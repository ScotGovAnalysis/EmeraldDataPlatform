import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

const Contact = () => {
  useEffect(() => {
    // Dynamically set the page title
    document.title = "Cobalt | Contact Us";
  }, []);

  const navigate = useNavigate();
  const [showGif, setShowGif] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowGif(true);
    setTimeout(() => {
      setShowGif(false);
      navigate('/home');
    }, 5000);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.6' }}>
      <div style={{ backgroundColor: '#222', color: '#fff', padding: '20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Contact Us</h1>
          <p>The Open Data team values your feedback, questions, or comments. We are always happy to hear from you.</p>
        </header>
      </div>

      <div style={{ display: 'flex', maxWidth: '1200px', margin: '20px auto', gap: '20px', padding: '0 20px' }}>
        {/* Sidebar */}
        <aside style={{ flex: '1', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#f9f9f9' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#007BFF' }}>Ways to Reach Us</h2>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <Mail size={24} color="#007BFF" style={{ marginRight: '10px' }} />
            <div>
              <h3>Email Us</h3>
              <a href="mailto:statistics.opendata@gov.scot" style={{ textDecoration: 'none', color: '#007BFF' }}>
                statistics.opendata@gov.scot
              </a>
            </div>
          </div>
          <hr />
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <Phone size={24} color="#007BFF" style={{ marginRight: '10px' }} />
            <div>
              <h3>Call Us</h3>
              <a href="tel:+441234567890" style={{ textDecoration: 'none', color: '#007BFF' }}>
                +44 123 456 7890
              </a>
              <p style={{ fontSize: '0.9rem', color: '#555' }}>Mon-Fri, 9am-5pm</p>
            </div>
          </div>
          <hr />
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <MapPin size={24} color="#007BFF" style={{ marginRight: '10px' }} />
            <div>
              <h3>Visit Us</h3>
              <p style={{ margin: 0 }}>
                Open Data Team<br />
                Scottish Government<br />
                Victoria Quay<br />
                Edinburgh, EH6 6QQ
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: '2', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#007BFF' }}>Send Us a Message</h2>
          <p>We aim to get back to you within 3 days.</p>
          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
              <div style={{ flex: '1' }}>
                <label htmlFor="name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Your Name</label>
                <input type="text" id="name" name="name" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} required />
              </div>
              <div style={{ flex: '1' }}>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Your Email</label>
                <input type="email" id="email" name="email" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} required />
              </div>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="subject" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Subject</label>
              <input type="text" id="subject" name="subject" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} required />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="message" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Your Message</label>
              <textarea id="message" name="message" rows="5" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} required></textarea>
            </div>
            <button type="submit" style={{
              backgroundColor: '#007BFF',
              color: '#fff',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              Send Message
            </button>
          </form>
        </main>
      </div>

      {/* Show gif */}
      {showGif && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <img src="https://media1.tenor.com/m/z0NTv7yYBtQAAAAd/oiia-cat.gif" alt="Sending..." style={{ width: '100px', height: 'auto' }} />
        </div>
      )}
    </div>
  );
};

export default Contact;
