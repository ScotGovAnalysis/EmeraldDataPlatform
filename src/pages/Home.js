import React, { useEffect, useState } from 'react';
import { Search, BookOpen, LifeBuoy, Database, ChevronRight, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import config from '../config.js';

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
    <div className="ds_wrapper">
      {/* Hero Section */}
      <div className="relative h-screen max-h-[800px] overflow-hidden">
        {/* Background Image with Blur Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/assets/images/edinburgh_skyline.jpg)' }}
        >
          <div className="absolute inset-0 backdrop-blur-sm bg-gradient-to-r from-blue-900/60 to-black/30"></div>
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-8">
            <div className="max-w-2xl">
              <h1 className="text-white text-5xl font-light tracking-wide leading-tight mb-4">
                Emerald Open Data Portal
              </h1>
              <div className="w-24 h-px bg-blue-300 mb-8"></div>
              <p className="text-white/90 text-lg font-light mb-12 leading-relaxed">
                Scotland's official open data portal providing access to the data behind our
                official statistics, managed by The Scottish Government.
              </p>

              {/* Search */}
              <div className="relative">
                <form onSubmit={handleSearch}>
                  <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-md overflow-hidden focus-within:border-blue-300 transition-all">
                    <input
                      type="text"
                      placeholder="Search datasets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full py-4 px-6 bg-transparent text-white placeholder-white/60 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                    >
                      <Search className="h-5 w-5" />
                    </button>
                  </div>
                </form>

                {/* Top searches */}
                <div className="mt-4 flex items-center space-x-6">
                  <span className="text-sm text-white/60">Top searches:</span>
                  {topSearches.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchTerm(item.label);
                        navigate(`/datasets?q=${item.label}`);
                      }}
                      className="text-sm text-white/80 hover:text-white transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Glass Panel with Scroll Down Indicator */}
        <div className="absolute bottom-0 left-0 w-full">
          <div className="backdrop-blur-md bg-white/10 border-t border-white/10">
            <div className="container mx-auto px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="text-white/80 text-sm">Scroll to explore</div>
                <div className="text-white/80">
                  <ArrowRight className="h-4 w-4 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="container mx-auto px-8 py-16">
        {/* Section Heading */}
        <div className="mb-12">
          <h2 className="ds_heading-l">Browse Data Categories</h2>
          <div className="w-16 h-px bg-blue-500"></div>
        </div>

        {/* Navigation Tabs - Sleek Design */}
        <div className="mb-10">
          <div className="inline-flex border-b border-gray-200">
            {navigationTabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(tab.label)}
                className={`ds_tabs__tab ${activeTab === tab.label ? 'ds_tabs__tab--active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Below Tabs */}
        <div className="mb-20">
          {activeTab === 'Themes' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchTerm(link.label);
                    navigate(`/datasets?q=${encodeURIComponent(link.label)}`);
                  }}
                  className="ds_card"
                >
                  <span>{link.label}</span>
                  <ChevronRight className="ds_icon" />
                </button>
              ))}
            </div>
          )}
          {activeTab === 'Subjects' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subjects.map((subject, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchTerm(subject.SbjValue);
                    navigate(`/datasets?q=${encodeURIComponent(subject.SbjValue)}`);
                  }}
                  className="ds_card"
                >
                  <span>{subject.SbjValue}</span>
                  <ChevronRight className="ds_icon" />
                </button>
              ))}
            </div>
          )}
          {activeTab === 'Products' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map((product, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchTerm(product.PrcValue);
                    navigate(`/datasets?q=${encodeURIComponent(product.PrcValue)}`);
                  }}
                  className="ds_card"
                >
                  <span>{product.PrcValue}</span>
                  <ChevronRight className="ds_icon" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Cards Section */}
        <div className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Datasets Card */}
            <div
              onClick={() => navigate('/datasets')}
              className="group cursor-pointer"
            >
              <div className="bg-gradient-to-br from-white to-blue-50 backdrop-blur-sm border border-gray-100 p-10 rounded-sm transition-all hover:shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mt-16 -mr-16 opacity-30"></div>
                <div className="relative z-10">
                  <div className="text-4xl font-light text-blue-600 mb-6">350<span className="text-xl">+</span></div>
                  <h3 className="text-xl font-normal text-gray-800 mb-4">Open Statistics</h3>
                  <div className="w-10 h-px bg-blue-200 mb-4"></div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    Explore and download the latest datasets from Scotland's official statistics.
                  </p>
                  <div className="text-blue-500 text-sm flex items-center group-hover:text-blue-600 transition-colors">
                    Browse recent datasets
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* About Card */}
            <div
              onClick={() => navigate('/about')}
              className="group cursor-pointer"
            >
              <div className="bg-gradient-to-br from-white to-blue-50 backdrop-blur-sm border border-gray-100 p-10 rounded-sm transition-all hover:shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mt-16 -mr-16 opacity-30"></div>
                <div className="relative z-10">
                  <div className="text-blue-400 mb-6">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-normal text-gray-800 mb-4">About Emerald</h3>
                  <div className="w-10 h-px bg-blue-200 mb-4"></div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    Learn more about Scotland's official open data portal and its mission.
                  </p>
                  <div className="text-blue-500 text-sm flex items-center group-hover:text-blue-600 transition-colors">
                    Read more
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* Help & Support Card */}
            <div
              onClick={() => navigate('/help')}
              className="group cursor-pointer"
            >
              <div className="bg-gradient-to-br from-white to-blue-50 backdrop-blur-sm border border-gray-100 p-10 rounded-sm transition-all hover:shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mt-16 -mr-16 opacity-30"></div>
                <div className="relative z-10">
                  <div className="text-blue-400 mb-6">
                    <LifeBuoy className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-normal text-gray-800 mb-4">Support & Help</h3>
                  <div className="w-10 h-px bg-blue-200 mb-4"></div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    Find guides, FAQs, and contact information for support.
                  </p>
                  <div className="text-blue-500 text-sm flex items-center group-hover:text-blue-600 transition-colors">
                    Get support
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Visualization Section */}
        <div className="mb-20">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="ds_heading-l">Data Insights</h2>
              <div className="w-16 h-px bg-blue-500"></div>
            </div>
            <a href="#" className="text-blue-500 text-sm flex items-center group">
              View all insights
              <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Featured Visualization */}
            <div className="bg-white border border-gray-100 rounded-sm p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 mb-6 rounded-sm overflow-hidden">
                <div className="h-full w-full bg-blue-50 flex items-center justify-center">
                  <Database className="w-12 h-12 text-blue-200" />
                </div>
              </div>
              <h3 className="text-lg font-normal text-gray-800 mb-2">Economic Trends 2025</h3>
              <p className="text-gray-500 text-sm mb-4">Analysis of key economic indicators showing the latest trends and forecasts.</p>
              <a href="#" className="text-blue-500 text-sm flex items-center group w-fit">
                Explore data
                <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Latest Updates */}
            <div className="bg-white border border-gray-100 rounded-sm p-6 shadow-sm">
              <h3 className="text-lg font-normal text-gray-800 mb-4">Latest Updates</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((item, index) => (
                  <div key={index} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="text-xs text-gray-400 mb-1">April {index + 5}, 2025</div>
                    <div className="text-sm text-gray-700 mb-1">Updated Dataset: Population Statistics {2025 - index}</div>
                    <a href="#" className="text-blue-500 text-xs flex items-center group w-fit">
                      View
                      <ChevronRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
