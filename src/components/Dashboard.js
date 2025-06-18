import React from 'react';
import { User, Shield, TrendingUp, CheckCircle, FileText } from 'lucide-react';

const Dashboard = ({
  dids,
  votes,
  consolidatedVCs,
  calculateReputationScore,
  calculateDirectTrust,
  getTrustLevel,
  getDisplayName,
  authenticatedDID,
  isAdmin,
  generateConsolidatedVC,
  hasConsolidatedVC
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-blue-50 p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 font-medium">Total DIDs</p>
            <p className="text-2xl font-bold text-blue-900">{dids.length}</p>
          </div>
          <User className="h-8 w-8 text-blue-600" />
        </div>
      </div>
      <div className="bg-green-50 p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-600 font-medium">Total Votes</p>
            <p className="text-2xl font-bold text-green-900">{votes.length}</p>
          </div>
          <Shield className="h-8 w-8 text-green-600" />
        </div>
      </div>
      <div className="bg-purple-50 p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-purple-600 font-medium">Generated VCs</p>
            <p className="text-2xl font-bold text-purple-900">{consolidatedVCs.length}</p>
          </div>
          <TrendingUp className="h-8 w-8 text-purple-600" />
        </div>
      </div>
    </div>

    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Trust Reputation Scores</h3>
      <div className="space-y-4">
        {dids.map(did => {
          const reputationScore = calculateReputationScore(did.id);
          const directScore = calculateDirectTrust(did.id);
          const trustLevel = getTrustLevel(reputationScore);
          const voteCount = votes.filter(vote => vote.subject === did.id).length;
          const hasVC = hasConsolidatedVC(did.id);

          return (
            <div key={did.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {getDisplayName(did)}
                      {authenticatedDID === did.id && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">{did.type}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Direct Trust</p>
                  <p className="font-semibold">{directScore.toFixed(1)}/10</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Reputation</p>
                  <p className="font-semibold">{reputationScore.toFixed(1)}/10</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Votes</p>
                  <p className="font-semibold">{voteCount}</p>
                </div>
                <div className="flex items-center gap-2">
                  {voteCount > 0 && (
                    <button
                      onClick={() => generateConsolidatedVC(did.id)}
                      disabled={!(isAdmin || authenticatedDID === did.id)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        hasVC
                          ? 'bg-green-100 text-green-800'
                          : (isAdmin || authenticatedDID === did.id)
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      title={
                        hasVC
                          ? 'VC Generated'
                          : (isAdmin || authenticatedDID === did.id)
                            ? 'Generate VC'
                            : 'You can only generate a VC for your own DID'
                      }
                    >
                      {hasVC ? (
                        <>
                          <CheckCircle className="h-3 w-3 inline mr-1" />
                          VC Ready
                        </>
                      ) : (
                        <>
                          <FileText className="h-3 w-3 inline mr-1" />
                          Generate VC
                        </>
                      )}
                    </button>
                  )}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${trustLevel.bg} ${trustLevel.color}`}>
                    {trustLevel.level}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

export default Dashboard;