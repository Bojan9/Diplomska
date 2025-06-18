import React from 'react';
import { Vote, Star, Clock, CheckCircle } from 'lucide-react';

const VotingSystem = ({
  dids,
  votes,
  voteData,
  setVoteData,
  authenticatedDID,
  handleSubmitVote,
  getDisplayName
}) => (
  <div className="space-y-6">
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Submit Trust Vote</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Issuer (Your DID)</label>
          <select
            value={authenticatedDID}
            disabled
            className="w-full p-2 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
          >
            {dids
              .filter(did => did.id === authenticatedDID)
              .map(did => (
                <option key={did.id} value={did.id}>
                  {getDisplayName(did)}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Subject (Entity to Rate)</label>
          <select
            value={voteData.subject}
            onChange={(e) => setVoteData({ ...voteData, subject: e.target.value })}
            className="w-full p-2 border rounded-lg"
          >
            <option value="">Select Subject</option>
            {dids.map(did => (
              <option key={did.id} value={did.id}>{getDisplayName(did)}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Trust Score (1-10)</label>
          <input
            type="range"
            min="1"
            max="10"
            value={voteData.trustScore}
            onChange={(e) => setVoteData({ ...voteData, trustScore: e.target.value })}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>1 (Low)</span>
            <span className="font-medium">{voteData.trustScore}</span>
            <span>10 (High)</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Context</label>
          <select
            value={voteData.context}
            onChange={(e) => setVoteData({ ...voteData, context: e.target.value })}
            className="w-full p-2 border rounded-lg"
          >
            <option value="service_quality">Service Quality</option>
            <option value="reliability">Reliability</option>
            <option value="communication">Communication</option>
            <option value="security">Security</option>
            <option value="performance">Performance</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Comment</label>
          <input
            type="text"
            value={voteData.comment}
            onChange={(e) => setVoteData({ ...voteData, comment: e.target.value })}
            placeholder="Enter a comment"
            className="w-full p-2 border rounded-lg"
          />
        </div>
      </div>
      <button
        onClick={handleSubmitVote}
        disabled={!voteData.subject || authenticatedDID === voteData.subject}
        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Vote className="h-4 w-4 inline mr-2" />
        Submit Trust Vote
      </button>
    </div>
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Recent Trust Votes</h3>
      <div className="space-y-3">
        {votes.slice(-10).reverse().map((vote, index) => {
          const issuer = dids.find(d => d.id === vote.issuer);
          const subject = dids.find(d => d.id === vote.subject);
          return (
            <div key={index} className="p-4 border rounded-lg bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{getDisplayName(issuer) || 'Unknown'}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-medium">{getDisplayName(subject) || 'Unknown'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold">{vote.trustScore}/10</span>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {vote.context.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="h-3 w-3" />
                    {new Date(vote.timestamp).toLocaleDateString()}
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

export default VotingSystem;