import React, { useState } from 'react';
import { Shield, Key, Lock, Clock, Server, ToggleLeft, ToggleRight, Check, X, Settings, Globe, Smartphone } from 'lucide-react';

interface AuthMethod {
  id: string;
  name: string;
  type: 'sso' | 'mfa' | 'oauth' | 'ldap' | 'password' | 'session';
  status: 'enabled' | 'disabled';
  description: string;
  config: any;
}

const IdentityAuthentication: React.FC = () => {
  const [authMethods, setAuthMethods] = useState<AuthMethod[]>([
    { 
      id: '1', 
      name: 'Single Sign-On (SSO)', 
      type: 'sso', 
      status: 'enabled', 
      description: 'Centralized authentication across all portals',
      config: { provider: 'Okta', domain: 'seleda.okta.com' }
    },
    { 
      id: '2', 
      name: 'Multi-Factor Authentication', 
      type: 'mfa', 
      status: 'enabled', 
      description: 'Additional security layer for user accounts',
      config: { methods: ['SMS', 'Authenticator App', 'Hardware Key'] }
    },
    { 
      id: '3', 
      name: 'OAuth 2.0', 
      type: 'oauth', 
      status: 'enabled', 
      description: 'OAuth 2.0 authorization framework',
      config: { providers: ['Google', 'Microsoft', 'GitHub'] }
    },
    { 
      id: '4', 
      name: 'OpenID Connect', 
      type: 'oauth', 
      status: 'enabled', 
      description: 'Identity layer on top of OAuth 2.0',
      config: { enabled: true }
    },
    { 
      id: '5', 
      name: 'LDAP / Active Directory', 
      type: 'ldap', 
      status: 'disabled', 
      description: 'Enterprise directory integration',
      config: { server: '', port: 389 }
    },
    { 
      id: '6', 
      name: 'Password Policies', 
      type: 'password', 
      status: 'enabled', 
      description: 'Password complexity and expiration rules',
      config: { minLength: 12, requireUppercase: true, requireNumbers: true, requireSpecialChars: true, expirationDays: 90 }
    },
    { 
      id: '7', 
      name: 'Session Policies', 
      type: 'session', 
      status: 'enabled', 
      description: 'Session timeout and management rules',
      config: { timeoutMinutes: 30, maxConcurrentSessions: 3 }
    },
  ]);

  const toggleAuthMethod = (id: string) => {
    setAuthMethods(methods => methods.map(method => 
      method.id === id 
        ? { ...method, status: method.status === 'enabled' ? 'disabled' : 'enabled' }
        : method
    ));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sso': return <Globe size={20} />;
      case 'mfa': return <Smartphone size={20} />;
      case 'oauth': return <Key size={20} />;
      case 'ldap': return <Server size={20} />;
      case 'password': return <Lock size={20} />;
      case 'session': return <Clock size={20} />;
      default: return <Shield size={20} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sso': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'mfa': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'oauth': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20';
      case 'ldap': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/20';
      case 'password': return 'text-rose-600 bg-rose-100 dark:bg-rose-900/20';
      case 'session': return 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/20';
      default: return 'text-slate-600 bg-slate-100 dark:bg-slate-800';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Identity & Authentication</h1>
          <p className="text-xs text-slate-400">Configure SSO, MFA, OAuth 2.0, OpenID Connect, LDAP/AD, password policies, and session policies</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Settings size={16} />
          Global Settings
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Enabled Methods', value: authMethods.filter(m => m.status === 'enabled').length, icon: Check, color: 'text-emerald-600' },
          { label: 'Disabled Methods', value: authMethods.filter(m => m.status === 'disabled').length, icon: X, color: 'text-red-600' },
          { label: 'SSO Providers', value: 1, icon: Globe, color: 'text-blue-600' },
          { label: 'MFA Methods', value: 3, icon: Smartphone, color: 'text-purple-600' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
              <div className={`w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} flex items-center justify-center mb-2`}>
                <Icon size={16} />
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Authentication Methods */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Authentication Methods</h3>
            <p className="text-xs text-slate-400">Identity and access configuration</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {authMethods.map((method) => (
            <div key={method.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${getTypeColor(method.type)} flex items-center justify-center`}>
                  {getTypeIcon(method.type)}
                </div>
                <button
                  onClick={() => toggleAuthMethod(method.id)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  {method.status === 'enabled' ? (
                    <ToggleRight size={20} className="text-emerald-500" />
                  ) : (
                    <ToggleLeft size={20} className="text-slate-400" />
                  )}
                </button>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{method.name}</h4>
              <p className="text-xs text-slate-500 mb-4">{method.description}</p>

              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                  method.status === 'enabled' 
                    ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400'
                }`}>
                  {method.status}
                </span>
                <button className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                  Configure
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Password Policy Configuration */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Password Policy</h3>
            <p className="text-xs text-slate-400">Current password requirements</p>
          </div>
          <button className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Edit Policy
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Minimum Length', value: '12 characters' },
            { label: 'Uppercase Required', value: 'Yes' },
            { label: 'Numbers Required', value: 'Yes' },
            { label: 'Special Characters', value: 'Yes' },
            { label: 'Expiration', value: '90 days' },
            { label: 'History Check', value: 'Last 5' },
            { label: 'Account Lockout', value: '5 attempts' },
            { label: 'Lockout Duration', value: '30 minutes' },
          ].map((policy, index) => (
            <div key={index} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{policy.label}</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{policy.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Session Policy Configuration */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Session Policy</h3>
            <p className="text-xs text-slate-400">Session management rules</p>
          </div>
          <button className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Edit Policy
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Session Timeout', value: '30 minutes' },
            { label: 'Max Concurrent Sessions', value: '3 per user' },
            { label: 'Remember Me Duration', value: '7 days' },
            { label: 'Idle Timeout', value: '15 minutes' },
            { label: 'IP Restriction', value: 'Disabled' },
            { label: 'Device Fingerprinting', value: 'Enabled' },
            { label: 'Geolocation Check', value: 'Optional' },
            { label: 'Session Encryption', value: 'AES-256' },
          ].map((policy, index) => (
            <div key={index} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{policy.label}</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{policy.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IdentityAuthentication;