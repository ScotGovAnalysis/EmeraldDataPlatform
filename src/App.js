import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import React Router
import routes from './routes'; // Your route configuration
import Footer from './components/Footer'; // Import the footer component
import Header from './components/Header'; // Import the footer component
import ScrollToTop from './components/ScrollToTop';
import './App.css'
import '@scottish-government/design-system/dist/scripts/design-system.js';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 'bold',
    },
    h5: {
      fontWeight: 'bold',
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
    <Router>
              <ScrollToTop />

      <div>
        {/* Define the routes */}
        <Header />
        <main id="main-content" className="flex-1 p-6 overflow-auto" style={{ paddingTop: '0' }}>

        <Routes>
          {routes.map(({ path, element }, index) => (
            <Route key={index} path={path} element={element} />
          ))}
        </Routes>
        
        </main>
        <Footer />
      </div>
    </Router>
    </ThemeProvider>

  );
};

export default App;
