import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { X } from 'lucide-react';
import { Bar, Line, Pie, Doughnut, Radar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';

const ChartRenderingModal = ({ isOpen, onRequestClose, chartConfig, dataset }) => {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && chartConfig) {
      fetchChartData();
    }
  }, [isOpen, chartConfig]);

  const fetchChartData = async () => {
    try {
      const dimensions = {
        [chartConfig.xAxisDimension]: { category: { index: chartConfig.labels } },
      };
      chartConfig.series.forEach(s => {
        dimensions[s.dimension] = { category: { index: [Object.keys(dataset.dimension[s.dimension].category.label)[0]] } };
      });

      const response = await fetch('https://ws.cso.ie/public/api.jsonrpc', {
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
              matrix: dataset.id,
              language: { code: 'en' },
              format: { type: 'JSON-stat', version: '2.0' },
            },
            version: '2.0',
          },
          id: 677981009,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const labels = chartConfig.labels.map(code => dataset.dimension[chartConfig.xAxisDimension].category.label[code]);
      const datasets = chartConfig.series.map((s, i) => ({
        label: s.label,
        data: data.result.value.slice(i * chartConfig.labels.length, (i + 1) * chartConfig.labels.length),
        backgroundColor: `hsl(${i * 60}, 70%, 50%)`,
        borderColor: `hsl(${i * 60}, 70%, 50%)`,
        borderWidth: 1,
        yAxisID: chartConfig.dualAxis ? s.yAxis : undefined,
      }));

      setChartData({ labels, datasets });
      setError(null);
    } catch (err) {
      setError('Failed to fetch chart data: ' + (err.message || 'Please try again.'));
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: chartConfig.legendPosition },
      title: { display: true, text: chartConfig.title },
    },
    scales: chartConfig.type === 'pie' || chartConfig.type === 'doughnut' || chartConfig.type === 'radar' ? {} : {
      x: { title: { display: true, text: chartConfig.xAxisLabel } },
      ...(chartConfig.dualAxis ? {
        'y-axis-0': { position: 'left', title: { display: true, text: chartConfig.yAxisLabel }, stacked: chartConfig.stacked },
        'y-axis-1': { position: 'right', title: { display: true, text: 'Right Y-Axis' }, stacked: chartConfig.stacked },
      } : {
        y: { title: { display: true, text: chartConfig.yAxisLabel }, stacked: chartConfig.stacked, beginAtZero: !chartConfig.autoScale },
      }),
    },
  };

  const ChartComponent = {
    bar: Bar,
    line: Line,
    pie: Pie,
    doughnut: Doughnut,
    radar: Radar,
  }[chartConfig?.type] || Bar;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Chart Rendering Modal"
      className="max-w-5xl mx-auto mt-20 bg-white rounded-lg shadow-lg p-6"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <button onClick={onRequestClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
        <X size={20} />
      </button>
      <h2 className="text-2xl font-medium text-gray-900 mb-6">Chart Preview</h2>
      {error ? (
        <div className="text-red-500 text-sm">{error}</div>
      ) : chartData ? (
        <div className="h-[60vh]">
          <ChartComponent data={chartData} options={options} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-t-blue-600 border-gray-200 rounded-full animate-spin"></div>
        </div>
      )}
    </Modal>
  );
};

export default ChartRenderingModal;