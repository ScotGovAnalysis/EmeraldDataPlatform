import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import config from '../config.js';

const Organisations = () => {
  const [organisations, setOrganisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'CprValue', direction: 'ascending' });

  useEffect(() => {
    document.title = "Emerald | Organisations";

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
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const filteredOrganisations = sortedOrganisations.filter(org =>
    org.CprValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.CprCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sampleOrganisations = [
    { CprCode: "CSO", CprValue: "Central Statistics Office", CprUrl: "https://www.cso.ie", MtrCount: 326 },
    { CprCode: "DEPT_EDU", CprValue: "Department of Education", CprUrl: "https://www.gov.ie/en/organisation/department-of-education/", MtrCount: 147 },
    { CprCode: "DEPT_AGRI", CprValue: "Department of Agriculture", CprUrl: "https://www.gov.ie/en/organisation/department-of-agriculture-food-and-the-marine/", MtrCount: 95 },
    { CprCode: "HSE", CprValue: "Health Service Executive", CprUrl: "https://www.hse.ie", MtrCount: 218 },
    { CprCode: "REVENUE", CprValue: "Revenue Commissioners", CprUrl: "https://www.revenue.ie", MtrCount: 65 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0065bd] to-[#0057a4]"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI3NjgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiIGlkPSJhIj48c3RvcCBzdG9wLWNvbG9yPSIjRkZGIiBzdG9wLW9wYWNpdHk9Ii4yNSIgb2Zmc2V0PSIwJSIvPjxzdG9wIHN0b3AtY29sb3I9IiNGRkYiIHN0b3Atb3BhY2l0eT0iMCIgb2Zmc2V0PSIxMDAlIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZD0iTTAgMGgxNDQwdjc2OEgweiIgZmlsbD0idXJsKCNhKSIgZmlsbC1ydWxlPSJldmVub2RkIiBvcGFjaXR5PSIuMiIvPjwvc3ZnPg==')] opacity-30"></div>
        <div className="relative max-w-6xl mx-auto px-8 py-16" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
          <nav className="breadcrumb">
            <span className="breadcrumb-link">
              <Link to="/home">Home</Link>
            </span>
            <span className="separator">/</span>
            <span className="current-page">Organisations</span>
          </nav>
          <div className="md:w-3/4">
            <h1 className="text-4xl font-medium text-white leading-tight" style={{ marginBottom: '20px' }}>
              Organisations
            </h1>
            <p className="text-lg text-gray-200 mb-4">
              Browse organisations that contribute data to the Emerald Open Data Portal. Each organisation is responsible for maintaining and providing high-quality datasets.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl font-medium text-gray-900">Directory of Organisations</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search organisations..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
                value={searchTerm}
                onChange={handleSearch}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {error}. Displaying sample data instead.
                  </p>
                </div>
              </div>
            </div>
          ) : filteredOrganisations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('CprValue')}
                    >
                      <div className="flex items-center">
                        Organisation Name
                        {sortConfig.key === 'CprValue' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('CprCode')}
                    >
                      <div className="flex items-center">
                        Code
                        {sortConfig.key === 'CprCode' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('MtrCount')}
                    >
                      <div className="flex items-center">
                        Datasets
                        {sortConfig.key === 'MtrCount' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrganisations.map((org) => (
                    <tr key={org.CprCode} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-medium">
                            {org.CprValue.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{org.CprValue}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{org.CprCode}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{org.MtrCount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {org.CprUrl ? (
                          <a
                            href={org.CprUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Visit Website
                          </a>
                        ) : null}
                        <Link
                          to={`/datasets?org=${org.CprCode}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Datasets
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500">No organisations found matching your search criteria.</div>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-medium text-gray-900 mb-6">About Organisations</h2>
          <p className="text-gray-600 mb-4">
            Organisations are entities that own and publish datasets on the Emerald Open Data Portal. Each organisation is responsible for:
          </p>
          <ul className="list-disc pl-5 text-gray-600 space-y-2 mb-6">
            <li>Maintaining the quality and accuracy of their datasets</li>
            <li>Providing appropriate metadata and documentation</li>
            <li>Ensuring datasets are updated according to their stated frequency</li>
            <li>Responding to queries about their data</li>
          </ul>
          <p className="text-gray-600">
            If you have questions about a specific dataset, please contact the organisation that owns it directly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Organisations;
