import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import config from '../config';
import styles from '../styles/Design_Style.module.css';
import BackToTop from '../components/BackToTop';
import { PropagateLoader } from 'react-spinners';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/Design_Style.module.css';

const Datasets = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q');
  const themeQuery = queryParams.get('theme');
  const orgCode = queryParams.get('org');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [selectedOrganizations, setSelectedOrganizations] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState([null, null]);
  const [organizationOptions, setOrganizationOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState(searchQuery || '');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    document.title = 'Emerald | Datasets';
    setSearchInput(searchQuery || '');
    if (orgCode) {
      fetchDatasetsByOrganisation(orgCode);
    } else if (searchQuery) {
      fetchSearchResults(searchQuery);
    } else if (themeQuery) {
      fetchDatasetsByTheme(themeQuery);
    } else {
      fetchDefaultDatasets();
    }
  }, [searchQuery, orgCode, themeQuery]);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const fetchDefaultDatasets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/api.jsonrpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'PxStat.Data.Cube_API.ReadCollection',
          params: { language: 'en', datefrom: '2025-03-14' },
          id: 977917801,
        }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const datasets = data.result?.link?.item?.map((item) => ({
        MtrCode: item.extension?.matrix || 'unknown',
        MtrTitle: item.label || 'Untitled Dataset',
        RlsLiveDatetimeFrom: item.updated || new Date().toISOString(),
        CprValue: item.extension?.copyright?.name || 'Unknown',
        CprCode: item.extension?.copyright?.code || 'UNKNOWN',
        description: item.description || 'No description available',
      })) || [];
      setResults(datasets);
      setOrganizationOptions([...new Set(datasets
        .filter(item => !config.pxFilter || item.CprCode.toLowerCase().startsWith(config.pxFilter.toLowerCase()))
        .map((item) => item.CprValue)
        .filter(Boolean))]);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const fetchSearchResults = async (term) => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/api.jsonrpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'PxStat.System.Navigation.Navigation_API.Search',
          params: { Search: term, LngIsoCode: 'en' },
          id: Math.floor(Math.random() * 1000000000),
        }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const searchResults = Array.isArray(data.result)
        ? data.result.map((item) => ({
            MtrCode: item.MtrCode || 'unknown',
            MtrTitle: item.MtrTitle || 'Untitled Dataset',
            RlsLiveDatetimeFrom: item.RlsLiveDatetimeFrom || new Date().toISOString(),
            CprValue: item.CprValue || 'Unknown',
            CprCode: item.CprCode || 'UNKNOWN',
            description: item.description || 'No description available',
            FrqValue: item.FrqValue,
            period: item.period,
            classification: item.classification,
          }))
        : [];
      setResults(searchResults);
      setOrganizationOptions([...new Set(searchResults
        .filter(item => !config.pxFilter || item.CprCode.toLowerCase().startsWith(config.pxFilter.toLowerCase()))
        .map((item) => item.CprValue)
        .filter(Boolean))]);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const fetchDatasetsByOrganisation = async (cprCode) => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/api.jsonrpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'PxStat.System.Navigation.Navigation_API.Search',
          params: { Search: '', LngIsoCode: 'en' },
          id: Math.floor(Math.random() * 1000000000),
        }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const datasets = Array.isArray(data.result)
        ? data.result
            .filter(item => item.CprCode && item.CprCode.toLowerCase() === cprCode.toLowerCase())
            .map((item) => ({
              MtrCode: item.MtrCode || 'unknown',
              MtrTitle: item.MtrTitle || 'Untitled Dataset',
              RlsLiveDatetimeFrom: item.RlsLiveDatetimeFrom || new Date().toISOString(),
              CprValue: item.CprValue || cprCode,
              CprCode: item.CprCode || cprCode,
            }))
        : [];
      setResults(datasets);
      setOrganizationOptions([...new Set(datasets
        .filter(item => !config.pxFilter || item.CprCode.toLowerCase().startsWith(config.pxFilter.toLowerCase()))
        .map((item) => item.CprValue)
        .filter(Boolean))]);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const fetchDatasetsByTheme = async (theme) => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/api.jsonrpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'PxStat.System.Navigation.Navigation_API.Search',
          params: { Search: theme, LngIsoCode: 'en' },
          id: Math.floor(Math.random() * 1000000000),
        }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const datasets = Array.isArray(data.result)
        ? data.result.map((item) => ({
            MtrCode: item.MtrCode || 'unknown',
            MtrTitle: item.MtrTitle || 'Untitled Dataset',
            RlsLiveDatetimeFrom: item.RlsLiveDatetimeFrom || new Date().toISOString(),
            CprValue: item.CprValue || 'Unknown',
            CprCode: item.CprCode || 'UNKNOWN',
            description: item.description || 'No description available',
          }))
        : [];
      setResults(datasets);
      setOrganizationOptions([...new Set(datasets
        .filter(item => !config.pxFilter || item.CprCode.toLowerCase().startsWith(config.pxFilter.toLowerCase()))
        .map((item) => item.CprValue)
        .filter(Boolean))]);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const handleSortChange = (e) => {
    const selectedSort = e.target.value;
    setSortBy(selectedSort);
    let sortedResults = [...results];
    if (selectedSort === 'date') {
      sortedResults.sort((a, b) => new Date(b.RlsLiveDatetimeFrom) - new Date(a.RlsLiveDatetimeFrom));
    } else if (selectedSort === 'adate') {
      sortedResults.sort((a, b) => new Date(a.RlsLiveDatetimeFrom) - new Date(b.RlsLiveDatetimeFrom));
    }
    setResults(sortedResults);
  };

  const handleOrganizationFilter = (org) => {
    setSelectedOrganizations((prev) =>
      prev.includes(org) ? prev.filter((item) => item !== org) : [...prev, org]
    );
  };

  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setSelectedDateRange([start, end]);
  };

  const filteredResults = results.filter((result) => {
    const orgMatch =
      selectedOrganizations.length === 0 || selectedOrganizations.includes(result.CprValue);
    const dateMatch =
      selectedDateRange[0] === null ||
      selectedDateRange[1] === null ||
      (new Date(result.RlsLiveDatetimeFrom) >= selectedDateRange[0] &&
       new Date(result.RlsLiveDatetimeFrom) <= selectedDateRange[1]);
    const cprMatch = !config.pxFilter || result.CprCode.toLowerCase().startsWith(config.pxFilter.toLowerCase());
    return orgMatch && dateMatch && cprMatch;
  });

  const getOrganizationCounts = () => {
    return organizationOptions.map((org) => ({
      name: org,
      count: results.filter((result) => result.CprValue === org &&
        (!config.pxFilter || result.CprCode.toLowerCase().startsWith(config.pxFilter.toLowerCase()))).length,
    }));
  };

  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = filteredResults.slice(indexOfFirstResult, indexOfLastResult);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/datasets?q=${encodeURIComponent(searchInput.trim())}`);
    } else {
      navigate('/datasets');
    }
  };

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  const toggleAccordion = (id) => {
    const accordionControl = document.getElementById(id);
    if (accordionControl) {
      accordionControl.checked = !accordionControl.checked;
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

  return (
    <div className="ds_page__middle">
      <div className="ds_wrapper">
        <main className="ds_layout ds_layout--search-results--filters">
          <div className="ds_layout__header">
            <header className="ds_page-header">
              <h1 className="ds_page-header__title">
                {searchQuery ? `Search results for "${searchQuery}"` : themeQuery ? `Datasets for ${themeQuery}` : orgCode ? `Datasets for ${orgCode}` : 'Datasets'}
              </h1>
            </header>
          </div>
          <div className="ds_layout__content">
            {isMobile && (
              <button
                onClick={toggleMobileFilters}
                className="ds_button ds_button--secondary ds_button--small"
                style={{ marginBottom: '1rem', width: '100%' }}
              >
                {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            )}
          </div>
          <div className="ds_layout__sidebar" style={{ display: isMobile && !showMobileFilters ? 'none' : 'block' }}>
            <div className="ds_search-filters">
              <h3 className="ds_search-filters__title ds_h4">Search</h3>
              <div className="ds_site-search" style={{ marginBottom: '1rem' }}>
                <form
                  action="/datasets"
                  role="search"
                  className="ds_site-search__form"
                  method="GET"
                  onSubmit={handleSearchSubmit}
                >
                  <label className="ds_label visually-hidden" htmlFor="site-search">
                    Search
                  </label>
                  <div className="ds_input__wrapper ds_input__wrapper--has-icon">
                    <input
                      name="q"
                      required
                      id="site-search"
                      className="ds_input ds_site-search__input"
                      type="search"
                      placeholder="Search"
                      autoComplete="off"
                      defaultValue={searchQuery || ''}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                    <button type="submit" className="ds_button js-site-search-button">
                      <span className="visually-hidden">Search</span>
                      <svg
                        className="ds_icon ds_icon--24"
                        aria-hidden="true"
                        role="img"
                        viewBox="0 0 24 24"
                      >
                        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
              <div className="ds_details ds_no-margin" data-module="ds-details">
                <input id="filters-toggle" type="checkbox" className="ds_details__toggle visually-hidden" />
                <label htmlFor="filters-toggle" className="ds_details__summary">
                  Search filters
                </label>
                <div className="ds_skip-links ds_skip-links--static">
                  <ul className="ds_skip-links__list">
                    <li className="ds_skip-links__item">
                      <a className="ds_skip-links__link" href="#search-results">
                        Skip to results
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="ds_details__text">
                  <form id="filters">
                    <h3 className="ds_search-filters__title ds_h4">Filter by</h3>
                    <div className="ds_accordion ds_accordion--small ds_!_margin-top--0" data-module="ds-accordion">
                      <div className="ds_accordion-item">
                        <input
                          type="checkbox"
                          className={`visually-hidden ds_accordion-item__control ${styles.accordionItemControl}`}
                          id="organization-panel"
                          aria-labelledby="organization-panel-heading"
                        />
                        <div className={`ds_accordion-item__header ${styles.accordionItemHeader}`}>
                          <h3 id="organization-panel-heading" className="ds_accordion-item__title">
                            Organisation
                            {selectedOrganizations.length > 0 && (
                              <div className="ds_search-filters__filter-count">
                                ({selectedOrganizations.length} selected)
                              </div>
                            )}
                          </h3>
                          <span className={styles.accordionIndicator}></span>
                          <label className="ds_accordion-item__label" htmlFor="organization-panel">
                            <span className="visually-hidden">Show this section</span>
                          </label>
                        </div>
                        <div className="ds_accordion-item__body">
                          <fieldset>
                            <legend className="visually-hidden">
                              Select which organizations you would like to see
                            </legend>
                            <div className="ds_search-filters__scrollable">
                              <div className="ds_search-filters__checkboxes">
                                {getOrganizationCounts().map((org) => (
                                  <div key={org.name} className="ds_checkbox ds_checkbox--small">
                                    <input
                                      id={`org-${org.name}`}
                                      name="organisations"
                                      type="checkbox"
                                      className="ds_checkbox__input"
                                      checked={selectedOrganizations.includes(org.name)}
                                      onChange={() => handleOrganizationFilter(org.name)}
                                    />
                                    <label htmlFor={`org-${org.name}`} className="ds_checkbox__label">
                                      {org.name} <span className="badge ml-2">({org.count})</span>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </fieldset>
                        </div>
                      </div>
                      <div className="ds_accordion-item">
                        <input
                          type="checkbox"
                          className={`visually-hidden ds_accordion-item__control ${styles.accordionItemControl}`}
                          id="date-panel"
                          aria-labelledby="date-panel-heading"
                        />
                        <div className={`ds_accordion-item__header ${styles.accordionItemHeader}`}>
                          <h3 id="date-panel-heading" className="ds_accordion-item__title">
                            Updated
                            {(selectedDateRange[0] || selectedDateRange[1]) && (
                              <div className="ds_search-filters__filter-count">
                                (Date selected)
                              </div>
                            )}
                          </h3>
                          <span className={styles.accordionIndicator}></span>
                          <label className="ds_accordion-item__label" htmlFor="date-panel">
                            <span className="visually-hidden">Show this section</span>
                          </label>
                        </div>
                        <div className="ds_accordion-item__body">
                          <fieldset id="filter-date-range">
                            <legend className="visually-hidden">Filter by date</legend>
                            <div className="date-form-group">
                              <div className="date-datepicker">
                                <label className="date-label" htmlFor="date-from">
                                  Start date
                                </label>
                                <p className="date-hint-text">
                                  For example, 31/01/2025
                                </p>
                                <div className="date-input-container">
                                  <div className="date-input-wrapper">
                                    <DatePicker
                                      id="date-from"
                                      selected={selectedDateRange[0]}
                                      onChange={(date) => handleDateRangeChange([date, selectedDateRange[1]])}
                                      dateFormat="dd/MM/yyyy"
                                      placeholderText="dd/mm/yyyy"
                                      className="date-input"
                                      showMonthDropdown
                                      showYearDropdown
                                      dropdownMode="select"
                                    />
                                    <button
                                      type="button"
                                      className="date-button"
                                      aria-label="Choose start date"
                                    >
                                      <svg className="date-icon" aria-hidden="true">
                                        <use xlinkHref="/assets/images/icons/icons.stack.svg#calendar_today"></use>
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="date-form-group">
                              <div className="date-datepicker">
                                <label className="date-label" htmlFor="date-to">
                                  End date
                                </label>
                                <p className="date-hint-text">
                                  For example, 31/03/2025
                                </p>
                                <div className="date-input-container">
                                  <div className="date-input-wrapper">
                                    <DatePicker
                                      id="date-to"
                                      selected={selectedDateRange[1]}
                                      onChange={(date) => handleDateRangeChange([selectedDateRange[0], date])}
                                      dateFormat="dd/MM/yyyy"
                                      placeholderText="dd/mm/yyyy"
                                      className="date-input"
                                      showMonthDropdown
                                      showYearDropdown
                                      dropdownMode="select"
                                    />
                                    <button
                                      type="button"
                                      className="date-button"
                                      aria-label="Choose end date"
                                    >
                                      <svg className="date-icon" aria-hidden="true">
                                        <use xlinkHref="/assets/images/icons/icons.stack.svg#calendar_today"></use>
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </fieldset>
                        </div>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="ds_button ds_button--primary ds_button--small ds_button--max ds_no-margin"
                    >
                      Clear filters
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="ds_layout__list">
            <div className="ds_search-results">
              <h2 aria-live="polite" className="ds_search-results__title">
                {searchQuery
                  ? `${filteredResults.length} result${filteredResults.length !== 1 ? 's' : ''} for "${searchQuery}"`
                  : themeQuery
                    ? `${filteredResults.length} dataset${filteredResults.length !== 1 ? 's' : ''} for ${themeQuery}`
                    : orgCode
                      ? `${filteredResults.length} dataset${filteredResults.length !== 1 ? 's' : ''} for ${orgCode}`
                      : `Showing latest ${filteredResults.length} dataset${filteredResults.length !== 1 ? 's' : ''}`}
              </h2>
              <hr className="ds_search-results__divider" />
              <div className="ds_search-controls">
                <div className="ds_skip-links ds_skip-links--static">
                  <ul className="ds_skip-links__list">
                    <li className="ds_skip-links__item">
                      <a className="ds_skip-links__link" href="#search-results">
                        Skip to results
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="ds_sort-options">
                  <label className="ds_label" htmlFor="sort-by">
                    Sort by
                  </label>
                  <span className={`ds_select-wrapper ${styles.selectWrapper}`}>
                    <select
                      className={`ds_select ${styles.select}`}
                      id="sort-by"
                      value={sortBy}
                      onChange={handleSortChange}
                    >
                      <option value="date">Updated (newest)</option>
                      <option value="adate">Updated (oldest)</option>
                    </select>
                    <span className={`ds_select-arrow ${styles.selectArrow}`} aria-hidden="true"></span>
                  </span>
                </div>
              </div>
              <ol
                className="ds_search-results__list"
                data-total={filteredResults.length}
                start={indexOfFirstResult + 1}
              >
                {currentResults.map((result) => (
                  <li key={result.MtrCode} className="ds_search-result">
                    <h3 className="ds_search-result__title">
                      <Link
                        to={{
                          pathname: `/dataset/${result.MtrCode}`,
                          state: { fromResults: true, searchQuery: searchQuery },
                        }}
                        className="ds_search-result__link"
                      >
                        {result.MtrTitle}
                      </Link>
                    </h3>
                    <dl className="ds_search-result__metadata ds_metadata ds_metadata--inline">
                      <div className="ds_metadata__item">
                        <dt className="ds_metadata__key">Organisation</dt>
                        <dd className="ds_metadata__value">{result.CprValue || 'Unknown'}</dd>
                      </div>
                      <div className="ds_metadata__item">
                        <dt className="ds_metadata__key">Last Updated</dt>
                        <dd className="ds_metadata__value">
                          {new Date(result.RlsLiveDatetimeFrom).toLocaleDateString()}
                        </dd>
                      </div>
                    </dl>
                    {(result.FrqValue || result.period || result.classification) && (
                      <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {result.FrqValue && (
                          <span
                          style={{
                            backgroundColor: '#0475b1',           // Rich, dark blue-black
                            color: '#ffffff',
                            padding: '0.3rem 0.8rem',
                            borderRadius: '0.5rem',              // More squared than before
                            fontSize: '0.55rem',
                            fontWeight: 500,
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            transition: 'all 0.2s ease-in-out',
                            whiteSpace: 'nowrap'
                          }}
                          >
                            {result.FrqValue}
                          </span>
                        )}
                        {result.period && (
                          <span
                          style={{
                            backgroundColor: '#28a197',           // Rich, dark blue-black
                            color: '#ffffff',
                            padding: '0.3rem 0.8rem',
                            borderRadius: '0.5rem',              // More squared than before
                            fontSize: '0.55rem',
                            fontWeight: 500,
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            transition: 'all 0.2s ease-in-out',
                            whiteSpace: 'nowrap'
                          }}
                          >
                            {result.period[0]} - {result.period[result.period.length - 1]}
                          </span>
                        )}
                        {result.classification &&
                          result.classification.map((dim, index) => (
                            <span
                              key={index}
                              style={{
                                backgroundColor: '#38486d',           // Rich, dark blue-black
                                color: '#ffffff',
                                padding: '0.3rem 0.8rem',
                                borderRadius: '0.5rem',              // More squared than before
                                fontSize: '0.55rem',
                                fontWeight: 500,
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                transition: 'all 0.2s ease-in-out',
                                whiteSpace: 'nowrap'
                              }}
                              
                            >
                              {dim.ClsValue}
                            </span>
                          ))}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
              <nav className="ds_pagination" aria-label="Search result pages">
                <ul className="ds_pagination__list">
                  <li className="ds_pagination__item">
                    <button
                      className="ds_pagination__link"
                      disabled={currentPage === 1}
                      onClick={() => paginate(currentPage - 1)}
                    >
                      <span className="ds_pagination__link-label">Previous</span>
                    </button>
                  </li>
                  {Array.from(
                    { length: Math.ceil(filteredResults.length / resultsPerPage) },
                    (_, i) => (
                      <li key={i + 1} className="ds_pagination__item">
                        <button
                          aria-label={`Page ${i + 1}`}
                          className={`ds_pagination__link ${
                            currentPage === i + 1 ? 'ds_current' : ''
                          }`}
                          onClick={() => paginate(i + 1)}
                        >
                          <span className="ds_pagination__link-label">{i + 1}</span>
                        </button>
                      </li>
                    )
                  )}
                  <li className="ds_pagination__item">
                    <button
                      className="ds_pagination__link"
                      disabled={currentPage >= Math.ceil(filteredResults.length / resultsPerPage)}
                      onClick={() => paginate(currentPage + 1)}
                    >
                      <span className="ds_pagination__link-label">Next</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          <BackToTop />
        </main>
      </div>
    </div>
  );
};

export default Datasets;
