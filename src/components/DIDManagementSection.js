import React from 'react';
import DIDManagement from './DIDManagement';
import CreateDIDModal from './CreateDIDModal';
import DIDDocumentModal from './DIDDocumentModal';

const DIDManagementSection = ({
  dids,
  authenticatedDID,
  isAdmin,
  getDisplayName,
  setSelectedDID,
  handleDeleteDID,
  showCreateDID,
  createDIDForm,
  setCreateDIDForm,
  handleCreateDID,
  selectedDID,
  setShowCreateDID
}) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold">DID Management</h3>
    </div>

    <DIDManagement
      dids={dids}
      authenticatedDID={authenticatedDID}
      isAdmin={isAdmin}
      getDisplayName={getDisplayName}
      setSelectedDID={setSelectedDID}
      handleDeleteDID={handleDeleteDID}
    />

    {/* Create DID Modal */}
    {showCreateDID && (
      <CreateDIDModal
        show={showCreateDID}
        createDIDForm={createDIDForm}
        setCreateDIDForm={setCreateDIDForm}
        onClose={() => setShowCreateDID(false)}
        onCreate={handleCreateDID}
      />
    )}

    {selectedDID && (
      <DIDDocumentModal
        show={!!selectedDID}
        did={selectedDID}
        onClose={() => setSelectedDID(null)}
      />
    )}
  </div>
);

export default DIDManagementSection;