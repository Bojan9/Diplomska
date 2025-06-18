import React from 'react';

const VCModal = ({
  show,
  did,
  consolidatedVCs,
  isAdmin,
  authenticatedDID,
  onClose,
  onRevoke
}) => {
  if (!show || !did) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Verifiable Credentials for {did.alias}
          </h3>
          <div className="flex items-center ml-auto gap-2">
            {(isAdmin || consolidatedVCs.some(vc => vc.issuer === authenticatedDID && vc.credentialSubject.id === did.id)) && (
              <button
                onClick={onRevoke}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                title="Revoke all VCs for this DID"
              >
                Revoke VC
              </button>
            )}
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-200 transition"
              title="Close"
            >
              ×
            </button>
          </div>
        </div>
        {consolidatedVCs.filter(vc => vc.credentialSubject.id === did.id).length === 0 ? (
          <p className="text-gray-500">No Verifiable Credentials found for this DID.</p>
        ) : (
          consolidatedVCs
            .filter(vc => vc.credentialSubject.id === did.id)
            .map((vc, idx) => (
              <div key={idx} className="mb-4">
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
                  {JSON.stringify(vc, null, 2)}
                </pre>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default VCModal;