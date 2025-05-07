import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PropagateLoader } from 'react-spinners';
import config from '../config.js';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import styles from '../styles/Design_Style.module.css';
import BackToTop from '../components/BackToTop';

const Organisations = () => {
  const [organisations, setOrganisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'CprValue', direction: 'ascending' });

  useEffect(() => {
    document.title = 'Emerald | Organisations';

    const fetchOrganisations = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${config.apiBaseUrl}/api.jsonrpc`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'PxStat.System.Settings.Copyright_API.Read',
            params: {},
            id: 193280692,
          }),
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(`API Error: ${data.error.message} - ${data.error.data || ''}`);
        }

        if (data.result) {
          setOrganisations(data.result);
        } else {
          setOrganisations([]);
        }
      } catch (error) {
        console.error('Error fetching organisations:', error);
        setError(error.message || 'Failed to fetch organisations');
        setOrganisations(sampleOrganisations);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganisations();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedOrganisations = [...organisations].sort((a, b) => {
    // Handle CprValue sorting (alphabetical)
    if (sortConfig.key === 'CprValue') {
      const valueA = a.CprValue.toLowerCase();
      const valueB = b.CprValue.toLowerCase();
      if (valueA < valueB) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    }
    
    // Handle MtrCount sorting (numeric)
    if (sortConfig.key === 'MtrCount') {
      if (sortConfig.direction === 'ascending') {
        return a.MtrCount - b.MtrCount; // Low to High
      } else {
        return b.MtrCount - a.MtrCount; // High to Low
      }
    }
    
    return 0;
  });

  const filteredOrganisations = sortedOrganisations.filter((org) =>
    (org.CprValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
     org.CprCode.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!config.pxFilter || org.CprCode.toLowerCase().startsWith(config.pxFilter.toLowerCase()))
  );

  const sampleOrganisations = [
    { CprCode: 'CSO', CprValue: 'Central Statistics Office', CprUrl: 'https://www.cso.ie', MtrCount: 326 },
    { CprCode: 'DEPT_EDU', CprValue: 'Department of Education', CprUrl: 'https://www.gov.ie/en/organisation/department-of-education/', MtrCount: 147 },
    { CprCode: 'DEPT_AGRI', CprValue: 'Department of Agriculture', CprUrl: 'https://www.gov.ie/en/organisation/department-of-agriculture-food-and-the-marine/', MtrCount: 95 },
    { CprCode: 'HSE', CprValue: 'Health Service Executive', CprUrl: 'https://www.hse.ie', MtrCount: 218 },
    { CprCode: 'REVENUE', CprValue: 'Revenue Commissioners', CprUrl: 'https://www.revenue.ie', MtrCount: 65 },
  ];

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
          <div className="ds_notification ds_notification--error">
            <p className="ds_notification__text">Error: {error}. Displaying sample data instead.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ds_page__middle">
      <div className="ds_wrapper">
        <main className="ds_layout ds_layout--search-results">
          <div className="ds_layout__header">
            <header className="ds_page-header">
              <div className="ds_page-header__title-wrapper">
                <h1 className="ds_page-header__title">
                  {searchTerm ? `Search results for "${searchTerm}"` : 'Organisations'}
                </h1>
              </div>
            </header>
          </div>

          <div className="ds_layout__content ds_layout__content--standard-grid">
            <div className="ds_site-search ds_!-margin-bottom-4">
              <form role="search" className="ds_site-search__form" onSubmit={(e) => e.preventDefault()}>
                <label className="ds_label" htmlFor="org-search">Search organisations</label>
                <div className="ds_input__wrapper ds_input__wrapper--has-icon">
                  <input
                    name="q"
                    id="org-search"
                    className="ds_input ds_site-search__input"
                    type="search"
                    placeholder="Search organisations..."
                    autoComplete="off"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                  <button type="submit" className="ds_button js-site-search-button">
                    <span className="visually-hidden">Search</span>
                    <svg className="ds_icon ds_icon--24" aria-hidden="true" role="img" viewBox="0 0 24 24">
                      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="ds_layout__list">
            <div className="ds_search-results">
              <h2 aria-live="polite" className="ds_search-results__title">
                {filteredOrganisations.length} Organisation{filteredOrganisations.length !== 1 ? 's' : ''}{searchTerm ? ` for "${searchTerm}"` : ''}
              </h2>
              <div className="ds_search-controls">
                <div className="ds_skip-links ds_skip-links--static">
                  <ul className="ds_skip-links__list">
                    <li className="ds_skip-links__item">
                      <a className="ds_skip-links__link" href="#search-results">Skip to results</a>
                    </li>
                  </ul>
                </div>
                <hr className="ds_search-results__divider" />
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="ds_sort-options">
                    <label className="ds_label" htmlFor="sort-by">Sort by</label>
                    <span className="ds_select-wrapper">
                      <select
                        className="ds_select"
                        id="sort-by"
                        onChange={(e) => handleSort(e.target.value)}
                        value={sortConfig.key}
                      >
                        <option value="CprValue">Name (A-Z)</option>
                        <option value="CprValue_desc">Name (Z-A)</option>
                        <option value="MtrCount">Datasets (High to Low)</option>
                        <option value="MtrCount_desc">Datasets (Low to High)</option>
                      </select>
                      <span className="ds_select-arrow" aria-hidden="true"></span>
                    </span>
                  </div>
                </form>
              </div>

              <ol className="ds_search-results__list" data-total={filteredOrganisations.length} start="1" id="search-results">
                {filteredOrganisations.map((org) => (
                  <li key={org.CprCode} className="ds_search-result">
                    <h3 className="ds_search-result__title">
                      <Link to={`/datasets?q=${encodeURIComponent(org.CprValue)}`} className="ds_search-result__link">
                        {org.CprValue}
                      </Link>
                    </h3>
                    <p className="ds_search-result__summary">
                      Official statistics and datasets published by {org.CprValue}.
                    </p>
                    <dl className="ds_search-result__metadata ds_metadata ds_metadata--inline">
                      <div className="ds_metadata__item">
                        <dt className="ds_metadata__key">Datasets</dt>
                        <dd className="ds_metadata__value">{org.MtrCount} Datasets Published</dd>
                      </div>
                    </dl>
                    <dl className="ds_search-result__context">
                      <dd className="ds_search-result__context-value">
                        {org.CprUrl && (
                          <div className="ds_button-group" style={{ marginTop: '-3px' }}>
                            <a
                              href={org.CprUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ds_button ds_button--secondary ds_button--small"
                            >
                              Visit Website
                            </a>
                            <Link to={`/datasets?q=${encodeURIComponent(org.CprValue)}`} className="ds_button ds_button--primary ds_button--small">
                              View Datasets
                            </Link>
                          </div>
                        )}
                      </dd>
                    </dl>
                  </li>
                ))}
              </ol>

              <nav className="ds_pagination" aria-label="Search result pages">
                <ul className="ds_pagination__list">
                  <li className="ds_pagination__item">
                    <span aria-current="page" className="ds_pagination__link ds_current">
                      <span className="ds_pagination__link-label">1</span>
                    </span>
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

export default Organisations;
