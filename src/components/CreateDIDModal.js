import React from 'react';

const CreateDIDModal = ({
  show,
  createDIDForm,
  setCreateDIDForm,
  onClose,
  onCreate
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Create New DID</h3>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-200 transition"
            title="Close"
          >
            ×
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Entity Name</label>
            <input
              type="text"
              value={createDIDForm.alias}
              onChange={(e) => setCreateDIDForm({ ...createDIDForm, alias: e.target.value })}
              placeholder="Enter entity name"
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Entity Type</label>
            <select
              value={createDIDForm.type}
              onChange={(e) => setCreateDIDForm({ ...createDIDForm, type: e.target.value })}
              className="w-full p-2 border rounded-lg"
            >
              <option value="service_provider">Service Provider</option>
              <option value="client">Client</option>
              <option value="validator">Validator</option>
              <option value="regulator">Regulator</option>
              <option value="auditor">Auditor</option>
              <option value="intermediary">Intermediary</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">DID Method</label>
            <select
              value={createDIDForm.method}
              onChange={(e) => setCreateDIDForm({ ...createDIDForm, method: e.target.value })}
              className="w-full p-2 border rounded-lg"
            >
              <option value="key">Key (did:key:)</option>
              <option value="web">Web (did:web:)</option>
              <option value="local">Local (did:local:)</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onCreate}
            disabled={!createDIDForm.alias.trim()}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Create DID
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateDIDModal;