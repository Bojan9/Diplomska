import React from 'react';
import { Shield, LogIn, UserPlus } from 'lucide-react';

const AuthScreen = ({
  loginMode,
  setLoginMode,
  dids,
  getDisplayName,
  selectedLoginDID,
  setSelectedLoginDID,
  loginSecretKey,
  setLoginSecretKey,
  handleLogin,
  createDIDForm,
  setCreateDIDForm,
  handleRegister
}) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">DID Trust System</h1>
        <p className="text-gray-600 mt-2">Secure your digital identity</p>
      </div>
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setLoginMode('login')}
          className={`flex-1 py-2 px-4 text-center ${
            loginMode === 'login'
              ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
              : 'text-gray-500'
          }`}
        >
          <LogIn className="h-4 w-4 inline mr-2" />
          Login
        </button>
        <button
          onClick={() => setLoginMode('register')}
          className={`flex-1 py-2 px-4 text-center ${
            loginMode === 'register'
              ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
              : 'text-gray-500'
          }`}
        >
          <UserPlus className="h-4 w-4 inline mr-2" />
          Register
        </button>
      </div>
      {loginMode === 'login' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select your DID
            </label>
            <select
              value={selectedLoginDID}
              onChange={(e) => setSelectedLoginDID(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose your DID...</option>
              {dids.map(did => (
                <option key={did.id} value={did.id}>
                  {getDisplayName(did)} ({did.type})
                </option>
              ))}
            </select>
            <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
              Secret Key (Base58)
            </label>
            <input
              type="password"
              value={loginSecretKey}
              onChange={e => setLoginSecretKey(e.target.value)}
              placeholder="Enter your secret key"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={!selectedLoginDID}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Login with DID
          </button>
          {dids.length === 0 && (
            <p className="text-center text-sm text-gray-500 mt-4">
              No DIDs available. Please register first.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entity Name
            </label>
            <input
              type="text"
              value={createDIDForm.alias}
              onChange={(e) => setCreateDIDForm({...createDIDForm, alias: e.target.value})}
              placeholder="Enter your entity name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entity Type
            </label>
            <select
              value={createDIDForm.type}
              onChange={(e) => setCreateDIDForm({...createDIDForm, type: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DID Method
            </label>
            <select
              value={createDIDForm.method}
              onChange={(e) => setCreateDIDForm({...createDIDForm, method: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="key">Key (did:key:)</option>
              <option value="web">Web (did:web:)</option>
              <option value="local">Local (did:local:)</option>
            </select>
          </div>
          <button
            onClick={handleRegister}
            disabled={!createDIDForm.alias.trim()}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Register & Login
          </button>
        </div>
      )}
    </div>
  </div>
);

export default AuthScreen;