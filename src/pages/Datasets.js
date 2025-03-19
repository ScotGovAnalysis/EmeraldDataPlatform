import React, { useEffect, useState } from 'react';
import { Search, ChevronDown, Filter, Calendar, Tag, X, Check } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const Datasets = () => {
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [sortOption, setSortOption] = useState('relevance');
  const [selectedFilters, setSelectedFilters] = useState({
    topics: [],
    types: [],
    organisations: [],
    dateRange: [null, null],
  });
  const [searchResults, setSearchResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtersData, setFiltersData] = useState({ topics: [], types: [], organisations: [] });
  const [openFilter, setOpenFilter] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const term = urlParams.get('q');
    if (term) {
      setSearchTerm(term);
      fetchSearchResults(term);
    }
  }, [location.search]);

  const fetchSearchResults = async (term) => {
    try {
      const response = await fetch('https://ws.cso.ie/public/api.jsonrpc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'PxStat.System.Navigation.Navigation_API.Search',
          params: { Search: term, LngIsoCode: 'en' },
          id: Math.floor(Math.random() * 1000000000),
        }),
      });
      const data = await response.json();
      setSearchResults(data.result);

      // Extract unique filter values from the results
      const uniqueTopics = [...new Set(data.result.map((item) => item.ThmValue))];
      const uniqueTypes = [...new Set(data.result.map((item) => item.SbjValue))];
      const uniqueOrganisations = [...new Set(data.result.map((item) => item.CprValue))];
      setFiltersData({ topics: uniqueTopics, types: uniqueTypes, organisations: uniqueOrganisations });
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  useEffect(() => {
    document.title = 'Emerald | Datasets';
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchResults, selectedFilters]);

  const applyFilters = () => {
    const results = searchResults.filter((result) => {
      const topicMatch = selectedFilters.topics.length === 0 || selectedFilters.topics.includes(result.ThmValue);
      const typeMatch = selectedFilters.types.length === 0 || selectedFilters.types.includes(result.SbjValue);
      const organisationMatch = selectedFilters.organisations.length === 0 || selectedFilters.organisations.includes(result.CprValue);
      const dateMatch = selectedFilters.dateRange[0] === null || selectedFilters.dateRange[1] === null ||
        (new Date(result.RlsLiveDatetimeFrom) >= new Date(selectedFilters.dateRange[0]) &&
         new Date(result.RlsLiveDatetimeFrom) <= new Date(selectedFilters.dateRange[1]));
      return topicMatch && typeMatch && organisationMatch && dateMatch;
    });
    setFilteredResults(results);
  };

  const toggleFilter = (category, value) => {
    setSelectedFilters((prev) => {
      const updatedFilters = {
        ...prev,
        [category]: prev[category].includes(value)
          ? prev[category].filter((item) => item !== value)
          : [...prev[category], value],
      };
      return updatedFilters;
    });
  };

  const handleFilterToggle = (filterName) => {
    setOpenFilter(openFilter === filterName ? null : filterName);
  };

  const handleSelectAll = (category) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [category]: [...filtersData[category]],
    }));
  };

  const handleClearAll = (category) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [category]: [],
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(`/datasets?q=${searchTerm}`);
  };

  const handleDatasetClick = (mtrCode) => {
    navigate(`/dataset/${mtrCode}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-900"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI3NjgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiIGlkPSJhIj48c3RvcCBzdG9wLWNvbG9yPSIjRkZGIiBzdG9wLW9wYWNpdHk9Ii4yNSIgb2Zmc2V0PSIwJSIvPjxzdG9wIHN0b3AtY29sb3I9IiNGRkYiIHN0b3Atb3BhY2l0eT0iMCIgb2Zmc2V0PSIxMDAlIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZD0iTTAgMGgxNDQwdjc2OEgweiIgZmlsbD0idXJsKCNhKSIgZmlsbC1ydWxlPSJldmVub2RkIiBvcGFjaXR5PSIuMiIvPjwvc3ZnPg==')] opacity-30"></div>
        <div className="relative max-w-6xl mx-auto px-8 py-16">
          <nav className="text-sm text-blue-100/80 flex items-center mb-8">
            <span className="hover:text-white cursor-pointer transition-colors duration-200">
              <a href="/home">Home</a>
            </span>
            <span className="mx-2 text-blue-100/40">/</span>
            <span className="text-white">Search Results</span>
          </nav>
          <div className="md:w-3/4">
          <h1 
  className="text-4xl font-medium text-white leading-tight" 
  style={{ marginBottom: '20px' }}
>
  Datasets
</h1>          </div>
          <div className="md:w-3/4">
          </div>
          <form onSubmit={handleSearch} className="flex group">
            <div className="relative flex-1 bg-white/10 rounded-l-lg border-y border-l border-white/20">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-100" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search datasets, publications, and more..."
                className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-blue-100/70 focus:outline-none transition-colors duration-200"
              />
            </div>
            <button 
              type="submit" 
              className="px-8 bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 rounded-r-lg border border-white/20"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className={`lg:w-1/3 ${filtersVisible ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium text-gray-900">Filters</h2>
                <button
                  className="lg:hidden px-3 py-1 text-sm text-gray-600 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setFiltersVisible(!filtersVisible)}
                >
                  <X size={16} />
                </button>
              </div>
              
              {/* Topic Filter */}
              <div className="mb-4 border border-gray-100 overflow-hidden bg-white rounded-lg shadow-sm">
                <button
                  onClick={() => handleFilterToggle('topics')}
                  className="w-full px-6 py-4 bg-white hover:bg-gray-50 transition-colors duration-150 flex justify-between items-center"
                >
                  <div>
                    <div className="text-left text-gray-800 font-medium">Topic</div>
                    {selectedFilters.topics?.length > 0 && (
                      <div className="text-sm text-gray-500 mt-1">{selectedFilters.topics.length} selected</div>
                    )}
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 transition-transform duration-200 ${openFilter === 'topics' ? 'transform rotate-180' : ''}`}
                  />
                </button>
                
                {openFilter === 'topics' && (
                  <div className="border-t border-gray-100">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        {selectedFilters.topics?.length || 0} of {filtersData.topics.length} selected
                      </div>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleSelectAll('topics')}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Select all
                        </button>
                        <button
                          onClick={() => handleClearAll('topics')}
                          className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                        >
                          Clear all
                        </button>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="p-4">
                        {filtersData.topics.map((item, index) => {
                          const isSelected = selectedFilters.topics?.includes(item);
                          return (
                            <div key={index} className="flex items-center mb-2">
                              <button
                                onClick={() => toggleFilter('topics', item)}
                                className={`flex items-center w-full p-2 rounded hover:bg-gray-100 transition-colors duration-150 ${isSelected ? 'bg-blue-50' : ''}`}
                              >
                                <div className={`w-5 h-5 rounded flex items-center justify-center ${isSelected ? 'bg-blue-600' : 'border border-gray-300'}`}>
                                  {isSelected && <Check size={14} className="text-white" />}
                                </div>
                                <span className="ml-3 text-gray-700 text-sm">{item}</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Type Filter */}
              <div className="mb-4 border border-gray-100 overflow-hidden bg-white rounded-lg shadow-sm">
                <button
                  onClick={() => handleFilterToggle('types')}
                  className="w-full px-6 py-4 bg-white hover:bg-gray-50 transition-colors duration-150 flex justify-between items-center"
                >
                  <div>
                    <div className="text-left text-gray-800 font-medium">Type</div>
                    {selectedFilters.types?.length > 0 && (
                      <div className="text-sm text-gray-500 mt-1">{selectedFilters.types.length} selected</div>
                    )}
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 transition-transform duration-200 ${openFilter === 'types' ? 'transform rotate-180' : ''}`}
                  />
                </button>
                
                {openFilter === 'types' && (
                  <div className="border-t border-gray-100">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        {selectedFilters.types?.length || 0} of {filtersData.types.length} selected
                      </div>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleSelectAll('types')}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Select all
                        </button>
                        <button
                          onClick={() => handleClearAll('types')}
                          className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                        >
                          Clear all
                        </button>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="p-4">
                        {filtersData.types.map((item, index) => {
                          const isSelected = selectedFilters.types?.includes(item);
                          return (
                            <div key={index} className="flex items-center mb-2">
                              <button
                                onClick={() => toggleFilter('types', item)}
                                className={`flex items-center w-full p-2 rounded hover:bg-gray-100 transition-colors duration-150 ${isSelected ? 'bg-blue-50' : ''}`}
                              >
                                <div className={`w-5 h-5 rounded flex items-center justify-center ${isSelected ? 'bg-blue-600' : 'border border-gray-300'}`}>
                                  {isSelected && <Check size={14} className="text-white" />}
                                </div>
                                <span className="ml-3 text-gray-700 text-sm">{item}</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Organisation Filter */}
              <div className="mb-4 border border-gray-100 overflow-hidden bg-white rounded-lg shadow-sm">
                <button
                  onClick={() => handleFilterToggle('organisations')}
                  className="w-full px-6 py-4 bg-white hover:bg-gray-50 transition-colors duration-150 flex justify-between items-center"
                >
                  <div>
                    <div className="text-left text-gray-800 font-medium">Organisation</div>
                    {selectedFilters.organisations?.length > 0 && (
                      <div className="text-sm text-gray-500 mt-1">{selectedFilters.organisations.length} selected</div>
                    )}
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 transition-transform duration-200 ${openFilter === 'organisations' ? 'transform rotate-180' : ''}`}
                  />
                </button>
                
                {openFilter === 'organisations' && (
                  <div className="border-t border-gray-100">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        {selectedFilters.organisations?.length || 0} of {filtersData.organisations.length} selected
                      </div>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleSelectAll('organisations')}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Select all
                        </button>
                        <button
                          onClick={() => handleClearAll('organisations')}
                          className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                        >
                          Clear all
                        </button>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="p-4">
                        {filtersData.organisations.map((item, index) => {
                          const isSelected = selectedFilters.organisations?.includes(item);
                          return (
                            <div key={index} className="flex items-center mb-2">
                              <button
                                onClick={() => toggleFilter('organisations', item)}
                                className={`flex items-center w-full p-2 rounded hover:bg-gray-100 transition-colors duration-150 ${isSelected ? 'bg-blue-50' : ''}`}
                              >
                                <div className={`w-5 h-5 rounded flex items-center justify-center ${isSelected ? 'bg-blue-600' : 'border border-gray-300'}`}>
                                  {isSelected && <Check size={14} className="text-white" />}
                                </div>
                                <span className="ml-3 text-gray-700 text-sm">{item}</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Date Range Filter */}
              <div className="mb-4 border border-gray-100 overflow-hidden bg-white rounded-lg shadow-sm">
                <button
                  onClick={() => handleFilterToggle('dateRange')}
                  className="w-full px-6 py-4 bg-white hover:bg-gray-50 transition-colors duration-150 flex justify-between items-center"
                >
                  <div>
                    <div className="text-left text-gray-800 font-medium">Date Range</div>
                    {(selectedFilters.dateRange[0] || selectedFilters.dateRange[1]) && (
                      <div className="text-sm text-gray-500 mt-1">Filter applied</div>
                    )}
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 transition-transform duration-200 ${openFilter === 'dateRange' ? 'transform rotate-180' : ''}`}
                  />
                </button>
                
                {openFilter === 'dateRange' && (
                  <div className="border-t border-gray-100 p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">From</label>
                        <div className="relative">
                          <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="date"
                            value={selectedFilters.dateRange[0] || ''}
                            onChange={(e) => setSelectedFilters((prev) => ({
                              ...prev,
                              dateRange: [e.target.value, prev.dateRange[1]],
                            }))}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">To</label>
                        <div className="relative">
                          <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="date"
                            value={selectedFilters.dateRange[1] || ''}
                            onChange={(e) => setSelectedFilters((prev) => ({
                              ...prev,
                              dateRange: [prev.dateRange[0], e.target.value],
                            }))}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => setSelectedFilters((prev) => ({
                            ...prev,
                            dateRange: [null, null],
                          }))}
                          className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                        >
                          Clear dates
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          <main className="lg:w-2/3">
            <div className="flex items-center justify-between mb-6">
              <button
                className="lg:hidden px-4 py-2 text-sm text-gray-600 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 flex items-center transition-colors duration-200"
                onClick={() => setFiltersVisible(!filtersVisible)}
              >
                <Filter size={16} className="mr-2" />
                {filtersVisible ? 'Hide filters' : 'Show filters'}
              </button>
              
              <p className="text-sm text-gray-600 hidden lg:block">
                Showing <span className="font-medium text-gray-900">{filteredResults.length}</span> results for{' '}
                <span className="font-medium text-gray-900">{searchTerm}</span>
              </p>
              
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">Sort by:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="pl-4 pr-8 py-2 text-sm bg-white text-gray-900 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 transition-colors duration-200"
                >
                  <option value="relevance">Relevance</option>
                  <option value="date">Date (Newest)</option>
                  <option value="popularity">Popularity</option>
                </select>
              </div>
            </div>

            {filteredResults.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No results found for "{searchTerm}"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredResults.map((result) => (
                  <div
                    key={result.MtrCode}
                    onClick={() => handleDatasetClick(result.MtrCode)}
                    className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer"
                  >
                    <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200 mb-2">
                      {result.MtrTitle}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">{result.MtrTitle}</p>
                    <div className="flex flex-wrap items-center justify-between">
                      <div className="flex gap-2 flex-wrap">
                        {result.classification && result.classification.map((classification) => (
                          <span
                            key={classification.ClsCode}
                            className="px-3 py-1 bg-gray-50 text-gray-600 text-xs rounded-full flex items-center"
                          >
                            <Tag size={12} className="mr-1.5" />
                            {classification.ClsValue}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 mt-2 lg:mt-0">
                        {new Date(result.RlsLiveDatetimeFrom).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Datasets;