import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useRef } from 'react';
import { useERP } from '../../context/ERPContext';
import { ModalSystem } from '../Shared/ModalSystem';
import { toISODate } from '../../utils/date';
import { supabaseService } from '../../services/supabaseService';
import { supabase } from '../../lib/supabase';
import UnifiedInvoiceTemplate from '../Shared/UnifiedInvoiceTemplate';
import PaymentSystem, { PaymentSplit } from '../Shared/PaymentSystem';
import { SplitPayment } from '../../types/finance';
import {
  PaymentMethodSummary,
  BankAccountSummary,
  buildPaymentCSVHeader,
  formatTransactionRowsForCSV,
  POSPaymentAuditTable,
  type PaymentAuditTransaction
} from '../Shared/POSPaymentJournalHelpers';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Check, 
  User,
  UserPlus,
  Receipt, 
  History, 
  ShoppingBag, 
  QrCode, 
  CreditCard, 
  Coins, 
  Smartphone, 
  Tag, 
  Percent, 
  Info,
  Gift,
  Sparkles,
  Trophy,
  Coffee,
  Image as ImageIcon,
  Mail,
  Shield,
  Clock,
  ExternalLink,
  Ban,
  Landmark,
  Printer,
  Download,
  X,
  CheckCircle2,
  Package
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  priceUsd: number;
  stock: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface SavedTransaction {
  id: string;
  invoiceNumber: string;
  date: string;
  cashier: string;
  items: { productName: string; quantity: number; price: number }[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  clientName?: string;
  clientTIN?: string;
  clientVATNo?: string;
  clientVATDate?: string;
  roomChargeDetails?: {
    reservationId: string;
    roomNumber: string;
    guestName: string;
  };
  changeGiven?: number;
  splitPayments?: SplitPayment[];
  status?: 'Completed' | 'Voided' | 'Pending';
  receiptUrl?: string;
}

interface GiftShopIssue {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  type: 'Damaged' | 'Broken' | 'Lost';
  date: string;
  reporter: string;
  notes: string;
  itemCost?: number;
}

interface GiftShopTab {
  id: string;
  name: string;
  createdAt: string;
  items: CartItem[];
  paymentMethod?: string;
  selectedRoomId?: string;
  discountPercent?: number;
  walkInClientName?: string;
  walkInClientTIN?: string;
  walkInClientVATNo?: string;
  walkInClientVATDate?: string;
  cashAmountPaid?: string;
  isSplitPayment?: boolean;
  splitAmounts?: Record<string, string>;
  paymentScreenshot?: File | null;
}

export default function GiftShopPOS() {
  const { 
    reservations, 
    addFolioCharge, 
    formatAmount, 
    currency, 
    globalHotelSettings,
    userProfile,
    inventoryItems,
    updateInventoryItem,
    addInventoryItem,
    addSaleTransaction,
    addStructuredAuditLog,
    chartOfAccounts
  } = useERP();

  const outletCategories = globalHotelSettings.posOutletCategories?.['Boutique / Gift Shop'] || globalHotelSettings.posOutletCategories?.['Gift Shop'] || globalHotelSettings.posCategories || [];

  // Internal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAddItemCode, setSelectedAddItemCode] = useState('');
  const [addItemPrice, setAddItemPrice] = useState<string>('');
  const [addItemCategory, setAddItemCategory] = useState<string>('');
  const [posActiveItemCodes, setPosActiveItemCodes] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hotel_erp_giftshop_pos_active_items_v1');
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [editingPriceCode, setEditingPriceCode] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<string>('');
  
  // Client Info for Walk-ins
  const [showClientInfoFields, setShowClientInfoFields] = useState(false);
  const [walkInClientName, setWalkInClientName] = useState('');
  const [walkInClientTIN, setWalkInClientTIN] = useState('');
  const [walkInClientVATNo, setWalkInClientVATNo] = useState('');
  const [walkInClientVATDate, setWalkInClientVATDate] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [cashAmountPaid, setCashAmountPaid] = useState<string>('');
  const [searchTermRoom, setSearchTermRoom] = useState('');
  const [invoicePrintData, setInvoicePrintData] = useState<any>(null);
  
  // Payment system state - using unified PaymentSystem component
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  
  // Remove old split payment state - using PaymentSystem component instead

  // Named active tabs logic, matching Bar module
  const [openTabs, setOpenTabs] = useState<GiftShopTab[]>(() => {
    const saved = localStorage.getItem('hotel_erp_giftshop_tabs_v1');
    return saved ? JSON.parse(saved) : [
      { id: 'quick-sale', name: 'Quick Sale', createdAt: new Date().toISOString(), items: [], paymentMethod: 'Cash', selectedRoomId: '', discountPercent: 0, walkInClientName: '', walkInClientTIN: '', walkInClientVATNo: '', walkInClientVATDate: '', cashAmountPaid: '', isSplitPayment: false, splitAmounts: {}, paymentScreenshot: null }
    ];
  });
  const [selectedTabId, setSelectedTabId] = useState<string>('quick-sale');
  const [showNewTabModal, setShowNewTabModal] = useState(false);
  const [newTabName, setNewTabName] = useState('');
  const [tabToDelete, setTabToDelete] = useState<string | null>(null);

  // Synchronize dynamic client parameters per active gift shop tab
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
    updateTabField(selectedTabId, 'cashAmountPaid', cashAmountPaid);
  }, [cashAmountPaid, selectedTabId]);

  useEffect(() => {
    updateTabField(selectedTabId, 'selectedRoomId', selectedRoomId);
  }, [selectedRoomId, selectedTabId]);

  useEffect(() => {
    updateTabField(selectedTabId, 'discountPercent', discountPercent);
  }, [discountPercent, selectedTabId]);

  useEffect(() => {
    updateTabField(selectedTabId, 'paymentMethod', paymentMethod);
  }, [paymentMethod, selectedTabId]);

  useEffect(() => {
    updateTabField(selectedTabId, 'paymentScreenshot', paymentScreenshot);
  }, [paymentScreenshot, selectedTabId]);

  // Fetch bank accounts for split payments
  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/finance/bank-accounts', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setBankAccounts(data.bankAccounts || []);
          }
        }
      } catch (error) {
        console.error('Failed to fetch bank accounts:', error);
      }
    };
    fetchBankAccounts();
  }, []);

  // Persist open tabs to cache
  useEffect(() => {
    localStorage.setItem('hotel_erp_giftshop_tabs_v1', JSON.stringify(openTabs));
  }, [openTabs]);

  // Persist POS active item codes
  useEffect(() => {
    localStorage.setItem('hotel_erp_giftshop_pos_active_items_v1', JSON.stringify(posActiveItemCodes));
  }, [posActiveItemCodes]);

  const updateTabField = <K extends keyof GiftShopTab>(tabId: string, field: K, value: GiftShopTab[K]) => {
    setOpenTabs(prev => prev.map(t => t.id === tabId ? { ...t, [field]: value } : t));
  };

  // Switch or handle tabs
  const handleSelectTab = (tabId: string) => {
    const target = openTabs.find(t => t.id === tabId);
    if (!target) return;
    setSelectedTabId(tabId);
    setCart(target.items || []);
    setPaymentMethod(target.paymentMethod || 'Cash');
    setSelectedRoomId(target.selectedRoomId || '');
    setDiscountPercent(target.discountPercent || 0);
    setWalkInClientName(target.walkInClientName || '');
    setWalkInClientTIN(target.walkInClientTIN || '');
    setWalkInClientVATNo(target.walkInClientVATNo || '');
    setWalkInClientVATDate(target.walkInClientVATDate || '');
    setCashAmountPaid(target.cashAmountPaid || '');
    setPaymentScreenshot(target.paymentScreenshot || null);
  };

  const handleCreateTab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTabName.trim()) return;
    const tabId = 'TAB-' + Math.floor(100 + Math.random() * 900);
    const newTab: GiftShopTab = {
      id: tabId,
      name: newTabName.trim(),
      createdAt: new Date().toISOString(),
      items: [],
      paymentMethod: 'Cash',
      selectedRoomId: '',
      discountPercent: 0,
      walkInClientName: '',
      walkInClientTIN: '',
      walkInClientVATNo: '',
      walkInClientVATDate: '',
      cashAmountPaid: '',
      isSplitPayment: false,
      splitAmounts: {},
      paymentScreenshot: null
    };
    setOpenTabs(prev => [...prev, newTab]);
    setNewTabName('');
    setShowNewTabModal(false);
    // Automatically select the newly created tab
    setTimeout(() => {
      handleSelectTab(tabId);
    }, 10);
    showNotification('success', `Boutique tab "${newTab.name}" opened.`);
  };

  const handleDeleteTab = (tabId: string) => {
    if (tabId === 'quick-sale') return;
    setOpenTabs(prev => prev.filter(t => t.id !== tabId));
    if (selectedTabId === tabId) {
      handleSelectTab('quick-sale');
    }
    showNotification('success', 'Boutique tab discarded.');
  };
  
  // Sales shift transactions
  const [recentTransactions, setRecentTransactions] = useState<SavedTransaction[]>([]);
  const [showInvoicePrint, setShowInvoicePrint] = useState<SavedTransaction | null>(null);
  const [successAnimation, setSuccessAnimation] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'error' | 'success' | 'info', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'pos' | 'history' | 'issues'>('pos');
  const [shiftJournalFilterDate, setShiftJournalFilterDate] = useState<string>(toISODate(new Date()));

  // Damaged, broken or lost items tracking
  const [giftShopIssues, setGiftShopIssues] = useState<GiftShopIssue[]>([]);
  const [selectedProductIdIssue, setSelectedProductIdIssue] = useState<string>('');
  const [issueQuantity, setIssueQuantity] = useState<number>(1);
  const [issueType, setIssueType] = useState<'Damaged' | 'Broken' | 'Lost'>('Damaged');
  const [issueNotes, setIssueNotes] = useState<string>('');
  const [issueReporter, setIssueReporter] = useState<string>('');

  // Printable section refs
  const shiftJournalRef = useRef<HTMLDivElement>(null);
  const damagedLostRef = useRef<HTMLDivElement>(null);

  const printElement = (el: HTMLElement | null, title: string) => {
    if (!el) return;
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;
    const clone = el.cloneNode(true) as HTMLElement;
    // Strip dark-mode classes and interactive elements for clean print
    const stripClasses = (node: Element) => {
      const classList = node.classList;
      const classesToRemove: string[] = [];
      classList.forEach(c => {
        if (c.startsWith('dark:') || c.includes('hover:') || c.includes('cursor-pointer') || c.includes('transition')) {
          classesToRemove.push(c);
        }
      });
      classesToRemove.forEach(c => classList.remove(c));
      Array.from(node.children).forEach(stripClasses);
    };
    stripClasses(clone);
    const buttons = clone.querySelectorAll('button');
    buttons.forEach(b => b.remove());
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; margin: 24px; color: #1e293b; background: #fff; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th, td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: left; }
            th { background: #f8fafc; font-weight: 700; text-transform: uppercase; font-size: 9px; letter-spacing: 0.05em; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-mono { font-family: ui-monospace, monospace; }
            .font-black { font-weight: 900; }
            .rounded-xl, .rounded-2xl, .rounded-lg { border-radius: 8px; }
            .border { border: 1px solid #e2e8f0; }
            .shadow-3xs { box-shadow: none; }
            .space-y-4 > * + * { margin-top: 16px; }
            .p-5 { padding: 20px; }
            .pb-4 { padding-bottom: 16px; }
            .mb-1 { margin-bottom: 4px; }
            .mt-1 { margin-top: 4px; }
            .px-3 { padding-left: 12px; padding-right: 12px; }
            .py-1\.5 { padding-top: 6px; padding-bottom: 6px; }
            .bg-slate-50 { background: #f8fafc; }
            .bg-indigo-50 { background: #eef2ff; }
            .bg-emerald-50 { background: #ecfdf5; }
            .bg-amber-50 { background: #fffbeb; }
            .bg-rose-50 { background: #fff1f2; }
            .text-indigo-600 { color: #4f46e5; }
            .text-emerald-600 { color: #059669; }
            .text-amber-600 { color: #d97706; }
            .text-rose-600 { color: #e11d48; }
            .text-slate-900 { color: #0f172a; }
            .text-slate-500 { color: #64748b; }
            .text-slate-400 { color: #94a3b8; }
            .text-xs { font-size: 12px; }
            .text-3xs { font-size: 10px; }
            .text-4xs { font-size: 9px; }
            .uppercase { text-transform: uppercase; }
            .tracking-wider { letter-spacing: 0.05em; }
            .truncate { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div style="margin-bottom: 16px;">
            <h2 style="margin:0;font-size:16px;font-weight:900;text-transform:uppercase;">${title}</h2>
            <p style="margin:4px 0 0 0;font-size:10px;color:#64748b;font-family:monospace;">Generated: ${new Date().toLocaleString()}</p>
          </div>
          ${clone.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 300);
  };

  // Load transactions and issues from Supabase on mount
  useEffect(() => {
    const loadFromDb = async () => {
      try {
        const [sales, issues] = await Promise.all([
          supabaseService.fetchGiftShopSales(),
          supabaseService.fetchGiftShopIssues()
        ]);
        if (sales.length > 0) {
          setRecentTransactions(sales.map((s: any) => ({
            id: s.id,
            invoiceNumber: s.invoice_number,
            date: s.sale_date,
            cashier: s.cashier,
            items: s.items || [],
            subtotal: Number(s.subtotal),
            tax: Number(s.tax),
            total: Number(s.total),
            paymentMethod: s.payment_method,
            clientName: s.client_name,
            clientTIN: s.client_tin,
            clientVATNo: s.client_vat_no,
            clientVATDate: s.client_vat_date,
            roomChargeDetails: s.room_charge_details,
            changeGiven: Number(s.change_given),
            splitPayments: s.split_payments,
            status: s.status || 'Completed',
            receiptUrl: s.receipt_url || undefined
          })));
        }
        if (issues.length > 0) {
          setGiftShopIssues(issues.map((i: any) => ({
            id: i.id,
            productId: i.product_id,
            productName: i.product_name,
            quantity: i.quantity,
            type: i.type,
            date: i.created_at,
            reporter: i.reporter,
            notes: i.notes,
            itemCost: Number(i.item_cost)
          })));
        }
      } catch (error) {
        console.error('Failed to load gift shop DB state:', error);
      }
    };
    loadFromDb();
  }, []);

  useEffect(() => {
    if (userProfile?.name && !issueReporter) {
      setIssueReporter(userProfile.name);
    }
  }, [userProfile, issueReporter]);

  // Dynamic Catalogue — ONLY items explicitly added to POS from Gift Shop store (ST-GIFT)
  const products: Product[] = React.useMemo(() => {
    const shopItems = inventoryItems.filter(item =>
      item.storeId === 'ST-GIFT' && posActiveItemCodes.includes(item.code)
    );

    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      'Souvenirs': Gift,
      'Beverages': Coffee,
      'Crafts': Trophy,
      'Apparel': Shield,
      'Art': ImageIcon,
      'Stationery': Mail,
      'Essentials': Package,
      'General': Package,
      'Food & Beverage': Coffee,
      'Gift Shop': Gift,
      'Honey': Coffee,
      'Printing': Mail,
      'Consumables': Package,
      'Dairy': Coffee,
      'Meat & Poultry': Shield,
      'Bakery': Coffee,
      'Dry Foods': Package,
      'Cleaning Chemicals': Shield,
      'Electrical': Shield,
      'Plumbing': Shield,
      'HVAC': Shield,
      'Laundry Supplies': Shield,
    };

    return shopItems.map(item => {
      const catKey = item.subcategory || item.category || 'General';
      const Icon = iconMap[catKey] || iconMap[item.category] || Package;
      return {
        id: item.code,
        name: item.name,
        category: catKey,
        priceUsd: item.retailPrice || item.salePrice || (item.lastCost ? item.lastCost * 1.5 : 15),
        stock: item.currentStock,
        icon: Icon,
        description: item.brand ? `Brand: ${item.brand}` : `${catKey} item from Gift Shop store`
      };
    });
  }, [inventoryItems, posActiveItemCodes]);

  // Filtering products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Adding item to cart
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      let newCart;
      if (existing) {
        if (existing.quantity >= product.stock) {
          showNotification('error', `Cannot exceed available physical stock (${product.stock} units)`);
          return prev;
        }
        newCart = prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        newCart = [...prev, { product, quantity: 1 }];
      }
      updateTabField(selectedTabId, 'items', newCart);
      return newCart;
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      const item = prev.find(i => i.product.id === productId);
      if (!item) return prev;
      
      const nextQty = item.quantity + delta;
      let newCart;
      if (nextQty <= 0) {
        newCart = prev.filter(i => i.product.id !== productId);
      } else if (delta > 0 && nextQty > item.product.stock) {
        showNotification('error', `Cannot exceed available physical stock (${item.product.stock} units)`);
        return prev;
      } else {
        newCart = prev.map(i => i.product.id === productId ? { ...i, quantity: nextQty } : i);
      }
      updateTabField(selectedTabId, 'items', newCart);
      return newCart;
    });
  };

  const removeItem = (productId: string) => {
    setCart(prev => {
      const newCart = prev.filter(i => i.product.id !== productId);
      updateTabField(selectedTabId, 'items', newCart);
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    setDiscountPercent(0);
    setSelectedRoomId('');
    setCashAmountPaid('');
    // Clear walk-in info too
    setWalkInClientName('');
    setWalkInClientTIN('');
    setWalkInClientVATNo('');
    setWalkInClientVATDate('');
    setPaymentScreenshot(null);
    updateTabField(selectedTabId, 'items', []);
    updateTabField(selectedTabId, 'discountPercent', 0);
    updateTabField(selectedTabId, 'selectedRoomId', '');
    updateTabField(selectedTabId, 'cashAmountPaid', '');
    updateTabField(selectedTabId, 'walkInClientName', '');
    updateTabField(selectedTabId, 'walkInClientTIN', '');
    updateTabField(selectedTabId, 'walkInClientVATNo', '');
    updateTabField(selectedTabId, 'walkInClientVATDate', '');
    updateTabField(selectedTabId, 'paymentScreenshot', null);
  };

  const showNotification = (type: 'success' | 'error' | 'info', text: string) => {
    setAlertMessage({ type, text });
    setTimeout(() => {
      setAlertMessage(null);
    }, 4000);
  };

  // Process payment using the unified PaymentSystem splits
  const processPaymentWithSplits = async (splits: PaymentSplit[], receiptUrl?: string) => {
    if (cart.length === 0) {
      showNotification('error', 'Cannot process an empty checkout cart.');
      return;
    }

    // Generate invoice number via DB sequence (atomic, unique)
    const invoiceNum = await supabaseService.nextGiftShopInvoice();
    const dateStr = new Date().toISOString();

    const orderItems = cart.map(item => ({
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.priceUsd
    }));

    let targetReservation: any = null;
    const roomChargeSplit = splits.find(s => s.method === 'RoomCharge' || s.method === 'Room Charge' || s.method.includes('Room'));
    
    if (roomChargeSplit && roomChargeSplit.amount > 0) {
      if (!selectedRoomId) {
        showNotification('error', 'Please select an in-house room to post the folio charge portion!');
        return;
      }
      targetReservation = reservations.find(r => r.id === selectedRoomId);
      if (!targetReservation) {
        showNotification('error', 'Selected room reservation has expired or cannot be found for split folio post.');
        return;
      }
    }

    // Add folio charge if Room Charge is selected
    const names = cart.map(i => `${i.product.name} (x${i.quantity})`).join(', ');
    if (roomChargeSplit && roomChargeSplit.amount > 0) {
      try {
        addFolioCharge(selectedRoomId, {
          amount: roomChargeSplit.amount,
          description: `Gift Shop Purchase Split [Invoice: ${invoiceNum}]: ${names}`,
          // USALI tracking
          usaliCode: '6700',
          usaliRevenueCode: '6700',
          usaliCostCode: '6700',
          department: 'Gift Shop'
        });
      } catch (err) {
        showNotification('error', 'Folio split charge failed to submit. Try again.');
        return;
      }
    }

    const finalPaymentMethod = splits.length > 1
      ? `Split: ${splits.map(s => `${s.method} (${formatAmount(s.amount)})`).join(', ')}`
      : splits[0].method;

    const enrichedSplits = splits.map((split) => {
      const account = split.bankAccountId ? bankAccounts.find((a: any) => a.id === split.bankAccountId) : undefined;
      return {
        ...split,
        bankAccountName: account
          ? `${account.bank_name || account.account_name || account.name || account.bankName || 'Bank'}-${account.accountNumber || account.account_number || ''}`
          : undefined
      };
    });

    const transaction: SavedTransaction = {
      id: 'TXN-' + Date.now(),
      invoiceNumber: invoiceNum,
      date: dateStr,
      cashier: userProfile?.name || 'Front Desk Agent',
      items: orderItems,
      subtotal: subtotalUsd,
      tax: taxAmountUsd,
      total: totalUsd,
      paymentMethod: finalPaymentMethod as any,
      clientName: walkInClientName || (selectedRoomId ? reservations.find(r => r.id === selectedRoomId)?.guestName : '') || 'Walk-in Customer',
      clientTIN: walkInClientTIN,
      clientVATNo: walkInClientVATNo,
      clientVATDate: walkInClientVATDate,
      ...(targetReservation ? {
        roomChargeDetails: {
          reservationId: targetReservation.id,
          roomNumber: targetReservation.roomNumber || 'TBD',
          guestName: targetReservation.guestName
        }
      } : {}),
      splitPayments: enrichedSplits
    };

    // Decrement from central inventoryItems to sync physical multi-store stock counts
    cart.forEach(item => {
      const dbItem = inventoryItems.find(
        i => i.storeId === 'ST-GIFT' && i.code === item.product.id
      );
      if (dbItem) {
        const remaining = Math.max(0, dbItem.currentStock - item.quantity);
        updateInventoryItem(dbItem.id, {
          currentStock: remaining
        });
        if (remaining <= dbItem.reorderPoint) {
          console.warn(`Low stock warning: ${dbItem.name} reorder point reached! Current stock: ${remaining}`);
        }
      }
    });

    // Persist to Supabase
    const dbPayload = {
      invoice_number: invoiceNum,
      sale_date: dateStr,
      cashier: transaction.cashier,
      items: orderItems,
      subtotal: subtotalUsd,
      tax: taxAmountUsd,
      total: totalUsd,
      discount_percent: discountPercent,
      discount_amount: discountAmountUsd,
      payment_method: finalPaymentMethod,
      split_payments: enrichedSplits.length > 0 ? enrichedSplits : null,
      client_name: transaction.clientName,
      client_tin: transaction.clientTIN || null,
      client_vat_no: transaction.clientVATNo || null,
      client_vat_date: transaction.clientVATDate || null,
      room_charge_details: transaction.roomChargeDetails || null,
      change_given: 0,
      status: 'Completed'
    };

    try {
      console.log('[GiftShopPOS] Inserting sale to DB:', dbPayload);
      const insertedId = await supabaseService.insertGiftShopSale(dbPayload);
      
      showNotification('success', `Gift Shop sale completed successfully! Invoice: ${invoiceNum}`);
      
      // Clear cart after successful payment
      clearCart();
      
      // Update payment method for next transaction
      setPaymentMethod(splits[0].method);
      
    } catch (error) {
      console.error('[GiftShopPOS] Failed to insert sale:', error);
      showNotification('error', 'Failed to record sale. Please try again.');
    }
  };

  // Helper function to upload payment receipt screenshot to Supabase Storage
  const uploadPaymentReceipt = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { data, error } = await supabase.storage
        .from('payment-receipts')
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading receipt:', error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('payment-receipts')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading receipt:', error);
      return null;
    }
  };

  // Pricing math
  const subtotalUsd = cart.reduce((sum, item) => sum + (item.product.priceUsd * item.quantity), 0);
  const discountAmountUsd = (subtotalUsd * discountPercent) / 100;
  const taxableSubtotalUsd = subtotalUsd - discountAmountUsd;
  
  // Lodging default sales tax configuration
  const { formatTaxesAndFees } = useERP();
  const taxData = React.useMemo(() => formatTaxesAndFees(taxableSubtotalUsd), [formatTaxesAndFees, taxableSubtotalUsd]);
  
  const vatRate = globalHotelSettings?.taxPercent || 15;
  const taxAmountUsd = taxData.taxAmount;
  const totalUsd = taxData.totalWithTaxes;

  // Payment methods list
  const baseTypes = globalHotelSettings?.paymentTypes || ['Cash', 'Credit Card', 'Mobile Money', 'Bank Transfer'];
  const accounts = (chartOfAccounts || [])
    .filter(a => (a.subCategory === 'Bank' || a.subCategory === 'Cash') && a.isActive)
    .map(a => a.name);
  const allMethods = React.useMemo(() => {
    return Array.from(new Set([...baseTypes, ...accounts, 'RoomCharge']));
  }, [baseTypes, accounts]);

  const isRoomChargeOnly = paymentMethod === 'RoomCharge' || paymentMethod === 'Room Charge' || paymentMethod.includes('RoomCharge') || paymentMethod.includes('Room Charge');
  const isCashOnly = paymentMethod === 'Cash' || paymentMethod.includes('Cash');

  // Rooms active list (CheckedIn) to host room charge posting
  const activeInhouseRooms = reservations.filter(r => {
    const isCheckedIn = r.status === 'CheckedIn';
    if (!isCheckedIn) return false;
    
    if (searchTermRoom) {
      const search = searchTermRoom.toLowerCase();
      return r.guestName.toLowerCase().includes(search) || 
             (r.roomNumber && r.roomNumber.toLowerCase().includes(search));
    }
    return true;
  });

  // Re-calc exchange rate if currency is ETB for display
  const currentTotalDisplay = formatAmount(totalUsd);

  // Reconcile cash change
  const numericCashPaid = parseFloat(cashAmountPaid) || 0;
  const cashChangeNeededUsd = numericCashPaid > totalUsd ? (numericCashPaid - totalUsd) : 0;

  const handleAddGiftShopItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddItemCode) return;

    const selectedItem = inventoryItems.find(i => i.code === selectedAddItemCode);
    if (!selectedItem) {
      showNotification('error', 'Selected item not found in Gift Shop store.');
      return;
    }

    if (posActiveItemCodes.includes(selectedItem.code)) {
      showNotification('info', `"${selectedItem.name}" is already active in the POS catalog.`);
      setShowAddModal(false);
      return;
    }

    const newPrice = parseFloat(addItemPrice);
    if (!isNaN(newPrice) && newPrice >= 0) {
      updateInventoryItem(selectedItem.id, { retailPrice: newPrice });
    }

    if (addItemCategory) {
      updateInventoryItem(selectedItem.id, { subcategory: addItemCategory as any });
    }

    setPosActiveItemCodes(prev => [...prev, selectedItem.code]);
    showNotification('success', `"${selectedItem.name}" added to Gift Shop POS catalog.`);
    setSelectedAddItemCode('');
    setAddItemPrice('');
    setAddItemCategory('');
    setShowAddModal(false);
  };

  // Legacy handleCheckout - replaced by processPaymentWithSplits using PaymentSystem component
  const handleCheckout = async () => {
    // This function is no longer used - payment processing now handled by PaymentSystem component
    showNotification('info', 'Please use the Process Payment button to complete checkout.');
  };

  const voidTransaction = async (id: string) => {
    if (confirm('Are you absolutely sure you want to VOID this souvenir purchase record? This does not undo any active room ledger folio postings.')) {
      try {
        await supabaseService.updateGiftShopSaleStatus(id, 'Voided');
        setRecentTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'Voided' as any } : t));
        showNotification('success', 'Gift shop transactional docket voided.');
        addStructuredAuditLog({
          action: 'Void Gift Shop Sale',
          user: userProfile?.name || 'Front Desk Agent',
          target: id,
          details: 'Transaction status updated to Voided in database.'
        });
      } catch (err) {
        console.error('Failed to void transaction:', err);
        showNotification('error', 'Void failed to sync to database.');
      }
    }
  };

  const handleRegisterIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProductIdIssue) {
      showNotification('error', 'Please select a souvenir item.');
      return;
    }
    
    const product = products.find(p => p.id === selectedProductIdIssue);
    if (!product) {
      showNotification('error', 'Souvenir item not found.');
      return;
    }
    
    if (issueQuantity <= 0) {
      showNotification('error', 'Quantity must be at least 1.');
      return;
    }
    
    if (issueQuantity > product.stock) {
      showNotification('error', `Cannot write off more than current available stock (${product.stock} units).`);
      return;
    }

    const dbItem = inventoryItems.find(
      i => i.storeId === 'ST-GIFT' && i.code === selectedProductIdIssue
    );
    
    if (dbItem) {
      const remaining = Math.max(0, dbItem.currentStock - issueQuantity);
      updateInventoryItem(dbItem.id, {
        currentStock: remaining
      });
    }

    const newIssue: GiftShopIssue = {
      id: `ISS-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      quantity: issueQuantity,
      type: issueType,
      date: new Date().toISOString(),
      reporter: issueReporter || userProfile?.name || 'Duty Clerk',
      notes: issueNotes || 'No notes provided',
      itemCost: product.priceUsd * 0.6
    };

    try {
      console.log('[GiftShopPOS] Inserting issue to DB:', { product_id: newIssue.productId, type: newIssue.type });
      const insertedId = await supabaseService.insertGiftShopIssue({
        product_id: newIssue.productId,
        product_name: newIssue.productName,
        quantity: newIssue.quantity,
        type: newIssue.type,
        item_cost: newIssue.itemCost,
        notes: newIssue.notes,
        reporter: newIssue.reporter
      });
      console.log('[GiftShopPOS] DB issue insert returned:', insertedId);
      if (insertedId) {
        setGiftShopIssues(prev => [newIssue, ...prev]);
        addStructuredAuditLog({
          action: 'Gift Shop Issue Registered',
          user: userProfile?.name || 'Front Desk Agent',
          target: newIssue.productName,
          details: `${issueQuantity}x ${issueType}. Stock adjusted.`
        });
      } else {
        console.warn('[GiftShopPOS] DB issue insert returned null — check Supabase config / table existence / RLS policies.');
        showNotification('error', 'Issue logged locally but failed to sync to database (insert returned null).');
        setGiftShopIssues(prev => [newIssue, ...prev]);
      }
    } catch (err: any) {
      console.error('[GiftShopPOS] DB issue insert threw error:', err?.message || err);
      showNotification('error', `Issue sync failed: ${err?.message || 'Unknown DB error'}`);
      setGiftShopIssues(prev => [newIssue, ...prev]);
    }

    setSelectedProductIdIssue('');
    setIssueQuantity(1);
    setIssueNotes('');
    
    showNotification('success', `Logged ${issueQuantity}x "${product.name}" as ${issueType}. Stock updated.`);
  };

  const handleDeleteIssue = async (id: string) => {
    if (confirm('Reclaim/void this entry? This restores the stock count in the Central Inventory.')) {
      const issue = giftShopIssues.find(iss => iss.id === id);
      if (issue) {
        const dbItem = inventoryItems.find(
          i => i.storeId === 'ST-GIFT' && i.code === issue.productId
        );
        if (dbItem) {
          updateInventoryItem(dbItem.id, {
            currentStock: dbItem.currentStock + issue.quantity
          });
        }
      }
      try {
        await supabaseService.deleteGiftShopIssue(id);
        setGiftShopIssues(prev => prev.filter(iss => iss.id !== id));
        addStructuredAuditLog({
          action: 'Gift Shop Issue Voided',
          user: userProfile?.name || 'Front Desk Agent',
          target: id,
          details: 'Issue deleted and inventory stock replenished.'
        });
        showNotification('success', 'Entry voided. Stock counts replenished.');
      } catch (err) {
        console.error('Failed to delete gift shop issue:', err);
        showNotification('error', 'Failed to sync issue deletion to database.');
        setGiftShopIssues(prev => prev.filter(iss => iss.id !== id));
      }
    }
  };

  const filteredTransactions = recentTransactions.filter(t => t.date.startsWith(shiftJournalFilterDate));

  return (
    <div className="space-y-6 container mx-auto animate-fade-in text-slate-700 dark:text-slate-300" id="giftshop-pos-container">
      
      <div className="flex items-center justify-between bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Main Boutique POS</h2>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              Outlet: {globalHotelSettings.posOutlets?.find(o => o.toLowerCase().includes('gift') || o.toLowerCase().includes('boutique')) || 'Gift Shop'} / Store: ST-GIFT
            </p>
          </div>
        </div>
        
        <div className="flex bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'pos' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Checkout Desk
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'history' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Shift Journal
          </button>
          <button 
            onClick={() => setActiveTab('issues')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'issues' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <Ban size={13} /> Damaged & Lost
          </button>
        </div>
      </div>

      {alertMessage && (
        <div
          className={`px-4 py-3 rounded-xl flex items-center gap-2 text-xs border animate-slide-in shadow-md ${
            alertMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400'
              : alertMessage.type === 'info'
              ? 'bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-400'
              : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-450'
          }`}
          id="giftshop-toast"
        >
          {alertMessage.type === 'success' ? <Check size={14} className="text-emerald-500" /> : alertMessage.type === 'info' ? <Info size={14} className="text-sky-500" /> : <Info size={14} className="text-rose-500" />}
          <span className="font-semibold">{alertMessage.text}</span>
        </div>
      )}

      {/* RENDER POS MAIN WORKSPACE OR HISTORICAL REPORTS */}
      {activeTab === 'pos' ? (
        <>
        <div className="flex-1 grid lg:grid-cols-12 gap-6 min-h-[900px]" id="pos-grid-workspace">

          
          {/* LEFT SECTION (GRID CATALOGUE FILTER/SEARCH) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            
            {/* Search and Category Badges */}
            <div className="bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800/80 p-4 rounded-xl shadow-xs space-y-3 flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search craft items, souvenirs, postcards, local honey..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-900 dark:text-white font-medium"
                />
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="w-full md:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-slate-950 dark:text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-amber-500/20"
              >
                <Plus size={14} /> Add Item
              </button>
            </div>
            



              {/* Category Pills */}
              <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl self-start sm:self-auto gap-1 border dark:border-slate-800 overflow-x-auto max-w-md no-scrollbar">
                {['All', ...outletCategories].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat === 'All' ? 'all' : cat)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-mono font-black tracking-tight cursor-pointer transition-all whitespace-nowrap ${
                      (cat === 'All' ? 'all' : cat).toLowerCase() === selectedCategory.toLowerCase()
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            {/* </div>  <- removed this premature closing tag */}

            {/* PRODUCT CARD GRID */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white dark:bg-slate-905 border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center rounded-2xl flex flex-col items-center justify-center space-y-4">
                <ShoppingBag size={44} className="text-slate-300 dark:text-slate-700 animate-pulse" />
                <div>
                  <h4 className="font-sans font-extrabold text-slate-900 dark:text-white uppercase text-xs">No Boutique Products Found</h4>
                  <p className="text-4xs text-slate-400 font-mono mt-1 max-w-xs uppercase">
                    Check your search string or filter toggle categories. Our ledger handles 15 specialty stock items.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
                {filteredProducts.map(prod => {
                  const ProdIcon = prod.icon;
                  const inCartItem = cart.find(item => item.product.id === prod.id);
                  const isLowStock = prod.stock <= 4;
                  return (
                    <div 
                      key={prod.id}
                      className="bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-amber-400 dark:hover:border-amber-400/60 transition-all duration-200 group relative hover:shadow-2xs"
                    >
                      {/* Thumbnail Placeholder or category icons */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-950/60 border border-slate-200/40 dark:border-slate-800 flex items-center justify-center text-slate-650 dark:text-amber-500/80 shrink-0 select-none shadow-3xs">
                          <ProdIcon className="w-4 h-4 group-hover:scale-110 transition duration-150" />
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">{prod.id}</span>
                          <span className="text-xs font-mono font-black text-slate-900 dark:text-white mt-0.5 block">{formatAmount(prod.priceUsd)}</span>
                        </div>
                      </div>

                      <div className="mt-3.5 space-y-1">
                        <h4 className="text-xs font-sans font-bold text-slate-900 dark:text-stone-100 uppercase tracking-tight leading-tight group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                          {prod.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans leading-relaxed line-clamp-2">
                          {prod.description}
                        </p>
                      </div>

                      {/* Stock controls & action */}
                      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-50 dark:border-slate-850/50 pt-3">
                        <span className={`text-[9px] font-mono uppercase font-black ${
                          prod.stock === 0
                            ? 'text-rose-600'
                            : isLowStock
                            ? 'text-amber-500 animate-pulse'
                            : 'text-emerald-505'
                        }`}>
                          {prod.stock === 0 ? 'Out of Stock' : `Stock: ${prod.stock} Units`}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {editingPriceCode === prod.id ? (
                            <>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                autoFocus
                                value={editingPriceValue}
                                onChange={(e) => setEditingPriceValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const newPrice = parseFloat(editingPriceValue);
                                    if (!isNaN(newPrice) && newPrice >= 0) {
                                      const item = inventoryItems.find(i => i.code === prod.id);
                                      if (item) updateInventoryItem(item.id, { retailPrice: newPrice });
                                    }
                                    setEditingPriceCode(null);
                                  } else if (e.key === 'Escape') {
                                    setEditingPriceCode(null);
                                  }
                                }}
                                className="w-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-amber-500"
                              />
                              <button
                                onClick={() => {
                                  const newPrice = parseFloat(editingPriceValue);
                                  if (!isNaN(newPrice) && newPrice >= 0) {
                                    const item = inventoryItems.find(i => i.code === prod.id);
                                    if (item) updateInventoryItem(item.id, { retailPrice: newPrice });
                                  }
                                  setEditingPriceCode(null);
                                }}
                                className="p-1 text-emerald-500 hover:text-emerald-600 transition cursor-pointer"
                                title="Save price"
                              >
                                <Check size={12} strokeWidth={3} />
                              </button>
                              <button
                                onClick={() => setEditingPriceCode(null)}
                                className="p-1 text-slate-300 hover:text-slate-500 transition cursor-pointer"
                                title="Cancel"
                              >
                                <X size={12} strokeWidth={3} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingPriceCode(prod.id);
                                  setEditingPriceValue(String(prod.priceUsd));
                                }}
                                title="Edit retail price"
                                className="p-1 text-slate-300 hover:text-amber-500 transition cursor-pointer"
                              >
                                <Tag size={12} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Remove "${prod.name}" from the POS catalog?`)) {
                                    setPosActiveItemCodes(prev => prev.filter(code => code !== prod.id));
                                  }
                                }}
                                title="Remove from POS catalog"
                                className="p-1 text-slate-300 hover:text-rose-500 transition cursor-pointer"
                              >
                                <Ban size={12} />
                              </button>

                              {inCartItem ? (
                                <div className="flex items-center bg-amber-400 text-slate-950 rounded-lg border border-amber-500/30 overflow-hidden font-bold text-xs shadow-3xs">
                                  <button
                                    onClick={() => updateQuantity(prod.id, -1)}
                                    className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/40 transition cursor-pointer"
                                  >
                                    <Minus size={11} strokeWidth={3} />
                                  </button>
                                  <span className="px-2 font-mono">{inCartItem.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(prod.id, 1)}
                                    className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/40 transition cursor-pointer"
                                  >
                                    <Plus size={11} strokeWidth={3} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  disabled={prod.stock === 0}
                                  onClick={() => addToCart(prod)}
                                  className={`px-3 py-1 text-4xs font-mono tracking-wider font-extrabold uppercase rounded-lg border transition cursor-pointer select-none ${
                                    prod.stock === 0
                                      ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                                      : 'bg-white hover:bg-slate-950 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:text-white hover:border-slate-300 dark:hover:border-slate-705 shadow-3xs'
                                  }`}
                                >
                                  Add +1
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col overflow-hidden" id="pos-billing-cart">
            
            {/* ACTIVE TABS SELECTOR PANEL */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">Boutique Active Tab</h3>
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

              {/* Switches */}
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
            
            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 min-h-[371px]">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-3">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Empty Tab</p>
                </div>
              ) : (
                <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800/50">
                  {cart.map(item => (
                    <div key={item.product.id} className="pt-3 flex items-center justify-between gap-3 first:pt-0">
                      <div className="min-w-0">
                        <h5 className="text-[11px] font-sans font-bold text-slate-800 dark:text-slate-200 leading-tight truncate">
                          {item.product.name}
                        </h5>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                          {item.quantity} × {formatAmount(item.product.priceUsd)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-[11px] font-bold text-slate-950 dark:text-white">
                          {formatAmount(item.product.priceUsd * item.quantity)}
                        </span>
                        <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-950">
                          <button onClick={() => updateQuantity(item.product.id, -1)} className="px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer text-slate-500">-</button>
                          <span className="px-2 py-1 font-mono text-[10px] font-bold w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, 1)} className="px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer text-slate-500">+</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing Summary Block */}
            <div className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-900">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-150 dark:border-slate-850 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 text-3xs font-semibold uppercase">
                <span>Subtotal Items</span>
                <span className="font-mono">{formatAmount(subtotalUsd)}</span>
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

              {discountAmountUsd > 0 && (
                <div className="flex justify-between items-center text-rose-500 text-3xs font-semibold uppercase">
                  <span>Waiver Discount ({discountPercent}%)</span>
                  <span className="font-mono">- {formatAmount(discountAmountUsd)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 text-3xs font-semibold uppercase">
                <span>Sales VAT ({vatRate}%)</span>
                <span className="font-mono">{formatAmount(taxAmountUsd)}</span>
              </div>

              <div className="flex justify-between items-center font-black pb-0.5 border-t border-dashed border-slate-200 dark:border-slate-800 pt-2">
                <span className="text-slate-900 dark:text-white uppercase text-[11px]">Total Invoice</span>
                <span className="font-mono text-indigo-650 dark:text-amber-400 text-sm">{formatAmount(totalUsd)}</span>
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

              {/* UNIFIED PAYMENT SYSTEM - Using folio-style payment component */}
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-2.5 font-sans text-white">
                <button
                  type="button"
                  disabled={cart.length === 0}
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CreditCard size={12} /> Process Payment
                </button>
              </div>

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

        {/* Payment Modal */}
        <ModalSystem
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title="Payment Processing"
          variant="form"
          size="lg"
          showFooter={false}
        >
                <PaymentSystem
                  totalAmount={totalUsd}
                  availableMethods={allMethods}
                  currency={currency}
                  initialMethod={paymentMethod}
                  isRoomChargeAvailable={true}
                  selectedRoomId={selectedRoomId}
                  allowReceiptUpload={true}
                  requireReference={false}
                  requireBankAccount={true}
                  bankAccounts={bankAccounts}
                  onPaymentComplete={async (splits: PaymentSplit[], receiptUrl?: string) => {
                    // Process the payment using the splits from PaymentSystem
                    await processPaymentWithSplits(splits, receiptUrl);
                    setShowPaymentModal(false);
                  }}
                  onCancel={() => setShowPaymentModal(false)}
                />
        </ModalSystem>

      <ModalSystem
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Item to POS Catalog"
        subtitle="Select an item from the Gift Shop store to activate in POS"
        variant="form"
        size="lg"
        showFooter={false}
      >
            <form onSubmit={handleAddGiftShopItem} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-bold">Select Gift Shop Item</label>
                <select
                  required
                  value={selectedAddItemCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    setSelectedAddItemCode(code);
                    const item = inventoryItems.find(i => i.code === code);
                    setAddItemPrice(item ? String(item.retailPrice || item.salePrice || item.lastCost * 1.5) : '');
                    setAddItemCategory(item ? (item.subcategory || item.category || outletCategories[0] || 'General') : '');
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-500 font-semibold text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose an item from Gift Shop store --</option>
                  {inventoryItems
                    .filter(item => item.storeId === 'ST-GIFT' && !posActiveItemCodes.includes(item.code))
                    .map(item => (
                      <option key={item.code} value={item.code}>
                        {item.name} — {item.code} (Stock: {item.currentStock} {item.unit})
                      </option>
                    ))}
                </select>
                {inventoryItems.filter(item => item.storeId === 'ST-GIFT' && !posActiveItemCodes.includes(item.code)).length === 0 && (
                  <p className="text-[10px] text-slate-400 font-mono">All Gift Shop items are already in the POS catalog.</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-bold">Category</label>
                  <select
                    value={addItemCategory}
                    onChange={(e) => setAddItemCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-500 font-semibold text-slate-900 dark:text-white"
                  >
                    {outletCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-bold">Retail Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={addItemPrice}
                    onChange={(e) => setAddItemPrice(e.target.value)}
                    placeholder="e.g. 24.99"
                    className="w-full bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-500 font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={!selectedAddItemCode}
                className="w-full py-3 bg-amber-500 text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add to POS Catalog
              </button>
            </form>
      </ModalSystem>
      </>
      ) : activeTab === 'history' ? (
        /* SOUVENIR TRANSACTION history dockets */
        <div ref={shiftJournalRef} className="bg-white dark:bg-slate-905 border border-slate-205 dark:border-slate-800 p-5 rounded-2xl shadow-3xs space-y-4" id="historical-pos-records">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
            <div>
              <span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded uppercase tracking-wider font-extrabold">Core Ledgers</span>
              <h4 className="text-base font-sans font-black tracking-tight text-slate-900 dark:text-white uppercase mt-1">
                Boutique Shift Invoice Journal
              </h4>
            </div>
            
            <div className="flex gap-4 items-center text-xs">
              <input 
                type="date"
                value={shiftJournalFilterDate}
                onChange={(e) => setShiftJournalFilterDate(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 font-mono text-xs"
              />
              <button onClick={() => printElement(shiftJournalRef.current, 'Boutique Shift Invoice Journal')} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                <Printer size={14} /> Print
              </button>
              <button 
                onClick={() => {
                  const rows: string[][] = [];
                  filteredTransactions.forEach(t => {
                    rows.push(...formatTransactionRowsForCSV(t));
                  });
                  const csv = [
                    buildPaymentCSVHeader().join(','),
                    ...rows.map(r => r.join(','))
                  ].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `shift_journal_${shiftJournalFilterDate}.csv`;
                  a.click();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <Download size={14} /> Export
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <PaymentMethodSummary
              transactions={filteredTransactions}
              bankAccounts={bankAccounts}
              formatAmount={formatAmount}
            />
            <BankAccountSummary
              transactions={filteredTransactions}
              bankAccounts={bankAccounts}
              formatAmount={formatAmount}
            />
          </div>

          <div className="flex gap-4 items-center text-xs">
            <div className="bg-slate-50 dark:bg-slate-900 border px-3 py-1.5 rounded-xl text-slate-500 font-mono">
              Shift Total Collections:{' '}
              <strong className="text-slate-900 dark:text-white font-sans font-black">
                {formatAmount(filteredTransactions.reduce((sum, t) => sum + t.total, 0))}
              </strong>
            </div>
          </div>

          <POSPaymentAuditTable
            transactions={filteredTransactions.map(t => ({
              id: t.id,
              invoiceNumber: t.invoiceNumber,
              date: t.date,
              customerName: t.clientName || t.customerName || 'Walk-in Customer',
              items: t.items,
              paymentMethod: t.paymentMethod,
              splitPayments: t.splitPayments,
              status: t.status,
              receiptUrl: t.receiptUrl,
              total: t.total,
              subtotal: t.subtotal,
              tax: t.tax
            })) as PaymentAuditTransaction[]}
            bankAccounts={bankAccounts}
            formatAmount={formatAmount}
            emptyMessage="No boutique sales logs posted in current cashier shift cycle."
            onViewReceipt={(tx) => {
              if (tx.receiptUrl) window.open(tx.receiptUrl, '_blank', 'noopener,noreferrer');
            }}
            onPrintInvoice={(tx) => {
              const original = filteredTransactions.find(t => t.id === tx.id);
              setShowInvoicePrint(
                original || ({
                  ...tx,
                  cashier: userProfile?.name || 'Front Desk Agent',
                  clientName: tx.customerName
                } as SavedTransaction)
              );
            }}
            onVoidTransaction={(tx) => voidTransaction(tx.id)}
          />
        </div>
      ) : (
        /* SOUVENIR DAMAGES AND LOSS REGISTRATION */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in" id="damaged-lost-workspace">
          
          {/* Form left panel */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-905 border border-slate-205 dark:border-slate-800 p-5 rounded-2xl shadow-3xs space-y-4">
            <div>
              <span className="text-[9px] font-mono text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded uppercase tracking-wider font-extrabold">Boutique Inventory Adjustment</span>
              <h4 className="text-base font-sans font-black tracking-tight text-slate-900 dark:text-white uppercase mt-1">
                Log Damaged or Lost Item
              </h4>
              <p className="text-4xs text-slate-400 font-mono mt-1 uppercase leading-normal">
                Submit boutique inventory write-offs to correct physical stock layers and update central inventory nodes.
              </p>
            </div>

            <form onSubmit={handleRegisterIssue} className="space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">1. Select Artifact / Souvenir</label>
                <select
                  value={selectedProductIdIssue}
                  onChange={(e) => {
                    setSelectedProductIdIssue(e.target.value);
                    setIssueQuantity(1);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-250 focus:outline-none focus:ring-1 focus:ring-amber-400 font-sans"
                  required
                >
                  <option value="">-- Choose Boutique Item --</option>
                  {products.map((prod) => (
                    <option key={prod.id} value={prod.id}>
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
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-250 focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono font-bold"
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
                    max={selectedProductIdIssue ? products.find(p => p.id === selectedProductIdIssue)?.stock || 1 : 100}
                    value={issueQuantity}
                    onChange={(e) => setIssueQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-250 font-mono"
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
                  placeholder="Cashier or Front Desk Agent"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-250"
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
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-250 focus:outline-none focus:ring-1 focus:ring-amber-400 font-sans"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-500 text-white rounded-xl font-sans font-black uppercase text-3xs tracking-wider transition-all cursor-pointer"
              >
                Post Write-off Entry
              </button>
            </form>
          </div>

          {/* List right panel */}
          <div ref={damagedLostRef} className="lg:col-span-2 bg-white dark:bg-slate-905 border border-slate-205 dark:border-slate-800 p-5 rounded-2xl shadow-3xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
              <div>
                <span className="text-[9px] font-mono text-zinc-500 bg-zinc-500/10 px-2.5 py-0.5 rounded uppercase tracking-wider font-extrabold">Boutique Inventory Adjustment Log</span>
                <h4 className="text-base font-sans font-black tracking-tight text-slate-900 dark:text-white uppercase mt-1">
                  Physically Adjusted & Written-Off Items
                </h4>
              </div>
              
              <div className="flex gap-3 items-center">
                <div className="bg-slate-50 dark:bg-slate-900 border px-3 py-1.5 rounded-xl text-slate-500 font-mono text-3xs uppercase">
                  Active Audit Log Count:{' '}
                  <strong className="text-slate-950 dark:text-zinc-200 font-sans font-extrabold text-2xs">
                    {giftShopIssues.length} entries
                  </strong>
                </div>
                <button
                  onClick={() => printElement(damagedLostRef.current, 'Boutique Inventory Adjustment Log')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <Printer size={14} /> Print
                </button>
                <button
                  onClick={() => {
                    const csv = [
                      ['Date', 'Product', 'Quantity', 'Type', 'Notes', 'Reporter', 'Item Cost'].join(','),
                      ...giftShopIssues.map(i => [
                        i.date,
                        i.productName,
                        i.quantity,
                        i.type,
                        `"${(i.notes || '').replace(/"/g, '""')}"`,
                        i.reporter,
                        i.itemCost ?? ''
                      ].join(','))
                    ].join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `boutique_adjustment_log_${toISODate(new Date())}.csv`;
                    a.click();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <Download size={14} /> Export
                </button>
              </div>
            </div>

            {giftShopIssues.length === 0 ? (
              <div className="py-20 text-center text-slate-400 space-y-4 border border-dashed border-slate-250 dark:border-slate-800/60 rounded-xl">
                <Ban size={40} className="mx-auto text-slate-300 dark:text-slate-800" />
                <div>
                  <h5 className="font-sans font-bold text-slate-900 dark:text-white uppercase text-xs">No write-offs on file</h5>
                  <p className="text-4xs text-slate-400 font-mono mt-1 max-w-xs mx-auto uppercase">
                    All boutique souvenirs are currently accounted for. No damaged, broken or lost report logs filed in this audit period.
                  </p>
                </div>
              </div>
            ) : (
              <div className="border border-slate-150 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-3xs overflow-x-auto font-sans">
                <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 font-mono text-[9px] uppercase text-slate-405 sticky top-0 border-b border-slate-200 dark:border-slate-805">
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
                    {giftShopIssues.map((iss) => (
                      <tr key={iss.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 text-[11px]">
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
                              : 'bg-zinc-100 dark:bg-zinc-805/40 text-zinc-650 dark:text-zinc-400'
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
                            className="p-1 hover:bg-slate-205 dark:hover:bg-slate-800 rounded text-rose-500 transition cursor-pointer"
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
      )}

      {/* DETAILED PRINTABLE GUEST INVOICE RECEIPT MODAL */}
      {showInvoicePrint && (() => {
        const chargedRes = showInvoicePrint.roomChargeDetails?.reservationId
          ? reservations.find(r => r.id === showInvoicePrint.roomChargeDetails?.reservationId)
          : null;
        return (
          <UnifiedInvoiceTemplate 
            title="Boutique Purchase Receipt"
            invoiceNumber={showInvoicePrint.invoiceNumber}
            date={new Date(showInvoicePrint.date).toLocaleString()}
            customerName={chargedRes?.guestName || showInvoicePrint.roomChargeDetails?.guestName || showInvoicePrint.clientName || 'Walk-In Boutique Guest'}
            roomNo={showInvoicePrint.roomChargeDetails?.roomNumber}
            customerTin={chargedRes?.guestTin || showInvoicePrint.clientTIN}
            customerVatNo={chargedRes?.guestVatNo || showInvoicePrint.clientVATNo}
            customerVatDate={chargedRes?.guestVatDate || showInvoicePrint.clientVATDate}
            items={showInvoicePrint.items}
            subtotal={showInvoicePrint.subtotal}
            fees={[
              { label: `VAT/Sales Tax (${vatRate}%)`, amount: showInvoicePrint.tax }
            ]}
            total={showInvoicePrint.total}
            changeGiven={showInvoicePrint.changeGiven}
            payments={[
              { method: showInvoicePrint.paymentMethod, amount: showInvoicePrint.total }
            ]}
            balanceDue={0}
            isPOSReceipt={true}
            onClose={() => setShowInvoicePrint(null)}
            footerMessage="Thank you for supporting community arts! Boutique & Tourism Desk"
          />
        );
      })()}

      {invoicePrintData && (
        <UnifiedInvoiceTemplate 
          title="Boutique Purchase Receipt"
          invoiceNumber={invoicePrintData.invoiceNumber}
          date={invoicePrintData.date}
          customerName={invoicePrintData.customerName}
          customerEmail={invoicePrintData.customerEmail}
          roomNo={invoicePrintData.roomNo}
          customerTin={invoicePrintData.customerTin}
          customerVatNo={invoicePrintData.customerVatNo}
          customerVatDate={invoicePrintData.customerVatDate}
          items={invoicePrintData.items}
          subtotal={invoicePrintData.subtotalUsd}
          fees={invoicePrintData.fees}
          total={invoicePrintData.totalUsd}
          payments={[
            { method: invoicePrintData.paymentMethod, amount: invoicePrintData.totalUsd }
          ]}
          balanceDue={0}
          isPOSReceipt={true}
          onClose={() => setInvoicePrintData(null)}
          footerMessage="Thank you for supporting community arts! Boutique & Tourism Desk"
        />
      )}

      {/* Name New Gift Shop Tab Modal */}
      <ModalSystem
        isOpen={showNewTabModal}
        onClose={() => setShowNewTabModal(false)}
        title="Open New Boutique Tab"
        subtitle="Open guest draft tab ledgers"
        variant="form"
        size="md"
        showFooter={false}
      >
            <form onSubmit={handleCreateTab}>
               <div className="p-6 space-y-4">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold block">Boutique Tab Descriptor Name</label>
                     <input
                        type="text"
                        autoFocus
                        placeholder="e.g. Table 4 / Lounge VIP / Guest Smith"
                        value={newTabName}
                        onChange={(e) => setNewTabName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                     />
                  </div>
               </div>
               <div className="p-6 bg-slate-50 dark:bg-slate-850 border-t dark:border-slate-800 flex flex-col pt-4">
                  <button 
                    type="submit"
                    className="py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest transition cursor-pointer"
                  >
                     Register &amp; Activate
                  </button>
               </div>
            </form>
      </ModalSystem>

    </div>
  );

  // Helper inside loop to display accurate USD prices formatted
  function prodPrice(usdValue: number) {
    return formatAmount(usdValue);
  }
}
