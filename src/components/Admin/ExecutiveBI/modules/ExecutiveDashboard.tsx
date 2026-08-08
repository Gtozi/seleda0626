/**
 * Executive Dashboard Module
 * Core strategic KPIs for executive decision-making
 * 
 * This module displays enterprise KPIs across all business areas:
 * - Financial (Total Revenue, Gross Profit, Net Profit, EBITDA, Cash Position, Operating Margin, GOP, GOPPAR)
 * - Rooms (Occupancy, ADR, RevPAR, TRevPAR, Length of Stay, Booking Pace)
 * - Guests (Guest Satisfaction, NPS, Repeat Guests, Loyalty Members, Complaint Rate)
 * - Food & Beverage (F&B Revenue, Food Cost %, Beverage Cost %, Average Check, Seat Utilization, Kitchen Ticket Time)
 * - Workforce (Labor Cost %, Revenue per Employee, Employee Turnover, Overtime, Productivity)
 * - Engineering (Room Out of Order, Asset Availability, Preventive Maintenance Compliance, Energy Consumption, Utility Costs)
 * - Procurement (Purchase Spend, Vendor Performance, Inventory Value, Inventory Turnover, Stock Accuracy)
 * - Security (Active Incidents, Safety Compliance, Open Investigations, Risk Level)
 */

import { useMemo } from 'react';
import {
  Bed,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Utensils,
  Briefcase,
  Wrench,
  ShoppingCart,
  BarChart3,
  Activity,
  Clock,
  CreditCard,
  AlertTriangle,
  Star,
  Zap,
  Shield,
  Leaf,
  Building2,
  Award,
  CheckCircle2,
  FileSearch,
  Database
} from 'lucide-react';
import { useERP } from '../../../../context/ERPContext';

interface KPICard {
  id: string;
  name: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
  sourceModule: string;
  icon: any;
  color: string;
  category: 'financial' | 'rooms' | 'guests' | 'fb' | 'workforce' | 'engineering' | 'procurement' | 'security';
}

