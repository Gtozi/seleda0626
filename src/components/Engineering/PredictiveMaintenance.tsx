import React, { useState } from 'react';
import {
  TrendingUp, AlertTriangle, Activity, Thermometer, Zap,
  Droplets, Gauge, Brain, Search, Filter, Plus, BarChart3,
  Clock, CheckCircle2, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';

interface Prediction {
  id: string;
  assetId: string;
  assetName: string;
  assetCategory: string;
  location: string;
  dataSource: 'IoT Sensors' | 'Runtime Counters' | 'Temperature' | 'Vibration' | 'Energy Usage' | 'Historical Failures';
  predictionType: 'Failure Prediction' | 'Maintenance Recommendation' | 'Remaining Useful Life' | 'Risk Assessment';
  confidence: number;
  predictedFailureDate?: string;
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  currentHealth: number;
  recommendedAction: string;
  status: 'Active' | 'Addressed' | 'Dismissed';
  createdAt: string;
}

const PredictiveMaintenance: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([
    {
      id: 'PM-1001',
      assetId: 'GEN-01',
      assetName: 'Backup Generator 500kVA',
      assetCategory: 'Power Systems',
      location: 'Plant Room 1',
      dataSource: 'Temperature',
      predictionType: 'Failure Prediction',
      confidence: 87,
      predictedFailureDate: '2026-08-15',
      riskLevel: 'High',
      currentHealth: 65,
      recommendedAction: 'Schedule cooling system inspection and coolant replacement before August 10th.',
      status: 'Active',
      createdAt: '2026-07-25',
    },
    {
      id: 'PM-1002',
      assetId: 'AC-LOBBY-01',
      assetName: 'Central Chiller Unit',
      assetCategory: 'HVAC',
      location: 'Rooftop South',
      dataSource: 'Vibration',
      predictionType: 'Maintenance Recommendation',
      confidence: 92,
      riskLevel: 'Critical',
      currentHealth: 45,
      recommendedAction: 'Immediate bearing replacement required. Vibration levels exceed safety thresholds.',
      status: 'Active',
      createdAt: '2026-07-28',
    },
    {
      id: 'PM-1003',
      assetId: 'PUMP-W-01',
      assetName: 'Main Water Booster Pump',
      assetCategory: 'Water Systems',
      location: 'Pump House',
      dataSource: 'Runtime Counters',
      predictionType: 'Remaining Useful Life',
      confidence: 78,
      predictedFailureDate: '2026-12-01',
      riskLevel: 'Medium',
      currentHealth: 78,
      recommendedAction: 'Plan for pump replacement in Q4 2026. Begin procurement process.',
      status: 'Active',
      createdAt: '2026-07-20',
    },
    {
      id: 'PM-1004',
      assetId: 'EV-A',
      assetName: 'Service Elevator Alpha',
      assetCategory: 'Vertical Transport',
      location: 'Back of House',
      dataSource: 'Energy Usage',
      predictionType: 'Risk Assessment',
      confidence: 85,
      riskLevel: 'Medium',
      currentHealth: 82,
      recommendedAction: 'Energy consumption increasing by 15%. Recommend motor efficiency audit.',
      status: 'Active',
      createdAt: '2026-07-22',
    },
    {
      id: 'PM-1005',
      assetId: 'BOILER-02',
      assetName: 'Steam Boiler 02',
      assetCategory: 'HVAC',
      location: 'Boiler Room',
      dataSource: 'Historical Failures',
      predictionType: 'Failure Prediction',
      confidence: 72,
      predictedFailureDate: '2026-09-20',
      riskLevel: 'Medium',
      currentHealth: 70,
      recommendedAction: 'Historical pattern suggests pressure valve failure in 6-8 weeks. Preemptive replacement recommended.',
      status: 'Active',
      createdAt: '2026-07-18',
    },
    {
      id: 'PM-1006',
      assetId: 'COLD-STORE',
      assetName: 'Walk-in Cold Store',
      assetCategory: 'Kitchen Equipment',
      location: 'Kitchen',
      dataSource: 'IoT Sensors',
      predictionType: 'Maintenance Recommendation',
      confidence: 95,
      riskLevel: 'Low',
      currentHealth: 88,
      recommendedAction: 'Compressor efficiency declining by 5%. Schedule maintenance within 30 days.',
      status: 'Addressed',
      createdAt: '2026-07-15',
    },
  ]);

  const [activeRisk, setActiveRisk] = useState<string>('All');
  const [activeSource, setActiveSource] = useState<string>('All');

  const riskLevels = ['All', 'Critical', 'High', 'Medium', 'Low'];
  const dataSources = ['All', 'IoT Sensors', 'Runtime Counters', 'Temperature', 'Vibration', 'Energy Usage', 'Historical Failures'];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'bg-rose-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-amber-500 text-white';
      case 'Low': return 'bg-blue-500 text-white';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-emerald-500';
    if (health >= 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getTrendIcon = (health: number) => {
    if (health >= 80) return <CheckCircle2 size={12} className="text-emerald-500" />;
    if (health >= 60) return <Minus size={12} className="text-amber-500" />;
    return <ArrowDownRight size={12} className="text-rose-500" />;
  };

  const filteredPredictions = predictions.filter(pred => {
    if (activeRisk !== 'All' && pred.riskLevel !== activeRisk) return false;
    if (activeSource !== 'All' && pred.dataSource !== activeSource) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white leading-tight">Predictive Maintenance</h2>
          <p className="text-xs text-slate-400 font-medium tracking-tight">AI-powered failure prediction and maintenance recommendations</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <BarChart3 size={16} />
            Analytics
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200 dark:shadow-none">
            <Plus size={16} />
            Configure AI Model
          </button>
        </div>
      </div>

      {/* Risk Level Filter */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto no-scrollbar gap-1.5">
        {riskLevels.map((risk) => (
          <button
            key={risk}
            onClick={() => setActiveRisk(risk)}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap uppercase tracking-tighter ${
              activeRisk === risk
                ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {risk}
          </button>
        ))}
      </div>

      {/* Data Source Filter */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto no-scrollbar gap-1.5">
        {dataSources.map((source) => (
          <button
            key={source}
            onClick={() => setActiveSource(source)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap uppercase tracking-tighter ${
              activeSource === source
                ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {source}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500">
              <Brain size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{predictions.filter(p => p.status === 'Active').length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Predictions</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500">
              <AlertTriangle size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{predictions.filter(p => p.riskLevel === 'Critical').length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Critical Risk</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500">
              <Activity size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {Math.round(predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length)}%
            </span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg. Confidence</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500">
              <TrendingUp size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {Math.round(predictions.reduce((acc, p) => acc + p.currentHealth, 0) / predictions.length)}%
            </span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg. Asset Health</span>
        </div>
      </div>

      {/* Predictions List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          {filteredPredictions.map((pred) => (
            <div
              key={pred.id}
              className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-3xs group hover:border-indigo-300 transition-all cursor-pointer relative overflow-hidden"
            >
              {/* Risk Indicator Line */}
              <div className={`absolute top-0 left-0 w-1.5 h-full ${getRiskColor(pred.riskLevel).split(' ')[0]}`} />

              <div className="flex flex-col md:flex-row justify-between gap-4 ml-2">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-black text-slate-400 group-hover:text-indigo-500 transition-colors uppercase tracking-widest">{pred.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight ${getRiskColor(pred.riskLevel)}`}>
                      {pred.riskLevel} Risk
                    </span>
                    <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-[8px] font-black uppercase tracking-tight">
                      {pred.predictionType}
                    </span>
                    {pred.status === 'Addressed' && (
                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[8px] font-black uppercase tracking-tight">
                        Addressed
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white leading-tight">{pred.assetName}</h4>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                      <span className="text-[10px] font-bold text-slate-500">{pred.assetCategory}</span>
                      <span className="text-[10px] font-bold text-slate-400">•</span>
                      <span className="text-[10px] font-bold text-slate-500">{pred.location}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain size={12} className="text-indigo-500" />
                      <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">AI Recommendation</span>
                      <span className="text-[9px] font-black text-slate-400 ml-auto">{pred.confidence}% confidence</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{pred.recommendedAction}</p>
                  </div>

                  {pred.predictedFailureDate && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-rose-500">
                      <Clock size={10} />
                      <span>Predicted failure: {pred.predictedFailureDate}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-row md:flex-col justify-between items-end md:items-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-6 pt-3 md:pt-0">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Health Score</span>
                        {getTrendIcon(pred.currentHealth)}
                      </div>
                      <span className={`text-xl font-black ${getHealthColor(pred.currentHealth)}`}>{pred.currentHealth}%</span>
                    </div>

                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase block tracking-tight">Data Source</span>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{pred.dataSource}</span>
                    </div>

                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase block tracking-tight">Created</span>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{pred.createdAt}</span>
                    </div>
                  </div>

                  <button className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 transition">
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-6">
            <div>
              <h3 className="text-sm font-sans font-extrabold leading-tight">Data Sources</h3>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">AI input streams</p>
            </div>

            <div className="space-y-4">
              {dataSources.slice(1).map((source, i) => {
                const count = predictions.filter(p => p.dataSource === source).length;
                const icons: Record<string, any> = {
                  'IoT Sensors': Activity,
                  'Runtime Counters': Clock,
                  'Temperature': Thermometer,
                  'Vibration': Zap,
                  'Energy Usage': Droplets,
                  'Historical Failures': BarChart3,
                };
                const Icon = icons[source] || Activity;
                return (
                  <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <Icon size={12} className="text-slate-400" />
                      <span className="text-[10px] font-bold">{source}</span>
                    </div>
                    <span className="text-[10px] font-black">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-4">
            <div>
              <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">Prediction Types</h3>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">AI analysis outputs</p>
            </div>

            <div className="space-y-3">
              {[
                { type: 'Failure Prediction', count: predictions.filter(p => p.predictionType === 'Failure Prediction').length, color: 'text-rose-500' },
                { type: 'Maintenance Recommendation', count: predictions.filter(p => p.predictionType === 'Maintenance Recommendation').length, color: 'text-amber-500' },
                { type: 'Remaining Useful Life', count: predictions.filter(p => p.predictionType === 'Remaining Useful Life').length, color: 'text-blue-500' },
                { type: 'Risk Assessment', count: predictions.filter(p => p.predictionType === 'Risk Assessment').length, color: 'text-purple-500' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{item.type}</span>
                  <span className={`text-[10px] font-black ${item.color}`}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveMaintenance;
