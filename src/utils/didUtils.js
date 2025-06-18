import nacl from 'tweetnacl';
import bs58 from 'bs58';

export const generateDID = (method = 'key') => {
  const id = Math.random().toString(36).substr(2, 9);
  const keyPair = nacl.sign.keyPair();

  const publicKeyBase58 = bs58.encode(keyPair.publicKey);
  const privateKeyBase58 = bs58.encode(keyPair.secretKey);

  let didId;
  switch (method) {
    case 'key':
      didId = `did:key:z${id}`;
      break;
    case 'ethr':
      didId = `did:ethr:0x${id}`;
      break;
    case 'web':
      didId = `did:web:example.com:user:${id}`;
      break;
    case 'local':
      didId = `did:local:${id}`;
      break;
    default:
      throw new Error(`Unsupported DID method: ${method}`);
  }

  return {
    id: didId,
    controller: didId,
    created: new Date().toISOString(),
    publicKey: [{
      id: `${didId}#key1`,
      type: 'Ed25519VerificationKey2020',
      controller: didId,
      publicKeyBase58
    }],
    authentication: [`${didId}#key1`],
    privateKey: privateKeyBase58
  };
};

export const createConsolidatedTrustVC = (subjectDID, votes, issuerDID = null) => {
  const totalVotes = votes.length;
  const averageScore = totalVotes > 0 ? votes.reduce((sum, vote) => sum + vote.trustScore, 0) / totalVotes : 0;
  
  // Group votes by context
  const votesByContext = votes.reduce((acc, vote) => {
    if (!acc[vote.context]) acc[vote.context] = [];
    acc[vote.context].push(vote);
    return acc;
  }, {});

  // Calculate context-specific averages
  const contextAnalysis = Object.entries(votesByContext).map(([context, contextVotes]) => ({
    context,
    averageScore: contextVotes.reduce((sum, vote) => sum + vote.trustScore, 0) / contextVotes.length,
    voteCount: contextVotes.length,
    latestVote: contextVotes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0].timestamp
  }));

  // Get unique voters
  const uniqueVoters = [...new Set(votes.map(vote => vote.issuer))];

  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://api-pilot.ebsi.eu/trusted-schemas-registry/v2/schemas/z3MgUFUkb722uq4x3dv5yAJmnNmzDFeK5UC8x83QoeLJM'
    ],
    id: `urn:uuid:${Math.random().toString(36).substr(2, 9)}`,
    type: ['VerifiableCredential', 'ConsolidatedTrustCredential'],
    issuer: issuerDID || 'did:ebsi:system',
    issuanceDate: new Date().toISOString(),
    expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    credentialSubject: {
      id: subjectDID,
      trustProfile: {
        overallTrustScore: averageScore,
        totalVotes: totalVotes,
        uniqueVoters: uniqueVoters.length,
        voterList: uniqueVoters,
        contextAnalysis: contextAnalysis,
        detailedVotes: votes.map(vote => ({
          issuer: vote.issuer,
          trustScore: vote.trustScore,
          context: vote.context,
          timestamp: vote.timestamp,
          comment: vote.comment || null
        })),
        generatedAt: new Date().toISOString(),
        lastUpdated: votes.length > 0 ? votes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0].timestamp : new Date().toISOString()
      }
    },
    proof: {
      type: 'Ed25519Signature2020',
      created: new Date().toISOString(),
      verificationMethod: `${issuerDID || 'did:ebsi:system'}#key1`,
      proofPurpose: 'assertionMethod',
      proofValue: Math.random().toString(36).substr(2, 64)
    }
  };
};