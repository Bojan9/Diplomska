import React from 'react';

const DIDDocumentModal = ({ show, did, onClose }) => {
  if (!show || !did) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">DID Document</h3>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-200 transition"
            title="Close"
          >
            ×
          </button>
        </div>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
          {JSON.stringify(did, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default DIDDocumentModal;