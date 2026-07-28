import React, { useState, useEffect } from 'react';
import {
  History,
  RotateCcw,
  FileText,
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
  GitBranch,
  ArrowRightLeft,
  Eye,
  Download
} from 'lucide-react';

interface ConfigVersion {
  id: string;
  config_key: string;
  config_value: any;
  version: number;
  change_description: string | null;
  changed_by: string | null;
  changed_at: string;
  is_current: boolean;
  metadata: any;
}

interface RollbackLog {
  id: string;
  config_key: string;
  from_version: number;
  to_version: number;
  rollback_reason: string | null;
  rolled_back_by: string | null;
  rolled_back_at: string;
  metadata: any;
}

export default function ConfigurationVersionManager() {
  const [configKeys, setConfigKeys] = useState<string[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [versions, setVersions] = useState<ConfigVersion[]>([]);
  const [rollbackLogs, setRollbackLogs] = useState<RollbackLog[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<{ from: number; to: number } | null>(null);
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [rollbackReason, setRollbackReason] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchConfigKeys = async () => {
    try {
      const res = await fetch('/api/admin/config/keys');
      if (res.ok) {
        const keys = await res.json();
        setConfigKeys(keys);
        if (keys.length > 0 && !selectedKey) {
          setSelectedKey(keys[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch config keys:', error);
    }
  };

  const fetchVersions = async (key: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/config/${key}/history`);
      if (res.ok) {
        const data = await res.json();
        setVersions(data);
      }
    } catch (error) {
      console.error('Failed to fetch versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRollbackLogs = async (key: string) => {
    try {
      const res = await fetch(`/api/admin/config/${key}/rollbacks`);
      if (res.ok) {
        const data = await res.json();
        setRollbackLogs(data);
      }
    } catch (error) {
      console.error('Failed to fetch rollback logs:', error);
    }
  };

  useEffect(() => {
    fetchConfigKeys();
  }, []);

  useEffect(() => {
    if (selectedKey) {
      fetchVersions(selectedKey);
      fetchRollbackLogs(selectedKey);
    }
  }, [selectedKey]);

  const handleRollback = async () => {
    if (!selectedVersions || !rollbackReason) return;

    try {
      const res = await fetch(`/api/admin/config/${selectedKey}/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_version: selectedVersions.to,
          rollback_reason: rollbackReason
        })
      });

      if (res.ok) {
        setShowRollbackModal(false);
        setRollbackReason('');
        setSelectedVersions(null);
        fetchVersions(selectedKey);
        fetchRollbackLogs(selectedKey);
      }
    } catch (error) {
      console.error('Failed to rollback:', error);
    }
  };

  const handleCompare = (version1: number, version2: number) => {
    setSelectedVersions({ from: version1, to: version2 });
    setShowRollbackModal(false);
  };

  const formatConfigValue = (value: any) => {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Configuration Versioning</h2>
          <p className="text-sm text-slate-500">Track configuration changes and rollback to previous versions</p>
        </div>
      </div>

      {/* Config Key Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Configuration Key</label>
        <select
          value={selectedKey}
          onChange={(e) => setSelectedKey(e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm font-medium"
        >
          {configKeys.map(key => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
      </div>

      {/* Version History */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5" />
            Version History
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading versions...</div>
          ) : versions.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <History className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No version history available</p>
            </div>
          ) : (
            versions.map((version, index) => (
              <div key={version.id} className="px-6 py-4 hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2 rounded-lg ${version.is_current ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                      <GitBranch className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-900">Version {version.version}</h4>
                        {version.is_current && (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mb-2">
                        {version.change_description || 'No description provided'}
                      </p>
                      <div className="flex gap-6 text-xs">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span className="text-slate-600">
                            {version.changed_by || 'System'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className="text-slate-600">
                            {new Date(version.changed_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleCompare(version.version, versions[0]?.version)}
                      className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition"
                      title="Compare with current"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                    </button>
                    {!version.is_current && (
                      <button
                        onClick={() => {
                          setSelectedVersions({ from: versions[0]?.version || 0, to: version.version });
                          setShowRollbackModal(true);
                        }}
                        className="p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition"
                        title="Rollback to this version"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Rollback Logs */}
      {rollbackLogs.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Recent Rollbacks
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {rollbackLogs.map(log => (
              <div key={log.id} className="px-6 py-4 hover:bg-slate-50">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <RotateCcw className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900">
                        v{log.from_version} → v{log.to_version}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-2">
                      {log.rollback_reason || 'No reason provided'}
                    </p>
                    <div className="flex gap-6 text-xs">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="text-slate-600">
                          {log.rolled_back_by || 'System'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span className="text-slate-600">
                          {new Date(log.rolled_back_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Version Comparison */}
      {selectedVersions && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" />
            Version Comparison
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-2">Version {selectedVersions.from}</h4>
              <pre className="bg-slate-50 p-4 rounded-lg text-xs overflow-auto max-h-96">
                {formatConfigValue(versions.find(v => v.version === selectedVersions.from)?.config_value)}
              </pre>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-2">Version {selectedVersions.to}</h4>
              <pre className="bg-slate-50 p-4 rounded-lg text-xs overflow-auto max-h-96">
                {formatConfigValue(versions.find(v => v.version === selectedVersions.to)?.config_value)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Rollback Modal */}
      {showRollbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Confirm Rollback
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to rollback from version {selectedVersions?.from} to version {selectedVersions?.to}?
              This action will create a new version with the rolled-back configuration.
            </p>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Rollback Reason
            </label>
            <textarea
              value={rollbackReason}
              onChange={(e) => setRollbackReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-4"
              rows={3}
              placeholder="Explain why you are rolling back..."
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRollbackModal(false);
                  setRollbackReason('');
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRollback}
                disabled={!rollbackReason}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition disabled:opacity-50"
              >
                Confirm Rollback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
