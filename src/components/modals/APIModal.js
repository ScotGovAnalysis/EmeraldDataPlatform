import React from 'react';
import Modal from 'react-modal';
import { X } from 'lucide-react';

const APIModal = ({ isOpen, onRequestClose, apiUrl }) => {
  const tryMeCode = `
  fetch('${apiUrl}', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
  `;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="API Data Modal"
      className="Modal"
      overlayClassName="Overlay"
    >
      <button onClick={onRequestClose} className="absolute top-4 right-4">
        <X size={16} />
      </button>
      <h2 className="text-xl font-medium text-gray-900 mb-6">API Information</h2>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-800 mb-2">API URL</h3>
        <a href={apiUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all block">
          {apiUrl}
        </a>
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">Try Me</h3>
        <pre className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-y-auto">
          <code>{tryMeCode}</code>
        </pre>
      </div>
    </Modal>
  );
};

export default APIModal;
