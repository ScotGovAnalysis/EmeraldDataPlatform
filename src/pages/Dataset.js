import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Share2, Download, FileText, Table, Search, Eye, Check, ChevronDown } from 'lucide-react';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import { format, isValid, parseISO } from 'date-fns';
import '../index.css';
import config from '../config';
import styles from '../styles/Design_Style.module.css';
import BackToTop from '../components/BackToTop';
import { PropagateLoader } from 'react-spinners';
import APIModal from '../modals/APIModal';
import DataViewerModal from '../modals/DataViewerModal';
import ChartConfigurationModal from '../modals/ChartConfigurationModal';
import ChartRenderingModal from '../modals/ChartRenderingModal';

// Function to parse pseudo-JSON note
const parsePseudoJsonNote = (note) => {
  if (!note || !note[0]) return { isPseudoJson: false, content: note?.[0] || 'No description available' };

  const noteText = note[0];

  // Function to parse Markdown links [text](url)
  const parseMarkdownLinks = (text) => {
    const linkRegex = /\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
      }
      // Add the link
      parts.push({ type: 'link', text: match[1], url: match[2] });
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after the last link
    if (lastIndex < text.length) {
      parts.push({ type: 'text', value: text.slice(lastIndex) });
    }

    return parts.length > 0 ? parts : [{ type: 'text', value: text }];
  };

  // Check if the note follows the pseudo-JSON pattern
  if (noteText.startsWith('[{') && noteText.endsWith('}]')) {
    try {
      const parsed = {};

      // Split into individual key-value pairs
      const pairs = noteText
        .slice(2, -2)
        .split('],')
        .map(pair => pair.trim())
        .filter(pair => pair);

      pairs.forEach(pair => {
        const keyValue = pair.split(':[{');
        if (keyValue.length < 2) return;

        const key = keyValue[0].trim();
        let value = keyValue[1].replace('}]', '').trim();

        // Skip Markdown parsing for specific fields like contactEmail
        const skipMarkdownFields = ['http://publishmydata.com/def/dataset#contactEmail'];
        const shouldParseMarkdown = !skipMarkdownFields.includes(key);

        if (value.includes('},{')) {
          parsed[key] = value.split('},{').map(v => {
            const match = v.match(/@value:([^}]*)/) || v.match(/@id:([^}]*)/);
            const rawValue = match ? match[1].trim() : v.trim();
            return shouldParseMarkdown ? parseMarkdownLinks(rawValue) : rawValue;
          });
        } else {
          const valueMatch = value.match(/@value:([^}]*)/) || value.match(/@id:([^}]*)/);
          const rawValue = valueMatch ? valueMatch[1].trim() : value.trim();
          parsed[key] = shouldParseMarkdown ? parseMarkdownLinks(rawValue) : rawValue;
        }
      });

      return { isPseudoJson: true, content: parsed };
    } catch (err) {
      console.error('Error parsing pseudo-JSON:', err, 'Note:', noteText);
      return { isPseudoJson: false, content: parseMarkdownLinks(noteText) };
    }
  }

  // Handle non-pseudo-JSON notes with Markdown links
  return { isPseudoJson: false, content: parseMarkdownLinks(noteText) };
};