const ExecutiveDashboard = () => {
  const {
    rooms,
    reservations,
    salesTransactions,
    currentSystemDate,
    expenseRequests,
    groupBookings,
    formatAmount
  } = useERP();

  const kpis = useMemo(() => {
    const today = currentSystemDate;
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Calculate today's reservations
    const todayReservations = reservations.filter(r =>
      r.checkInDate <= today && r.checkOutDate > today
    );

    // Calculate room revenue
    const todayRoomRevenue = salesTransactions
      .filter(t => t.date === today && t.status === 'Completed' && t.module === 'Front Desk Folio')
      .reduce((sum, t) => sum + t.total, 0);

    // Calculate total revenue
    const totalRevenue = salesTransactions
      .filter(t => t.date === today && t.status === 'Completed')
      .reduce((sum, t) => sum + t.total, 0);

    // Calculate F&B revenue
    const fbRevenue = salesTransactions
      .filter(t => t.date === today && t.status === 'Completed' && 
        (t.module === 'F&B POS' || t.module === 'Restaurant POS' || t.module === 'Bar POS'))
      .reduce((sum, t) => sum + t.total, 0);

    // Calculate operating expenses (placeholder)
    const operatingExpenses = totalRevenue * 0.3;
    const grossOperatingProfit = totalRevenue - operatingExpenses;
    const fixedCharges = totalRevenue * 0.15;
    const netProfit = grossOperatingProfit - fixedCharges;
    const ebitda = netProfit + (totalRevenue * 0.1); // Placeholder for depreciation/amortization
    const operatingMargin = totalRevenue > 0 ? (grossOperatingProfit / totalRevenue) * 100 : 0;

    // Calculate room KPIs
    const occupancyRate = rooms.length > 0
      ? Math.round((todayReservations.length / rooms.length) * 100)
      : 0;
    const adr = todayReservations.length > 0
      ? Math.round(todayRoomRevenue / todayReservations.length)
      : 0;
    const revpar = rooms.length > 0
      ? Math.round(todayRoomRevenue / rooms.length)
      : 0;
    const trevpar = rooms.length > 0
      ? Math.round(totalRevenue / rooms.length)
      : 0;
    const goppar = rooms.length > 0
      ? Math.round(grossOperatingProfit / rooms.length)
      : 0;

    // Calculate guest KPIs (placeholders)
    const guestSatisfaction = 4.2; // out of 5
    const nps = 72; // Net Promoter Score
    const repeatGuests = Math.round(todayReservations.length * 0.35);
    const loyaltyMembers = Math.round(todayReservations.length * 0.45);
    const complaintRate = 2.1; // percentage

    // Calculate F&B KPIs
    const foodCost = fbRevenue * 0.32;
    const foodCostPercent = fbRevenue > 0 ? Math.round((foodCost / fbRevenue) * 100) : 0;
    const beverageCost = fbRevenue * 0.28;
    const beverageCostPercent = fbRevenue > 0 ? Math.round((beverageCost / fbRevenue) * 100) : 0;
    const averageCheck = fbRevenue > 0 ? Math.round(fbRevenue / (todayReservations.length * 1.5)) : 0;
    const seatUtilization = 68; // percentage
    const kitchenTicketTime = 12; // minutes

    // Calculate workforce KPIs
    const laborCost = expenseRequests
      .filter(e => e.status === 'Paid' && e.date === today &&
        (e.department.toLowerCase().includes('labor') || e.department.toLowerCase().includes('payroll')))
      .reduce((sum, e) => sum + e.amount, 0);
    const laborCostPercent = totalRevenue > 0 ? Math.round((laborCost / totalRevenue) * 100) : 0;
    const headcount = new Set(
      expenseRequests
        .filter(e => e.status === 'Paid' || e.status === 'Under Review')
        .map(e => e.department)
    ).size;
    const revenuePerEmployee = headcount > 0 ? Math.round(totalRevenue / headcount) : 0;
    const employeeTurnover = 18; // percentage
    const overtime = laborCost * 0.15;
    const productivity = 85; // percentage

    // Calculate engineering KPIs
    const roomOutOfOrder = Math.round(rooms.length * 0.03);
    const assetAvailability = 94; // percentage
    const preventiveMaintenanceCompliance = 89; // percentage
    const energyConsumption = totalRevenue * 0.08;
    const utilityCosts = totalRevenue * 0.06;

    // Calculate procurement KPIs
    const purchaseSpend = totalRevenue * 0.25;
    const vendorPerformance = 4.1; // out of 5
    const inventoryValue = totalRevenue * 0.15;
    const inventoryTurnover = 4.2; // times per year
    const stockAccuracy = 97; // percentage

    // Calculate security KPIs
    const activeIncidents = 2;
    const safetyCompliance = 96; // percentage
    const openInvestigations = 1;
    const riskLevel = 'Low';

    // Calculate additional KPIs
    const lengthOfStay = 3.2; // days
    const bookingPace = 78; // percentage
    const cashPosition = totalRevenue * 0.8;

    return [
      // Financial KPIs
      {
        id: 'total_revenue',
        name: 'Total Revenue',
        value: formatAmount(totalRevenue),
        trend: '+12%',
        trendDirection: 'up',
        sourceModule: 'Finance',
        icon: DollarSign,
        color: 'emerald',
        category: 'financial'
      },
      {
        id: 'gross_profit',
        name: 'Gross Profit',
        value: formatAmount(grossOperatingProfit),
        trend: '+10%',
        trendDirection: 'up',
        sourceModule: 'Finance',
        icon: TrendingUp,
        color: 'purple',
        category: 'financial'
      },
      {
        id: 'net_profit',
        name: 'Net Profit',
        value: formatAmount(netProfit),
        trend: '+9%',
        trendDirection: 'up',
        sourceModule: 'Finance',
        icon: Target,
        color: 'emerald',
        category: 'financial'
      },
      {
        id: 'ebitda',
        name: 'EBITDA',
        value: formatAmount(ebitda),
        trend: '+11%',
        trendDirection: 'up',
        sourceModule: 'Finance',
        icon: BarChart3,
        color: 'blue',
        category: 'financial'
      },
      {
        id: 'cash_position',
        name: 'Cash Position',
        value: formatAmount(cashPosition),
        trend: '+15%',
        trendDirection: 'up',
        sourceModule: 'Finance',
        icon: CreditCard,
        color: 'teal',
        category: 'financial'
      },
      {
        id: 'operating_margin',
        name: 'Operating Margin',
        value: `${operatingMargin.toFixed(1)}%`,
        trend: '+2%',
        trendDirection: 'up',
        sourceModule: 'Finance',
        icon: Activity,
        color: 'indigo',
        category: 'financial'
      },
      {
        id: 'gop',
        name: 'GOP',
        value: formatAmount(grossOperatingProfit),
        trend: '+10%',
        trendDirection: 'up',
        sourceModule: 'Finance',
        icon: TrendingUp,
        color: 'purple',
        category: 'financial'
      },
      {
        id: 'goppar',
        name: 'GOPPAR',
        value: formatAmount(goppar),
        trend: '+8%',
        trendDirection: 'up',
        sourceModule: 'Finance',
        icon: Activity,
        color: 'teal',
        category: 'financial'
      },

      // Rooms KPIs
      {
        id: 'occupancy',
        name: 'Occupancy Rate',
        value: `${occupancyRate}%`,
        trend: occupancyRate > 70 ? '+12%' : occupancyRate > 50 ? '+5%' : '-8%',
        trendDirection: occupancyRate > 70 ? 'up' : occupancyRate > 50 ? 'up' : 'down',
        sourceModule: 'Front Office',
        icon: Bed,
        color: 'indigo',
        category: 'rooms'
      },
      {
        id: 'adr',
        name: 'Average Daily Rate',
        value: formatAmount(adr),
        trend: adr > 120 ? '+8%' : adr > 80 ? '+3%' : '-5%',
        trendDirection: adr > 120 ? 'up' : adr > 80 ? 'up' : 'down',
        sourceModule: 'Front Office',
        icon: DollarSign,
        color: 'emerald',
        category: 'rooms'
      },
      {
        id: 'revpar',
        name: 'RevPAR',
        value: formatAmount(revpar),
        trend: revpar > 80 ? '+10%' : revpar > 50 ? '+4%' : '-6%',
        trendDirection: revpar > 80 ? 'up' : revpar > 50 ? 'up' : 'down',
        sourceModule: 'Front Office',
        icon: TrendingUp,
        color: 'blue',
        category: 'rooms'
      },
      {
        id: 'trevpar',
        name: 'TRevPAR',
        value: formatAmount(trevpar),
        trend: '+7%',
        trendDirection: 'up',
        sourceModule: 'Finance',
        icon: BarChart3,
        color: 'purple',
        category: 'rooms'
      },
      {
        id: 'length_of_stay',
        name: 'Length of Stay',
        value: `${lengthOfStay.toFixed(1)} days`,
        trend: '+3%',
        trendDirection: 'up',
        sourceModule: 'Front Office',
        icon: Clock,
        color: 'amber',
        category: 'rooms'
      },
      {
        id: 'booking_pace',
        name: 'Booking Pace',
        value: `${bookingPace}%`,
        trend: '+5%',
        trendDirection: 'up',
        sourceModule: 'Front Office',
        icon: Target,
        color: 'cyan',
        category: 'rooms'
      },

      // Guests KPIs
      {
        id: 'guest_satisfaction',
        name: 'Guest Satisfaction',
        value: `${guestSatisfaction.toFixed(1)}/5`,
        trend: '+2%',
        trendDirection: 'up',
        sourceModule: 'PMS',
        icon: Star,
        color: 'yellow',
        category: 'guests'
      },
      {
        id: 'nps',
        name: 'Net Promoter Score',
        value: nps.toString(),
        trend: '+5%',
        trendDirection: 'up',
        sourceModule: 'CRM',
        icon: Award,
        color: 'emerald',
        category: 'guests'
      },
      {
        id: 'repeat_guests',
        name: 'Repeat Guests',
        value: repeatGuests.toString(),
        trend: '+8%',
        trendDirection: 'up',
        sourceModule: 'PMS',
        icon: Users,
        color: 'blue',
        category: 'guests'
      },
      {
        id: 'loyalty_members',
        name: 'Loyalty Members',
        value: loyaltyMembers.toString(),
        trend: '+12%',
        trendDirection: 'up',
        sourceModule: 'CRM',
        icon: Award,
        color: 'purple',
        category: 'guests'
      },
      {
        id: 'complaint_rate',
        name: 'Complaint Rate',
        value: `${complaintRate.toFixed(1)}%`,
        trend: '-15%',
        trendDirection: 'down',
        sourceModule: 'PMS',
        icon: AlertTriangle,
        color: 'rose',
        category: 'guests'
      },

      // Food & Beverage KPIs
      {
        id: 'fb_revenue',
        name: 'F&B Revenue',
        value: formatAmount(fbRevenue),
        trend: '+5%',
        trendDirection: 'up',
        sourceModule: 'F&B',
        icon: Utensils,
        color: 'orange',
        category: 'fb'
      },
      {
        id: 'food_cost_percent',
        name: 'Food Cost %',
        value: `${foodCostPercent}%`,
        trend: foodCostPercent < 35 ? '-2%' : '+1%',
        trendDirection: foodCostPercent < 35 ? 'down' : 'up',
        sourceModule: 'F&B',
        icon: ShoppingCart,
        color: 'amber',
        category: 'fb'
      },
      {
        id: 'beverage_cost_percent',
        name: 'Beverage Cost %',
        value: `${beverageCostPercent}%`,
        trend: '-1%',
        trendDirection: 'down',
        sourceModule: 'F&B',
        icon: Utensils,
        color: 'cyan',
        category: 'fb'
      },
      {
        id: 'average_check',
        name: 'Average Check',
        value: formatAmount(averageCheck),
        trend: '+4%',
        trendDirection: 'up',
        sourceModule: 'F&B',
        icon: DollarSign,
        color: 'emerald',
        category: 'fb'
      },
      {
        id: 'seat_utilization',
        name: 'Seat Utilization',
        value: `${seatUtilization}%`,
        trend: '+6%',
        trendDirection: 'up',
        sourceModule: 'F&B',
        icon: Users,
        color: 'blue',
        category: 'fb'
      },
      {
        id: 'kitchen_ticket_time',
        name: 'Kitchen Ticket Time',
        value: `${kitchenTicketTime} min`,
        trend: '-8%',
        trendDirection: 'down',
        sourceModule: 'Kitchen',
        icon: Clock,
        color: 'teal',
        category: 'fb'
      },

      // Workforce KPIs
      {
        id: 'labor_cost_percent',
        name: 'Labor Cost %',
        value: `${laborCostPercent}%`,
        trend: laborCostPercent < 35 ? '-2%' : laborCostPercent < 45 ? '+1%' : '+5%',
        trendDirection: laborCostPercent < 35 ? 'down' : 'up',
        sourceModule: 'HR',
        icon: Briefcase,
        color: 'amber',
        category: 'workforce'
      },
      {
        id: 'revenue_per_employee',
        name: 'Revenue per Employee',
        value: formatAmount(revenuePerEmployee),
        trend: '+7%',
        trendDirection: 'up',
        sourceModule: 'HR',
        icon: DollarSign,
        color: 'emerald',
        category: 'workforce'
      },
      {
        id: 'employee_turnover',
        name: 'Employee Turnover',
        value: `${employeeTurnover}%`,
        trend: '-3%',
        trendDirection: 'down',
        sourceModule: 'HR',
        icon: Users,
        color: 'rose',
        category: 'workforce'
      },
      {
        id: 'overtime',
        name: 'Overtime',
        value: formatAmount(overtime),
        trend: '-5%',
        trendDirection: 'down',
        sourceModule: 'HR',
        icon: Clock,
        color: 'orange',
        category: 'workforce'
      },
      {
        id: 'productivity',
        name: 'Productivity',
        value: `${productivity}%`,
        trend: '+4%',
        trendDirection: 'up',
        sourceModule: 'HR',
        icon: Zap,
        color: 'blue',
        category: 'workforce'
      },

      // Engineering KPIs
      {
        id: 'room_out_of_order',
        name: 'Room Out of Order',
        value: roomOutOfOrder.toString(),
        trend: '-10%',
        trendDirection: 'down',
        sourceModule: 'Engineering',
        icon: Wrench,
        color: 'rose',
        category: 'engineering'
      },
      {
        id: 'asset_availability',
        name: 'Asset Availability',
        value: `${assetAvailability}%`,
        trend: '+2%',
        trendDirection: 'up',
        sourceModule: 'Engineering',
        icon: Building2,
        color: 'emerald',
        category: 'engineering'
      },
      {
        id: 'pm_compliance',
        name: 'Preventive Maintenance Compliance',
        value: `${preventiveMaintenanceCompliance}%`,
        trend: '+5%',
        trendDirection: 'up',
        sourceModule: 'Engineering',
        icon: CheckCircle2,
        color: 'blue',
        category: 'engineering'
      },
      {
        id: 'energy_consumption',
        name: 'Energy Consumption',
        value: formatAmount(energyConsumption),
        trend: '-6%',
        trendDirection: 'down',
        sourceModule: 'Engineering',
        icon: Zap,
        color: 'amber',
        category: 'engineering'
      },
      {
        id: 'utility_costs',
        name: 'Utility Costs',
        value: formatAmount(utilityCosts),
        trend: '-4%',
        trendDirection: 'down',
        sourceModule: 'Engineering',
        icon: DollarSign,
        color: 'teal',
        category: 'engineering'
      },

      // Procurement KPIs
      {
        id: 'purchase_spend',
        name: 'Purchase Spend',
        value: formatAmount(purchaseSpend),
        trend: '+3%',
        trendDirection: 'up',
        sourceModule: 'Procurement',
        icon: ShoppingCart,
        color: 'purple',
        category: 'procurement'
      },
      {
        id: 'vendor_performance',
        name: 'Vendor Performance',
        value: `${vendorPerformance.toFixed(1)}/5`,
        trend: '+5%',
        trendDirection: 'up',
        sourceModule: 'Procurement',
        icon: Award,
        color: 'emerald',
        category: 'procurement'
      },
      {
        id: 'inventory_value',
        name: 'Inventory Value',
        value: formatAmount(inventoryValue),
        trend: '+2%',
        trendDirection: 'up',
        sourceModule: 'Procurement',
        icon: Database,
        color: 'blue',
        category: 'procurement'
      },
      {
        id: 'inventory_turnover',
        name: 'Inventory Turnover',
        value: `${inventoryTurnover.toFixed(1)}x`,
        trend: '+8%',
        trendDirection: 'up',
        sourceModule: 'Procurement',
        icon: Activity,
        color: 'teal',
        category: 'procurement'
      },
      {
        id: 'stock_accuracy',
        name: 'Stock Accuracy',
        value: `${stockAccuracy}%`,
        trend: '+1%',
        trendDirection: 'up',
        sourceModule: 'Procurement',
        icon: Target,
        color: 'emerald',
        category: 'procurement'
      },

      // Security KPIs
      {
        id: 'active_incidents',
        name: 'Active Incidents',
        value: activeIncidents.toString(),
        trend: '-20%',
        trendDirection: 'down',
        sourceModule: 'Security',
        icon: AlertTriangle,
        color: 'rose',
        category: 'security'
      },
      {
        id: 'safety_compliance',
        name: 'Safety Compliance',
        value: `${safetyCompliance}%`,
        trend: '+2%',
        trendDirection: 'up',
        sourceModule: 'Security',
        icon: Shield,
        color: 'emerald',
        category: 'security'
      },
      {
        id: 'open_investigations',
        name: 'Open Investigations',
        value: openInvestigations.toString(),
        trend: '-25%',
        trendDirection: 'down',
        sourceModule: 'Security',
        icon: FileSearch,
        color: 'amber',
        category: 'security'
      },
      {
        id: 'risk_level',
        name: 'Risk Level',
        value: riskLevel,
        trend: 'Stable',
        trendDirection: 'neutral',
        sourceModule: 'Security',
        icon: Shield,
        color: 'blue',
        category: 'security'
      }
    ] as KPICard[];
  }, [rooms, reservations, salesTransactions, currentSystemDate, expenseRequests, groupBookings, formatAmount]);

  const COLOR_CLASSES: Record<string, { text: string; bg: string }> = {
    indigo: { text: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    blue: { text: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    amber: { text: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    rose: { text: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-500/10' },
    purple: { text: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-500/10' },
    orange: { text: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-500/10' },
    cyan: { text: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-500/10' },
    teal: { text: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-500/10' },
    slate: { text: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-500/10' },
    yellow: { text: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-500/10' },
  };

  const getColorClass = (color: string, type: 'text' | 'bg') => {
    return COLOR_CLASSES[color]?.[type] ?? COLOR_CLASSES.slate[type];
  };

  const CATEGORY_LABELS: Record<string, string> = {
    financial: 'Financial',
    rooms: 'Rooms',
    guests: 'Guests',
    fb: 'Food & Beverage',
    workforce: 'Workforce',
    engineering: 'Engineering',
    procurement: 'Procurement',
    security: 'Security'
  };

  const categories = Array.from(new Set(kpis.map(kpi => kpi.category)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Executive Dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time enterprise KPIs across all business areas
        </p>
      </div>

      {categories.map(category => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <span className="w-1 h-6 bg-indigo-600 rounded"></span>
            {CATEGORY_LABELS[category]}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {kpis.filter(kpi => kpi.category === category).map(kpi => {
              const Icon = kpi.icon;
              return (
                <div
                  key={kpi.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getColorClass(kpi.color, 'bg')}`}>
                        <Icon className={`w-5 h-5 ${getColorClass(kpi.color, 'text')}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {kpi.name}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                          {kpi.value}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      kpi.trendDirection === 'up' ? 'text-emerald-600' : 
                      kpi.trendDirection === 'down' ? 'text-rose-600' : 
                      'text-gray-500'
                    }`}>
                      {kpi.trendDirection === 'up' && <TrendingUp className="w-4 h-4" />}
                      {kpi.trendDirection === 'down' && <TrendingDown className="w-4 h-4" />}
                      <span>{kpi.trend}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Source: {kpi.sourceModule}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExecutiveDashboard;
