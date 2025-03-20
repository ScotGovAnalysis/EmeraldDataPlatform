import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  useEffect(() => {
    // Dynamically set the page title
    document.title = "Cobalt | About";
  }, []);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333' }}>
      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Page Header */}
        <header style={{ borderBottom: '2px solid #ddd', marginBottom: '20px', paddingBottom: '10px' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#222', margin: '0' }}>About</h1>
        </header>

        {/* Introduction */}
        <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#444' }}>Cobalt Open Data Portal</p>
        <p style={{ marginBottom: '20px' }}>
          The Scottish Government’s Open Data team are running an Agile alpha to build prototypes to test
          different ideas and explore new approaches for statistics.gov.scot. Prototypes will be focused on
          addressing high-priority user needs identified during discovery, as well as addressing the key
          problems and challenges our users face. This Cobalt Open Data Portal is one of those prototypes.
        </p>

        {/* Mission Section */}
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.8rem', borderBottom: '2px solid #f00', paddingBottom: '5px', color: '#f00' }}>Our Mission</h2>
          <ul style={{ listStyleType: 'circle', paddingLeft: '20px', marginTop: '10px' }}>
            <li>To support and enable Data Publishers in publishing and updating data and metadata easily.</li>
            <li>To support and enable Users to easily discover, find, access, and use the data and metadata they need.</li>
            <li>To provide a data service that is accessible, usable, well-maintained, and trusted.</li>
          </ul>
        </section>

        {/* Vision Section */}
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.8rem', borderBottom: '2px solid #444', paddingBottom: '5px', color: '#444' }}>Vision</h2>
          <p>
            We believe everyone has the right to share, access, and use data. We aim to bring you a wide
            and comprehensive range of open government data and statistics in one place to support openness,
            transparency, and empowerment.
          </p>
        </section>

        {/* History Section */}
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.8rem', borderBottom: '2px solid #888', paddingBottom: '5px', color: '#888' }}>History</h2>
          <p>
            In 2015, the Scottish Government published an Open Data Strategy to help achieve its data vision – a Scotland
            which recognizes the value of data and responsibly uses it to improve public services and deliver wider
            societal and economic benefits. In February 2016, the Scottish Government launched Statistics.gov.scot, a
            new site for publishing the Official Statistics of Scotland and the data behind them.
          </p>
          <p>
            In 2024, the Open Data team completed a discovery aimed at better understanding statistics.gov.scot. In 2025,
            we published a blog updating you on our progress as well as the full report on the user research completed
            during the discovery phase.
          </p>
        </section>

        {/* Contact Us Section */}
        <section>
          <h2 style={{ fontSize: '1.8rem', borderBottom: '2px solid #007BFF', paddingBottom: '5px', color: '#007BFF' }}>Contact Us</h2>
          <p>If you'd like to get in contact, please reach out through the contact form below.</p>
          <Link
            to="/contact"
            style={{
              display: 'inline-block',
              marginTop: '10px',
              padding: '10px 20px',
              backgroundColor: '#007BFF',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            Contact us
          </Link>
        </section>
      </main>
    </div>
  );
};

export default About;
