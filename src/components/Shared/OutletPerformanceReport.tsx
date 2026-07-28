import React from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  Wine, 
  Utensils, 
  Gift, 
  ArrowRightLeft,
  AlertTriangle,
  Download,
  Calendar,
  Filter,
  DollarSign,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { useERP } from '../../context/ERPContext';
import { 
  ReportTemplate, 
  ReportExport, 
  BarChartCard,
  type ExportOption 
} from './DashboardTemplate';

const OutletPerformanceReport: React.FC = () => {
  const { inventoryItems, formatAmount } = useERP();

  // Mock Sales Data for the 3 outlets
  const outletSalesData = [
    { name: 'Restaurant', sales: 12450, cost: 4200, profit: 8250 },
    { name: 'Bar', sales: 8900, cost: 2100, profit: 6800 },
    { name: 'Gift Shop', sales: 3400, cost: 1200, profit: 2200 },
  ];

  const consumptionComparison = [
    { item: 'Pepsi 330ml', bar: 156, restaurant: 210 },
    { item: 'Mineral Water', bar: 84, restaurant: 450 },
    { item: 'Beer (Local)', bar: 320, restaurant: 120 },
    { item: 'House Wine (Red)', bar: 45, restaurant: 110 },
  ];

  const varianceData = [
    { item: 'Johnnie Walker Black', store: 'Bar', physical: 14, system: 15, variance: -1, value: -65 },
    { item: 'T-Bone Steak 500g', store: 'Restaurant', physical: 22, system: 20, variance: 2, value: 30 },
    { item: 'Stone Cross Souvenir', store: 'Gift Shop', physical: 5, system: 6, variance: -1, value: -25 },
  ];

  const transfers = [
    { id: 'TR-101', date: '2026-05-28 14:20', from: 'Main Store', to: 'Bar Store', item: 'White Wine', qty: 12, status: 'Completed' },
    { id: 'TR-102', date: '2026-05-28 15:45', from: 'Main Store', to: 'Restaurant Store', item: 'Mineral Water', qty: 48, status: 'Completed' },
    { id: 'TR-103', date: '2026-05-28 16:10', from: 'Restaurant Store', to: 'Bar Store', item: 'Lemons', qty: 5, status: 'In Transit' },
  ];

  const COLORS = ['#B5563C', '#5F7A4F', '#C18A3B'];

  const exportOptions: ExportOption[] = [
    {
      format: 'pdf',
      label: 'Export as PDF',
      icon: FileText,
      action: () => console.log('Export PDF')
    },
    {
      format: 'excel',
      label: 'Export as Excel',
      icon: FileSpreadsheet,
      action: () => console.log('Export Excel')
    }
  ];

  const handleExportAudit = () => {
    console.log('Exporting audit data...');
  };

  return (
    <ReportTemplate 
      title="Outlet Performance Center"
      subtitle="Property Operational Matrix"
      actions={
        <ReportExport 
          options={exportOptions}
          onRefresh={() => console.log('Refresh data')}
        />
      }
    >

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {outletSalesData.map((outlet, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs overflow-hidden relative group">
             <div className="absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 bg-slate-50 dark:bg-slate-800/50 rounded-full group-hover:scale-110 transition-transform" />
             <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                      {outlet.name === 'Restaurant' && <Utensils size={20} />}
                      {outlet.name === 'Bar' && <Wine size={20} />}
                      {outlet.name === 'Gift Shop' && <Gift size={20} />}
                   </div>
                   <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{outlet.name} Outlet</span>
                      <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">{formatAmount(outlet.sales)}</span>
                   </div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold border-t border-slate-100 dark:border-slate-800 pt-3">
                   <span className="text-slate-400 uppercase">Gross Margin</span>
                   <span className="text-emerald-500">{Math.round((outlet.profit / outlet.sales) * 100)}%</span>
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Sales Chart */}
        <div className="xl:col-span-12 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-[40px] shadow-3xs">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Revenue vs Cost Analysis</h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Cross-Outlet Performance Evaluation</p>
              </div>
              <div className="flex gap-6">
                 <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Sales</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Input Cost</span>
                 </div>
              </div>
           </div>
           <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={outletSalesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} fontWeight={700} tick={{ fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight={700} tick={{ fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="sales" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={50} />
                    <Bar dataKey="cost" fill="#e2e8f0" radius={[8, 8, 0, 0]} barSize={50} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Drink Consumption */}
        <div className="xl:col-span-8 bg-white dark:bg-slate-900/30 border border-slate-150 dark:border-slate-700 p-8 rounded-[40px] shadow-3xs dark:shadow-slate-900/20">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Drink Consumption Comparison</h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Units Issued: Bar Store vs Restaurant Store</p>
              </div>
              <div className="flex gap-4">
                 <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Restaurant</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Bar</span>
                 </div>
              </div>
           </div>
           <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={consumptionComparison} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="item" type="category" axisLine={false} tickLine={false} fontSize={10} fontWeight={700} width={120} tick={{ fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                    <Bar dataKey="restaurant" fill="#10b981" radius={[0, 6, 6, 0]} barSize={20} />
                    <Bar dataKey="bar" fill="#f59e0b" radius={[0, 6, 6, 0]} barSize={20} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Stock Variance */}
        <div className="xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-[40px] shadow-3xs">
           <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Stock Variance Audit</h3>
           <div className="space-y-4">
              {varianceData.map((v, i) => (
                <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                   <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase truncate pr-2">{v.item}</span>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${v.variance < 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                         {v.variance > 0 ? '+' : ''}{v.variance}
                      </span>
                   </div>
                   <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">
                       <span>{v.store} Store</span>
                       <span className={v.value < 0 ? 'text-rose-500' : 'text-emerald-500'}>{formatAmount(Math.abs(v.value))} Risk</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
                         <div className={`h-full ${v.variance < 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.abs((v.physical/v.system)*100)}%` }} />
                      </div>
                      <span className="text-[8px] font-mono text-slate-400">{v.physical}/{v.system}</span>
                   </div>
                </div>
              ))}
           </div>
           <button className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition shadow-lg shadow-slate-200 dark:shadow-none">
              Start Full Stock Count
           </button>
        </div>

        {/* Transfer Log */}
        <div className="xl:col-span-12 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-[40px] shadow-3xs overflow-x-auto">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Inter-Store Transfer Log</h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Real-time Movement Audit</p>
              </div>
              <ArrowRightLeft className="text-indigo-500" size={20} />
           </div>
           <table className="w-full text-[10px] font-bold">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-widest">
                   <th className="text-left py-4 px-2">Timestamp</th>
                   <th className="text-left py-4 px-2">Item Description</th>
                   <th className="text-left py-4 px-2">From Outlet</th>
                   <th className="text-left py-4 px-2">To Outlet</th>
                   <th className="text-right py-4 px-2">Quantity</th>
                   <th className="text-right py-4 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((t, i) => (
                  <tr key={i} className="border-b border-slate-50 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                     <td className="py-4 px-2 text-slate-500 font-mono tracking-tight">{t.date}</td>
                     <td className="py-4 px-2 text-slate-900 dark:text-white uppercase">{t.item}</td>
                     <td className="py-4 px-2 text-slate-600 dark:text-slate-400 uppercase">{t.from}</td>
                     <td className="py-4 px-2 text-slate-600 dark:text-slate-400 uppercase">{t.to}</td>
                     <td className="py-4 px-2 text-right text-indigo-500">{t.qty}</td>
                     <td className="py-4 px-2 text-right">
                        <span className={`px-2 py-1 rounded font-black text-[8px] uppercase tracking-tighter ${
                          t.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                           {t.status}
                        </span>
                     </td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
      </div>
    </ReportTemplate>
  );
};

export default OutletPerformanceReport;
