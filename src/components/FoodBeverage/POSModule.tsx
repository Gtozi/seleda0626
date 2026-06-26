/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useMemo, useEffect } from 'react';
import { toISODate } from '../../utils/date';
import { 
  Search, 
  Plus, 
  Minus, 
  X, 
  CheckCircle2, 
  Receipt, 
  CreditCard,
  History,
  Trash2,
  ChevronRight,
  Clock,
  LogIn,
  ChefHat,
  ClipboardList,
  Printer,
  Download,
  Coins,
  Smartphone,
  User,
  UserPlus,
  Landmark,
  Coffee,
  Check,
  Percent,
  PlusCircle,
  HelpCircle,
  ShoppingBag,
  Banknote,
  Building,
  AlertCircle,
  Ban
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useERP } from '../../context/ERPContext';
import UnifiedInvoiceTemplate from '../Shared/UnifiedInvoiceTemplate';

export interface RestaurantTab {
  id: string; // e.g., 'quick-sale', 'T1', or 'tab-1715...'
  name: string; // e.g., 'Direct Checkout', 'Table T1 (2 PAX)', or guest name
  customerType: string; // e.g., 'Walk-In Guest', 'In-House Guest', etc.
  createdAt: string;
  items: { id: string; name: string; price: number; quantity: number }[];
  paymentMethod?: 'Cash' | 'Card' | 'Mobile' | 'RoomCharge';
  selectedRoomId?: string;
  discountPercent?: number;
  walkInClientName?: string;
  walkInClientTIN?: string;
  walkInClientVATNo?: string;
  walkInClientVATDate?: string;
  isKitchenSent?: boolean;
  paymentScreenshot?: File | null;
}

