import React, { useEffect, useState } from 'react';
import styles from '../styles/Embedded_Modal.module.css';
import { X } from 'lucide-react';
import { Bar, Line, Pie, Doughnut, Radar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';

const ChartRenderingModal = ({ isOpen, onRequestClose, chartConfig, dataset, matrix }) => {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && chartConfig) {
      fetchChartData();
    }
  }, [isOpen, chartConfig]);

  const colorPalette = [
    '#05445e', // Navy Blue
    '#189ab4', // Blue Grotto
    '#75e6da', // Blue Green
    '#d4f1f4'  // Baby Blue
  ];
  const fetchChartData = async () => {
    let payload = null;
    try {
      if (!chartConfig || !chartConfig.xAxisDimension || !chartConfig.labels?.length) {
        throw new Error('Invalid chart configuration');
      }
      if (!matrix) {
        throw new Error('Matrix ID is required');
      }
  
      // Map dimension IDs to labels for logging
      const dimensionLabels = Object.fromEntries(
        Object.entries(dataset.dimension || {}).map(([id, dim]) => [id, dim.label])
      );
  
      // Prepare the API payload
      const allDimensions = Object.keys(dataset.dimension || {});
      const dimensions = {};
      const dimensionIds = [];
  
      dimensions[chartConfig.xAxisDimension] = {
        category: { index: [...new Set(chartConfig.labels)] }
      };
      dimensionIds.push(chartConfig.xAxisDimension);
  
      chartConfig.series.forEach((s) => {
        if (s.dimension && !dimensionIds.includes(s.dimension)) {
          dimensions[s.dimension] = {
            category: {
              index: s.values?.length > 0 ? [...new Set(s.values)] : Object.keys(dataset.dimension[s.dimension].category.label)
            }
          };
          dimensionIds.push(s.dimension);
        }
      });
  
      allDimensions.forEach(dim => {
        if (!dimensionIds.includes(dim)) {
          dimensions[dim] = {
            category: { index: Object.keys(dataset.dimension[dim].category.label) }
          };
          dimensionIds.push(dim);
        }
      });
  
      const timeDimension = Object.keys(dataset.dimension).find(key => dataset.dimension[key].role === 'time');
      let fluidTime = [];
      if (timeDimension && chartConfig.xAxisDimension === timeDimension) {
        const dimensionSize = Object.keys(dataset.dimension[timeDimension].category.label).length;
        fluidTime = chartConfig.labels.map(code => {
          const actualPosition = Object.keys(dataset.dimension[timeDimension].category.label).indexOf(code);
          return dimensionSize - actualPosition - 1;
        });
        console.log('Fluid Time:', fluidTime);
      }
  
      payload = {
        jsonrpc: '2.0',
        method: 'PxStat.Data.Cube_API.ReadDataset',
        params: {
          class: 'query',
          id: dimensionIds,
          dimension: dimensions,
          extension: {
            language: { code: 'en' },
            format: { type: 'JSON-stat', version: '2.0' },
            matrix: matrix,
            m2m: false
          },
          version: '2.0'
        },
        id: 'pxwidget-chart'
      };
  
      // Log payload with labels
      console.log('API Payload:', {
        payload: JSON.stringify(payload, null, 2),
        dimensionLabels: dimensionIds.map(id => `${id} (${dimensionLabels[id] || 'Unknown'})`)
      });
  
      const response = await fetch('https://ws-demo-pxstat.cso.ie/public/api.jsonrpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      if (data.error) {
        throw new Error(`API error: ${data.error.message} (Code: ${data.error.code})`);
      }
  
      if (!data.result) {
        throw new Error('No data returned by the API. Check matrix ID or dimension values.');
      }
  
      const result = data.result;
      const { dimension, value, size, id } = result;
  
      const labels = chartConfig.labels.map(
        code => dataset.dimension[chartConfig.xAxisDimension].category.label[code]
      );
  
      const getPosition = (indices) => {
        let position = 0;
        let multiplier = 1;
        for (let i = id.length - 1; i >= 0; i--) {
          position += indices[i] * multiplier;
          multiplier *= size[i];
        }
        return position;
      };
  
      const datasets = [];
      chartConfig.series.forEach((series, seriesIdx) => {
        const seriesValues = series.values.length > 0 ? series.values : Object.keys(dataset.dimension[series.dimension].category.label);
  
        seriesValues.forEach((seriesCode, valueIdx) => {
          const seriesData = [];
          chartConfig.labels.forEach((xAxisCode) => {
            const indices = id.map(dimId => {
              if (dimId === chartConfig.xAxisDimension) {
                return dimension[dimId].category.index.indexOf(xAxisCode);
              } else if (dimId === series.dimension) {
                return dimension[dimId].category.index.indexOf(seriesCode);
              } else {
                return 0;
              }
            });
  
            const flatIndex = getPosition(indices);
            const dataValue = flatIndex < value.length ? value[flatIndex] || 0 : 0;
            if (!value[flatIndex]) console.warn(`Missing data at index ${flatIndex}`);
            seriesData.push(dataValue);
          });
  
          datasets.push({
            label: `${series.label} - ${dataset.dimension[series.dimension].category.label[seriesCode]}`,
            data: seriesData,
            yAxisID: chartConfig.dualAxis ? series.yAxis : undefined,
            backgroundColor: colorPalette[valueIdx % colorPalette.length],
            borderColor: colorPalette[valueIdx % colorPalette.length],
            borderWidth: 1
          });
        });
      });
  
      setChartData({ labels, datasets });
      console.log('Chart Data:', { labels, datasets });
      setError(null);
    } catch (err) {
      setError(`Failed to fetch chart data: ${err.message}`);
      console.error('Error Details:', {
        message: err.message,
        stack: err.stack,
        payload: payload ? JSON.stringify(payload, null, 2) : 'Payload not constructed',
        dimensionLabels: Object.fromEntries(
          Object.entries(dataset.dimension || {}).map(([id, dim]) => [id, dim.label])
        )
      });
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: chartConfig?.legendPosition || 'top' },
      title: { display: true, text: chartConfig?.title || 'Chart' },
    },
    scales: chartConfig?.type === 'pie' || chartConfig?.type === 'doughnut' || chartConfig?.type === 'radar' ? {} : {
      x: { 
        title: { display: true, text: chartConfig?.xAxisLabel || '' },
        stacked: chartConfig?.stacked
      },
      ...(chartConfig?.dualAxis ? {
        'y-axis-0': {
          position: 'left',
          title: { display: true, text: chartConfig?.yAxisLabel || '' },
          stacked: chartConfig?.stacked,
          beginAtZero: !chartConfig?.autoScale
        },
        'y-axis-1': {
          position: 'right',
          title: { display: true, text: 'Right Y-Axis' },
          stacked: chartConfig?.stacked,
          beginAtZero: !chartConfig?.autoScale
        },
      } : {
        y: {
          title: { display: true, text: chartConfig?.yAxisLabel || '' },
          stacked: chartConfig?.stacked,
          beginAtZero: !chartConfig?.autoScale
        },
      }),
    },
  };

  const ChartComponent = chartConfig?.type ? {
    bar: Bar,
    line: Line,
    pie: Pie,
    doughnut: Doughnut,
    radar: Radar,
  }[chartConfig.type] : Bar;

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.titleContainer}>
            <span className={styles.viewerTitle}>Chart Preview</span>
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
          {error ? (
            <div className="text-red-500 text-sm">{error}</div>
          ) : chartData ? (
            <div className="h-[80vh]">
              <ChartComponent data={chartData} options={options} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-t-blue-600 border-gray-200 rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartRenderingModal;