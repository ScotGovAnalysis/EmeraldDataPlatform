import React, { useState, useEffect } from 'react';
import styles from '../styles/Embedded_Modal.module.css';
import { X, ChevronDown, Check, Plus, BarChart2, LineChart, PieChart, Activity, Disc } from 'lucide-react';

const ChartConfigurationModal = ({ isOpen, onRequestClose, onConfigureChart, dataset }) => {
  const [chartConfig, setChartConfig] = useState({
    type: 'bar',
    xAxisDimension: '',
    xAxisLabel: '',
    series: [],
    yAxisLabel: '',
    dualAxis: false,
    stacked: false,
    autoScale: true,
    legendPosition: 'top',
    title: dataset?.label || 'Chart Title'
  });

  const [openDimension, setOpenDimension] = useState(null);
  const [selectedDimensions, setSelectedDimensions] = useState({});
  const [activeTab, setActiveTab] = useState('general');
  const [dimensionValues, setDimensionValues] = useState({});

  useEffect(() => {
    if (dataset?.dimension) {
      const initialDimensions = {};
      const initialValues = {};
  
      Object.keys(dataset.dimension).forEach(key => {
        initialDimensions[key] = [];
        initialValues[key] = Object.keys(dataset.dimension[key].category.label);
      });
  
      const firstDimension = Object.keys(dataset.dimension)[0];
      if (!chartConfig.xAxisDimension && firstDimension) {
        setChartConfig(prev => ({
          ...prev,
          xAxisDimension: firstDimension,
          yAxisLabel: dataset.dimension[firstDimension]?.unit?.[Object.keys(dataset.dimension[firstDimension].category.label)[0]]?.label || ''
        }));
      }
  
      setSelectedDimensions(initialDimensions);
      setDimensionValues(initialValues);
    }
  }, [dataset]);

  const handleDimensionToggle = (dimensionKey) => {
    setOpenDimension(openDimension === dimensionKey ? null : dimensionKey);
  };

  const handleDimensionSelect = (dimensionKey, value, isSelected) => {
    setSelectedDimensions(prev => {
      const currentSelected = prev[dimensionKey] || [];
      const updatedSelected = isSelected
        ? [...currentSelected, value]
        : currentSelected.filter(v => v !== value);
      return {
        ...prev,
        [dimensionKey]: updatedSelected,
      };
    });
  };

  const addSeries = () => {
    const availableDimensions = Object.keys(dataset.dimension || {})
      .filter(dim => dim !== chartConfig.xAxisDimension)
      .filter(dim => Object.keys(dataset.dimension[dim].category.label).length > 1);
  
    const seriesDimension = availableDimensions[0] || '';
    if (!seriesDimension) return;
  
    setChartConfig(prev => ({
      ...prev,
      series: [
        ...prev.series,
        {
          label: dataset.dimension[seriesDimension]?.category.label[
            dimensionValues[seriesDimension]?.[0] || ''
          ] || 'New Series',
          dimension: seriesDimension,
          values: dimensionValues[seriesDimension] ? [dimensionValues[seriesDimension][0]] : [],
          yAxis: 'y-axis-0'
        }
      ],
    }));
  };

  const updateSeries = (index, field, value) => {
    setChartConfig(prev => {
      const newSeries = [...prev.series];
      newSeries[index] = { ...newSeries[index], [field]: value };
      return { ...prev, series: newSeries };
    });
  };

  const handleSeriesValuesToggle = (index) => {
    setOpenDimension(openDimension === `series-${index}` ? null : `series-${index}`);
  };

  const handleSeriesValueSelect = (index, value, isSelected) => {
    setChartConfig(prev => {
      const newSeries = [...prev.series];
      const currentValues = newSeries[index].values || [];
      newSeries[index].values = isSelected
        ? [...currentValues, value]
        : currentValues.filter(v => v !== value);
      return { ...prev, series: newSeries };
    });
  };

  const removeSeries = (index) => {
    setChartConfig(prev => ({
      ...prev,
      series: prev.series.filter((_, i) => i !== index),
    }));
  };

  const handleConfigureChart = () => {
    if (!chartConfig.xAxisDimension || chartConfig.series.length === 0) {
      alert('Please select an X-axis dimension and at least one series.');
      return;
    }

    const config = {
      ...chartConfig,
      labels: [...new Set(selectedDimensions[chartConfig.xAxisDimension] || [])],
      series: chartConfig.series.map(s => ({
        ...s,
        values: [...new Set(s.values)]
      }))
    };

    onConfigureChart(config);
  };

  const chartTypeIcons = {
    bar: <BarChart2 size={20} />,
    line: <LineChart size={20} />,
    pie: <PieChart size={20} />,
    doughnut: <Disc size={20} />,
    radar: <Activity size={20} />,
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.titleContainer}>
            <span className={styles.viewerTitle}>Configure Chart</span>
          </div>
          <button
            className={styles.closeButton}
            onClick={onRequestClose}
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-4 font-medium text-sm transition-colors ${activeTab === 'general' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}
            >
              General Settings
            </button>
            <button
              onClick={() => setActiveTab('series')}
              className={`px-6 py-4 font-medium text-sm transition-colors ${activeTab === 'series' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}
            >
              Series Configuration
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`px-6 py-4 font-medium text-sm transition-colors ${activeTab === 'advanced' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}
            >
              Advanced Options
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Chart Title</label>
                  <input
                    type="text"
                    value={chartConfig.title}
                    onChange={(e) => setChartConfig({ ...chartConfig, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="Enter chart title"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-3">Chart Type</label>
                  <div className="grid grid-cols-5 gap-3">
                    {['bar', 'line', 'pie', 'doughnut', 'radar'].map(type => (
                      <button
                        key={type}
                        onClick={() => setChartConfig({ ...chartConfig, type })}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border ${chartConfig.type === type ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 hover:bg-gray-50 text-gray-600'} transition-colors`}
                      >
                        <div className="mb-2">{chartTypeIcons[type]}</div>
                        <span className="text-sm font-medium capitalize">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">X-Axis Dimension</label>
                  <div className="relative">
                    <select
                      value={chartConfig.xAxisDimension}
                      onChange={(e) => setChartConfig({ ...chartConfig, xAxisDimension: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-colors"
                    >
                      <option value="">Select Dimension</option>
                      {dataset?.dimension && Object.entries(dataset.dimension).map(([key, value]) => (
                        <option key={key} value={key}>{value.label}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown size={18} className="text-gray-400" />
                    </div>
                  </div>
                </div>
                {chartConfig.xAxisDimension && (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => handleDimensionToggle(chartConfig.xAxisDimension)}
                      className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex justify-between items-center transition-colors"
                    >
                      <span className="text-gray-800 font-medium">{dataset.dimension[chartConfig.xAxisDimension].label}</span>
                      <ChevronDown
                        size={18}
                        className={`text-gray-500 transition-transform duration-200 ${openDimension === chartConfig.xAxisDimension ? 'transform rotate-180' : ''}`}
                      />
                    </button>
                    {openDimension === chartConfig.xAxisDimension && (
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-gray-500">
                            {selectedDimensions[chartConfig.xAxisDimension]?.length || 0} of {dimensionValues[chartConfig.xAxisDimension]?.length || 0} selected
                          </span>
                          <button
                            className="text-sm text-blue-600 hover:text-blue-800"
                            onClick={() => {
                              const allValues = dimensionValues[chartConfig.xAxisDimension] || [];
                              const isAllSelected = selectedDimensions[chartConfig.xAxisDimension]?.length === allValues.length;
                              setSelectedDimensions(prev => ({
                                ...prev,
                                [chartConfig.xAxisDimension]: isAllSelected ? [] : allValues,
                              }));
                            }}
                          >
                            {selectedDimensions[chartConfig.xAxisDimension]?.length === dimensionValues[chartConfig.xAxisDimension]?.length ? "Deselect All" : "Select All"}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto">
                          {dimensionValues[chartConfig.xAxisDimension]?.map((code) => {
                            const isSelected = selectedDimensions[chartConfig.xAxisDimension]?.includes(code);
                            return (
                              <button
                                key={code}
                                onClick={() => handleDimensionSelect(chartConfig.xAxisDimension, code, !isSelected)}
                                className={`flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors`}
                              >
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${isSelected ? 'bg-blue-600' : 'border border-gray-300'}`}>
                                  {isSelected && <Check size={14} className="text-white" />}
                                </div>
                                <span className="text-gray-700 text-sm ml-3 truncate">
                                  {dataset.dimension[chartConfig.xAxisDimension].category.label[code]}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">X-Axis Label</label>
                    <input
                      type="text"
                      value={chartConfig.xAxisLabel}
                      onChange={(e) => setChartConfig({ ...chartConfig, xAxisLabel: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      placeholder="X-Axis Label"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Y-Axis Label</label>
                    <input
                      type="text"
                      value={chartConfig.yAxisLabel}
                      onChange={(e) => setChartConfig({ ...chartConfig, yAxisLabel: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      placeholder="Y-Axis Label"
                    />
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'series' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-800">Data Series</h3>
                  <button
                    onClick={addSeries}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Series
                  </button>
                </div>
                {chartConfig.series.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <BarChart2 size={40} className="text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-4">No data series configured yet</p>
                    <button
                      onClick={addSeries}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Your First Series
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chartConfig.series.map((series, index) => (
                      <div key={index} className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">Series Label</label>
                            <input
                              type="text"
                              value={series.label}
                              onChange={(e) => updateSeries(index, 'label', e.target.value)}
                              placeholder="Series Label"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">Dimension</label>
                            <div className="relative">
                              <select
                                value={series.dimension}
                                onChange={(e) => updateSeries(index, 'dimension', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-colors"
                              >
                                <option value="">Select Dimension</option>
                                {dataset?.dimension && Object.entries(dataset.dimension)
                                  .filter(([key]) => key !== chartConfig.xAxisDimension)
                                  .map(([key, value]) => (
                                    <option key={key} value={key}>{value.label}</option>
                                  ))}
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <ChevronDown size={16} className="text-gray-400" />
                              </div>
                            </div>
                          </div>
                          {chartConfig.dualAxis && (
                            <div className="w-48">
                              <label className="block text-xs text-gray-500 mb-1">Y-Axis</label>
                              <div className="relative">
                                <select
                                  value={series.yAxis}
                                  onChange={(e) => updateSeries(index, 'yAxis', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-colors"
                                >
                                  <option value="y-axis-0">Left Y-Axis</option>
                                  <option value="y-axis-1">Right Y-Axis</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                  <ChevronDown size={16} className="text-gray-400" />
                                </div>
                              </div>
                            </div>
                          )}
                          <button
                            onClick={() => removeSeries(index)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X size={18} />
                          </button>
                        </div>
                        {series.dimension && (
                          <div className="rounded-lg border border-gray-200 overflow-hidden">
                            <button
                              onClick={() => handleSeriesValuesToggle(index)}
                              className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex justify-between items-center transition-colors"
                            >
                              <span className="text-gray-800 font-medium">Select {dataset.dimension[series.dimension].label} Values</span>
                              <ChevronDown
                                size={18}
                                className={`text-gray-500 transition-transform duration-200 ${openDimension === `series-${index}` ? 'transform rotate-180' : ''}`}
                              />
                            </button>
                            {openDimension === `series-${index}` && (
                              <div className="p-4">
                                <div className="flex justify-between items-center mb-3">
                                  <span className="text-sm text-gray-500">
                                    {series.values.length} of {dimensionValues[series.dimension]?.length || 0} selected
                                  </span>
                                  <button
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                    onClick={() => {
                                      const allValues = dimensionValues[series.dimension] || [];
                                      const isAllSelected = series.values.length === allValues.length;
                                      updateSeries(index, 'values', isAllSelected ? [] : allValues);
                                    }}
                                  >
                                    {series.values.length === dimensionValues[series.dimension]?.length ? "Deselect All" : "Select All"}
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto">
                                  {dimensionValues[series.dimension]?.map((code) => {
                                    const isSelected = series.values.includes(code);
                                    return (
                                      <button
                                        key={code}
                                        onClick={() => handleSeriesValueSelect(index, code, !isSelected)}
                                        className={`flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors`}
                                      >
                                        <div className={`w-5 h-5 rounded-md flex items-center justify-center ${isSelected ? 'bg-blue-600' : 'border border-gray-300'}`}>
                                          {isSelected && <Check size={14} className="text-white" />}
                                        </div>
                                        <span className="text-gray-700 text-sm ml-3 truncate">
                                          {dataset.dimension[series.dimension].category.label[code]}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Legend Position</label>
                    <div className="relative">
                      <select
                        value={chartConfig.legendPosition}
                        onChange={(e) => setChartConfig({ ...chartConfig, legendPosition: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-colors"
                      >
                        {['top', 'left', 'bottom', 'right'].map(pos => (
                          <option key={pos} value={pos}>{pos.charAt(0).toUpperCase() + pos.slice(1)}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronDown size={18} className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-700">Display Options</h4>
                    <div className="flex items-center">
                      <div className="relative inline-block w-12 mr-3 align-middle select-none">
                        <input
                          type="checkbox"
                          id="toggle-dualaxis"
                          checked={chartConfig.dualAxis}
                          onChange={(e) => setChartConfig({ ...chartConfig, dualAxis: e.target.checked })}
                          className="absolute opacity-0 w-0 h-0"
                        />
                        <label
                          htmlFor="toggle-dualaxis"
                          className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${chartConfig.dualAxis ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <span
                            className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${chartConfig.dualAxis ? 'translate-x-6' : 'translate-x-0'}`}
                          ></span>
                        </label>
                      </div>
                      <label htmlFor="toggle-dualaxis" className="text-gray-700 cursor-pointer">Dual Y-Axis</label>
                    </div>
                    <div className="flex items-center">
                      <div className="relative inline-block w-12 mr-3 align-middle select-none">
                        <input
                          type="checkbox"
                          id="toggle-stacked"
                          checked={chartConfig.stacked}
                          onChange={(e) => setChartConfig({ ...chartConfig, stacked: e.target.checked })}
                          className="absolute opacity-0 w-0 h-0"
                        />
                        <label
                          htmlFor="toggle-stacked"
                          className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${chartConfig.stacked ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <span
                            className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${chartConfig.stacked ? 'translate-x-6' : 'translate-x-0'}`}
                          ></span>
                        </label>
                      </div>
                      <label htmlFor="toggle-stacked" className="text-gray-700 cursor-pointer">Stacked Display</label>
                    </div>
                    <div className="flex items-center">
                      <div className="relative inline-block w-12 mr-3 align-middle select-none">
                        <input
                          type="checkbox"
                          id="toggle-autoscale"
                          checked={chartConfig.autoScale}
                          onChange={(e) => setChartConfig({ ...chartConfig, autoScale: e.target.checked })}
                          className="absolute opacity-0 w-0 h-0"
                        />
                        <label
                          htmlFor="toggle-autoscale"
                          className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${chartConfig.autoScale ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <span
                            className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${chartConfig.autoScale ? 'translate-x-6' : 'translate-x-0'}`}
                          ></span>
                        </label>
                      </div>
                      <label htmlFor="toggle-autoscale" className="text-gray-700 cursor-pointer">Auto Scale Axes</label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-between items-center mt-auto">
            <button
              onClick={onRequestClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfigureChart}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <BarChart2 size={18} className="mr-2" />
              Generate Chart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartConfigurationModal;