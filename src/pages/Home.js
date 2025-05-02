import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import config from '../config.js';
import styles from '../styles/Design_Style.module.css';

const Home = () => {
  const [themes, setThemes] = useState([]);
  const [quickLinks, setQuickLinks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const allowedThemes = [
    "Access to Services",
    "Business, Enterprise and Energy",
    "Children and Young People",
    "Community Wellbeing and Social Environment",
    "Crime and Justice",
    "Economic Activity, Benefits and Tax Credits",
    "Economy",
    "Education, Skills and Training",
    "Environment",
    "Farming and Rural",
    "Geography",
    "Health and Social Care",
    "Housing",
    "Labour Force",
    "Management Information",
    "Population",
    "Reference",
    "Scottish Index of Multiple Deprivation",
    "Transport"
  ];

  useEffect(() => {
    document.title = 'Emerald | Home';
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/api.jsonrpc`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'PxStat.System.Navigation.Navigation_API.Read',
            params: { LngIsoCode: 'en' },
            id: 933080121,
          }),
        });
        if (!response.ok) throw new Error('Failed to fetch themes');
        const data = await response.json();
        const filteredThemes = data.result.filter(theme => allowedThemes.includes(theme.ThmValue));
        setThemes(filteredThemes);

        const extractedLinks = filteredThemes.map((theme) => ({
          label: theme.ThmValue,
          href: `/datasets?theme=${encodeURIComponent(theme.ThmValue)}`,
        }));
        setQuickLinks(extractedLinks.slice(0, 3)); // Limit to 3 items
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/datasets?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const topSearches = [
    { label: 'covid', href: '/datasets?q=covid' },
    { label: 'population', href: '/datasets?q=population' },
    { label: 'economy', href: '/datasets?q=economy' },
    { label: 'energy', href: '/datasets?q=energy' },
  ];

  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.classList.remove('overflow-auto');
    }
  }, []);

  return (
    <div className="ds_page__middle">
      <main id="main-content">
        <div
          className="ds_cb ds_cb--blue relative"
          style={{
            backgroundImage: 'url(/assets/images/edinburgh_skyline.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100%',
            boxSizing: 'border-box',
            padding: '2rem 0',
          }}
        >
          <div className="absolute inset-0 bg-blue-900/60"></div>
          <div className="ds_wrapper relative">
            <div className="ds_cb__inner ds_cb__inner--spacious">
              <div className="ds_layout">
                <div className="ds_layout__content">
                  <div style={{ marginTop: '2rem' }}>
                    <h1 className="ds_page-header__title" style={{ color: '#FFFFFF', marginBottom: '12.5px' }}>
                      Open access to Scotland's data
                    </h1>
                  </div>
                  <p className="ds_lead" style={{ color: '#FFFFFF' }}>
                    Find and access <strong><u><Link to="/datasets" style={{ color: '#FFFFFF' }}>datasets</Link></u></strong> from the Scottish Government and its agencies. Explore data by <strong><u><Link to="/themes" style={{ color: '#FFFFFF' }}>theme</Link></u></strong> or <strong><u><Link to="/organisations" style={{ color: '#FFFFFF' }}>organisations</Link></u></strong>. For assistance, <strong><u><Link to="/help" style={{ color: '#FFFFFF' }}>help</Link></u></strong> is available or <strong><u><Link to="/contact" style={{ color: '#FFFFFF' }}>contact us</Link></u></strong>.
                  </p>
                  <div className="ds_cb__inner">
                    <div
                      className="search-container"
                      style={{
                        border: '4px solid white',
                        borderRadius: '8px',
                        display: 'inline-block',
                        width: 'calc(100% - 4rem)',
                        maxWidth: '800px',
                        height: '56px',
                        marginBottom: '15px',
                      }}
                    >
                      <div className="ds_site-search" style={{ width: '100%' }}>
                        <form
                          onSubmit={handleSearch}
                          role="search"
                          className="ds_site-search__form"
                          method="GET"
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
                              placeholder="Search our data"
                              autoComplete="off"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button type="submit" className="ds_button js-site-search-button">
                              <span className="visually-hidden">Search</span>
                              <svg
                                className="ds_icon"
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
                    </div>
                    <div
                      className="mt-4 p-4 bg-white/20 backdrop-blur-sm rounded-md"
                      style={{ marginBottom: '2rem', width: '70%' }}
                    >
                      <span className="text-sm font-bold text-gray-200">Top searches:</span>
                      <div className="flex items-center space-x-4">
                        {topSearches.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSearchTerm(item.label);
                              navigate(item.href);
                            }}
                            className="text-sm text-gray-200 hover:text-white transition-colors"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ds_wrapper" style={{ marginTop: '1.5rem' }}>
          <div className="ds_cb__inner">
            <h3 className="ds_h3">Browse By Theme</h3>
            <nav aria-label="Category navigation">
              <ul className="ds_category-list ds_category-list--grid ds_category-list--narrow" style={{ marginTop: '-0.5rem' }}>
                {quickLinks.map((link, index) => (
                  <li key={index} className="ds_card ds_card--has-hover">
                    <article className="ds_category-item ds_category-item--card">
                      <h2 className="ds_category-item__title">
                        <Link to={link.href} className="ds_category-item__link">
                          {link.label}
                        </Link>
                      </h2>
                      <p className="ds_category-item__summary">
                        Explore datasets related to {link.label.toLowerCase()}.
                      </p>
                    </article>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