export default function POSModule({ outletName = 'Main Restaurant' }: { outletName?: string }) {
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
    salesTransactions,
    formatTaxesAndFees
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'pos' | 'history' | 'issues'>('pos');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Damaged, broken or lost items tracking
  const [restaurantIssues, setRestaurantIssues] = useState<any[]>(() => {
    const saved = localStorage.getItem('hotel_erp_restaurant_issues');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedProductIdIssue, setSelectedProductIdIssue] = useState<string>('');
  const [issueQuantity, setIssueQuantity] = useState<number>(1);
  const [issueType, setIssueType] = useState<'Damaged' | 'Broken' | 'Lost'>('Damaged');
  const [issueNotes, setIssueNotes] = useState<string>('');
  const [issueReporter, setIssueReporter] = useState<string>('');

  const saveRestaurantIssues = (newList: any[]) => {
    setRestaurantIssues(newList);
    localStorage.setItem('hotel_erp_restaurant_issues', JSON.stringify(newList));
  };

  // Active Tab/Ledger State
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Mobile' | 'RoomCharge'>('Cash');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [shiftJournalFilterDate, setShiftJournalFilterDate] = useState<string>(toISODate(new Date()));
  const [cashReceived, setCashReceived] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [invoicePrintData, setInvoicePrintData] = useState<any | null>(null);

  // Split payment state
  const [isSplitPayment, setIsSplitPayment] = useState(false);
  const [splitAmounts, setSplitAmounts] = useState<Record<string, string>>({});
  const [tabToDelete, setTabToDelete] = useState<string | null>(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);

  // Walk-in client details
  const [showClientInfoFields, setShowClientInfoFields] = useState(false);
  const [walkInClientName, setWalkInClientName] = useState('');
  const [walkInClientTIN, setWalkInClientTIN] = useState('');
  const [walkInClientVATNo, setWalkInClientVATNo] = useState('');
  const [walkInClientVATDate, setWalkInClientVATDate] = useState('');

  // Modals
  const [showNewTabModal, setShowNewTabModal] = useState(false);
  const [newTabName, setNewTabName] = useState('');
  const [newTabCustomerType, setNewTabCustomerType] = useState<string>('Walk-In Guest');
  const [showAddModal, setShowAddModal] = useState(false);

  const outletCategories = globalHotelSettings.posOutletCategories?.[outletName] || globalHotelSettings.posCategories || [];

  // New Item Registration Form details
  const [newItem, setNewItem] = useState({
    name: '',
    code: '',
    subcategory: outletCategories[0] || 'General',
    unit: 'Portion',
    salePrice: 25,
    currentStock: 50,
    minStock: 10,
    maxStock: 200,
    reorderLevel: 20,
    brand: '',
    barcode: ''
  });

  // Load and bootstrap active restaurant tabs (Direct + Custom)
  const [openTabs, setOpenTabs] = useState<RestaurantTab[]>(() => {
    try {
      const saved = localStorage.getItem('hotel_erp_restaurant_tabs_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          // Filter out legacy fixed tables to support clean migration
          const filtered = parsed.filter((t: any) => !['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'].includes(t.id));
          // Ensure quick-sale is always present
          const hasQuick = filtered.some((t: any) => t.id === 'quick-sale');
          if (!hasQuick) {
            filtered.unshift({
              id: 'quick-sale',
              name: 'Direct Sale / Quick Check',
              customerType: 'Walk-In Guest',
              createdAt: new Date().toISOString(),
              items: [],
              paymentMethod: 'Cash',
              selectedRoomId: '',
              discountPercent: 0
            });
          }
          return filtered;
        }
      }
    } catch (e) {
      console.warn('Failed to parse restaurant tabs, rebuilding defaults...');
    }

    return [
      { 
        id: 'quick-sale', 
        name: 'Direct Sale / Quick Check', 
        customerType: 'Walk-In Guest', 
        createdAt: new Date().toISOString(), 
        items: [], 
        paymentMethod: 'Cash', 
        selectedRoomId: '', 
        discountPercent: 0 
      }
    ];
  });

  const [selectedTabId, setSelectedTabId] = useState<string>('quick-sale');

  // Persist Open Tabs to cache
  useEffect(() => {
    localStorage.setItem('hotel_erp_restaurant_tabs_v2', JSON.stringify(openTabs));
  }, [openTabs]);

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

  const updateTabField = <K extends keyof RestaurantTab>(tabId: string, field: K, value: RestaurantTab[K]) => {
    setOpenTabs(prev => prev.map(t => t.id === tabId ? { ...t, [field]: value } : t));
  };

  useEffect(() => {
    updateTabField(selectedTabId, 'paymentScreenshot', paymentScreenshot);
  }, [paymentScreenshot, selectedTabId]);

  // Derive Menu from inventory and meal packages
  const menuItems = useMemo(() => {
    const fixedPackages: { id: string; name: string; price: number; category: string; available: boolean; isFixedMenu: boolean }[] = [
      { id: 'MP1', name: 'Breakfast Buffet Package', price: 25, category: 'Meal Package', available: true, isFixedMenu: true },
      { id: 'MP2', name: 'Lunch Package / Buffet', price: 35, category: 'Meal Package', available: true, isFixedMenu: true },
      { id: 'MP3', name: 'Premium Dinner Package', price: 45, category: 'Meal Package', available: true, isFixedMenu: true },
      { id: 'MP4', name: 'Half Board Dining Block', price: 60, category: 'Meal Package', available: true, isFixedMenu: true },
      { id: 'MP5', name: 'Full Board Dining Block', price: 85, category: 'Meal Package', available: true, isFixedMenu: true },
      { id: 'MP6', name: 'Corporate Breakout Package', price: 55, category: 'Meal Package', available: true, isFixedMenu: true },
    ];

    const inventoryBevs = inventoryItems
      .filter(item => item.location === 'Restaurant Store' && (item.category === 'Consumables' || item.category === 'Food & Beverage' || item.category === 'Food & Beverage Store'))
      .map(item => ({
        id: item.id,
        name: item.name,
        price: item.avgCost ? (item.avgCost * 2.5) : 20, // 150% markup or moderate default
        category: (item.subcategory || item.category || 'Beverage') as string,
        available: item.currentStock > 0,
        isFixedMenu: false
      }));

    return [...fixedPackages, ...inventoryBevs];
  }, [inventoryItems]);

  // Filters
  const filteredMenu = useMemo(() => {
    return menuItems.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
      if (selectedCategory === 'All') return matchSearch;
      return matchSearch && item.category === selectedCategory;
    });
  }, [menuItems, searchTerm, selectedCategory]);

  // Cart Management
  const addToCart = (item: typeof menuItems[0]) => {
    const existing = cart.find(c => c.id === item.id);
    let newCart;
    if (existing) {
      newCart = cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
    } else {
      newCart = [...cart, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    }
    setCart(newCart);
    updateTabField(selectedTabId, 'items', newCart);
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    const existing = cart.find(c => c.id === itemId);
    if (!existing) return;
    const nextQty = existing.quantity + delta;
    let newCart;
    if (nextQty <= 0) {
      newCart = cart.filter(c => c.id !== itemId);
    } else {
      newCart = cart.map(c => c.id === itemId ? { ...c, quantity: nextQty } : c);
    }
    setCart(newCart);
    updateTabField(selectedTabId, 'items', newCart);
  };

  const handleDiscardTab = (tabId: string) => {
    if (tabId !== 'quick-sale') {
      // Delete custom named tab
      setOpenTabs(prev => prev.filter(t => t.id !== tabId));
      if (selectedTabId === tabId) {
        handleSelectTab('quick-sale');
      }
      addNotification(`Dining tab "${openTabs.find(t => t.id === tabId)?.name}" discarded.`, 'warning', 'Restaurant');
    }
  };

  // Add Custom named tab
  const handleCreateTab = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newTabName.trim();
    if (!cleanName) return;

    const newId = `tab-dining-${Date.now()}`;
    const newTabObj: RestaurantTab = {
      id: newId,
      name: cleanName,
      customerType: newTabCustomerType,
      createdAt: new Date().toISOString(),
      items: [],
      paymentMethod: 'Cash',
      selectedRoomId: '',
      discountPercent: 0
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

    addNotification(`Opened dining tab for "${cleanName}"`, 'success', 'Restaurant');
  };

  // Add registered item to inventory Store
  const handleAddRestaurantItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;

    const itemCode = newItem.code.trim() || `RES-FD-${newItem.name.replace(/\s+/g, '-').toUpperCase().slice(0, 8)}-${Math.floor(100 + Math.random() * 900)}`;
    const costForMarkup = Number(newItem.salePrice) / 2.5;

    addInventoryItem({
      code: itemCode,
      name: newItem.name,
      category: 'Consumables',
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
      location: 'Restaurant Store',
      barcode: newItem.barcode || undefined
    });

    addNotification(`Registered custom item "${newItem.name}" inside Restaurant Store.`, 'success', 'Restaurant');
    
    // reset form
    setNewItem({
      name: '',
      code: '',
      subcategory: outletCategories[0] || 'General',
      unit: 'Portion',
      salePrice: 25,
      currentStock: 50,
      minStock: 10,
      maxStock: 200,
      reorderLevel: 20,
      brand: '',
      barcode: ''
    });
    setShowAddModal(false);
  };

  // Kitchen Transmission
  const handleSendToKitchen = () => {
    if (cart.length === 0) return;
    const currentTabName = openTabs.find(t => t.id === selectedTabId)?.name || 'Guest';
    updateTabField(selectedTabId, 'isKitchenSent', true);
    addNotification(`Dining ticket for "${currentTabName}" sent to Kitchen Display Screen (KDS) & Prep station.`, 'success', 'Kitchen');
  };

  // Calculations
  const { subtotal, discountAmount, tax, taxData, total } = useMemo(() => {
    const sub = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const disc = (sub * discountPercent) / 100;
    const taxable = sub - disc;
    const tData = formatTaxesAndFees(taxable);
    return { 
      subtotal: sub, 
      discountAmount: disc, 
      tax: tData.taxAmount, 
      taxData: tData,
      total: tData.totalWithTaxes 
    };
  }, [cart, discountPercent, formatTaxesAndFees]);

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

  // direct checkout direct direct direkte checkout direct Direct direct Settle direct!
  const handleDirectCheckout = () => {
    if (cart.length === 0) return;

    const activeTabObj = openTabs.find(t => t.id === selectedTabId);
    const currentTabName = activeTabObj?.name || 'Walk-In Guest';
    const invoiceNum = `INV-RES-${Math.floor(10000 + Math.random() * 90000)}`;
    const matchedRes = selectedRoomId ? reservations.find(r => r.id === selectedRoomId) : null;
    const finalCustomerName = matchedRes ? matchedRes.guestName : (walkInClientName || currentTabName);

    // Get non-zero splits if Split is enabled
    const splits = isSplitPayment
      ? allMethods
          .map(m => ({ method: m, amount: parseFloat(splitAmounts[m] || '0') }))
          .filter(s => s.amount > 0)
      : [];

    const finalPaymentMethod = isSplitPayment
      ? `Split: ${splits.map(s => `${s.method} (${formatAmount(s.amount)})`).join(', ')}`
      : paymentMethod;

    // Register sale into ERP finance general ledger
    addSaleTransaction({
      date: new Date().toISOString(),
      invoiceNumber: invoiceNum,
      module: 'Restaurant POS',
      customerName: finalCustomerName,
      items: cart.map(i => ({ productName: i.name, quantity: i.quantity, price: i.price })),
      subtotal,
      tax,
      total,
      paymentMethod: finalPaymentMethod,
      splitPayments: isSplitPayment ? splits : undefined,
      status: 'Completed',
      cashierName: userProfile?.name || 'Restaurant Cashier'
    });

    // Populate Print Invoice
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

    // Folio Post if needed (single or split)
    if (isSplitPayment) {
      const roomChargeSplit = splits.find(s => s.method === 'RoomCharge');
      if (roomChargeSplit && roomChargeSplit.amount > 0 && matchedRes) {
        addFolioCharge(matchedRes.id, {
          id: `RES-${Date.now()}`,
          date: new Date().toISOString(),
          description: `Restaurant Dining Order (Split - Tab/Table: ${currentTabName}): ${cart.map(i => `${i.name} (x${i.quantity})`).join(', ')}`,
          amount: roomChargeSplit.amount,
          type: 'F&B'
        });
      }
    } else if (paymentMethod === 'RoomCharge' && matchedRes) {
      addFolioCharge(matchedRes.id, {
        id: `RES-${Date.now()}`,
        date: new Date().toISOString(),
        description: `Restaurant Dining Order (Tab/Table: ${currentTabName}): ${cart.map(i => `${i.name} (x${i.quantity})`).join(', ')}`,
        amount: total,
        type: 'F&B'
      });
    }

    // Deduct stock levels in warehouse
    cart.forEach(cartItem => {
      const invComp = inventoryItems.find(i => i.id === cartItem.id);
      if (invComp) {
        updateInventoryItem(invComp.id, {
          currentStock: Math.max(0, invComp.currentStock - cartItem.quantity)
        });
      }
    });

    addNotification(`Restaurant ticket "${currentTabName}" successfully settled ($${total.toFixed(2)}) via ${finalPaymentMethod}.`, 'success', 'Restaurant');

    // Tear-down or reset tab
    if (selectedTabId !== 'quick-sale') {
      // Terminate custom named tab
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
    } else {
      // Clear permanent direct carts
      setCart([]);
      setCashReceived('');
      setSelectedRoomId('');
      setDiscountPercent(0);
      setPaymentMethod('Cash');
      setWalkInClientName('');
      setWalkInClientTIN('');
      setWalkInClientVATNo('');
      setWalkInClientVATDate('');
      setPaymentScreenshot(null);
      setIsSplitPayment(false);
      setSplitAmounts({});
      updateTabField(selectedTabId, 'items', []);
      updateTabField(selectedTabId, 'paymentMethod', 'Cash');
      updateTabField(selectedTabId, 'selectedRoomId', '');
      updateTabField(selectedTabId, 'discountPercent', 0);
      updateTabField(selectedTabId, 'walkInClientName', '');
      updateTabField(selectedTabId, 'walkInClientTIN', '');
      updateTabField(selectedTabId, 'walkInClientVATNo', '');
      updateTabField(selectedTabId, 'walkInClientVATDate', '');
      updateTabField(selectedTabId, 'isKitchenSent', false);
      updateTabField(selectedTabId, 'paymentScreenshot', null);
    }
  };

  const changeCalculation = useMemo(() => {
    if (!cashReceived) return 0;
    const num = parseFloat(cashReceived);
    if (isNaN(num)) return 0;
    return Math.max(0, num - total);
  }, [cashReceived, total]);

  const inHouseGuests = useMemo(() => {
    return reservations.filter(r => r.status === 'Check-In');
  }, [reservations]);

  // Sync state modifications within open tabs array whenever fields change in active tab checkout pane
  useEffect(() => {
    updateTabField(selectedTabId, 'paymentMethod', paymentMethod);
  }, [paymentMethod, selectedTabId]);

  useEffect(() => {
    updateTabField(selectedTabId, 'selectedRoomId', selectedRoomId);
  }, [selectedRoomId, selectedTabId]);

  useEffect(() => {
    updateTabField(selectedTabId, 'discountPercent', discountPercent);
  }, [discountPercent, selectedTabId]);

  useEffect(() => {
    updateTabField(selectedTabId, 'walkInClientName', walkInClientName);
  }, [walkInClientName, selectedTabId]);

  useEffect(() => {
    updateTabField(selectedTabId, 'walkInClientTIN', walkInClientTIN);
  }, [walkInClientTIN, selectedTabId]);

  useEffect(() => {
    updateTabField(selectedTabId, 'walkInClientVATNo', walkInClientVATNo);
  }, [walkInClientVATNo, selectedTabId]);

  useEffect(() => {
    updateTabField(selectedTabId, 'walkInClientVATDate', walkInClientVATDate);
  }, [walkInClientVATDate, selectedTabId]);

  useEffect(() => {
    updateTabField(selectedTabId, 'paymentScreenshot', paymentScreenshot);
  }, [paymentScreenshot, selectedTabId]);

  // Filter settled restaurant transactions for Shift history report ledger
  const settledRestaurantSales = useMemo(() => {
    return (salesTransactions || []).filter(tx => tx.module === 'Restaurant POS' || tx.module === 'F&B POS');
  }, [salesTransactions]);

  const filteredRestaurantSales = useMemo(() => {
    return settledRestaurantSales.filter(tx => tx.date.startsWith(shiftJournalFilterDate));
  }, [settledRestaurantSales, shiftJournalFilterDate]);

  const handleRegisterIssue = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProductIdIssue) {
      addNotification('Please select a restaurant item.', 'error', 'Restaurant');
      return;
    }
    
    const product = menuItems.find(p => p.id === selectedProductIdIssue);
    if (!product) {
      addNotification('Restaurant item not found.', 'error', 'Restaurant');
      return;
    }
    
    const dbItem = inventoryItems.find(i => i.id === selectedProductIdIssue);
    const stockAvailable = dbItem ? dbItem.currentStock : 0;
    
    if (issueQuantity <= 0) {
      addNotification('Quantity must be at least 1.', 'error', 'Restaurant');
      return;
    }
    
    if (issueQuantity > stockAvailable) {
      addNotification(`Cannot write off more than current available stock (${stockAvailable} units).`, 'error', 'Restaurant');
      return;
    }

    if (dbItem) {
      const remaining = Math.max(0, dbItem.currentStock - issueQuantity);
      updateInventoryItem(dbItem.id, {
        currentStock: remaining
      });
    }

    const newIssue = {
      id: Math.random().toString(36).substr(2, 9),
      productId: product.id,
      productName: product.name,
      quantity: issueQuantity,
      type: issueType,
      date: new Date().toISOString(),
      reporter: issueReporter || userProfile?.name || 'Restaurant staff',
      notes: issueNotes || 'No notes provided',
      itemCost: product.price * 0.4
    };

    const updatedIssues = [newIssue, ...restaurantIssues];
    saveRestaurantIssues(updatedIssues);

    setSelectedProductIdIssue('');
    setIssueQuantity(1);
    setIssueNotes('');
    
    addNotification(`Logged ${issueQuantity}x "${product.name}" as ${issueType}. Stock updated.`, 'success', 'Restaurant');
  };

  const handleDeleteIssue = (id: string) => {
    if (confirm('Reclaim/void this entry? This restores the stock count in Inventory.')) {
      const issue = restaurantIssues.find(iss => iss.id === id);
      if (issue) {
        const dbItem = inventoryItems.find(i => i.id === issue.productId);
        if (dbItem) {
          updateInventoryItem(dbItem.id, {
            currentStock: dbItem.currentStock + issue.quantity
          });
        }
      }
      const filtered = restaurantIssues.filter(iss => iss.id !== id);
      saveRestaurantIssues(filtered);
      addNotification('Entry voided. Stock counts replenished.', 'success', 'Restaurant');
    }
  };

  const activeTabObj = openTabs.find(t => t.id === selectedTabId);

  return (
    <div className="space-y-4 font-sans h-full flex flex-col animate-fade-in relative text-slate-800 dark:text-slate-100">
      
      {/* Upper Module Selector Card */}
      <div className="flex items-center justify-between bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
            <Coffee size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">{outletName} POS</h2>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Outlet:Standalone Restaurant / Store:F&amp;B Store</p>
          </div>
        </div>
        
        <div className="flex bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'pos' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Sell Terminal
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'history' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Shift History
          </button>
          <button 
            onClick={() => setActiveTab('issues')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'issues' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <Ban size={13} /> Damaged & Lost
          </button>
        </div>
      </div>

      {activeTab === 'pos' ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[900px] items-stretch">
          
          {/* LEFT: Menu Selection & Search (lg:col-span-8) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            
            {/* Quick Actions Search Bar */}
            <div className="bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shadow-3xs">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Scan SKU barcode or type menu names..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 p-2.5 pl-9 rounded-2xl text-xs outline-none focus:ring-1 focus:ring-amber-500 font-medium text-slate-900 dark:text-white"
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

              {/* Add F&B Item Registry */}
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-slate-950 dark:text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-amber-500/20"
              >
                <PlusCircle size={14} /> Add F&B Item
              </button>
            </div>

            {/* Menu Grid Scroll Area */}
            <div className="flex-1 overflow-y-auto pr-1 max-h-[680px]">
              {filteredMenu.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 space-y-3">
                  <span className="text-3xl">🍽️</span>
                  <p className="text-xs font-bold uppercase tracking-wider">No matching active F&B items found</p>
                  <p className="text-[10px] text-slate-400 max-w-sm mx-auto">Register new items using the registry form or adjust your categories selection filtering above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
                  {filteredMenu.map(item => {
                    const isPackage = item.category === 'Meal Package';
                    return (
                      <button
                        key={item.id}
                        onClick={() => item.available && addToCart(item)}
                        disabled={!item.available}
                        className={`bg-white dark:bg-slate-905 border p-4 rounded-2xl text-left shadow-3xs transition-all flex flex-col justify-between h-36 group relative overflow-hidden outline-none ${
                          item.available 
                            ? 'hover:border-amber-500 hover:shadow-xs cursor-pointer border-slate-200 dark:border-slate-800' 
                            : 'opacity-50 border-slate-100 dark:border-slate-900 cursor-not-allowed bg-slate-50 dark:bg-slate-950/20'
                        }`}
                      >
                        <div className="relative z-10 w-full">
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest block font-mono">
                              {item.category}
                            </span>
                            {!item.available && (
                              <span className="text-[7px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded font-mono">
                                SOLD OUT
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white mt-1.5 group-hover:text-amber-500 transition-colors leading-snug-tight line-clamp-2">
                            {item.name}
                          </h4>
                        </div>

                        <div className="flex justify-between items-end mt-3 relative z-10 w-full pt-2 border-t border-slate-50 dark:border-slate-850">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                              {formatAmount(item.price)}
                            </span>
                          </div>
                          <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                            <Plus size={16} />
                          </div>
                        </div>

                        {/* Background structural watermark decoration matching fine arts */}
                        <div className="absolute top-0 right-0 p-2 opacity-2 scale-150 rotate-12 group-hover:scale-125 transition-transform text-slate-900 dark:text-white">
                          <Coffee size={56} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: High Availability Cart & Settle Sidebar (lg:col-span-4) */}
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
                            : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-303'
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
                                handleDiscardTab(tab.id);
                                setTabToDelete(null);
                              } else {
                                setTabToDelete(tab.id);
                                // Reset after 3.5 seconds
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
                          <button onClick={() => updateCartQuantity(item.id, -1)} className="px-1.5 py-0.5 hover:bg-slate-205 dark:hover:bg-slate-800 transition cursor-pointer">-</button>
                          <span className="px-1.5 py-0.5 bg-white dark:bg-slate-900 font-bold font-mono">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.id, 1)} className="px-1.5 py-0.5 hover:bg-slate-205 dark:hover:bg-slate-800 transition cursor-pointer">+</button>
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
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl text-[10px] focus:ring-1 focus:ring-amber-505/30 outline-none font-mono transition-all"
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
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleSendToKitchen}
                      disabled={cart.length === 0}
                      className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition"
                    >
                      <ChefHat size={11} /> Send to KDS
                    </button>
                    
                    <button
                      type="button"
                      disabled={cart.length === 0}
                      onClick={() => {
                        const matchedRes = selectedRoomId ? reservations.find(r => r.id === selectedRoomId) : null;
                        const currentTabName = openTabs.find(t => t.id === selectedTabId)?.name || 'Guest';
                        const finalCustomerName = matchedRes ? matchedRes.guestName : (walkInClientName || currentTabName || 'Walk-In Guest');
                        
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
                      className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition"
                    >
                      <Printer size={11} /> Draft Invoice
                    </button>
                  </div>

                  <button
                    disabled={
                      cart.length === 0 || 
                      (isSplitPayment 
                        ? (Math.abs(sumOfSplits - total) > 0.01 || (parseFloat(splitAmounts['RoomCharge'] || '0') > 0 && !selectedRoomId))
                        : (paymentMethod === 'RoomCharge' && !selectedRoomId)
                      )
                    }
                    onClick={handleDirectCheckout}
                    className="w-full py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 size={12} /> {isSplitPayment ? 'Settle Split Payment' : paymentMethod === 'RoomCharge' ? 'Folio Charge' : 'Settle Check'}
                  </button>

                  {selectedTabId !== 'quick-sale' && (
                    <button
                      type="button"
                      onClick={() => {
                        handleDiscardTab(selectedTabId);
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
        /* Dynamic History Tab layout */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-3xs space-y-6">
          <div>
            <h4 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-tight">Closed Dining Shift Ledger</h4>
            <p className="text-[10px] text-slate-400 font-mono">Shift audits and finalized checks registered under current user session.</p>
          </div>
          <div className="flex gap-4 items-center text-xs">
            <input 
              type="date"
              value={shiftJournalFilterDate}
              onChange={(e) => setShiftJournalFilterDate(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 font-mono text-xs"
            />
            <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer">
              <Printer size={14} /> Print
            </button>
            <button 
              onClick={() => {
                const csv = [
                  ['Invoice', 'Date', 'Cashier', 'Total', 'Method'].join(','),
                  ...filteredRestaurantSales.map(t => [t.invoiceNumber, t.date, t.cashierName, t.total, t.paymentMethod].join(','))
                ].join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `shift_journal_res_${shiftJournalFilterDate}.csv`;
                a.click();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <Download size={14} /> Export
            </button>
          </div>

          {filteredRestaurantSales.length === 0 ? (
            <div className="py-16 text-center text-slate-400 border border-dashed rounded-2xl dark:border-slate-800 space-y-2">
              <span className="text-3xl">📭</span>
              <p className="text-xs font-bold uppercase tracking-wider">No settled transactions in this session.</p>
              <p className="text-[9px] text-slate-400">Complete standard payment settlements on the sell terminal to populate this journal.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-mono text-slate-400">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-2">Date / Time</th>
                    <th className="py-3 px-2">Customer Recipient</th>
                    <th className="py-3 px-2 text-right">Subtotal</th>
                    <th className="py-3 px-2 text-right">Tax (VAT)</th>
                    <th className="py-3 px-2 text-right">Settled Amount</th>
                    <th className="py-3 px-2">Channel</th>
                    <th className="py-3 px-4">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredRestaurantSales.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white select-all">{tx.invoiceNumber}</td>
                      <td className="py-3 px-2 font-mono text-slate-400 text-2xs">
                        {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-2 truncate max-w-[150px]">{tx.customerName}</td>
                      <td className="py-3 px-2 text-right font-mono text-slate-50o">{formatAmount(tx.subtotal)}</td>
                      <td className="py-3 px-2 text-right font-mono text-slate-50o">{formatAmount(tx.tax)}</td>
                      <td className="py-3 px-2 text-right font-black font-mono text-amber-500">{formatAmount(tx.total)}</td>
                      <td className="py-3 px-2">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-300 font-mono">
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => {
                            setInvoicePrintData({
                              invoiceNumber: tx.invoiceNumber,
                              date: new Date(tx.date).toLocaleDateString() + ' ' + new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                              customerName: tx.customerName,
                              subtotal: tx.subtotal,
                              fees: [{ label: `VAT (${globalHotelSettings?.taxPercent || 12}%)`, amount: tx.tax }],
                              total: tx.total,
                              paymentMethod: tx.paymentMethod,
                              items: tx.items || []
                            });
                          }}
                          className="p-1 px-2.5 bg-slate-50 hover:bg-amber-500 dark:bg-slate-800 hover:text-slate-950 dark:hover:bg-amber-600 dark:hover:text-slate-950 text-slate-600 dark:text-slate-300 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition"
                        >
                          <Printer size={10} /> View Rec.
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : activeTab === 'issues' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in" id="damaged-lost-workspace">
          
          {/* Form left panel */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
            <div>
              <span className="text-[9px] font-mono text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded uppercase tracking-wider font-extrabold">Restaurant Inventory Adjustment</span>
              <h4 className="text-base font-sans font-black tracking-tight text-slate-900 dark:text-white uppercase mt-1">
                Log Damaged or Lost Item
              </h4>
              <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase leading-normal">
                Submit restaurant inventory write-offs to correct physical stock layers and update central inventory nodes.
              </p>
            </div>

            <form onSubmit={handleRegisterIssue} className="space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">1. Select Restaurant Item</label>
                <select
                  value={selectedProductIdIssue}
                  onChange={(e) => {
                    setSelectedProductIdIssue(e.target.value);
                    setIssueQuantity(1);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400 font-sans"
                  required
                >
                  <option value="">-- Choose Restaurant Item --</option>
                  {menuItems.filter(p => !p.isFixedMenu).map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name}
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
                    max={selectedProductIdIssue ? inventoryItems.find(p => p.id === selectedProductIdIssue)?.currentStock || 1 : 100}
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
                  placeholder="Restaurant Staff"
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
                <span className="text-[9px] font-mono text-zinc-500 bg-zinc-500/10 px-2.5 py-0.5 rounded uppercase tracking-wider font-extrabold">Restaurant Inventory Adjustment Log</span>
                <h4 className="text-base font-sans font-black tracking-tight text-slate-900 dark:text-white uppercase mt-1">
                  Physically Adjusted & Written-Off Items
                </h4>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-900 border px-3 py-1.5 rounded-xl text-slate-500 font-mono text-[10px] uppercase">
                Active Audit Log Count:{' '}
                <strong className="text-slate-950 dark:text-zinc-200 font-sans font-extrabold text-[11px]">
                  {restaurantIssues.length} entries
                </strong>
              </div>
            </div>

            {restaurantIssues.length === 0 ? (
              <div className="py-20 text-center text-slate-400 space-y-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Ban size={40} className="mx-auto text-slate-300 dark:text-slate-700" />
                <div>
                  <h5 className="font-sans font-bold text-slate-900 dark:text-white uppercase text-xs">No write-offs on file</h5>
                  <p className="text-[10px] text-slate-400 font-mono mt-1 max-w-xs mx-auto uppercase">
                    All restaurant items are currently accounted for. No damaged, broken or lost report logs filed in this audit period.
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
                    {restaurantIssues.map((iss) => (
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

      {/* Name Custom Dining Tab Modal Overlay */}
      <AnimatePresence>
        {showNewTabModal && (
          <div className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Open Custom Tab</h3>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Allocate new table or customer ledgers</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowNewTabModal(false)} 
                  className="p-2 bg-white dark:bg-slate-800 rounded-xl hover:text-rose-600 transition"
                >
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleCreateTab} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tab / Guest Label</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Mike / Patio Bench 4"
                    value={newTabName}
                    onChange={(e) => setNewTabName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-500 font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Lodging Ledger Category</label>
                  <select
                    value={newTabCustomerType}
                    onChange={(e) => setNewTabCustomerType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-855 border dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-500 font-semibold text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="Walk-In Guest">Walk-In Guest</option>
                    <option value="In-House Guest">In-House Guest</option>
                    <option value="Corporate Client">Corporate Client</option>
                    <option value="Conference Group">Conference Group</option>
                    <option value="Tour Group">Tour Group</option>
                  </select>
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
                    className="py-2.5 bg-amber-500 text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest transition shadow-lg hover:bg-amber-600 cursor-pointer"
                  >
                    Open Tab
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Register New Dining Item Modal Overlay */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Register Dining Item</h3>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Add a new consumable product to the Restaurant Store</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-2 bg-white dark:bg-slate-800 rounded-xl hover:text-rose-600 transition cursor-pointer text-slate-500"
                >
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleAddRestaurantItem} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Item Name / Product</label>
                    <input
                      type="text"
                      required
                      value={newItem.name}
                      onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Shiro Wat Portion"
                      className="w-full bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-500 font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">SKU Code (Optional)</label>
                    <input
                      type="text"
                      value={newItem.code}
                      onChange={(e) => setNewItem(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="e.g. SH-WAT"
                      className="w-full bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-500 font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Sales Price ($)</label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      value={newItem.salePrice}
                      onChange={(e) => setNewItem(prev => ({ ...prev, salePrice: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-500 font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Subcategory</label>
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
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Initial Stock</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newItem.currentStock}
                      onChange={(e) => setNewItem(prev => ({ ...prev, currentStock: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-500 font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Reorder Level Alert</label>
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
                    className="py-2.5 bg-amber-500 text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest transition shadow-lg hover:bg-amber-600 cursor-pointer"
                  >
                    Register &amp; Activate
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Unified Print Invoice Receipt Modal Output */}
      {invoicePrintData && (
        <UnifiedInvoiceTemplate 
          title="F&amp;B DINING SETTLEMENT CHECK"
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
