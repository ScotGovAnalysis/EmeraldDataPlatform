import React from 'react';

const Footer = () => {
  return (
    <footer className="ds_site-footer">
      <div className="ds_wrapper">
        <div className="ds_site-footer__content">
          {/* Navigation Links */}
          <ul className="ds_site-footer__site-items">
            <li className="ds_site-items__item">
              <a href="/privacy">Privacy</a>
            </li>
            <li className="ds_site-items__item">
              <a href="/accessibility">Accessibility statement</a>
            </li>
            <li className="ds_site-items__item">
              <a href="/contact">Contact</a>
            </li>
            <li className="ds_site-items__item">
              <a href="/help">How to use this site</a>
            </li>
          </ul>

          {/* Copyright and Licensing */}
          <div className="ds_site-footer__copyright">
            <a
              className="ds_site-footer__copyright-logo"
              href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
            >
              <img
                loading="lazy"
                width="300"
                height="121"
                src="/assets/images/logos/ogl.svg"
                alt="Open Government License"
              />
            </a>
            <p>
              All content is available under the{' '}
              <a href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/">
                Open Government Licence v3.0
              </a>
              , except for graphic assets and where otherwise stated
            </p>
            <p>
              <strong>
                Powered by{' '}
                <a
                  href="https://github.com/ckan/ckan"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  PxStat
                </a>
              </strong>
            </p>
            <p>&copy; Crown Copyright</p>
          </div>

          {/* Organization Info */}
          <div className="ds_site-footer__org">
            <a
              className="ds_site-footer__org-link"
              title="The Scottish Government"
              href="https://www.gov.scot/"
            >
              <img
                loading="lazy"
                width="300"
                height="57"
                className="ds_site-footer__org-logo"
                src="/assets/images/logos/scottish-government--min.svg"
                alt="gov.scot"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