const Dataset = () => {
  const { id } = useParams();
  const location = useLocation();
  const [dataset, setDataset] = useState(null);
  const [selectedDimensions, setSelectedDimensions] = useState({});
  const [openDimension, setOpenDimension] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartConfig, setChartConfig] = useState({
    type: 'bar',
    dimensions: [],
    series: [],
    labels: [],
    title: 'Chart Title',
    xAxisLabel: '',
    yAxisLabel: '',
    dualAxis: false,
    stacked: false,
    stackedPercentage: false,
    autoScale: true,
    legendPosition: 'top',
  });
  const [error, setError] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isChartConfigOpen, setIsChartConfigOpen] = useState(false);
  const [isChartRenderOpen, setIsChartRenderOpen] = useState(false);
  const isFromResultsPage = location.state?.fromResults || false;
  const searchQueryParam = location.state?.searchQuery || '';

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/api.jsonrpc`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'PxStat.Data.Cube_API.ReadMetadata',
            params: {
              matrix: id,
              format: { type: 'JSON-stat', version: '2.0' },
              language: 'en',
              m2m: false,
            },
            id: 193280692,
          }),
        });
        if (!response.ok) throw new Error('Failed to fetch dataset details');
        const data = await response.json();
        setDataset(data.result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDataset();
  }, [id]);

  useEffect(() => {
    if (dataset && dataset.label) {
      document.title = `Emerald | ${dataset.label}`;
    } else {
      document.title = 'Emerald | Dataset';
    }
  }, [dataset]);

  const handleViewClick = async () => {
    try {
      if (Object.keys(selectedDimensions).length === 0) {
        alert('Please select at least one dimension');
        return;
      }

      const dimensions = {};
      let hasSelectedValues = false;
      Object.keys(selectedDimensions).forEach((key) => {
        if (selectedDimensions[key]?.length > 0) {
          dimensions[key] = { category: { index: selectedDimensions[key] } };
          hasSelectedValues = true;
        }
      });

      if (!hasSelectedValues) {
        alert('Please select at least one option from a dimension');
        return;
      }

      const response = await fetch(`${config.apiBaseUrl}/api.jsonrpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'PxStat.Data.Cube_API.ReadDataset',
          params: {
            class: 'query',
            id: Object.keys(dimensions),
            dimension: dimensions,
            extension: {
              pivot: null,
              codes: false,
              language: { code: 'en' },
              format: { type: 'JSON-stat', version: '2.0' },
              matrix: id,
            },
            version: '2.0',
            m2m: false,
          },
          id: 677981009,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const parsedData = parseJsonStat(data.result);
      setTableData(parsedData);
      setError(null);
      setIsTableModalOpen(true);
    } catch (err) {
      setError('An error occurred while fetching the dataset: ' + (err.message || 'Please try again.'));
    }
  };

  const parseJsonStat = (jsonStat) => {
    if (!jsonStat || !jsonStat.dimension || !jsonStat.value) {
      console.error('Invalid JSON-stat data:', jsonStat);
      return [];
    }

    const { dimension, value, id, size } = jsonStat;
    const dimIds = id || [];
    const dimSizes = size || [];
    const dimCategories = {};

    dimIds.forEach((dimId) => {
      dimCategories[dimId] = dimension[dimId]?.category?.label || {};
    });

    const tableData = [];
    const indices = new Array(dimIds.length).fill(0);

    const generateRows = (dimIndex, currentRow) => {
      if (dimIndex >= dimIds.length) {
        let flatIndex = 0;
        let multiplier = 1;
        for (let i = dimIds.length - 1; i >= 0; i--) {
          flatIndex += indices[i] * multiplier;
          multiplier *= dimSizes[i];
        }

        const row = { ...currentRow, Value: value[flatIndex] || null };
        tableData.push(row);
        return;
      }

      const dimId = dimIds[dimIndex];
      const categories = Object.keys(dimCategories[dimId]);
      categories.forEach((code, index) => {
        indices[dimIndex] = index;
        generateRows(dimIndex + 1, { ...currentRow, [dimId]: code });
      });
    };

    generateRows(0, {});
    return tableData;
  };

  const handleApiClick = async () => {
    try {
      const response = await fetch(dataset.href);
      const data = await response.json();
      setApiData(data);
      setIsApiModalOpen(true);
    } catch (err) {
      setError('An error occurred while fetching the API data: ' + (err.message || 'Please try again.'));
    }
  };

  const handleConfigureChart = (config) => {
    setChartConfig(config);
    setIsChartConfigOpen(false);
    setIsChartRenderOpen(true);
  };

  const handleDimensionToggle = (dimensionKey) => {
    setOpenDimension(openDimension === dimensionKey ? null : dimensionKey);
    setSearchQuery('');
  };

  const handleDimensionSelect = (dimensionKey, value, isSelected) => {
    setSelectedDimensions((prev) => {
      const currentSelected = prev[dimensionKey] || [];
      return {
        ...prev,
        [dimensionKey]: isSelected
          ? [...currentSelected, value]
          : currentSelected.filter((v) => v !== value),
      };
    });
  };

  const handleSelectDimensions = (dimensionKey, categories) => {
    setSelectedDimensions((prev) => ({
      ...prev,
      [dimensionKey]: Object.keys(categories),
    }));
  };

  const handleClearDimensions = (dimensionKey) => {
    setSelectedDimensions((prev) => ({ ...prev, [dimensionKey]: [] }));
  };

  const filteredCategories = (categories) => {
    return Object.entries(categories || {}).filter(([code, label]) =>
      label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getThumbnailImage = (type) => {
    switch (type.toLowerCase()) {
      case 'text/csv':
        return '/documents/csv.svg';
      case 'application/json':
        return '/documents/json.svg';
      case 'application/base64':
        return '/documents/excel.svg';
      case 'application/octet-stream':
        return '/documents/px.svg';
      default:
        return '/documents/generic.svg';
    }
  };
const formatDate = (dateString) => {
  if (!dateString) return 'No date available';

  try {
    // Trim the date string to remove any leading or trailing whitespace
    const trimmedDateString = dateString.trim();

    // Ensure the hour part of the time has a leading zero
    const correctedDateStr = trimmedDateString.replace(/T(\d):/, 'T0$1:');

    // Log the corrected date string to ensure it's properly formatted
    console.log('Corrected Date String:', correctedDateStr);

    // Parse the corrected date string
    const date = parseISO(correctedDateStr);

    // Log the parsed date to check if it's valid
    console.log('Parsed Date Object:', date);

    return isValid(date) ? format(date, 'dd MMMM yyyy') : 'No date available';
  } catch (err) {
    console.error('Error formatting date:', err);
    return 'No date available';
  }
};

  if (loading) {
    return (
      <div className="ds_page__middle">
        <div className="ds_wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <PropagateLoader color="#0065bd" loading={true} speedMultiplier={1} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ds_page__middle">
        <div className="ds_wrapper">
          <div className="ds_error">
            <p>Error: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="ds_page__middle">
        <div className="ds_wrapper">
          <div className="ds_error">
            <p>No dataset found</p>
          </div>
        </div>
      </div>
    );
  }

  const { label, dimension, extension, updated, note, link } = dataset;
  const parsedNote = parsePseudoJsonNote(note);

  return (
    <div className="ds_page__middle">
      <div className="ds_wrapper">

        <main className="ds_layout ds_layout--search-results--filters">
          <div className="ds_layout__header w-full">
            <nav aria-label="Breadcrumb">
              <ol className="ds_breadcrumbs">
                <li className={styles.ds_breadcrumbs__item}>
                  <Link className="ds_breadcrumbs__link" to="/">Home</Link>
                </li>
                {isFromResultsPage ? (
                  <>
                    <li className={styles.ds_breadcrumbs__item}>
                      <Link className="ds_breadcrumbs__link" to={`/datasets?q=${encodeURIComponent(searchQueryParam)}`}>Results</Link>
                    </li>
                    <li className={styles.ds_breadcrumbs__item}>
                      <span className="ds_breadcrumbs__current">Dataset: {label}</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className={styles.ds_breadcrumbs__item}>
                      <Link className="ds_breadcrumbs__link" to="/datasets">Datasets</Link>
                    </li>
                    <li className={styles.ds_breadcrumbs__item}>
                      <span className="ds_breadcrumbs__current">{label}</span>
                    </li>
                  </>
                )}
              </ol>
            </nav>
            <header className="gov_layout gov_layout--publication-header w-full">
              <div className="gov_layout__title w-full">
                <h1 className="ds_page-header__title break-words whitespace-pre-wrap">
                  {label}
                </h1>
              </div>
            </header>
          </div>

          <div className="ds_layout__sidebar">
<div className="ds_metadata__panel">
  <hr />
  <h3 className="ds_metadata__panel-title">Metadata</h3>
  <dl className="ds_metadata">
    <div className="ds_metadata__item">
      <dt className="ds_metadata__key">Organisation</dt>
      <dd className="ds_metadata__value">{' '}{extension.copyright?.name || 'Not specified'}</dd>
    </div>
    <div className="ds_metadata__item">
      <dt className="ds_metadata__key">Published</dt>
      <dd className="ds_metadata__value">
        {' '}{formatDate(
          parsedNote.isPseudoJson && parsedNote.content['http://purl.org/dc/terms/modified']
            ? (Array.isArray(parsedNote.content['http://purl.org/dc/terms/modified'])
                ? parsedNote.content['http://purl.org/dc/terms/modified'][0]?.value ||
                  parsedNote.content['http://purl.org/dc/terms/modified'][0]
                : parsedNote.content['http://purl.org/dc/terms/modified']?.value ||
                  parsedNote.content['http://purl.org/dc/terms/modified'])
            : dataset.updated
        )}
      </dd>
    </div>
    <div className="ds_metadata__item">
      <dt className="ds_metadata__key">Last Updated</dt>
      <dd className="ds_metadata__value">
        {formatDate(dataset.updated)}
      </dd>
    </div>
    <div className="ds_metadata__item">
      <dt className="ds_metadata__key">Contact</dt>
      <dd className="ds_metadata__value">
        {' '}{parsedNote.isPseudoJson && parsedNote.content['http://publishmydata.com/def/dataset#contactEmail']
          ? (
              <a
                href={typeof parsedNote.content['http://publishmydata.com/def/dataset#contactEmail'] === 'string'
                  ? parsedNote.content['http://publishmydata.com/def/dataset#contactEmail']
                  : parsedNote.content['http://publishmydata.com/def/dataset#contactEmail'][0]?.value}
                className="ds_link"
              >
                {typeof parsedNote.content['http://publishmydata.com/def/dataset#contactEmail'] === 'string'
                  ? parsedNote.content['http://publishmydata.com/def/dataset#contactEmail'].replace('mailto:', '')
                  : parsedNote.content['http://publishmydata.com/def/dataset#contactEmail'][0]?.value?.replace('mailto:', '') || 'Not specified'}
              </a>
            )
          : extension.contact?.email
            ? (
                <a href={`mailto:${extension.contact.email}`} className="ds_link">
                  {extension.contact.email}
                </a>
              )
            : 'Not specified'}
      </dd>
    </div>
    <div className="ds_metadata__item">
      <dt className="ds_metadata__key">Subject</dt>
      <dd className="ds_metadata__value">{' '}{extension.subject?.value || 'Not specified'}</dd>
    </div>
    <div className="ds_metadata__item">
      <dt className="ds_metadata__key">Product</dt>
      <dd className="ds_metadata__value">{' '}{extension.product?.value || 'Not specified'}</dd>
    </div>
    {parsedNote.isPseudoJson && parsedNote.content['http://purl.org/dc/terms/license'] && (
      <div className="ds_metadata__item">
        <dt className="ds_metadata__key">License</dt>
        <dd className="ds_metadata__value">
          <a
            href={typeof parsedNote.content['http://purl.org/dc/terms/license'] === 'string'
              ? parsedNote.content['http://purl.org/dc/terms/license']
              : parsedNote.content['http://purl.org/dc/terms/license'][0]?.value}
            className="ds_link"
          >
            {(typeof parsedNote.content['http://purl.org/dc/terms/license'] === 'string'
              ? parsedNote.content['http://purl.org/dc/terms/license']
              : parsedNote.content['http://purl.org/dc/terms/license'][0]?.value || '')
              .split('/')
              .pop()
              .replace('version-', 'Version ')}
          </a>
        </dd>
      </div>
    )}
  </dl>
  <hr />
  <h3 className="ds_metadata__panel-title">Downloads</h3>
  {link?.alternate?.map((item, index) => (
    <a
      key={index}
      href={item.href}
      className="w-full mb-4 p-4 bg-gray-50 hover:bg-gray-200 transition-colors duration-150 flex items-center justify-between rounded-lg shadow-sm"
    >
      <div className="flex items-center">
        {item.type === 'text/csv' ? (
          <FileText size={20} className="text-blue-600 mr-3" />
        ) : item.type === 'application/json' ? (
          <FileText size={20} className="text-yellow-600 mr-3" />
        ) : item.type === 'application/base64' ? (
          <Table size={20} className="text-green-600 mr-3" />
        ) : (
          <FileText size={20} className="text-purple-600 mr-3" />
        )}
        <div className="text-left">
          <h4 className="font-medium text-gray-900" style={{ marginBottom: '0px' }}>
            {item.type === 'text/csv'
              ? 'CSV Data'
              : item.type === 'application/json'
              ? 'JSON File'
              : item.type === 'application/base64'
              ? 'Excel Spreadsheet'
              : 'PxStat File'}
          </h4>
        </div>
      </div>
      <Download size={18} className="text-gray-400" />
    </a>
  ))}
</div>
          </div>

          <div className="ds_layout__list">
            <div className="ds_search-results">
              <hr />
              <section className={styles.section}>
                <h2 className="ds_h3">Summary</h2>
                <p>
                  {parsedNote.isPseudoJson
                    ? (Array.isArray(parsedNote.content['http://www.w3.org/2000/01/rdf-schema#comment'])
                        ? parsedNote.content['http://www.w3.org/2000/01/rdf-schema#comment'].map((part, index) =>
                            part.type === 'link' ? (
                              <a key={index} href={part.url} className="ds_link" target="_blank" rel="noopener noreferrer">
                                {part.text}
                              </a>
                            ) : (
                              <span key={index}>{part.value}</span>
                            )
                          )
                        : parsedNote.content['http://www.w3.org/2000/01/rdf-schema#comment'] || extension.product?.value || label)
                    : extension.product?.value || label}
                </p>
              </section>
              <hr />
              <section className={styles.section}>
                <h2 className="ds_h3">Description</h2>
                {parsedNote.isPseudoJson ? (
                  <>
                    <p>
                      {Array.isArray(parsedNote.content['http://purl.org/dc/terms/description'])
                        ? parsedNote.content['http://purl.org/dc/terms/description'].map((part, index) =>
                            part.type === 'link' ? (
                              <a key={index} href={part.url} className="ds_link" target="_blank" rel="noopener noreferrer">
                                {part.text}
                              </a>
                            ) : (
                              <span key={index}>{part.value}</span>
                            )
                          )
                        : parsedNote.content['http://purl.org/dc/terms/description'] || 'No description available'}
                    </p>
                    {parsedNote.content['http://publishmydata.com/def/dataset#nextUpdateDue'] && (
                      <p>
                        <strong>Next Update Due:</strong>{' '}
                        {Array.isArray(parsedNote.content['http://publishmydata.com/def/dataset#nextUpdateDue'])
                          ? parsedNote.content['http://publishmydata.com/def/dataset#nextUpdateDue'].map((part, index) =>
                              part.type === 'link' ? (
                                <a key={index} href={part.url} className="ds_link" target="_blank" rel="noopener noreferrer">
                                  {part.text}
                                </a>
                              ) : (
                                <span key={index}>{part.value}</span>
                              )
                            )
                          : parsedNote.content['http://publishmydata.com/def/dataset#nextUpdateDue']}
                      </p>
                    )}
                  </>
                ) : (
                  <p>
                    {Array.isArray(parsedNote.content)
                      ? parsedNote.content.map((part, index) =>
                          part.type === 'link' ? (
                            <a key={index} href={part.url} className="ds_link" target="_blank" rel="noopener noreferrer">
                              {part.text}
                            </a>
                          ) : (
                            <span key={index}>{part.value}</span>
                          )
                        )
                      : parsedNote.content}
                  </p>
                )}
              </section>
              <hr />
              <section className={styles.section}>
                <h2 className="ds_h3">Select Dimensions</h2>
                <div className="space-y-4">
                  {Object.entries(dimension || {}).map(([key, value]) => {
                    const hasLongDescription = value.label.split(' ').length > 10;
                    const hasManyRecords = Object.keys(value.category?.label || {}).length > 100;

                    return (
                      <div key={key} className="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
                        <button
                          onClick={() => handleDimensionToggle(key)}
                          className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-200 transition-colors duration-150 flex justify-between items-center"
                        >
                          <div>
                            <div className="text-left text-gray-900 font-semibold">{value.label}</div>
                            {selectedDimensions[key]?.length > 0 && (
                              <div className="text-sm text-gray-700 mt-1">
                                {selectedDimensions[key]?.length} selected
                              </div>
                            )}
                          </div>
                          <ChevronDown
                            size={20}
                            className={`text-gray-700 transition-transform duration-200 ${
                              openDimension === key ? 'transform rotate-180' : ''
                            }`}
                          />
                        </button>
                        {openDimension === key && (
                          <div className="border-t border-gray-300">
                            <div className="p-4 bg-gray-100 border-b border-gray-300 flex justify-between items-center">
                              <div className="text-sm text-gray-700">
                                {selectedDimensions[key]?.length || 0} of{' '}
                                {Object.keys(value.category?.label || {}).length} selected
                              </div>
                              <div className="flex items-center space-x-4">
                                <button
                                  onClick={() => handleSelectDimensions(key, value.category?.label)}
                                  className="text-sm text-blue-700 hover:text-blue-900 font-semibold"
                                >
                                  Select all
                                </button>
                                <button
                                  onClick={() => handleClearDimensions(key)}
                                  className="text-sm text-gray-700 hover:text-gray-900 font-semibold"
                                >
                                  Clear all
                                </button>
                              </div>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                              {hasManyRecords && (
                                <div className="p-4 border-b border-gray-300">
                                  <div className="relative">
                                    <input
                                      type="text"
                                      placeholder="Search..."
                                      value={searchQuery}
                                      onChange={(e) => setSearchQuery(e.target.value)}
                                      className="w-full pl-10 pr-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-gray-900"
                                    />
                                    <Search size={18} className="absolute left-3 top-2.5 text-gray-700" />
                                  </div>
                                </div>
                              )}
                              <div
                                className={`grid ${
                                  filteredCategories(value.category?.label).some(
                                    ([_, label]) => label.split(' ').length > 10 || label.length > 60
                                  )
                                    ? 'grid-cols-1'
                                    : 'grid-cols-1 md:grid-cols-2'
                                } gap-2 p-4`}
                              >
                                {filteredCategories(value.category?.label).map(([code, label]) => {
                                  const isSelected = selectedDimensions[key]?.includes(code);
                                  return (
                                    <div key={code} className="flex items-center">
                                      <button
                                        onClick={() => handleDimensionSelect(key, code, !isSelected)}
                                        className={`flex items-center w-full p-2 rounded hover:bg-gray-200 transition-colors duration-150 ${
                                          isSelected ? 'bg-blue-100' : ''
                                        }`}
                                      >
                                        <div
                                          className={`w-5 h-5 rounded flex items-center justify-center ${
                                            isSelected ? 'bg-blue-700' : 'border border-gray-400'
                                          }`}
                                        >
                                          {isSelected && <Check size={14} className="text-white" />}
                                        </div>
                                        <span className="ml-3 text-gray-900 text-sm font-medium whitespace-normal text-left">
                                          {label}
                                        </span>
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-8 flex space-x-4">
                  <button
                    onClick={() => setIsChartConfigOpen(true)}
                    className="ds_button ds_button--secondary"
                  >
                    <Eye size={16} className="inline mr-2" />
                    Configure Chart
                  </button>
                  <button
                    onClick={handleViewClick}
                    className="ds_button ds_button--secondary"
                  >
                    <Table size={16} className="inline mr-2" />
                    View Data
                  </button>
                  <button
                    onClick={handleApiClick}
                    className="ds_button ds_button--secondary"
                  >
                    <Share2 size={16} className="inline mr-2" />
                    API
                  </button>
                </div>
                {error && <div className="mt-4 text-red-600 font-semibold">{error}</div>}
              </section>
              <hr />
              <section className={styles.section}>
                <h2 className="ds_h3">Data Quality</h2>
               <div className="ds_accordion">
  {[{
    key: 'Accuracy and Reliability',
    value: parsedNote.isPseudoJson && parsedNote.content['http://statistics.gov.scot/def/statistical-quality/accuracy-and-reliability']
      ? parsedNote.content['http://statistics.gov.scot/def/statistical-quality/accuracy-and-reliability']
      : [{ type: 'text', value: 'Data is sourced from official records with rigorous validation processes.' }]
  }, {
    key: 'Timeliness and Punctuality',
    value: parsedNote.isPseudoJson && parsedNote.content['http://statistics.gov.scot/def/statistical-quality/timeliness-and-punctuality']
      ? parsedNote.content['http://statistics.gov.scot/def/statistical-quality/timeliness-and-punctuality']
      : [{ type: 'text', value: 'Data is updated quarterly, ensuring timely availability.' }]
  }, {
    key: 'Relevance',
    value: parsedNote.isPseudoJson && parsedNote.content['http://statistics.gov.scot/def/statistical-quality/relevance']
      ? parsedNote.content['http://statistics.gov.scot/def/statistical-quality/relevance']
      : [{ type: 'text', value: 'Data is relevant to official statistical reporting.' }]
  }, {
    key: 'Accessibility and Clarity',
    value: parsedNote.isPseudoJson && parsedNote.content['http://statistics.gov.scot/def/statistical-quality/accessibility-and-clarity']
      ? parsedNote.content['http://statistics.gov.scot/def/statistical-quality/accessibility-and-clarity']
      : [{ type: 'text', value: 'Statistics are presented in accessible formats on the Scottish Government website.' }]
  }, {
    key: 'Comparability and Coherence',
    value: parsedNote.isPseudoJson && parsedNote.content['http://statistics.gov.scot/def/statistical-quality/comparability-and-coherence']
      ? parsedNote.content['http://statistics.gov.scot/def/statistical-quality/comparability-and-coherence']
      : [{ type: 'text', value: 'Data is comparable across regions and time periods.' }]
  }, {
    key: 'Confidentiality',
    value: parsedNote.isPseudoJson && parsedNote.content['http://statistics.gov.scot/def/statistical-quality/confidentiality']
      ? parsedNote.content['http://statistics.gov.scot/def/statistical-quality/confidentiality']
      : [{ type: 'text', value: 'This dataset does not contain sensitive or personal information.' }]
  }, {
    key: 'Quality Management',
    value: parsedNote.isPseudoJson && parsedNote.content['http://statistics.gov.scot/def/statistical-quality/quality-management']
      ? parsedNote.content['http://statistics.gov.scot/def/statistical-quality/quality-management']
      : [{ type: 'text', value: 'Data undergoes rigorous quality checks.' }]
  }, {
    key: 'Revisions',
    value: parsedNote.isPseudoJson && parsedNote.content['http://statistics.gov.scot/def/statistical-quality/revisions']
      ? parsedNote.content['http://statistics.gov.scot/def/statistical-quality/revisions']
      : [{ type: 'text', value: 'Data revisions are documented and updated as necessary.' }]
  }].map((item, index) => (
    <div key={index} className="ds_accordion-item">
      <input
        type="checkbox"
        className={`visually-hidden ds_accordion-item__control ${styles.accordionItemControl}`}
        id={`quality-detail-${index}`}
      />
      <div className={`ds_accordion-item__header ${styles.accordionItemHeader}`}>
        <h3 className="ds_accordion-item__title">{item.key}</h3>
        <span className={styles.accordionIndicator}></span>
        <label
          className="ds_accordion-item__label"
          htmlFor={`quality-detail-${index}`}
        >
          <span className="visually-hidden">Show this section</span>
        </label>
      </div>
      <div className="ds_accordion-item__body">
        <p>
          {Array.isArray(item.value)
            ? item.value.map((part, partIndex) =>
                part.type === 'link' ? (
                  <a
                    key={partIndex}
                    href={part.url}
                    className="ds_link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {part.text}
                  </a>
                ) : (
                  <span key={partIndex}>{part.value}</span>
                )
              )
            : item.value}
        </p>
      </div>
    </div>
  ))}
</div>

              </section>
              <section className={styles.section}>
                <h2 className="ds_h3">Additional Details</h2>
                <div className="ds_accordion">
                  {[
                    {
                      key: 'Official Statistics',
                      value: extension.official
                        ? 'This dataset is classified as official statistics.'
                        : 'This dataset is not classified as official statistics.',
                    },
                    {
                      key: 'Experimental Statistics',
                      value: extension.experimental
                        ? 'This dataset includes experimental statistics under development.'
                        : 'This dataset does not include experimental statistics.',
                    },
                  ].map((item, index) => (
                    <div key={index} className="ds_accordion-item">
                      <input
                        type="checkbox"
                        className={`visually-hidden ds_accordion-item__control ${styles.accordionItemControl}`}
                        id={`additional-detail-${index}`}
                      />
                      <div className={`ds_accordion-item__header ${styles.accordionItemHeader}`}>
                        <h3 className="ds_accordion-item__title">{item.key}</h3>
                        <span className={styles.accordionIndicator}></span>
                        <label
                          className="ds_accordion-item__label"
                          htmlFor={`additional-detail-${index}`}
                        >
                          <span className="visually-hidden">Show this section</span>
                        </label>
                      </div>
                      <div className="ds_accordion-item__body">
                        <p>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <APIModal
            isOpen={isApiModalOpen}
            onRequestClose={() => setIsApiModalOpen(false)}
            apiData={apiData}
            apiUrl={dataset.href}
          />
          <ChartConfigurationModal
            isOpen={isChartConfigOpen}
            onRequestClose={() => setIsChartConfigOpen(false)}
            onConfigureChart={handleConfigureChart}
            dataset={dataset}
          />
          <ChartRenderingModal
            isOpen={isChartRenderOpen}
            onRequestClose={() => setIsChartRenderOpen(false)}
            chartConfig={chartConfig}
            dataset={dataset}
            matrix={id}
          />
          <DataViewerModal
            isOpen={isTableModalOpen}
            onRequestClose={() => setIsTableModalOpen(false)}
            tableData={tableData}
            dimensionLabels={Object.fromEntries(
              Object.entries(dimension || {}).map(([key, value]) => [key, value.label])
            )}
          />
        </main>
      </div>
      <BackToTop />
    </div>
  );
};

export default Dataset;