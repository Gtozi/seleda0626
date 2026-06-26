/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useMemo } from 'react';
import { toISODate } from '../../utils/date';
import { 
  Beer, 
  Search, 
  Plus, 
  Minus, 
  X, 
  CheckCircle2, 
  Receipt, 
  CreditCard,
  History,
  Trash2,
  Trash,
  ShoppingBag,
  User,
  Smartphone,
  Coins,
  Landmark,
  UserPlus,
  Printer,
  Download,
  Percent,
  Ban
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useERP } from '../../context/ERPContext';
import UnifiedInvoiceTemplate from '../Shared/UnifiedInvoiceTemplate';

export default function BarPOSModule({ outletName = 'Pool Bar' }: { outletName?: string }) {
  const { 
    formatAmount, 
    inventoryItems, 
    addInventoryItem,
    updateInventoryItem, 
    addNotification, 
    reservations, 
    addFolioCharge,
    globalHotelSettings,
    chartOfAccounts,
    addSaleTransaction,
    userProfile,
    salesTransactions
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'pos' | 'history' | 'issues'>('pos');
  const [shiftJournalFilterDate, setShiftJournalFilterDate] = useState<string>(toISODate(new Date()));
  const [cart, setCart] = useState<{ id: string, name: string, price: number, quantity: number, stockId: string }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Mobile' | 'RoomCharge'>('Cash');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [invoicePrintData, setInvoicePrintData] = useState<any | null>(null);

  const settledBarSales = useMemo(() => {
    return (salesTransactions || []).filter(tx => tx.module === 'Bar POS');
  }, [salesTransactions]);

  const filteredBarSales = useMemo(() => {
    return settledBarSales.filter(tx => tx.date.startsWith(shiftJournalFilterDate));
  }, [settledBarSales, shiftJournalFilterDate]);

  // Damaged, broken or lost items tracking
  const [barIssues, setBarIssues] = useState<any[]>(() => {
    const saved = localStorage.getItem('hotel_erp_bar_issues');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedProductIdIssue, setSelectedProductIdIssue] = useState<string>('');
  const [issueQuantity, setIssueQuantity] = useState<number>(1);
  const [issueType, setIssueType] = useState<'Damaged' | 'Broken' | 'Lost'>('Damaged');
  const [issueNotes, setIssueNotes] = useState<string>('');
  const [issueReporter, setIssueReporter] = useState<string>('');

  const saveBarIssues = (newList: any[]) => {
    setBarIssues(newList);
    localStorage.setItem('hotel_erp_bar_issues', JSON.stringify(newList));
  };

  // Split payment state
  const [isSplitPayment, setIsSplitPayment] = useState(false);
  const [splitAmounts, setSplitAmounts] = useState<Record<string, string>>({});
  const [tabToDelete, setTabToDelete] = useState<string | null>(null);

  const [walkInClientName, setWalkInClientName] = useState('');
  const [walkInClientTIN, setWalkInClientTIN] = useState('');
  const [walkInClientVATNo, setWalkInClientVATNo] = useState('');
  const [walkInClientVATDate, setWalkInClientVATDate] = useState('');
  const [showClientInfoFields, setShowClientInfoFields] = useState(false);

  // Bar Tabs States & Structs
  interface BarTab {
    id: string;
    name: string;
    createdAt: string;
    items: { id: string, name: string, price: number, quantity: number, stockId: string }[];
    paymentMethod?: 'Cash' | 'Card' | 'Mobile' | 'RoomCharge';
    selectedRoomId?: string;
    discountPercent?: number;
    walkInClientName?: string;
    walkInClientTIN?: string;
    walkInClientVATNo?: string;
    walkInClientVATDate?: string;
    paymentScreenshot?: File | null;
  }

  const [openTabs, setOpenTabs] = useState<BarTab[]>(() => {
    const saved = localStorage.getItem('hotel_erp_bar_tabs_v1');
    return saved ? JSON.parse(saved) : [
      { id: 'quick-sale', name: 'Quick Sale', createdAt: new Date().toISOString(), items: [], paymentMethod: 'Cash', selectedRoomId: '', discountPercent: 0, walkInClientName: '', walkInClientTIN: '', walkInClientVATNo: '', walkInClientVATDate: '', paymentScreenshot: null }
    ];
  });
  const [selectedTabId, setSelectedTabId] = useState<string>('quick-sale');
  const [showNewTabModal, setShowNewTabModal] = useState(false);
  const [newTabName, setNewTabName] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);

  // Persist open tabs to cache
  React.useEffect(() => {
    localStorage.setItem('hotel_erp_bar_tabs_v1', JSON.stringify(openTabs));
  }, [openTabs]);

  // Synchronize dynamic client parameters per active bar tab
  React.useEffect(() => {
    updateTabField(selectedTabId, 'walkInClientName', walkInClientName);
  }, [walkInClientName, selectedTabId]);

  React.useEffect(() => {
    updateTabField(selectedTabId, 'walkInClientTIN', walkInClientTIN);
  }, [walkInClientTIN, selectedTabId]);

  React.useEffect(() => {
    updateTabField(selectedTabId, 'walkInClientVATNo', walkInClientVATNo);
  }, [walkInClientVATNo, selectedTabId]);

  React.useEffect(() => {
    updateTabField(selectedTabId, 'walkInClientVATDate', walkInClientVATDate);
  }, [walkInClientVATDate, selectedTabId]);

  // Handle switching tabs
  const handleSelectTab = (tabId: string) => {
    const target = openTabs.find(t => t.id === tabId);
    if (!target) return;
    setSelectedTabId(tabId);
    setCart(target.items || []);
    setPaymentMethod((target.paymentMethod || 'Cash') as any);
    setSelectedRoomId(target.selectedRoomId || '');
    setDiscountPercent(target.discountPercent || 0);
    setWalkInClientName(target.walkInClientName || '');
    setWalkInClientTIN(target.walkInClientTIN || '');
    setWalkInClientVATNo(target.walkInClientVATNo || '');
    setWalkInClientVATDate(target.walkInClientVATDate || '');
    setPaymentScreenshot(target.paymentScreenshot || null);
    setIsSplitPayment(false);
    setSplitAmounts({});
  };

  const updateTabField = <K extends keyof BarTab>(tabId: string, field: K, value: BarTab[K]) => {
    setOpenTabs(prev => prev.map(t => t.id === tabId ? { ...t, [field]: value } : t));
  };

  React.useEffect(() => {
    updateTabField(selectedTabId, 'paymentScreenshot', paymentScreenshot);
  }, [paymentScreenshot, selectedTabId]);

  const handleCreateTab = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newTabName.trim();
    if (!cleanName) return;

    const newId = `tab-${Date.now()}`;
    const newTabObj: BarTab = {
      id: newId,
      name: cleanName,
      createdAt: new Date().toISOString(),
      items: [],
      paymentMethod: 'Cash',
      selectedRoomId: '',
      discountPercent: 0,
      walkInClientName: '',
      walkInClientTIN: '',
      walkInClientVATNo: '',
      walkInClientVATDate: '',
      paymentScreenshot: null
    };

    setOpenTabs(prev => [...prev, newTabObj]);
    setNewTabName('');
    setShowNewTabModal(false);
    
    // Auto shift to new tab
    setSelectedTabId(newId);
    setCart([]);
    setPaymentMethod('Cash');
    setSelectedRoomId('');
    setDiscountPercent(0);
    setWalkInClientName('');
    setWalkInClientTIN('');
    setWalkInClientVATNo('');
    setWalkInClientVATDate('');
    setPaymentScreenshot(null);

    addNotification(`Opened bar tab under guest: "${cleanName}"`, 'success', 'Bar');
  };

  const handleDeleteTab = (tabId: string) => {
    if (tabId === 'quick-sale') return;
    setOpenTabs(prev => prev.filter(t => t.id !== tabId));
    if (selectedTabId === tabId) {
      handleSelectTab('quick-sale');
    }
    addNotification('Bar tab discarded', 'warning', 'Bar');
  };

  const outletCategories = globalHotelSettings.posOutletCategories?.[outletName] || globalHotelSettings.posCategories || [];

  // New POS Item registry state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    code: '',
    subcategory: outletCategories[0] || 'Beverage',
    unit: 'Bottle',
    salePrice: 15,
    currentStock: 50,
    minStock: 10,
    maxStock: 200,
    reorderLevel: 20,
    brand: '',
    barcode: ''
  });

  // Bar specific inventory items - checks both Food & Beverage and Consumables categories in the Bar Store location
  const barItems = useMemo(() => {
    return inventoryItems.filter(item => item.location === 'Bar Store' && (item.category === 'Consumables' || item.category === 'Food & Beverage'));
  }, [inventoryItems]);

  // Derived menu from Bar Store inventory
  // In a real system, we'd have a menu mapping, but for this demo let's use the items directly.
  const menuItems = useMemo(() => {
    return barItems.map(item => ({
      id: item.code,
      stockId: item.id,
      name: item.name,
      price: item.lastCost * 1.5, // Standard markup
      stock: item.currentStock,
      category: (item.subcategory || item.category || 'Beverage') as string
    })).filter(i => {
      const matchSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (selectedCategory === 'All') return matchSearch;
      return matchSearch && i.category === selectedCategory;
    });
  }, [barItems, searchTerm, selectedCategory]);

  const handleAddBarItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;

    const itemCode = newItem.code.trim() || `BAR-BEV-${newItem.name.replace(/\s+/g, '-').toUpperCase().slice(0, 8)}-${Math.floor(100 + Math.random() * 900)}`;
    const costForMarkup = Number(newItem.salePrice) / 1.5;

    addInventoryItem({
      code: itemCode,
      name: newItem.name,
      category: 'Food & Beverage',
      subcategory: newItem.subcategory,
      unit: newItem.unit,
      brand: newItem.brand || undefined,
      supplierId: 'S-001',
      minStock: Number(newItem.minStock) || 10,
      maxStock: Number(newItem.maxStock) || 200,
      reorderLevel: Number(newItem.reorderLevel) || 15,
      lastCost: costForMarkup,
      avgCost: costForMarkup,
      currentStock: Number(newItem.currentStock) || 0,
      location: 'Bar Store',
      barcode: newItem.barcode || undefined
    });

    addNotification(`Successfully registered "${newItem.name}" – now active in Bar POS.`, 'success', 'Bar');
    
    // reset form
    setNewItem({
      name: '',
      code: '',
      subcategory: outletCategories[0] || 'Beverage',
      unit: 'Bottle',
      salePrice: 15,
      currentStock: 50,
      minStock: 10,
      maxStock: 200,
      reorderLevel: 20,
      brand: '',
      barcode: ''
    });
    setShowAddModal(false);
  };

  const addToCart = (item: typeof menuItems[0]) => {
    const existing = cart.find(c => c.id === item.id);
    let newCart;
    if (existing) {
      if (existing.quantity >= item.stock) {
        addNotification('Cannot exceed available bar stock', 'error', 'Bar');
        return;
      }
      newCart = cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
    } else {
      newCart = [...cart, { id: item.id, name: item.name, price: item.price, quantity: 1, stockId: item.stockId }];
    }
    setCart(newCart);
    updateTabField(selectedTabId, 'items', newCart);
  };

  const updateQty = (id: string, delta: number) => {
    const item = cart.find(i => i.id === id);
    const stockItem = barItems.find(bi => bi.code === id);
    if (!item || !stockItem) return;
    
    const newQty = item.quantity + delta;
    let newCart;
    if (newQty <= 0) {
      newCart = cart.filter(i => i.id !== id);
    } else {
      if (delta > 0 && newQty > stockItem.currentStock) {
        addNotification('Stock limit reached', 'warning', 'Bar');
        return;
      }
      newCart = cart.map(i => i.id === id ? { ...i, quantity: newQty } : i);
    }
    setCart(newCart);
    updateTabField(selectedTabId, 'items', newCart);
  };

  const { formatTaxesAndFees } = useERP();
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableSubtotal = subtotal - discountAmount;
  
  const taxData = useMemo(() => formatTaxesAndFees(taxableSubtotal), [taxableSubtotal, formatTaxesAndFees]);
  const tax = taxData.taxAmount;
  const total = taxData.totalWithTaxes;

  const allMethods = useMemo(() => {
    const baseType = globalHotelSettings?.paymentTypes || ['Cash', 'Card', 'Mobile'];
    const accounts = (chartOfAccounts || [])
      .filter((a: any) => (a.subCategory === 'Bank' || a.subCategory === 'Cash') && a.isActive)
      .map((a: any) => a.name);
    return Array.from(new Set([...baseType, ...accounts, 'RoomCharge']));
  }, [globalHotelSettings?.paymentTypes, chartOfAccounts]);

  const sumOfSplits = useMemo(() => {
    return allMethods.reduce((acc, m) => acc + (parseFloat(splitAmounts[m] || '0') || 0), 0);
  }, [splitAmounts, allMethods]);

  const remainingAmount = useMemo(() => {
    return Math.max(0, total - sumOfSplits);
  }, [total, sumOfSplits]);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // Get non-zero splits if Split is enabled
    const splits = isSplitPayment
      ? allMethods
          .map(m => ({ method: m, amount: parseFloat(splitAmounts[m] || '0') }))
          .filter(s => s.amount > 0)
      : [];

    if (isSplitPayment) {
      if (Math.abs(sumOfSplits - total) > 0.01) {
        addNotification('Split payments total must equal order total', 'error', 'Bar');
        return;
      }
      const roomChargeSplit = splits.find(s => s.method === 'RoomCharge');
      if (roomChargeSplit && roomChargeSplit.amount > 0 && !selectedRoomId) {
        addNotification('Select a room for the folio charge portion', 'error', 'Bar');
        return;
      }
    } else {
      if (paymentMethod === 'RoomCharge' && !selectedRoomId) {
        addNotification('Select a room for folio posting', 'error', 'Bar');
        return;
      }
    }

    // Deduct Stock
    cart.forEach(item => {
      const stockItem = barItems.find(bi => bi.id === item.stockId);
      if (stockItem) {
        updateInventoryItem(stockItem.id, {
          currentStock: stockItem.currentStock - item.quantity
        });
      }
    });

    const currentTabName = openTabs.find(t => t.id === selectedTabId)?.name || 'Guest';

    const invoiceNum = `INV-BAR${Math.floor(Math.random() * 10000)}`;
    const matchedRes = selectedRoomId ? reservations.find(r => r.id === selectedRoomId) : null;
    const finalCustomerName = matchedRes ? matchedRes.guestName : (walkInClientName || currentTabName || 'Walk-In Bar Guest');

    const finalPaymentMethod = isSplitPayment
      ? `Split: ${splits.map(s => `${s.method} (${formatAmount(s.amount)})`).join(', ')}`
      : paymentMethod;

    // Register active transaction into Sales ledger 
    addSaleTransaction({
      date: new Date().toISOString(),
      invoiceNumber: invoiceNum,
      module: 'Bar POS',
      customerName: finalCustomerName,
      items: cart.map(i => ({ productName: i.name, quantity: i.quantity, price: i.price })),
      subtotal,
      tax,
      total,
      paymentMethod: finalPaymentMethod,
      splitPayments: isSplitPayment ? splits : undefined,
      status: 'Completed',
      cashierName: userProfile?.name || 'Bar Cashier'
    });

    // Populate the Invoice Print Data (Standardized with POSModule/CheckInOut)
    setInvoicePrintData({
      invoiceNumber: invoiceNum,
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customerName: finalCustomerName,
      customerEmail: matchedRes ? matchedRes.guestEmail : '',
      roomNo: matchedRes ? matchedRes.roomNumber : '',
      customerTin: matchedRes ? matchedRes.guestTin : walkInClientTIN,
      customerVatNo: matchedRes ? matchedRes.guestVatNo : walkInClientVATNo,
      customerVatDate: matchedRes ? matchedRes.guestVatDate : walkInClientVATDate,
      items: cart.map(i => ({ productName: i.name, quantity: i.quantity, price: i.price })),
      subtotal,
      fees: [
        ...(discountAmount > 0 ? [{ label: `Discount (-${discountPercent}%)`, amount: discountAmount, isDiscount: true }] : []),
        ...(taxData.serviceChargeAmount > 0 ? [{ label: `Service Charge (${globalHotelSettings?.serviceChargePercent || 10}%)`, amount: taxData.serviceChargeAmount }] : []),
        ...taxData.addonDetails.map(a => ({ label: a.name, amount: a.amount })),
        { label: `VAT (${globalHotelSettings?.taxPercent || 15}%)`, amount: taxData.taxAmount }
      ],
      total,
      paymentMethod: finalPaymentMethod,
      splitPayments: isSplitPayment ? splits : undefined
    });

    // Folio Post if needed
    if (isSplitPayment) {
      const roomChargeSplit = splits.find(s => s.method === 'RoomCharge');
      if (roomChargeSplit && roomChargeSplit.amount > 0 && matchedRes) {
        addFolioCharge(matchedRes.id, {
          id: `BAR-${Date.now()}`,
          date: new Date().toISOString(),
          description: `Bar Sales (Split - Tab: ${currentTabName}): ${cart.map(i => `${i.name} (x${i.quantity})`).join(', ')}`,
          amount: roomChargeSplit.amount,
          type: 'F&B'
        });
      }
    } else if (paymentMethod === 'RoomCharge') {
      const res = reservations.find(r => r.id === selectedRoomId);
      if (res) {
        addFolioCharge(res.id, {
          id: `BAR-${Date.now()}`,
          date: new Date().toISOString(),
          description: `Bar Sales (Tab: ${currentTabName}): ${cart.map(i => `${i.name} (x${i.quantity})`).join(', ')}`,
          amount: total,
          type: 'F&B'
        });
      }
    }

    addNotification(`Bar tab "${currentTabName}" settled ($${total.toFixed(2)}) via ${finalPaymentMethod}`, 'success', 'Bar');

    // Remove the custom tab if it's not quick-sale, otherwise reset
    if (selectedTabId !== 'quick-sale') {
      setOpenTabs(prev => prev.filter(t => t.id !== selectedTabId));
      setSelectedTabId('quick-sale');
      setCart([]);
      setCashReceived('');
      setSelectedRoomId('');
      setDiscountPercent(0);
      setPaymentMethod('Cash');
      setWalkInClientName('');
      setWalkInClientTIN('');
      setWalkInClientVATNo('');
      setWalkInClientVATDate('');
      setIsSplitPayment(false);
      setSplitAmounts({});
      setPaymentScreenshot(null);
    } else {
      setCart([]);
      setCashReceived('');
      setSelectedRoomId('');
      setDiscountPercent(0);
      setPaymentMethod('Cash');
      setWalkInClientName('');
      setWalkInClientTIN('');
      setWalkInClientVATNo('');
      setWalkInClientVATDate('');
      setIsSplitPayment(false);
      setSplitAmounts({});
      setPaymentScreenshot(null);
      updateTabField('quick-sale', 'items', []);
      updateTabField('quick-sale', 'walkInClientName', '');
      updateTabField('quick-sale', 'walkInClientTIN', '');
      updateTabField('quick-sale', 'walkInClientVATNo', '');
      updateTabField('quick-sale', 'walkInClientVATDate', '');
      updateTabField('quick-sale', 'paymentScreenshot', null);
    }
  };

  const handleRegisterIssue = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProductIdIssue) {
      addNotification('Please select a bar item.', 'error', 'Bar');
      return;
    }
    
    const product = menuItems.find(p => p.stockId === selectedProductIdIssue);
    if (!product) {
      addNotification('Bar item not found.', 'error', 'Bar');
      return;
    }
    
    if (issueQuantity <= 0) {
      addNotification('Quantity must be at least 1.', 'error', 'Bar');
      return;
    }
    
    if (issueQuantity > (product.stock ?? 0)) {
      addNotification(`Cannot write off more than current available stock (${product.stock} units).`, 'error', 'Bar');
      return;
    }

    const dbItem = inventoryItems.find(i => i.id === selectedProductIdIssue);
    
    if (dbItem) {
      const remaining = Math.max(0, dbItem.currentStock - issueQuantity);
      updateInventoryItem(dbItem.id, {
        currentStock: remaining
      });
    }

    const newIssue = {
      id: Math.random().toString(36).substr(2, 9),
      productId: product.stockId,
      productName: product.name,
      quantity: issueQuantity,
      type: issueType,
      date: new Date().toISOString(),
      reporter: issueReporter || userProfile?.name || 'Bartender',
      notes: issueNotes || 'No notes provided',
      itemCost: product.price * 0.4
    };

    const updatedIssues = [newIssue, ...barIssues];
    saveBarIssues(updatedIssues);

    setSelectedProductIdIssue('');
    setIssueQuantity(1);
    setIssueNotes('');
    
    addNotification(`Logged ${issueQuantity}x "${product.name}" as ${issueType}. Stock updated.`, 'success', 'Bar');
  };

  const handleDeleteIssue = (id: string) => {
    if (confirm('Reclaim/void this entry? This restores the stock count in Inventory.')) {
      const issue = barIssues.find(iss => iss.id === id);
      if (issue) {
        const dbItem = inventoryItems.find(i => i.id === issue.productId);
        if (dbItem) {
          updateInventoryItem(dbItem.id, {
            currentStock: dbItem.currentStock + issue.quantity
          });
        }
      }
      const filtered = barIssues.filter(iss => iss.id !== id);
      saveBarIssues(filtered);
      addNotification('Entry voided. Stock counts replenished.', 'success', 'Bar');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
            <Beer size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">{outletName} POS</h2>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              Outlet: {outletName}
            </p>
          </div>
        </div>
        
        <div className="flex bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'pos' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            New Sale
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            History
          </button>
          <button 
            onClick={() => setActiveTab('issues')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'issues' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <Ban size={13} /> Damaged & Lost
          </button>
        </div>
      </div>

      {activeTab === 'pos' ? (
        <div className="flex-1 grid lg:grid-cols-12 gap-6 min-h-[900px]">
          {/* Menu Selection */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <div className="bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search bar items..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Category Pills */}
              <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl self-start sm:self-auto gap-1 border dark:border-slate-800 overflow-x-auto max-w-md no-scrollbar">
                {['All', ...outletCategories].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-mono font-black tracking-tight cursor-pointer transition-all whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button 
                id="add-bar-item-btn"
                onClick={() => setShowAddModal(true)}
                className="w-full md:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-slate-950 dark:text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-amber-500/20"
              >
                <Plus size={14} /> Add Bar Item
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  disabled={item.stock <= 0}
                  className={`bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-left hover:border-amber-500 transition-all flex flex-col justify-between h-36 ${item.stock <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                >
                  <div>
                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{item.category}</span>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white mt-1 line-clamp-2">{item.name}</h4>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900 dark:text-white">{formatAmount(item.price)}</span>
                      <span className="text-[9px] font-mono font-bold text-slate-400">STOCK: {item.stock}</span>
                    </div>
                    <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                      <Plus size={16} />
                    </div>
                  </div>
                </button>
              ))}
              {menuItems.length === 0 && (
                <div className="col-span-full py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-300">
                    <Search size={32} />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No stock found in Bar Store.</p>
                </div>
              )}
            </div>
          </div>

          {/* Billing Sidebar */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">Active Tab</h3>
                  <p className="text-[9px] font-mono font-bold text-amber-500 uppercase tracking-wider">
                    {selectedTabId === 'quick-sale' ? 'Direct checkout (No tab)' : `Tab Code: ${selectedTabId}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewTabModal(true)}
                  className="px-2 py-1.5 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={10} /> Name Tab
                </button>
              </div>

              {/* Tabs list display */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono tracking-widest text-slate-400 font-bold block uppercase">SWITCH OR DISCARD TABS</span>
                <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto">
                  {openTabs.map(tab => {
                    const isSelected = tab.id === selectedTabId;
                    const itemsQty = (tab.items || []).reduce((sum, item) => sum + item.quantity, 0);
                    
                    return (
                      <div
                        key={tab.id}
                        onClick={() => handleSelectTab(tab.id)}
                        className={`group px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 border-amber-500 dark:border-amber-600 text-slate-950 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <User size={10} className={isSelected ? 'text-slate-950' : 'text-slate-400'} />
                        <span className="truncate max-w-[85px]">{tab.name}</span>
                        <span className={`text-[9px] font-mono px-1 rounded-sm ${isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                          {itemsQty > 0 ? `${itemsQty} items` : 'empty'}
                        </span>
                        {tab.id !== 'quick-sale' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (tabToDelete === tab.id) {
                                handleDeleteTab(tab.id);
                                setTabToDelete(null);
                              } else {
                                setTabToDelete(tab.id);
                                setTimeout(() => setTabToDelete(current => current === tab.id ? null : current), 3500);
                              }
                            }}
                            className={`p-1 rounded transition-all ml-1.5 flex items-center justify-center shrink-0 cursor-pointer ${
                              tabToDelete === tab.id
                                ? 'bg-rose-600 text-white animate-pulse'
                                : 'hover:bg-rose-500/10 hover:text-rose-500 text-slate-400 dark:text-slate-500'
                            }`}
                            title={tabToDelete === tab.id ? "Click again to confirm delete" : "Discard / Close Tab"}
                          >
                            {tabToDelete === tab.id ? <Trash2 size={10} /> : <X size={10} />}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 min-h-[371px]">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-3">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Empty Tab</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {cart.map(item => (
                    <div key={item.id} className="py-3 flex items-start justify-between gap-3 first:pt-0 last:pb-0 border-b border-slate-100 dark:border-slate-800 last:border-0 border-dashed">
                      <div className="space-y-0.5 max-w-[60%]">
                        <h5 className="text-[11px] font-sans font-bold text-slate-900 dark:text-stone-300 uppercase leading-snug truncate">
                          {item.name}
                        </h5>
                        <span className="text-3xs text-slate-400 font-mono">
                          {item.quantity} x {formatAmount(item.price)} each
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-slate-950 dark:text-white shrink-0">
                          {formatAmount(item.price * item.quantity)}
                        </span>
                        <div className="flex bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-650 dark:text-slate-300 text-3xs font-semibold overflow-hidden shadow-3xs">
                          <button onClick={() => updateQty(item.id, -1)} className="px-1.5 py-0.5 hover:bg-slate-205 dark:hover:bg-slate-800 transition cursor-pointer">-</button>
                          <span className="px-1.5 py-0.5 bg-white dark:bg-slate-900 font-bold font-mono">{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="px-1.5 py-0.5 hover:bg-slate-205 dark:hover:bg-slate-800 transition cursor-pointer">+</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-900">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-150 dark:border-slate-850 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 text-3xs font-semibold uppercase">
                <span>Subtotal Items</span>
                <span className="font-mono">{formatAmount(subtotal)}</span>
              </div>
              
              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-600 dark:text-slate-400 text-3xs font-bold uppercase flex items-center gap-1">
                  <Percent size={10} className="text-indigo-500" /> Apply Discount
                </span>
                <select
                  disabled={cart.length === 0}
                  value={discountPercent}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setDiscountPercent(val);
                    updateTabField(selectedTabId, 'discountPercent', val);
                  }}
                  className="px-2 py-0.5 text-4xs font-mono font-bold uppercase rounded border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 focus:outline-none"
                >
                  <option value={0}>0% Off</option>
                  <option value={5}>5% Off</option>
                  <option value={10}>10% Off</option>
                  <option value={15}>15% Off</option>
                  <option value={20}>20% Off</option>
                  <option value={100}>100% Off</option>
                </select>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-rose-500 text-3xs font-semibold uppercase">
                  <span>Waiver Discount ({discountPercent}%)</span>
                  <span className="font-mono">- {formatAmount(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 text-3xs font-semibold uppercase">
                <span>Sales VAT ({globalHotelSettings?.taxPercent || 15}%)</span>
                <span className="font-mono">{formatAmount(tax)}</span>
              </div>

              <div className="flex justify-between items-center font-black pb-0.5 border-t border-dashed border-slate-200 dark:border-slate-800 pt-2">
                <span className="text-slate-900 dark:text-white uppercase text-[11px]">Total Invoice</span>
                <span className="font-mono text-indigo-650 dark:text-amber-400 text-sm">{formatAmount(total)}</span>
              </div>
            </div>

              {/* Client Specifications Module */}
              <div className="bg-slate-950/20 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-2xl p-3.5 space-y-3 text-2xs font-sans transition-all hover:border-slate-350 dark:hover:border-white/10 group/specs text-slate-900 dark:text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover/specs:text-amber-500/90 transition-colors">
                    <UserPlus size={11} className="text-amber-500" />
                    <span>Billing Specifications</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowClientInfoFields(!showClientInfoFields)}
                    className="text-[9px] text-amber-500 font-black uppercase tracking-widest bg-slate-200 hover:bg-slate-300 dark:bg-white/5 px-2 py-0.5 rounded-full dark:hover:bg-amber-500 dark:hover:text-slate-950 transition-all cursor-pointer"
                  >
                    {showClientInfoFields ? 'Collapse' : 'Add Details'}
                  </button>
                </div>

                {showClientInfoFields && (
                  <div className="space-y-3 pt-2 animate-fade-in border-t border-slate-200 dark:border-white/5 mt-1">
                    <div className="space-y-1">
                      <label className="text-[8px] font-mono uppercase text-slate-500 tracking-wider">Client Name / Business Entity</label>
                      <input
                        type="text"
                        value={walkInClientName}
                        onChange={(e) => setWalkInClientName(e.target.value)}
                        placeholder="Guest Name"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl text-[10px] focus:ring-1 focus:ring-amber-500/30 outline-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono uppercase text-slate-500 tracking-wider">Tin Number</label>
                        <input
                          type="text"
                          value={walkInClientTIN}
                          onChange={(e) => setWalkInClientTIN(e.target.value)}
                          placeholder="TIN-000-000"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl text-[10px] focus:ring-1 focus:ring-amber-500/30 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono uppercase text-slate-500 tracking-wider">Vat Reg No</label>
                        <input
                          type="text"
                          value={walkInClientVATNo}
                          onChange={(e) => setWalkInClientVATNo(e.target.value)}
                          placeholder="VAT-000-000"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl text-[10px] focus:ring-1 focus:ring-amber-500/30 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-mono uppercase text-slate-500 tracking-wider">Reg. Date</label>
                      <input
                        type="date"
                        value={walkInClientVATDate}
                        onChange={(e) => setWalkInClientVATDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl text-[10px] focus:ring-1 focus:ring-amber-500/30 outline-none font-mono transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ONE-LINE INTEGRATED BILLING TERMINAL */}
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-2.5 font-sans text-white">
                {/* SPLIT TOGGLE */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold whitespace-nowrap">Payment Settle Mode:</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={cart.length === 0}
                      onClick={() => setIsSplitPayment(false)}
                      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                        !isSplitPayment
                          ? 'bg-amber-400 text-slate-950 border-amber-400 font-extrabold'
                          : 'text-slate-400 hover:text-white border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      Single
                    </button>
                    <button
                      type="button"
                      disabled={cart.length === 0}
                      onClick={() => setIsSplitPayment(true)}
                      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                        isSplitPayment
                          ? 'bg-amber-400 text-slate-950 border-amber-400 font-extrabold'
                          : 'text-slate-400 hover:text-white border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      Split Pay
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {isSplitPayment && (
                    <div className="flex items-center justify-end border-b border-slate-800 pb-2">
                      <div className="text-[9px] font-mono text-slate-400">
                        Remaining: <span className={remainingAmount === 0 ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>{formatAmount(remainingAmount)}</span> / {formatAmount(total)}
                      </div>
                    </div>
                  )}

                  {!isSplitPayment ? (
                    <>
                      {/* SINGLE PAYMENT SELECTION */}
                      <div className="flex flex-wrap gap-0.5 items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 max-h-[80px] overflow-y-auto">
                        {allMethods.map(methodName => {
                          const isSelected = paymentMethod === methodName;
                          let MethodIcon = Coins;
                          let btnLabel = methodName;
                          
                          const normalized = methodName.toLowerCase();
                          if (normalized.includes('card')) MethodIcon = CreditCard;
                          else if (normalized.includes('mobile') || normalized.includes('mpesa')) MethodIcon = Smartphone;
                          else if (normalized.includes('roomcharge') || normalized.includes('room')) { MethodIcon = User; btnLabel = 'Room'; }
                          else if (normalized.includes('bank') || normalized.includes('transfer')) MethodIcon = Landmark;

                          return (
                            <button
                              key={methodName}
                              disabled={cart.length === 0}
                              onClick={() => {
                                setPaymentMethod(methodName as any);
                                updateTabField(selectedTabId, 'paymentMethod', methodName as any);
                              }}
                              type="button"
                              className={`px-1.5 py-0.5 rounded flex items-center gap-1 text-[8px] font-sans font-black uppercase tracking-tight transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              <MethodIcon size={10} />
                              <span className="truncate max-w-[50px]">{btnLabel}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Room selection block */}
                      {paymentMethod === 'RoomCharge' && cart.length > 0 && (
                        <div className="space-y-1 animate-fade-in text-white">
                          <select
                            value={selectedRoomId}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSelectedRoomId(val);
                              updateTabField(selectedTabId, 'selectedRoomId', val);
                            }}
                            className="w-full bg-slate-850 border border-slate-700 text-white p-1.5 text-[11px] rounded-lg focus:outline-none"
                          >
                            <option value="">Select In-House Guest...</option>
                            {reservations.filter(r => r.status === 'CheckedIn' || r.status === 'Check-In').map(r => (
                              <option key={r.id} value={r.id} className="bg-slate-900 text-white animate-fade-in">
                                Rm {r.roomNumber} - {r.guestName}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {!['Cash', 'RoomCharge'].includes(paymentMethod) && (
                        <div className="mt-2 space-y-1 animate-fade-in">
                          <label className="text-[8px] font-mono uppercase text-slate-400 font-bold block">Payment Receipt Screenshot:</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                setPaymentScreenshot(e.target.files[0]);
                              }
                            }}
                            className="w-full bg-slate-950 text-white text-[10px] p-1.5 rounded-lg border border-slate-700"
                          />
                        </div>
                      )}


                      {paymentMethod === 'Card' && cart.length > 0 && (
                        <p className="text-[8px] text-slate-400 text-center animate-fade-in">
                          Verification of card reader terminal is ready.
                        </p>
                      )}

                      {paymentMethod === 'Mobile' && cart.length > 0 && (
                        <p className="text-[8px] text-slate-400 text-center animate-fade-in">
                          Verify Telebirr / CBE Birr merchant confirmation.
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      {/* SPLIT PAYMENT INPUTS */}
                      <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-2 animate-fade-in">
                        <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                          {allMethods.map(methodName => {
                            let MethodIcon = Coins;
                            const normalized = methodName.toLowerCase();
                            if (normalized.includes('card')) MethodIcon = CreditCard;
                            else if (normalized.includes('mobile') || normalized.includes('mpesa')) MethodIcon = Smartphone;
                            else if (normalized.includes('roomcharge') || normalized.includes('room')) MethodIcon = User;
                            else if (normalized.includes('bank') || normalized.includes('transfer')) MethodIcon = Landmark;

                            const val = splitAmounts[methodName] || '';

                            const handleValChange = (newVal: string) => {
                              if (parseFloat(newVal) < 0) return;
                              setSplitAmounts(prev => ({
                                ...prev,
                                [methodName]: newVal
                              }));
                            };

                            const handleUseRemaining = () => {
                              const otherSplitsTotal = allMethods
                                .filter(m => m !== methodName)
                                .reduce((acc, m) => acc + (parseFloat(splitAmounts[m] || '0') || 0), 0);
                              const remaining = Math.max(0, total - otherSplitsTotal);
                              setSplitAmounts(prev => ({
                                ...prev,
                                [methodName]: parseFloat(remaining.toFixed(2)).toString()
                              }));
                            };

                            return (
                              <div key={methodName} className="flex items-center justify-between gap-1 bg-slate-900 p-1 px-2 rounded-lg border border-slate-800">
                                <div className="flex items-center gap-1 truncate text-[10px]">
                                  <MethodIcon size={11} className="text-amber-400 shrink-0" />
                                  <span className="truncate text-slate-200">{methodName}</span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={val}
                                    onChange={(e) => handleValChange(e.target.value)}
                                    className="bg-slate-950 text-white font-mono text-center font-bold w-16 px-1 py-0.5 rounded border border-slate-700 text-[10px] focus:outline-none focus:border-amber-400"
                                  />
                                  {remainingAmount > 0 && (
                                    <button
                                      type="button"
                                      onClick={handleUseRemaining}
                                      className="px-1.5 py-0.5 bg-amber-400 text-slate-950 rounded text-[8px] font-black uppercase hover:bg-amber-500 transition cursor-pointer shrink-0"
                                    >
                                      Rem
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Room Selection if split incorporates RoomCharge */}
                        {parseFloat(splitAmounts['RoomCharge'] || '0') > 0 && (
                          <div className="space-y-1 mt-2 p-1.5 bg-slate-900 rounded-lg border border-slate-800 animate-fade-in text-white">
                            <label className="text-[8px] font-mono uppercase text-slate-400 font-bold block mb-1">Room charge assignee guest:</label>
                            <select
                              value={selectedRoomId}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSelectedRoomId(val);
                                updateTabField(selectedTabId, 'selectedRoomId', val);
                              }}
                              className="w-full bg-slate-950 border border-slate-700 text-white p-1 text-[10px] rounded focus:outline-none"
                            >
                              <option value="">Select In-House Guest...</option>
                              {reservations.filter(r => r.status === 'CheckedIn' || r.status === 'Check-In').map(r => (
                                <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                                  Rm {r.roomNumber} - {r.guestName}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Status tracker bar */}
                        <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-slate-300">
                          <span>Paid: {formatAmount(sumOfSplits)}</span>
                          {Math.abs(sumOfSplits - total) < 0.01 ? (
                            <span className="text-emerald-400 font-bold">✓ Balanced</span>
                          ) : sumOfSplits > total ? (
                            <span className="text-rose-450 font-bold">Over: {formatAmount(sumOfSplits - total)}</span>
                          ) : (
                            <span className="text-amber-400 font-bold">Short: {formatAmount(total - sumOfSplits)}</span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 3. Action Buttons */}
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={cart.length === 0}
                    onClick={() => {
                      const matchedRes = selectedRoomId ? reservations.find(r => r.id === selectedRoomId) : null;
                      const currentTabName = openTabs.find(t => t.id === selectedTabId)?.name || 'Guest';
                      const finalCustomerName = matchedRes ? matchedRes.guestName : (walkInClientName || currentTabName || 'Walk-In Bar Guest');
                      
                      const splits = isSplitPayment
                        ? allMethods
                            .map(m => ({ method: m, amount: parseFloat(splitAmounts[m] || '0') }))
                            .filter(s => s.amount > 0)
                        : [];
                      const finalPaymentMethod = isSplitPayment
                        ? `Split: ${splits.map(s => `${s.method} (${formatAmount(s.amount)})`).join(', ')}`
                        : paymentMethod;

                      setInvoicePrintData({
                        invoiceNumber: `DRAFT-${selectedTabId}-${Date.now().toString().slice(-4)}`,
                        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        customerName: finalCustomerName,
                        customerEmail: matchedRes ? matchedRes.guestEmail : '',
                        roomNo: matchedRes ? matchedRes.roomNumber : '',
                        customerTin: matchedRes ? matchedRes.guestTin : walkInClientTIN,
                        customerVatNo: matchedRes ? matchedRes.guestVatNo : walkInClientVATNo,
                        customerVatDate: matchedRes ? matchedRes.guestVatDate : walkInClientVATDate,
                        items: cart.map(i => ({ productName: i.name, quantity: i.quantity, price: i.price })),
                        subtotal,
                        fees: [
                          ...(discountAmount > 0 ? [{ label: `Discount (-${discountPercent}%)`, amount: discountAmount, isDiscount: true }] : []),
                          ...(taxData.serviceChargeAmount > 0 ? [{ label: `Service Charge (${globalHotelSettings?.serviceChargePercent || 10}%)`, amount: taxData.serviceChargeAmount }] : []),
                          ...taxData.addonDetails.map(a => ({ label: a.name, amount: a.amount })),
                          { label: `VAT (${globalHotelSettings?.taxPercent || 15}%)`, amount: taxData.taxAmount }
                        ],
                        total,
                        paymentMethod: finalPaymentMethod,
                        splitPayments: isSplitPayment ? splits : undefined
                      });
                    }}
                    className="w-full mb-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition"
                  >
                    <Printer size={11} /> Draft Invoice
                  </button>

                  <button
                    disabled={
                      cart.length === 0 || 
                      (isSplitPayment 
                        ? (Math.abs(sumOfSplits - total) > 0.01 || (parseFloat(splitAmounts['RoomCharge'] || '0') > 0 && !selectedRoomId))
                        : (paymentMethod === 'RoomCharge' && !selectedRoomId)
                      )
                    }
                    onClick={handleCheckout}
                    className="w-full py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 size={12} /> {isSplitPayment ? 'Settle Split Payment' : paymentMethod === 'RoomCharge' ? 'Folio Charge' : 'Settle Tab'}
                  </button>

                  {selectedTabId !== 'quick-sale' && (
                    <button
                      type="button"
                      onClick={() => {
                        handleDeleteTab(selectedTabId);
                      }}
                      className="w-full py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/15 hover:border-rose-500/30 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition"
                    >
                      <Trash2 size={11} /> Void / Close Active Tab
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'history' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-3xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-tight">Closed Bar Shift Ledger</h4>
              <p className="text-[10px] text-slate-400 font-mono">Shift audits and finalized checks.</p>
            </div>
            <div className="flex gap-2">
              <input type="date" value={shiftJournalFilterDate} onChange={(e) => setShiftJournalFilterDate(e.target.value)} className="text-xs bg-slate-50 dark:bg-slate-950 px-2 py-1 border rounded" />
              <button onClick={() => window.print()} className="px-2 py-1 bg-slate-100 rounded text-xs flex items-center gap-1.5 hover:bg-slate-200 transition">
                <Printer size={14} /> Print
              </button>
              <button 
                onClick={() => {
                  const csv = [
                    ['Invoice', 'Date', 'Cashier', 'Total', 'Method'].join(','),
                    ...filteredBarSales.map(t => [t.invoiceNumber, t.date, t.cashier || 'N/A', t.total, t.paymentMethod].join(','))
                  ].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `shift_journal_bar_${shiftJournalFilterDate}.csv`;
                  a.click();
                }}
                className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer text-xs"
              >
                <Download size={14} /> Export
              </button>
            </div>
          </div>
          <History size={48} className="mx-auto text-slate-200" strokeWidth={1} />
          <h3 className="text-sm font-black uppercase text-slate-400">Shift History Locked</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">Transactional history for the current shift is undergoing audit sweep. Contact bar manager for instant journal access.</p>
        </div>
      ) : activeTab === 'issues' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in" id="damaged-lost-workspace">
          
          {/* Form left panel */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
            <div>
              <span className="text-[9px] font-mono text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded uppercase tracking-wider font-extrabold">Bar Inventory Adjustment</span>
              <h4 className="text-base font-sans font-black tracking-tight text-slate-900 dark:text-white uppercase mt-1">
                Log Damaged or Lost Item
              </h4>
              <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase leading-normal">
                Submit bar inventory write-offs to correct physical stock layers and update central inventory nodes.
              </p>
            </div>

            <form onSubmit={handleRegisterIssue} className="space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">1. Select Bar Item</label>
                <select
                  value={selectedProductIdIssue}
                  onChange={(e) => {
                    setSelectedProductIdIssue(e.target.value);
                    setIssueQuantity(1);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400 font-sans"
                  required
                >
                  <option value="">-- Choose Bar Item --</option>
                  {menuItems.map((prod) => (
                    <option key={prod.stockId} value={prod.stockId}>
                      {prod.name} (Stock: {prod.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">2. Adjustment Type</label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono font-bold"
                  >
                    <option value="Damaged">⚠️ Damaged</option>
                    <option value="Broken">💥 Broken</option>
                    <option value="Lost">🔍 Lost</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">3. Write-off Qty</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProductIdIssue ? menuItems.find(p => p.stockId === selectedProductIdIssue)?.stock || 1 : 100}
                    value={issueQuantity}
                    onChange={(e) => setIssueQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">4. Reporter Name</label>
                <input
                  type="text"
                  value={issueReporter}
                  onChange={(e) => setIssueReporter(e.target.value)}
                  placeholder="Bartender Name"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">5. Damage Description / Reason</label>
                <textarea
                  value={issueNotes}
                  onChange={(e) => setIssueNotes(e.target.value)}
                  rows={3}
                  placeholder="Provide context e.g., 'Dropped during restocking' or 'Unaccounted physical count discrepancy'"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400 font-sans"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-500 text-white rounded-xl font-sans font-black uppercase text-[10px] tracking-wider transition-all cursor-pointer"
              >
                Post Write-off Entry
              </button>
            </form>
          </div>

          {/* List right panel */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
              <div>
                <span className="text-[9px] font-mono text-zinc-500 bg-zinc-500/10 px-2.5 py-0.5 rounded uppercase tracking-wider font-extrabold">Bar Inventory Adjustment Log</span>
                <h4 className="text-base font-sans font-black tracking-tight text-slate-900 dark:text-white uppercase mt-1">
                  Physically Adjusted & Written-Off Items
                </h4>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-900 border px-3 py-1.5 rounded-xl text-slate-500 font-mono text-[10px] uppercase">
                Active Audit Log Count:{' '}
                <strong className="text-slate-950 dark:text-zinc-200 font-sans font-extrabold text-[11px]">
                  {barIssues.length} entries
                </strong>
              </div>
            </div>

            {barIssues.length === 0 ? (
              <div className="py-20 text-center text-slate-400 space-y-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Ban size={40} className="mx-auto text-slate-300 dark:text-slate-700" />
                <div>
                  <h5 className="font-sans font-bold text-slate-900 dark:text-white uppercase text-xs">No write-offs on file</h5>
                  <p className="text-[10px] text-slate-400 font-mono mt-1 max-w-xs mx-auto uppercase">
                    All bar items are currently accounted for. No damaged, broken or lost report logs filed in this audit period.
                  </p>
                </div>
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm overflow-x-auto font-sans">
                <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 font-mono text-[9px] uppercase text-slate-400 sticky top-0 border-b border-slate-200 dark:border-slate-800">
                      <th className="py-2.5 px-4 font-bold">Date & Time</th>
                      <th className="py-2.5 px-3 font-bold">Product Item</th>
                      <th className="py-2.5 px-3 font-bold text-center">Qty</th>
                      <th className="py-2.5 px-3 font-bold text-center">Type</th>
                      <th className="py-2.5 px-3 font-bold">Notes</th>
                      <th className="py-2.5 px-3 font-bold">Reporter</th>
                      <th className="py-2.5 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-300">
                    {barIssues.map((iss) => (
                      <tr key={iss.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 text-[11px]">
                        <td className="py-3 px-4 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                          {new Date(iss.date).toLocaleString(undefined, { 
                            month: 'short', 
                            day: '2-digit', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white max-w-[150px] truncate animate-fade-in" title={iss.productName}>
                          {iss.productName}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold">x{iss.quantity}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase ${
                            iss.type === 'Damaged' 
                              ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' 
                              : iss.type === 'Broken'
                              ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                              : 'bg-zinc-100 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400'
                          }`}>
                            {iss.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[10px] truncate max-w-[150px]" title={iss.notes}>
                          {iss.notes}
                        </td>
                        <td className="py-3 px-3 text-[10px] whitespace-nowrap">{iss.reporter}</td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteIssue(iss.id)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-rose-500 transition cursor-pointer"
                            title="Reclaim entry and replenish stock"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Add New Bar Item Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-none"
            >
              <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
                 <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Add New Bar Item</h3>
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-none">Register standard or custom drink stock item</p>
                 </div>
                 <button type="button" onClick={() => setShowAddModal(false)} className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-xs hover:text-rose-600 transition-colors cursor-pointer text-slate-500 dark:text-slate-400">
                    <X size={16} />
                 </button>
              </div>

              <form onSubmit={handleAddBarItem} className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[75vh]">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-bold">Item Name</label>
                    <input 
                      type="text" 
                      required
                      value={newItem.name}
                      onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Asmara Premium Dry Beer"
                      className="w-full bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-500 font-semibold text-slate-900 dark:text-white"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-bold">Inventory SKU Code (Optional)</label>
                       <input 
                         type="text" 
                         value={newItem.code}
                         onChange={(e) => setNewItem(prev => ({ ...prev, code: e.target.value }))}
                         placeholder="e.g. BAR-BEV-ASM"
                         className="w-full bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-500 font-semibold text-slate-900 dark:text-white"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-bold">Sales / Retail Price ($)</label>
                       <input 
                         type="number" 
                         required
                         min="0.1"
                         step="0.01"
                         value={newItem.salePrice}
                         onChange={(e) => setNewItem(prev => ({ ...prev, salePrice: parseFloat(e.target.value) || 0 }))}
                         placeholder="15.00"
                         className="w-full bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-500 font-black text-slate-900 dark:text-white"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-bold">Serving Unit</label>
                       <select 
                         value={newItem.unit}
                         onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                         className="w-full bg-slate-50 dark:bg-slate-855 border dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-500 font-semibold text-slate-900 dark:text-white cursor-pointer"
                       >
                          <option value="Bottle">Bottle</option>
                          <option value="Can">Can</option>
                          <option value="Glass">Glass</option>
                          <option value="Shot">Shot</option>
                          <option value="Pcs">Pcs</option>
                       </select>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-bold">Subcategory</label>
                       <select 
                         value={newItem.subcategory}
                         onChange={(e) => setNewItem(prev => ({ ...prev, subcategory: e.target.value as any }))}
                         className="w-full bg-slate-50 dark:bg-slate-855 border dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-500 font-semibold text-slate-900 dark:text-white cursor-pointer"
                       >
                          {outletCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-bold">Initial Stock Level</label>
                       <input 
                         type="number" 
                         required
                         min="0"
                         value={newItem.currentStock}
                         onChange={(e) => setNewItem(prev => ({ ...prev, currentStock: parseInt(e.target.value) || 0 }))}
                         placeholder="50"
                         className="w-full bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-500 font-semibold text-slate-900 dark:text-white"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-bold">Reorder Level (Alerts)</label>
                       <input 
                         type="number" 
                         required
                         min="0"
                         value={newItem.reorderLevel}
                         onChange={(e) => setNewItem(prev => ({ ...prev, reorderLevel: parseInt(e.target.value) || 0 }))}
                         className="w-full bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-500 font-semibold text-slate-900 dark:text-white"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-bold">Min Stock Limit</label>
                       <input 
                         type="number" 
                         required
                         min="0"
                         value={newItem.minStock}
                         onChange={(e) => setNewItem(prev => ({ ...prev, minStock: parseInt(e.target.value) || 0 }))}
                         className="w-full bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-500 font-semibold text-slate-900 dark:text-white"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-bold">Brand Tag (Optional)</label>
                       <input 
                         type="text" 
                         value={newItem.brand}
                         onChange={(e) => setNewItem(prev => ({ ...prev, brand: e.target.value }))}
                         placeholder="e.g. Melotti"
                         className="w-full bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-500 font-semibold text-slate-900 dark:text-white"
                       />
                    </div>
                 </div>

                 <div className="pt-4 border-t dark:border-slate-800 grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                       Cancel
                    </button>
                    <button 
                      type="submit"
                      className="py-2.5 bg-amber-500 text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest transition shadow-lg shadow-amber-500/10 hover:bg-amber-600 cursor-pointer"
                    >
                       Register &amp; Activate
                    </button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Name New Bar Tab Modal */}
      <AnimatePresence>
        {showNewTabModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-none"
            >
              <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
                 <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Open New Bar Tab</h3>
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-none">Open group, table, or guest tab ledgers</p>
                 </div>
                 <button type="button" onClick={() => setShowNewTabModal(false)} className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-xs hover:text-rose-600 transition-colors cursor-pointer text-slate-500 dark:text-slate-400">
                    <X size={16} />
                 </button>
              </div>

              <form onSubmit={handleCreateTab} className="p-6 space-y-4">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tab / Guest Name</label>
                    <input 
                      type="text" 
                      required
                      autoFocus
                      value={newTabName}
                      onChange={(e) => setNewTabName(e.target.value)}
                      placeholder="e.g. Table 4 / John Doe"
                      className="w-full bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-500 font-semibold text-slate-900 dark:text-white"
                    />
                 </div>

                 <div className="pt-4 border-t dark:border-slate-800 grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setShowNewTabModal(false)}
                      className="py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                       Cancel
                    </button>
                    <button 
                      type="submit"
                      className="py-2.5 bg-amber-500 text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest transition shadow-lg shadow-amber-500/10 hover:bg-amber-600 cursor-pointer"
                    >
                       Initialize Tab
                    </button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {invoicePrintData && (
        <UnifiedInvoiceTemplate 
          title="BAR SETTLEMENT RECEIPT"
          invoiceNumber={invoicePrintData.invoiceNumber}
          date={invoicePrintData.date}
          customerName={invoicePrintData.customerName}
          customerEmail={invoicePrintData.customerEmail}
          roomNo={invoicePrintData.roomNo}
          customerTin={invoicePrintData.customerTin}
          customerVatNo={invoicePrintData.customerVatNo}
          customerVatDate={invoicePrintData.customerVatDate}
          items={invoicePrintData.items}
          subtotal={invoicePrintData.subtotal}
          fees={invoicePrintData.fees}
          total={invoicePrintData.total}
          payments={[
            { method: invoicePrintData.paymentMethod, amount: invoicePrintData.total }
          ]}
          balanceDue={0}
          isPOSReceipt={true}
          onClose={() => setInvoicePrintData(null)}
        />
      )}
    </div>
  );
}
