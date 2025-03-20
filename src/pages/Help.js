import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Help = () => {
  useEffect(() => {
    // Dynamically set the page title
    document.title = "Cobalt | Help";
  }, []);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.6' }}>
      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Page Header */}
        <header style={{ borderBottom: '2px solid #ddd', marginBottom: '20px', paddingBottom: '10px' }}>
          <h1 style={{ fontSize: '2.5rem', margin: 0, color: '#222' }}>Help & Support</h1>
          <p style={{ fontSize: '1.2rem', marginTop: '10px', color: '#555' }}>
            Find answers to common questions and get support for the Cobalt Open Data Portal.
          </p>
        </header>

        {/* FAQ Section */}
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '2rem', borderBottom: '2px solid #007BFF', paddingBottom: '5px', color: '#007BFF' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ marginTop: '20px' }}>
            {[
              { title: "How do I find data?", body: "You can search for data using keywords in the search boxes or browse the Datasets and Organisations pages." },
              { title: "How do I download data?", body: "Locate your dataset and download it in CSV format by clicking the download button under the Resources section." },
              { title: "How do I know if the data is reliable?", body: "Each dataset is accompanied by high-quality metadata and a data dictionary. For more information, contact the data producer." },
              { title: "How do I use the API?", body: "Datasets with an API endpoint include an API button for easy access to the data programmatically." },
              { title: "How up to date is the data?", body: "Datasets show their last modification date and update frequency on their respective pages." },
              { title: "Where else can I find data?", body: "Explore other platforms like Public Health Scotland's Open Data portal or use search engines with relevant keywords." },
              { title: "How can I share feedback?", body: "We’re always keen to hear from you. Use the Contact Us page to share your thoughts or seek further help." }
            ].map((faq, index) => (
              <div key={index} style={{ borderBottom: '1px solid #ddd', padding: '10px 0' }}>
                <h3 style={{ fontSize: '1.5rem', color: '#333' }}>{faq.title}</h3>
                <p style={{ marginTop: '5px', color: '#555' }}>{faq.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <h2 style={{ fontSize: '2rem', borderBottom: '2px solid #007BFF', paddingBottom: '5px', color: '#007BFF' }}>
            Contact Support
          </h2>
          <p style={{ marginTop: '10px', fontSize: '1.2rem', color: '#555' }}>
            If you can't find the answer to your question, please contact our support team. We're here to help!
          </p>
          <Link
            to="/contact"
            style={{
              display: 'inline-block',
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#007BFF',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '5px',
              fontWeight: 'bold'
            }}
          >
            Contact Us
          </Link>
        </section>
      </main>
    </div>
  );
};

export default Help;
