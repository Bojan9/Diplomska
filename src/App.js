import React, { useState, useEffect } from 'react';
import { User, Shield, Vote, TrendingUp, LogOut } from 'lucide-react';
import { generateDID, createConsolidatedTrustVC } from './utils/didUtils';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import VCModal from './components/VCModal';
import PrivateKeyModal from './components/PrivateKeyModal';
import VotingSystem from './components/VotingSystem';
import TrustMetrics from './components/TrustMetrics';
import DIDManagementSection from './components/DIDManagementSection';
import Dashboard from './components/Dashboard';
import AuthScreen from './components/AuthScreen';

const DIDTrustApp = () => {
  const [dids, setDids] = useState([]);
  const [votes, setVotes] = useState([]);
  const [consolidatedVCs, setConsolidatedVCs] = useState([]);
  const [selectedDID, setSelectedDID] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authenticatedDID, setAuthenticatedDID] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginSecretKey, setLoginSecretKey] = useState('');
  const [showCreateDID, setShowCreateDID] = useState(false);
  const [showVCModal, setShowVCModal] = useState(false);
  const [vcModalDID, setVCModalDID] = useState(null);
  const [showPrivateKeyModal, setShowPrivateKeyModal] = useState(false);
  const [newDIDPrivateKey, setNewDIDPrivateKey] = useState('');
  const [pendingDIDId, setPendingDIDId] = useState(null);
  const [createDIDForm, setCreateDIDForm] = useState({
    alias: '',
    type: 'service_provider',
    method: 'key'
  });
  const [voteData, setVoteData] = useState({
    issuer: '',
    subject: '',
    trustScore: 5,
    context: 'service_quality'
  });

  useEffect(() => {
    fetch('http://localhost:4000/data')
      .then(res => res.json())
      .then(({ dids, votes, vcs }) => {
        let adminDID = dids?.find(d => d.isAdmin);
        if (!adminDID) {
          adminDID = {
            id: 'did:local:admin',
            alias: 'Admin',
            type: 'Administrator',
            isAdmin: true,
            created: new Date().toISOString(),
            publicKey: [{ publicKeyBase58: 'ADMIN_PUBLIC_KEY' }],
            privateKey: 'ADMIN_PRIVATE_KEY'
          };
          dids = [...(dids || []), adminDID];
        }

        setDids(dids || []);
        setVotes(votes || []);
        setConsolidatedVCs(vcs || []);
      });
  }, []);

  const isAdmin = dids.find(d => d.id === authenticatedDID && d.isAdmin);

  useEffect(() => {
    if (isLoggedIn) {
      fetch('http://localhost:4000/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dids, votes, vcs: consolidatedVCs })
      });
    }
  }, [dids, votes, consolidatedVCs]);

    const [loginMode, setLoginMode] = useState('login');
    const [selectedLoginDID, setSelectedLoginDID] = useState('');

  const handleRegister = () => {
    if (!createDIDForm.alias.trim()) return;
    
    const generated = generateDID(createDIDForm.method);
    const newDID = {
      ...generated,
      alias: createDIDForm.alias,
      type: createDIDForm.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    };

    const { privateKey, ...didWithoutPrivateKey } = newDID;
    
    setDids([...dids, didWithoutPrivateKey]);
    setCreateDIDForm({ alias: '', type: 'service_provider', method: 'key' });
    setShowCreateDID(false);
    setNewDIDPrivateKey(generated.privateKey);
    setPendingDIDId(didWithoutPrivateKey.id);
    setShowPrivateKeyModal(true);
  };

  const handleLogin = () => {
    if (!selectedLoginDID) return;

    const selectedDID = dids.find(did => did.id === selectedLoginDID);
    if (!selectedDID) return;

    const privateKey = loginSecretKey.trim();
    if (!privateKey) return alert("No private key provided.");

    if (selectedDID.isAdmin) {
      if (privateKey === selectedDID.privateKey) {
        setAuthenticatedDID(selectedDID.id);
        setIsLoggedIn(true);
        setLoginSecretKey('');
        return;
      } else {
        alert("Invalid admin key.");
        return;
      }
    }

    const challenge = `login-challenge-${Date.now()}`;
    const signature = signChallenge(challenge, privateKey);

    const isValid = nacl.sign.detached.verify(
      new TextEncoder().encode(challenge),
      bs58.decode(signature),
      bs58.decode(selectedDID.publicKey[0].publicKeyBase58)
    );

    if (isValid) {
      setAuthenticatedDID(selectedDID.id);
      setIsLoggedIn(true);
      setLoginSecretKey('');
    } else {
      alert("Signature invalid. You don't own this DID.");
    }
  };

  const signChallenge = (challenge, privateKeyBase58) => {
    const privateKey = bs58.decode(privateKeyBase58);
    const message = new TextEncoder().encode(challenge);
    const signature = nacl.sign.detached(message, privateKey);
    return bs58.encode(signature);
  };

  const handleLogout = () => {
    setAuthenticatedDID(null);
    setIsLoggedIn(false);
    setActiveTab('dashboard');
  };

  const calculateReputationScore = (targetDID) => {
    const relevantVotes = votes.filter(vote => vote.subject === targetDID);
    if (relevantVotes.length === 0) return 0;

    // Direct trust calculation
    const directTrust = relevantVotes.reduce((sum, vote) => sum + vote.trustScore, 0) / relevantVotes.length;
    
    // Reputation trust (weighted by issuer's own reputation)
    let weightedSum = 0;
    let totalWeight = 0;
    
    relevantVotes.forEach(vote => {
      const issuerReputation = calculateDirectTrust(vote.issuer) || 5; // Default weight of 5
      const weight = issuerReputation / 10; // Normalize to 0-1
      weightedSum += vote.trustScore * weight;
      totalWeight += weight;
    });
    
    const reputationTrust = totalWeight > 0 ? weightedSum / totalWeight : 0;
    
    // Context trust (considering recency and context diversity)
    const contextFactors = {};
    relevantVotes.forEach(vote => {
      const context = vote.context;
      if (!contextFactors[context]) contextFactors[context] = [];
      contextFactors[context].push(vote.trustScore);
    });
    
    const contextDiversity = Object.keys(contextFactors).length;
    const contextTrust = directTrust * (1 + (contextDiversity - 1) * 0.1); // Boost for diversity
    
    // Aggregate trust score
    const aggregatedTrust = (directTrust * 0.4 + reputationTrust * 0.4 + contextTrust * 0.2);
    
    return Math.min(10, Math.max(0, aggregatedTrust));
  };

  const calculateDirectTrust = (targetDID) => {
    const relevantVotes = votes.filter(vote => vote.subject === targetDID);
    if (relevantVotes.length === 0) return 0;
    return relevantVotes.reduce((sum, vote) => sum + vote.trustScore, 0) / relevantVotes.length;
  };

  const getTrustLevel = (score) => {
    if (score >= 8) return { level: 'High', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 6) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score >= 4) return { level: 'Low', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { level: 'Very Low', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const handleCreateDID = () => {
    if (!createDIDForm.alias.trim()) return;
    
    const newDID = {
      ...generateDID(createDIDForm.method),
      alias: createDIDForm.alias,
      type: createDIDForm.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    };
    setDids([...dids, newDID]);
    setCreateDIDForm({ alias: '', type: 'service_provider', method: 'key' });
    setShowCreateDID(false);
  };

  const handleDeleteDID = (didToDelete) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm(`Are you sure you want to delete ${didToDelete.alias}?`)) {
      setDids(dids.filter(did => did.id !== didToDelete.id));
      setVotes(votes.filter(vote => 
        vote.issuer !== didToDelete.id && vote.subject !== didToDelete.id
      ));
      setConsolidatedVCs(consolidatedVCs.filter(vc => 
        vc.credentialSubject.id !== didToDelete.id
      ));
      if (authenticatedDID === didToDelete.id) {
        handleLogout();
      }
    }
  };

  const handleSubmitVote = () => {
    if (!voteData.subject || authenticatedDID === voteData.subject) return;
    
    const newVote = {
      id: `vote-${Date.now()}`,
      issuer: authenticatedDID,
      subject: voteData.subject,
      trustScore: parseInt(voteData.trustScore),
      context: voteData.context,
      timestamp: new Date().toISOString(),
      comment: (voteData.comment || '').trim() || null
    };
    
    setVotes([...votes, newVote]);
    setVoteData({ issuer: '', subject: '', trustScore: 5, context: 'service_quality', comment: '' });
    
    setConsolidatedVCs(consolidatedVCs.filter(vc => 
      vc.credentialSubject.id !== voteData.subject
    ));
  };

  const generateConsolidatedVC = (subjectDID) => {
    const subjectVotes = votes.filter(vote => vote.subject === subjectDID);
    const newVC = createConsolidatedTrustVC(subjectDID, subjectVotes, authenticatedDID);
    
    const updatedVCs = consolidatedVCs.filter(vc => vc.credentialSubject.id !== subjectDID);
    setConsolidatedVCs([...updatedVCs, newVC]);
    
    return newVC;
  };

  const hasConsolidatedVC = (subjectDID) => {
    return consolidatedVCs.some(vc => vc.credentialSubject.id === subjectDID);
  };

  const getDisplayName = (didObj) => {
    if (!didObj) return '';
    if (isAdmin || authenticatedDID === didObj.id) {
      return didObj.alias;
    }
    return didObj.id;
  };

