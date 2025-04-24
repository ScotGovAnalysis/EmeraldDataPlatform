import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import config from '../config';
import styles from '../styles/Design_Style.module.css';
import BackToTop from '../components/BackToTop';
import { PropagateLoader } from 'react-spinners';

const Datasets = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedOrganizations, setSelectedOrganizations] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState([null, null]);
  const [organizationOptions, setOrganizationOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(10);

  useEffect(() => {
    document.title = "Cobalt | Datasets";
    if (searchQuery) {
      fetchSearchResults(searchQuery);
    } else {
      fetchDefaultDatasets();
    }
  }, [searchQuery]);

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
      const datasets = data.result.link.item.map((item) => ({
        MtrCode: item.extension.matrix,
        MtrTitle: item.label,
        RlsLiveDatetimeFrom: item.updated,
        CprValue: item.extension.copyright.name,
        description: item.description || 'No description available',
      }));
      setResults(datasets);
      setOrganizationOptions([...new Set(datasets.map((item) => item.CprValue))]);
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
      setResults(data.result);
      setOrganizationOptions([...new Set(data.result.map((item) => item.CprValue))]);
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

  const handleDateRangeChange = (index, value) => {
    setSelectedDateRange((prev) => {
      const newRange = [...prev];
      newRange[index] = value;
      return newRange;
    });
  };

  const filteredResults = results.filter((result) => {
    const orgMatch =
      selectedOrganizations.length === 0 || selectedOrganizations.includes(result.CprValue);
    const dateMatch =
      selectedDateRange[0] === null ||
      selectedDateRange[1] === null ||
      (new Date(result.RlsLiveDatetimeFrom) >= new Date(selectedDateRange[0]) &&
       new Date(result.RlsLiveDatetimeFrom) <= new Date(selectedDateRange[1]));
    return orgMatch && dateMatch;
  });

  const getOrganizationCounts = () => {
    return organizationOptions.map((org) => ({
      name: org,
      count: results.filter((result) => result.CprValue === org).length,
    }));
  };

  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = filteredResults.slice(indexOfFirstResult, indexOfLastResult);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
                {searchQuery ? `Search results for "${searchQuery}"` : 'Datasets'}
              </h1>
            </header>
          </div>
          <div className="ds_layout__content"></div>
          <div className="ds_layout__sidebar">
            <div className="ds_search-filters">
              <h3 className="ds_search-filters__title ds_h4">Search</h3>
              <div className="ds_site-search">
                <form action="/results" role="search" className="ds_site-search__form" method="GET">
                  <label className="ds_label visually-hidden" htmlFor="site-search">Search</label>
                  <div className="ds_input__wrapper ds_input__wrapper--has-icon">
                    <input
                      name="q"
                      required
                      id="site-search"
                      className="ds_input ds_site-search__input"
                      type="search"
                      placeholder="Search"
                      autoComplete="off"
                      value={searchQuery || ''}
                      onChange={(e) => navigate(`/datasets?q=${encodeURIComponent(e.target.value)}`)}
                    />
                    <button type="submit" className="ds_button js-site-search-button">
                      <span className="visually-hidden">Search</span>
                      <svg className="ds_icon ds_icon--24" aria-hidden="true" role="img" viewBox="0 0 24 24">
                        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
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
                      <a className="ds_skip-links__link" href="#search-results">Skip to results</a>
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
                        />
                        <div className={`ds_accordion-item__header ${styles.accordionItemHeader}`}>
                          <h3 className="ds_accordion-item__title">
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
                            <legend className="visually-hidden">Select which organizations you would like to see</legend>
                            <div className="ds_search-filters__scrollable">
                              <div className="ds_search-filters__checkboxes">
                                {getOrganizationCounts().map((org) => (
                                  <div key={org.name} className="ds_checkbox ds_checkbox--small">
                                    <input
                                      id={`org-${org.name}`}
                                      type="checkbox"
                                      className="ds_checkbox__input"
                                      checked={selectedOrganizations.includes(org.name)}
                                      onChange={() => handleOrganizationFilter(org.name)}
                                    />
                                    <label htmlFor={`org-${org.name}`} className="ds_checkbox__label">
                                      {org.name}
                                      <span className="badge ml-2"> ({org.count})</span>
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
                        />
                        <div className={`ds_accordion-item__header ${styles.accordionItemHeader}`}>
                          <h3 className="ds_accordion-item__title">
                            Date Range
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
                          <fieldset>
                            <legend className="visually-hidden">Select date range</legend>
                            <div className="ds_search-filters__scrollable">
                              <div className="ds_search-filters__checkboxes">
                                <label className="ds_label" htmlFor="date-from">From</label>
                                <input
                                  id="date-from"
                                  type="date"
                                  className="ds_input"
                                  value={selectedDateRange[0] || ''}
                                  onChange={(e) => handleDateRangeChange(0, e.target.value)}
                                />
                                <label className="ds_label" htmlFor="date-to">To</label>
                                <input
                                  id="date-to"
                                  type="date"
                                  className="ds_input"
                                  value={selectedDateRange[1] || ''}
                                  onChange={(e) => handleDateRangeChange(1, e.target.value)}
                                />
                              </div>
                            </div>
                          </fieldset>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="ds_button ds_button--primary ds_button--small ds_button--max ds_no-margin"
                      onClick={() => {
                        setSelectedOrganizations([]);
                        setSelectedDateRange([null, null]);
                      }}
                    >
                      Clear all filters
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
                  : `Showing latest ${filteredResults.length} dataset${filteredResults.length !== 1 ? 's' : ''}`}
              </h2>
              <hr className="ds_search-results__divider" />
              <div className="ds_search-controls">
                <div className="ds_skip-links ds_skip-links--static">
                  <ul className="ds_skip-links__list">
                    <li className="ds_skip-links__item">
                      <a className="ds_skip-links__link" href="#search-results">Skip to results</a>
                    </li>
                  </ul>
                </div>
                <div className="ds_facets">
                  <p className="visually-hidden">
                    There are {selectedOrganizations.length + (selectedDateRange[0] || selectedDateRange[1] ? 1 : 0)} search filters applied
                  </p>
                  <dl className="ds_facets__list">
                    {selectedOrganizations.length > 0 && (
                      <div className="ds_facet-group">
                        <dt className="ds_facet__group-title">Organization:</dt>
                        {selectedOrganizations.map((org) => (
                          <dd key={org} className="ds_facet-wrapper">
                            <span className="ds_facet">
                              {org}
                              <button
                                type="button"
                                aria-label={`Remove '${org}' filter`}
                                className="ds_facet__button"
                                onClick={() => handleOrganizationFilter(org)}
                              >
                                <svg className="ds_facet__button-icon" aria-hidden="true" role="img" focusable="false">
                                  <use href="/assets/images/icons/icons.stack.svg#cancel"></use>
                                </svg>
                              </button>
                            </span>
                          </dd>
                        ))}
                      </div>
                    )}
                    {(selectedDateRange[0] || selectedDateRange[1]) && (
                      <div className="ds_facet-group">
                        <dt className="ds_facet__group-title">Date Range:</dt>
                        <dd className="ds_facet-wrapper">
                          <span className="ds_facet">
                            {selectedDateRange[0] || 'Any'} - {selectedDateRange[1] || 'Any'}
                            <button
                              type="button"
                              aria-label="Remove date range filter"
                              className="ds_facet__button"
                              onClick={() => setSelectedDateRange([null, null])}
                            >
                              <svg className="ds_facet__button-icon" aria-hidden="true" role="img" focusable="false">
                                <use href="/assets/images/icons/icons.stack.svg#cancel"></use>
                              </svg>
                            </button>
                          </span>
                        </dd>
                      </div>
                    )}
                  </dl>
                  {(selectedOrganizations.length > 0 || selectedDateRange[0] || selectedDateRange[1]) && (
                    <button
                      className="ds_facets__clear-button ds_button ds_button--secondary"
                      onClick={() => {
                        setSelectedOrganizations([]);
                        setSelectedDateRange([null, null]);
                      }}
                    >
                      Clear all filters
                      <svg className="ds_facet__button-icon" aria-hidden="true" role="img" focusable="false">
                        <use href="/assets/images/icons/icons.stack.svg#cancel"></use>
                      </svg>
                    </button>
                  )}
                </div>
                <div className="ds_sort-options">
                  <label className="ds_label" htmlFor="sort-by">Sort by</label>
                  <span className={`ds_select-wrapper ${styles.selectWrapper}`}>
                    <select
                      className={`ds_select ${styles.select}`}
                      id="sort-by"
                      value={sortBy}
                      onChange={handleSortChange}
                    >
                      <option value="relevance">Most relevant</option>
                      <option value="date">Updated (newest)</option>
                      <option value="adate">Updated (oldest)</option>
                    </select>
                    <span className={`ds_select-arrow ${styles.selectArrow}`} aria-hidden="true"></span>
                  </span>
                </div>
              </div>
              <ol className="ds_search-results__list" data-total={filteredResults.length} start={indexOfFirstResult + 1}>
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
                    <p className="ds_search-result__summary">
                      {result.description.length > 150
                        ? result.description.substring(0, 150) + '...'
                        : result.description}
                    </p>
                    <dl className="ds_search-result__metadata ds_metadata ds_metadata--inline">
                      <div className="ds_metadata__item">
                        <dt className="ds_metadata__key">Organization</dt>
                        <dd className="ds_metadata__value">{result.CprValue || 'Unknown'}</dd>
                      </div>
                      <div className="ds_metadata__item">
                        <dt className="ds_metadata__key">Last Updated</dt>
                        <dd className="ds_metadata__value">
                          {new Date(result.RlsLiveDatetimeFrom).toLocaleDateString()}
                        </dd>
                      </div>
                    </dl>
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
                  {Array.from({ length: Math.ceil(filteredResults.length / resultsPerPage) }, (_, i) => (
                    <li key={i + 1} className="ds_pagination__item">
                      <button
                        aria-label={`Page ${i + 1}`}
                        className={`ds_pagination__link ${currentPage === i + 1 ? 'ds_current' : ''}`}
                        onClick={() => paginate(i + 1)}
                      >
                        <span className="ds_pagination__link-label">{i + 1}</span>
                      </button>
                    </li>
                  ))}
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
        </main>
      </div>
      <BackToTop />
    </div>
  );
};

export default Datasets;