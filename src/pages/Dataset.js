import React, { useEffect, useState } from 'react';
import { Share2, Download, FileText, Table, Calendar, Clock, ChevronDown, Check, X, Search, Eye } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import APIModal from '../modals/APIModal';
import DataViewerModal from '../modals/DataViewerModal';
import ChartConfigurationModal from '../modals/ChartConfigurationModal';
import ChartRenderingModal from '../modals/ChartRenderingModal';
import config from '../config.js';

const Dataset = () => {
  const { id } = useParams();
  const [dataset, setDataset] = useState(null);
  const [selectedDimensions, setSelectedDimensions] = useState({});
  const [openDimension, setOpenDimension] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tableData, setTableData] = useState(null);
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

  useEffect(() => {
    const fetchDataset = async () => {
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
      const data = await response.json();
      setDataset(data.result);
    };

    fetchDataset();
    document.title = 'Emerald | Dataset';
  }, [id]);

  const handleViewClick = async () => {
    try {
      const dimensions = {};
      Object.keys(selectedDimensions).forEach(key => {
        if (selectedDimensions[key]?.length > 0) {
          dimensions[key] = { category: { index: selectedDimensions[key] } };
        }
      });

      if (Object.keys(dimensions).length === 0) {
        setError('Please select at least one option from each dimension');
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

      // Parse the JSON-stat response
      const parsedData = parseJsonStat(data.result);
      setTableData(parsedData);
      setError(null);
      setIsTableModalOpen(true);
    } catch (err) {
      setError('An error occurred while fetching the dataset: ' + (err.message || 'Please try again.'));
    }
  };

  const parseJsonStat = (jsonStat) => {
    const { dimension, value, size, id } = jsonStat;

    if (!dimension || !value || !size || !id) {
      console.error("Invalid JSON-stat structure");
      return [];
    }

    // Function to calculate the position in the value array
    const getPosition = (indices) => {
      let position = 0;
      let multiplier = 1;

      // Process indices in reverse order (matches JSON-stat convention)
      for (let i = indices.length - 1; i >= 0; i--) {
        position += indices[i] * multiplier;
        multiplier *= size[i];
      }

      return position;
    };

    // Generate all possible combinations of indices
    const generateRows = (dimensionIndices = [], currentDimension = 0) => {
      // Base case: if we've processed all dimensions, create a row
      if (currentDimension >= id.length) {
        const position = getPosition(dimensionIndices);
        const row = {};

        // Map dimension IDs to their labels
        id.forEach((dimId, index) => {
          const dim = dimension[dimId];
          const categoryIndex = dim.category.index[dimensionIndices[index]];
          row[dimId] = dim.category.label[categoryIndex];
        });

        // Add the value (if it exists at this position)
        row["Value"] = position < value.length ? value[position] : null;

        return [row];
      }

      // Recursive case: iterate through all values of the current dimension
      const dimId = id[currentDimension];
      const dim = dimension[dimId];
      const results = [];

      for (let i = 0; i < dim.category.index.length; i++) {
        const newIndices = [...dimensionIndices];
        newIndices[currentDimension] = i;
        const rows = generateRows(newIndices, currentDimension + 1);
        results.push(...rows);
      }

      return results;
    };

    // Generate all rows
    const tableData = generateRows();

    console.log("Parsed Table Data:", tableData);
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

  if (!dataset) {
    return (
      <div className="ds_wrapper">
        <div className="ds_loading-spinner">Loading...</div>
      </div>
    );
  }

  const { label, dimension, extension, updated, note, link } = dataset;

  const handleDimensionToggle = (dimensionKey) => {
    setOpenDimension(openDimension === dimensionKey ? null : dimensionKey);
    setSearchQuery('');
  };

  const handleDimensionSelect = (dimensionKey, value, isSelected) => {
    setSelectedDimensions(prev => {
      const currentSelected = prev[dimensionKey] || [];
      return {
        ...prev,
        [dimensionKey]: isSelected
          ? [...currentSelected, value]
          : currentSelected.filter(v => v !== value),
      };
    });
  };

  const handleSelectAll = (dimensionKey, categories) => {
    setSelectedDimensions(prev => ({
      ...prev,
      [dimensionKey]: Object.keys(categories),
    }));
  };

  const handleClearAll = (dimensionKey) => {
    setSelectedDimensions(prev => ({ ...prev, [dimensionKey]: [] }));
  };

  const filteredCategories = (categories) => {
    return Object.entries(categories || {}).filter(([code, label]) =>
      label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="ds_wrapper">
      <main id="main-content" className="ds_layout ds_layout--article">
        <div className="ds_layout__header">
          <header className="ds_page-header">
            <nav className="ds_breadcrumb">
              <span className="ds_breadcrumb-link">
                <Link to="/home">Home</Link>
              </span>
              <span className="ds_breadcrumb-separator">/</span>
              <span className="ds_breadcrumb-link">
                <Link to="/datasets">Datasets</Link>
              </span>
              <span className="ds_breadcrumb-separator">/</span>
              <span className="ds_breadcrumb-current">{label}</span>
            </nav>
            <h1 className="ds_page-header__title">{label}</h1>
            <dl className="ds_page-header__metadata ds_metadata">
              <div className="ds_metadata__item">
                <dt className="ds_metadata__key">Published</dt>
                <dd className="ds_metadata__value">{new Date(updated).toLocaleDateString()}</dd>
              </div>
              <div className="ds_metadata__item">
                <dt className="ds_metadata__key">Updated</dt>
                <dd className="ds_metadata__value">{new Date(updated).toLocaleDateString()}</dd>
              </div>
            </dl>
          </header>
        </div>

        <div className="ds_layout__content">
          <div className="ds_section">
            <h2 className="ds_heading-l">Description</h2>
            <div className="ds_body">
              <p>
                {note?.[1]?.replace(/\[url=(.*?)\](.*?)\[\/url\]/g, '[$2]($1)') || 'No additional notes available'}
              </p>
            </div>
          </div>

          <div className="ds_section">
            <h2 className="ds_heading-l">Select Dimensions</h2>
            <div className="ds_dimensions">
              {Object.entries(dimension || {}).map(([key, value]) => {
                const hasLongDescription = value.label.split(' ').length > 10;
                const hasManyRecords = Object.keys(value.category?.label || {}).length > 100;

                return (
                  <div key={key} className="ds_dimension-item">
                    <button
                      onClick={() => handleDimensionToggle(key)}
                      className="ds_dimension-header"
                    >
                      <div>
                        <div className="ds_dimension-label">{value.label}</div>
                        {selectedDimensions[key]?.length > 0 && (
                          <div className="ds_dimension-selected">{selectedDimensions[key]?.length} selected</div>
                        )}
                      </div>
                      <ChevronDown
                        size={20}
                        className={`ds_icon ${openDimension === key ? 'ds_icon-rotated' : ''}`}
                      />
                    </button>

                    {openDimension === key && (
                      <div className="ds_dimension-content">
                        <div className="ds_dimension-actions">
                          <div className="ds_dimension-selected-count">
                            {selectedDimensions[key]?.length || 0} of {Object.keys(value.category?.label || {}).length} selected
                          </div>
                          <div className="ds_dimension-action-buttons">
                            <button
                              onClick={() => handleSelectAll(key, value.category?.label)}
                              className="ds_button ds_button-link"
                            >
                              Select all
                            </button>
                            <button
                              onClick={() => handleClearAll(key)}
                              className="ds_button ds_button-link"
                            >
                              Clear all
                            </button>
                          </div>
                        </div>
                        <div className="ds_dimension-categories">
                          {hasManyRecords && (
                            <div className="ds_search-box">
                              <div className="ds_search-input-wrapper">
                                <input
                                  type="text"
                                  placeholder="Search..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className="ds_input"
                                />
                                <Search size={18} className="ds_icon" />
                              </div>
                            </div>
                          )}
                          <div className="ds_dimension-categories-list">
                            {filteredCategories(value.category?.label).map(([code, label]) => {
                              const isSelected = selectedDimensions[key]?.includes(code);
                              return (
                                <div key={code} className="ds_dimension-category-item">
                                  <button
                                    onClick={() => handleDimensionSelect(key, code, !isSelected)}
                                    className={`ds_dimension-category-button ${isSelected ? 'ds_dimension-category-button-selected' : ''}`}
                                  >
                                    <div className={`ds_dimension-category-checkbox ${isSelected ? 'ds_dimension-category-checkbox-selected' : ''}`}>
                                      {isSelected && <Check size={14} className="ds_icon" />}
                                    </div>
                                    <span className="ds_dimension-category-label">
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
          </div>

          <div className="ds_actions">
            <button
              onClick={() => setIsChartConfigOpen(true)}
              className="ds_button"
            >
              <Eye size={16} />
              <span>Configure Chart</span>
            </button>
            <button
              onClick={handleViewClick}
              className="ds_button ds_button-secondary"
            >
              <Table size={16} />
              <span>View Data</span>
            </button>
          </div>

          {error && <div className="ds_error-message">{error}</div>}

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
            matrix={id} // Pass the matrix ID from the URL params
          />

          <DataViewerModal
            isOpen={isTableModalOpen}
            onRequestClose={() => setIsTableModalOpen(false)}
            tableData={tableData}
          />
        </div>

        <div className="ds_layout__sidebar">
          <div className="ds_article-aside">
            <h2>Downloads</h2>
            {link?.alternate?.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="ds_download-link"
              >
                <div className="ds_download-icon">
                  {item.type === 'text/csv' ? (
                    <FileText size={20} className="ds_icon-csv" />
                  ) : item.type === 'application/json' ? (
                    <FileText size={20} className="ds_icon-json" />
                  ) : item.type === 'application/base64' ? (
                    <Table size={20} className="ds_icon-excel" />
                  ) : (
                    <FileText size={20} className="ds_icon-pxstat" />
                  )}
                </div>
                <div className="ds_download-details">
                  <h4 className="ds_download-title">
                    {item.type === 'text/csv'
                      ? 'CSV Data'
                      : item.type === 'application/json'
                      ? 'JSON File'
                      : item.type === 'application/base64'
                      ? 'Excel Spreadsheet'
                      : 'PxStat File'}
                  </h4>
                  <p className="ds_download-subtitle">
                    {item.type.split('/')[1].toUpperCase()} •{' '}
                    {item.href.split('/').pop().split('.').pop().toUpperCase()}
                  </p>
                </div>
                <Download size={18} className="ds_icon" />
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dataset;
