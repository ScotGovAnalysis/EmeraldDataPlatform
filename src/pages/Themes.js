import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import config from '../config.js';
import styles from '../styles/Design_Style.module.css';

const Themes = () => {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    document.title = 'Emerald | Themes';
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
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="ds_page__middle">
      <main id="main-content">
        <div className="ds_wrapper" style={{ marginTop: '1.5rem' }}>
          <div className="ds_cb__inner">
            <h1 className="ds_h1">Browse By Theme</h1>
            <nav aria-label="Theme navigation">
              <ul className="ds_category-list ds_category-list--grid ds_category-list--narrow" style={{ marginTop: '-0.5rem' }}>
                {themes.map((theme, index) => (
                  <li key={index} className="ds_card ds_card--has-hover">
                    <article className="ds_category-item ds_category-item--card">
                      <h2 className="ds_category-item__title">
                        <Link to={`/datasets?theme=${encodeURIComponent(theme.ThmValue)}`} className="ds_category-item__link">
                          {theme.ThmValue}
                        </Link>
                      </h2>
                      <p className="ds_category-item__summary">
                        Explore datasets related to {theme.ThmValue.toLowerCase()}.
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

export default Themes;
