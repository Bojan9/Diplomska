import React from 'react';

const PrivateKeyModal = ({
  show,
  privateKey,
  onConfirm
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
        <h3 className="text-lg font-semibold mb-4 text-center">Save Your Private Key</h3>
        <p className="mb-2 text-gray-700 text-center">
          Please copy and securely save your private key. You will need it to log in!
        </p>
        <pre className="bg-gray-100 p-4 rounded text-xs break-all mb-4 text-center">
          {privateKey}
        </pre>
        <button
          onClick={onConfirm}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-medium"
        >
          OK, I Saved It
        </button>
      </div>
    </div>
  );
};

export default PrivateKeyModal;