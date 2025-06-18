import React from 'react';
import { User, Eye, AlertTriangle } from 'lucide-react';

const DIDManagement = ({
  dids,
  authenticatedDID,
  isAdmin,
  getDisplayName,
  setSelectedDID,
  handleDeleteDID
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {dids.map(did => (
      <div key={did.id} className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              did.id.includes('key') ? 'bg-green-100' :
              did.id.includes('web') ? 'bg-blue-100' :
              did.id.includes('local') ? 'bg-yellow-100' :
              'text-gray-100'
            }`}>
              <User className={`h-6 w-6 ${
                did.id.includes('key') ? 'text-green-600' :
                did.id.includes('web') ? 'text-blue-600' :
                did.id.includes('local') ? 'text-yellow-600' :
                'text-gray-400'
              }`} />
            </div>
            <div>
              <h4 className="font-semibold flex items-center gap-2">
                {getDisplayName(did)}
                {authenticatedDID === did.id && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Current User
                  </span>
                )}
              </h4>
              <p className="text-sm text-gray-500">{did.type}</p>
              <p className="text-xs text-gray-400">
                {did.id.includes('key') && 'Key DID'}
                {did.id.includes('web') && 'Web DID'}
                {did.id.includes('local') && 'Local DID'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedDID(did)}
              className="text-blue-600 hover:text-blue-800"
              title="View DID Document"
            >
              <Eye className="h-5 w-5" />
            </button>
            {(isAdmin || authenticatedDID === did.id) && (
              <button
                onClick={() => handleDeleteDID(did)}
                className="text-red-600 hover:text-red-800"
                title="Delete DID"
                style={{ display: isAdmin || authenticatedDID === did.id ? 'inline' : 'none' }}
              >
                <AlertTriangle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">DID:</span>
            <p className="text-gray-600 break-all">{did.id}</p>
          </div>
          <div>
            <span className="font-medium">Created:</span>
            <p className="text-gray-600">{new Date(did.created).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default DIDManagement;