if (showPrivateKeyModal) {
    return (
      <PrivateKeyModal
        show={showPrivateKeyModal}
        privateKey={newDIDPrivateKey}
        onConfirm={() => {
          setAuthenticatedDID(pendingDIDId);
          setIsLoggedIn(true);
          setShowPrivateKeyModal(false);
          setNewDIDPrivateKey('');
          setPendingDIDId(null);
        }}
      />
    );
  }

  // Login/Registration Screen
    if (!isLoggedIn) {
      return (
        <AuthScreen
          loginMode={loginMode}
          setLoginMode={setLoginMode}
          dids={dids}
          getDisplayName={getDisplayName}
          selectedLoginDID={selectedLoginDID}
          setSelectedLoginDID={setSelectedLoginDID}
          loginSecretKey={loginSecretKey}
          setLoginSecretKey={setLoginSecretKey}
          handleLogin={handleLogin}
          createDIDForm={createDIDForm}
          setCreateDIDForm={setCreateDIDForm}
          handleRegister={handleRegister}
        />
      );
    }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">DID Trust & Reputation System</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {showVCModal && vcModalDID && (
        <VCModal
          show={showVCModal}
          did={vcModalDID}
          consolidatedVCs={consolidatedVCs}
          isAdmin={isAdmin}
          authenticatedDID={authenticatedDID}
          onClose={() => setShowVCModal(false)}
          onRevoke={() => setConsolidatedVCs(consolidatedVCs.filter(vc => vc.credentialSubject.id !== vcModalDID.id))}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64">
            <nav className="space-y-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
                { id: 'dids', label: 'DID Management', icon: User },
                { id: 'voting', label: 'Trust Voting', icon: Vote },
                { id: 'metrics', label: 'Trust Metrics', icon: Shield }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1">
            {activeTab === 'dashboard' && 
              <Dashboard
                dids={dids}
                votes={votes}
                consolidatedVCs={consolidatedVCs}
                calculateReputationScore={calculateReputationScore}
                calculateDirectTrust={calculateDirectTrust}
                getTrustLevel={getTrustLevel}
                getDisplayName={getDisplayName}
                authenticatedDID={authenticatedDID}
                isAdmin={isAdmin}
                generateConsolidatedVC={generateConsolidatedVC}
                hasConsolidatedVC={hasConsolidatedVC}
              />
            }
            {activeTab === 'dids' && 
              <DIDManagementSection
                dids={dids}
                authenticatedDID={authenticatedDID}
                isAdmin={isAdmin}
                getDisplayName={getDisplayName}
                setSelectedDID={setSelectedDID}
                handleDeleteDID={handleDeleteDID}
                showCreateDID={showCreateDID}
                createDIDForm={createDIDForm}
                setCreateDIDForm={setCreateDIDForm}
                handleCreateDID={handleCreateDID}
                selectedDID={selectedDID}
                setShowCreateDID={setShowCreateDID}
              />
            }
            {activeTab === 'voting' && 
              <VotingSystem
                dids={dids}
                votes={votes}
                voteData={voteData}
                setVoteData={setVoteData}
                authenticatedDID={authenticatedDID}
                handleSubmitVote={handleSubmitVote}
                getDisplayName={getDisplayName}
              />
            }
            {activeTab === 'metrics' && 
              <TrustMetrics
                dids={dids}
                votes={votes}
                calculateDirectTrust={calculateDirectTrust}
                calculateReputationScore={calculateReputationScore}
                getDisplayName={getDisplayName}
                setVCModalDID={setVCModalDID}
                setShowVCModal={setShowVCModal}
              />
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default DIDTrustApp;