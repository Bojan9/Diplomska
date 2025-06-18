import React from 'react';
import { Eye } from 'lucide-react';

const TrustMetrics = ({
  dids,
  votes,
  calculateDirectTrust,
  calculateReputationScore,
  getDisplayName,
  setVCModalDID,
  setShowVCModal
}) => (
  <div className="space-y-6">
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Trust Calculation Models</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold text-blue-600 mb-2">Direct Trust</h4>
          <p className="text-sm text-gray-600 mb-3">
            Simple average of all trust scores received directly from other entities.
          </p>
          <p className="text-xs text-gray-500">
            Formula: Σ(trust_scores) / count
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold text-green-600 mb-2">Reputation Trust</h4>
          <p className="text-sm text-gray-600 mb-3">
            Weighted average where votes from higher-reputation entities carry more weight.
          </p>
          <p className="text-xs text-gray-500">
            Formula: Σ(trust_score × issuer_reputation) / Σ(issuer_reputation)
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold text-purple-600 mb-2">Context Trust</h4>
          <p className="text-sm text-gray-600 mb-3">
            Considers context diversity and temporal factors in trust calculation.
          </p>
          <p className="text-xs text-gray-500">
            Formula: direct_trust × (1 + diversity_bonus)
          </p>
        </div>
      </div>
    </div>

    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Detailed Trust Analysis</h3>
      <div className="space-y-4">
        {dids.map(did => {
          const directTrust = calculateDirectTrust(did.id);
          const reputationTrust = calculateReputationScore(did.id);
          const vcs = votes.filter(vote => vote.subject === did.id);
          const contexts = [...new Set(vcs.map(vote => vote.context))];

          return (
            <div key={did.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">{getDisplayName(did)}</h4>
                <div className="flex items-center gap-3 ml-auto">
                  <button
                    onClick={() => { setVCModalDID(did); setShowVCModal(true); }}
                    className="text-blue-600 hover:text-blue-800"
                    title="View VC Document"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <span className="text-sm text-gray-500">{vcs.length} votes</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Direct Trust</p>
                  <p className="font-semibold text-blue-600">{directTrust.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Reputation Trust</p>
                  <p className="font-semibold text-green-600">{reputationTrust.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Context Diversity</p>
                  <p className="font-semibold text-purple-600">{contexts.length}</p>
                </div>
                <div>
                  <p className="text-gray-500">Latest Vote</p>
                  <p className="font-semibold text-gray-600">
                    {vcs.length > 0 ? new Date(vcs[vcs.length - 1].timestamp).toLocaleDateString() : 'None'}
                  </p>
                </div>
              </div>
              {contexts.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500 mb-1">Contexts:</p>
                  <div className="flex flex-wrap gap-1">
                    {contexts.map(context => (
                      <span key={context} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {context.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

export default TrustMetrics;