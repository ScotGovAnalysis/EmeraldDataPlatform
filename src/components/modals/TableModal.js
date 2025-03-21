import React from 'react';
import Modal from 'react-modal';
import { X } from 'lucide-react';
import CustomDataTable from '../DataTable';

const TableModal = ({ isOpen, onRequestClose, tableData }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Table Data Modal"
      className="Modal"
      overlayClassName="Overlay"
    >
      <button onClick={onRequestClose} className="absolute top-4 right-4">
        <X size={16} />
      </button>
      <h2 className="text-xl font-medium text-gray-900 mb-6">Table Data</h2>
      <div className="max-h-96 overflow-y-auto">
        <CustomDataTable tableData={tableData} />
      </div>
    </Modal>
  );
};

export default TableModal;
