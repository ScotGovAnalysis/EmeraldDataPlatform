import React, { useEffect, useState } from 'react';
import { Search, BookOpen, LifeBuoy, Database, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [themes, setThemes] = useState([]);
  const [quickLinks, setQuickLinks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Themes');
  const [subjects, setSubjects] = useState([]);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Emerald | Home';
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://ws.cso.ie/public/api.jsonrpc', {
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
        const data = await response.json();
        setThemes(data.result);

        // Extract quick links (Themes)
        const extractedLinks = data.result.map((theme) => ({
          label: theme.ThmValue,
          href: '#',
        }));
        setQuickLinks(extractedLinks.slice(0, 9));

        // Randomize Subjects and Products
        const randomSubjects = data.result.flatMap((theme) => theme.subject)
          .sort(() => 0.5 - Math.random())
          .slice(0, 9);

        setSubjects(randomSubjects);

        const randomProducts = randomSubjects.flatMap((subject) => subject.product)
          .sort(() => 0.5 - Math.random())
          .slice(0, 9);

        setProducts(randomProducts);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(`/datasets?q=${searchTerm}`);
  };

  const navigationTabs = [
    { label: 'Themes', href: '#' },
    { label: 'Subjects', href: '#' },
    { label: 'Products', href: '#' },
  ];

  const topSearches = [
    { label: 'covid', href: '#' },
    { label: 'population', href: '#' },
    { label: 'economy', href: '#' },
    { label: 'energy', href: '#' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative h-[600px] bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/images/edinburgh_skyline.jpg)' }}
      >
        <div className="absolute inset-0 bg-black/50">
          <div className="container mx-auto px-4 h-full flex flex-col items-start justify-center mt-32">
            <h1 className="text-left text-white text-6xl font-bold mb-4 tracking-wide">
              Emerald Open Data Portal
            </h1>
            <p className="text-gray-200 text-l mb-12">
              Scotland’s official open data portal provides public access to the data behind our
              official statistics. The site is managed by The Scottish Government on behalf of all
              producers of official statistics in Scotland.
            </p>
            <div className="w-full max-w-2xl">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-4 px-6 bg-white/90 backdrop-blur-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Search className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </form>
              <div className="mt-4 p-4 bg-white/20 backdrop-blur-sm rounded-md">
                <span className="text-sm font-bold text-gray-200">Top searches:</span>
                <div className="flex items-center space-x-4">
                  {topSearches.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchTerm(item.label);
                        navigate(`/datasets?q=${item.label}`);
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

      {/* Navigation Tabs */}
      <div className="border-b bg-white z-10 relative">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            {navigationTabs.map((tab, index) => (
              <a
                key={index}
                href={tab.href}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(tab.label);
                }}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 hover:cursor-pointer ${
                  activeTab === tab.label
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Content Below Tabs */}
      <div className="container mx-auto px-4 py-8 z-20 relative">
        {activeTab === 'Themes' && (
          <div className="grid grid-cols-3 gap-4">
            {quickLinks.map((link, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchTerm(link.label);
                  navigate(`/datasets?q=${encodeURIComponent(link.label)}`);
                }}
                className="px-4 py-3 bg-white text-sm text-gray-600 hover:text-blue-600 border border-gray-100 rounded transition-colors w-full text-left"
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
        {activeTab === 'Subjects' && (
          <div className="grid grid-cols-3 gap-4">
            {subjects.map((subject, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchTerm(subject.SbjValue);
                  navigate(`/datasets?q=${encodeURIComponent(subject.SbjValue)}`);
                }}
                className="px-4 py-3 bg-white text-sm text-gray-600 hover:text-blue-600 border border-gray-100 rounded transition-colors w-full text-left"
              >
                {subject.SbjValue}
              </button>
            ))}
          </div>
        )}
        {activeTab === 'Products' && (
          <div className="grid grid-cols-3 gap-4">
            {products.map((product, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchTerm(product.PrcValue);
                  navigate(`/datasets?q=${encodeURIComponent(product.PrcValue)}`);
                }}
                className="px-4 py-3 bg-white text-sm text-gray-600 hover:text-blue-600 border border-gray-100 rounded transition-colors w-full text-left"
              >
                {product.PrcValue}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Other Sections */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Datasets Card */}
          <div
            onClick={() => navigate('/datasets')}
            className="bg-white p-8 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
          >
                        <div className="text-5xl font-normal text-blue-600 mb-6">350+</div>

            <h3 className="text-xl font-medium mb-4">Open Statistics for Download</h3>
            <p className="text-gray-600 mb-4">
              Explore and download the latest datasets from Scotland’s official statistics.
            </p>
            <div className="text-blue-600 font-medium inline-flex items-center group">
              Browse datasets
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* About Card */}
          <div
            onClick={() => navigate('/about')}
            className="bg-white p-8 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
          >
            <div className="text-blue-600 mb-6">
              <BookOpen className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-medium mb-4">About Statistics.gov.scot</h3>
            <p className="text-gray-600 mb-4">
              Learn more about Scotland’s official open data portal and its mission.
            </p>
            <div className="text-blue-600 font-medium inline-flex items-center group">
              Read more
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Help & Support Card */}
          <div
            onClick={() => navigate('/help')}
            className="bg-white p-8 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
          >
            <div className="text-blue-600 mb-6">
              <LifeBuoy className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-medium mb-4">Get Help or Contact Support</h3>
            <p className="text-gray-600 mb-4">
              Find guides, FAQs, and contact information for support.
            </p>
            <div className="text-blue-600 font-medium inline-flex items-center group">
              Go to support
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;