import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Share2, Download, FileText, Table, Search, Eye, Check, ChevronDown } from 'lucide-react';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import { format, isValid } from 'date-fns';
import '../index.css';
import config from '../config';
import styles from '../styles/Design_Style.module.css';
import BackToTop from '../components/BackToTop';
import { PropagateLoader } from 'react-spinners';
import APIModal from '../modals/APIModal';
import DataViewerModal from '../modals/DataViewerModal';
import ChartConfigurationModal from '../modals/ChartConfigurationModal';
import ChartRenderingModal from '../modals/ChartRenderingModal';

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
      // Check if no dimensions are selected
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
  
      // Check if no dimension values are selected
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
  

// Parse JSON-stat data into a table format for DataViewerModal
const parseJsonStat = (jsonStat) => {
  if (!jsonStat || !jsonStat.dimension || !jsonStat.value) {
    console.error('Invalid JSON-stat data:', jsonStat);
    return [];
  }

  const { dimension, value, id, size } = jsonStat;
  const dimIds = id || [];
  const dimSizes = size || [];
  const dimCategories = {};

  // Map dimension IDs to their category labels
  dimIds.forEach((dimId) => {
    dimCategories[dimId] = dimension[dimId]?.category?.label || {};
  });

  // Generate all possible combinations of dimension indices
  const tableData = [];
  const indices = new Array(dimIds.length).fill(0);

  const generateRows = (dimIndex, currentRow) => {
    if (dimIndex >= dimIds.length) {
      // Calculate flat index for value
      let flatIndex = 0;
      let multiplier = 1;
      for (let i = dimIds.length - 1; i >= 0; i--) {
        flatIndex += indices[i] * multiplier;
        multiplier *= dimSizes[i];
      }

      // Create row with dimension codes and value
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

// Handle chart configuration submission from ChartConfigurationModal
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

  const handleSelectAll = (dimensionKey, categories) => {
    setSelectedDimensions((prev) => ({
      ...prev,
      [dimensionKey]: Object.keys(categories),
    }));
  };

  const handleClearAll = (dimensionKey) => {
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
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'dd MMMM yyyy') : 'Invalid date';
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
                  <dd className="ds_metadata__value">{' '}{formatDate(updated)}</dd>
                </div>
                <div className="ds_metadata__item">
                  <dt className="ds_metadata__key">Last Updated</dt>
                  <dd className="ds_metadata__value">{' '}{formatDate(updated)}</dd>
                </div>
                <div className="ds_metadata__item">
                  <dt className="ds_metadata__key">Contact</dt>
                  <dd className="ds_metadata__value">{' '}
                    {extension.contact?.email ? (
                      <a href={`mailto:${extension.contact.email}`} className="ds_link">
                        {extension.contact.email}
                      </a>
                    ) : (
                      'Not specified'
                    )}
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
                      <h4 className="font-medium text-gray-900">
                        {item.type === 'text/csv'
                          ? 'CSV Data'
                          : item.type === 'application/json'
                          ? 'JSON File'
                          : item.type === 'application/base64'
                          ? 'Excel Spreadsheet'
                          : 'PxStat File'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {item.type.split('/')[1].toUpperCase()} •{' '}
                        {item.href.split('/').pop().split('.').pop().toUpperCase()}
                      </p>
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
                <p>{extension.product?.value || label}</p>
              </section>
              <hr />
              <section className={styles.section}>
                <h2 className="ds_h3">Description</h2>
                {note?.[0] ? (
                  note[0]
                    .replace(/\[url=(.*?)\](.*?)\[\/url\]/g, '[$2]($1)')
                    .split('\n')
                    .map((paragraph, index) => <p key={index}>{paragraph}</p>)
                ) : (
                  <p>No description available</p>
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
                                  onClick={() => handleSelectAll(key, value.category?.label)}
                                  className="text-sm text-blue-700 hover:text-blue-900 font-semibold"
                                >
                                  Select all
                                </button>
                                <button
                                  onClick={() => handleClearAll(key)}
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
                  {[
                    {
                      key: 'Accuracy and Reliability',
                      value: 'Data is sourced from official records with rigorous validation processes.',
                    },
                    {
                      key: 'Timeliness and Punctuality',
                      value: 'Data is updated quarterly, ensuring timely availability.',
                    },
                  ].map((item, index) => (
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
                        <p>{item.value}</p>
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