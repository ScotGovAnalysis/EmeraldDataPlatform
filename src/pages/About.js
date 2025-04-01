import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  useEffect(() => {
    document.title = "Emerald | About";
  }, []);

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
            <span className="current-page">About</span>
          </nav>
   
              <div className="md:w-3/4">
            <h1 className="text-4xl font-medium text-white leading-tight" style={{ marginBottom: '20px' }}>
              About Emerald Open Data Portal
            </h1>
            <p className="text-lg text-gray-200 mb-4">
            The Scottish Government’s Open Data team are running an Agile alpha to build prototypes to test different ideas and explore new approaches for statistics.gov.scot.
            </p>

          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-xl font-medium text-gray-900 mb-6">Our Mission</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>To support and enable Data Publishers in publishing and updating data and metadata easily.</li>
                <li>To support and enable Users to easily discover, find, access, and use the data and metadata they need.</li>
                <li>To provide a data service that is accessible, usable, well-maintained, and trusted.</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8 mt-8">
              <h2 className="text-xl font-medium text-gray-900 mb-6">Vision</h2>
              <p className="text-gray-600">
                We believe everyone has the right to share, access, and use data. We aim to bring you a wide and comprehensive range of open government data and statistics in one place to support openness, transparency, and empowerment.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8 mt-8">
              <h2 className="text-xl font-medium text-gray-900 mb-6">History</h2>
              <p className="text-gray-600">
                In 2015, the Scottish Government published an Open Data Strategy to help achieve its data vision – a Scotland which recognizes the value of data and responsibly uses it to improve public services and deliver wider societal and economic benefits. In February 2016, the Scottish Government launched Statistics.gov.scot, a new site for publishing the Official Statistics of Scotland and the data behind them.
              </p>
              <p className="text-gray-600 mt-4">
                In 2024, the Open Data team completed a discovery aimed at better understanding statistics.gov.scot. In 2025, we published a blog updating you on our progress as well as the full report on the user research completed during the discovery phase.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8 mt-8">
              <h2 className="text-xl font-medium text-gray-900 mb-6">Contact Us</h2>
              <p className="text-gray-600">If you'd like to get in contact, please reach out through the contact form below.</p>
              <Link
                to="/contact"
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
