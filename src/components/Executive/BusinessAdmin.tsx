import React, { useState } from 'react';
import { 
  Building2, 
  Save, 
  ShieldCheck, 
  CheckCircle2, 
  GitPullRequest, 
  Sliders, 
  AlertTriangle, 
  Plus, 
  X, 
  Check, 
  ArrowUpRight, 
  Clock, 
  Settings, 
  DollarSign, 
  Globe2, 
  History, 
  TrendingUp, 
  FileText, 
  Info,
  SlidersHorizontal,
  BookmarkCheck,
  ChevronRight,
  ShieldAlert,
  Trash2,
  Edit2,
  LayoutGrid,
  Printer,
  Store,
  CreditCard,
  Gavel
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useERP } from '../../context/ERPContext';

type AdminTab = 'details' | 'billing' | 'invoice_settings' | 'policies' | 'checkin_forms';

interface BankAccountItem {
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode?: string;
}

interface DatabaseBankAccount {
  id: string;
  account_name: string;
  bank_name: string;
  account_number: string;
  account_type: string;
  currency: string;
  is_active: boolean;
  is_default_for_sales: boolean;
  is_default_for_expenses: boolean;
  swift_bic_code?: string;
  branch_name?: string;
  branch_address?: string;
  description?: string;
  current_balance: number;
  coa_account_code?: string;
  department?: string;
  created_at: string;
}

const parseBankDetails = (text: string): BankAccountItem[] => {
  if (!text) return [];
  const accounts: BankAccountItem[] = [];
  try {
    if (text.trim().startsWith('[') && text.trim().endsWith(']')) {
      return JSON.parse(text);
    }
  } catch (e) {
    // fallback
  }

  const blocks = text.split(/\n\s*\n/);
  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;
    
    let bankName = lines[0];
    let accountName = '';
    let accountNumber = '';
    let swiftCode = '';

    for (const line of lines) {
      if (line.toLowerCase().startsWith('account name:')) {
        accountName = line.replace(/account name\s*:\s*/i, '').trim();
      } else if (line.toLowerCase().startsWith('account number:')) {
        accountNumber = line.replace(/account number\s*:\s*/i, '').trim();
      } else if (line.toLowerCase().startsWith('swift:')) {
        swiftCode = line.replace(/swift\s*:\s*/i, '').trim();
      }
    }

    if (!accountName && lines[1]) {
      accountName = lines[1].replace(/account name\s*:\s*/i, '').trim();
    }
    if (!accountNumber && lines[2]) {
      accountNumber = lines[2].replace(/account number\s*:\s*|account\s*:\s*/i, '').trim();
    }

    if (bankName) {
      accounts.push({
        bankName,
        accountName: accountName || 'Hotel Booking Account',
        accountNumber: accountNumber || '',
        swiftCode: swiftCode || undefined
      });
    }
  }
  return accounts;
};

const serializeBankDetails = (accounts: BankAccountItem[]): string => {
  return accounts.map(acc => {
    let block = `${acc.bankName}\nAccount Name: ${acc.accountName}\nAccount Number: ${acc.accountNumber}`;
    if (acc.swiftCode) {
      block += `\nSWIFT: ${acc.swiftCode}`;
    }
    return block;
  }).join('\n\n');
};

interface ChangeProposal {
  id: string;
  title: string;
  description: string;
  department: string;
  type: 'Policy' | 'Fee' | 'Configuration' | 'System';
  urgency: 'Low' | 'Medium' | 'High' | 'Emergency';
  proposer: string;
  dateProposed: string;
  status: 'Pending' | 'Approved' | 'Declined';
  effectedField?: string;
  effectedValue?: any;
}

interface BusinessAdminProps {
  initialTab?: AdminTab;
  showNav?: boolean;
}

export default function BusinessAdmin({ initialTab = 'details', showNav = true }: BusinessAdminProps) {
  const {
    globalHotelSettings,
    submitGlobalSettingsChange,
    currency,
    setCurrency,
    currentSystemDate,
    structuredAuditLogs,
    addStructuredAuditLog,
    inventoryItems,
    chartOfAccounts
  } = useERP();

  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [saveToast, setSaveToast] = useState<{ show: boolean; msg: string; type: 'success' | 'info' | 'error' }>({ show: false, msg: '', type: 'success' });

  // Hotel credentials local state
  const [hotelName, setHotelName] = useState(globalHotelSettings.customHotelName || 'Gheralta');
  const [hotelAddress, setHotelAddress] = useState(globalHotelSettings.customHotelAddress || 'Main Street, City, Country');
  const [hotelTin, setHotelTin] = useState(globalHotelSettings.hotelTin || '100293847');
  const [hotelVatNo, setHotelVatNo] = useState(globalHotelSettings.hotelVatNo || 'VAT-992384');
  const [hotelVatDate, setHotelVatDate] = useState(globalHotelSettings.hotelVatDate || '2026-01-15');
  const [hotelLogo, setHotelLogo] = useState(globalHotelSettings.hotelLogo || '');
  const [heroImage, setHeroImage] = useState(globalHotelSettings.heroImageUrl || '');
  
  // Custom business additions
  const [checkInTime, setCheckInTime] = useState('02:00 PM');
  const [checkOutTime, setCheckOutTime] = useState('11:00 AM');
  const [contactPhone, setContactPhone] = useState('+251 911 234 567');
  const [contactEmail, setContactEmail] = useState('info@hotel-erp.com');
  const [starRating, setStarRating] = useState('5');

  // Billing parameters local state
  const [exchangeRate, setExchangeRate] = useState(globalHotelSettings.exchangeRate || 120);
  const [feeComponents, setFeeComponents] = useState<import('../../types/erp').FeeComponent[]>(
    globalHotelSettings.feeComponents || [
      { id: 'fc_vat', name: 'VAT', feeType: 'percentage', value: 15, isEnabled: true, displayOrder: 1, accountCode: '2200' },
      { id: 'fc_sc', name: 'Service Charge', feeType: 'percentage', value: 10, isEnabled: true, displayOrder: 2, accountCode: '2300' }
    ]
  );
  const [newFeeName, setNewFeeName] = useState('');
  const [newFeeType, setNewFeeType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [newFeeValue, setNewFeeValue] = useState('');
  const [newFeeAccount, setNewFeeAccount] = useState('');
  const [splitFolioRules, setSplitFolioRules] = useState(globalHotelSettings.splitFolioRules || []);

  // Invoice parameters local state
  const [invoiceTemplate, setInvoiceTemplate] = useState(globalHotelSettings.invoiceTemplate || 'classic');
  const [invoiceFooterText, setInvoiceFooterText] = useState(globalHotelSettings.invoiceFooterText || 'Thank you for your stay. We hope you visit again.');
  const [invoiceBankDetails, setInvoiceBankDetails] = useState(globalHotelSettings.invoiceBankDetails || '');
  const [paymentTypesConfig, setPaymentTypesConfig] = useState((globalHotelSettings.paymentTypes || ['Cash', 'Credit Card', 'Mobile Money', 'Bank Transfer', 'Room Charge']).join(', '));

  const [bankAccounts, setBankAccounts] = useState<BankAccountItem[]>(() => {
    const raw = globalHotelSettings.invoiceBankDetails || '';
    if (!raw) {
      return [
        { bankName: 'Commercial Bank of Ethiopia (CBE)', accountName: 'SELEDA Luxury Resort Booking', accountNumber: '1000 4829 3819 1932', swiftCode: 'CBETETAA' },
        { bankName: 'Awash Bank', accountName: 'SELEDA Resort PLC', accountNumber: '0132 0293 4819 2831', swiftCode: 'AWABETAA' }
      ];
    }
    return parseBankDetails(raw);
  });

  // Database-backed bank accounts state
  const [dbBankAccounts, setDbBankAccounts] = useState<DatabaseBankAccount[]>([]);
  const [loadingBankAccounts, setLoadingBankAccounts] = useState(false);

  const [editingBankIndex, setEditingBankIndex] = useState<number | null>(null);
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    swiftCode: '',
    accountType: 'Business',
    currency: 'ETB',
    isDefaultForSales: false,
    isDefaultForExpenses: false,
    coaAccountCode: '',
    department: 'Finance'
  });
  const [showBankForm, setShowBankForm] = useState(false);
  const [isManualBankDetailsEdit, setIsManualBankDetailsEdit] = useState(false);

  // Fetch database-backed bank accounts
  React.useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    setLoadingBankAccounts(true);
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
          setDbBankAccounts(data.bankAccounts || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch bank accounts:', error);
    } finally {
      setLoadingBankAccounts(false);
    }
  };

  const saveBankAccount = async () => {
    if (!bankForm.bankName || !bankForm.accountName || !bankForm.accountNumber) {
      alert('Please fill in Bank Name, Account Name, and Account Number.');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const url = editingBankIndex !== null 
        ? `/api/finance/bank-accounts/${dbBankAccounts[editingBankIndex].id}`
        : '/api/finance/bank-accounts';
      
      const method = editingBankIndex !== null ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accountName: bankForm.accountName,
          bankName: bankForm.bankName,
          accountNumber: bankForm.accountNumber,
          accountType: bankForm.accountType,
          currency: bankForm.currency,
          swiftBicCode: bankForm.swiftCode || undefined,
          isDefaultForSales: bankForm.isDefaultForSales,
          isDefaultForExpenses: bankForm.isDefaultForExpenses
        })
      });

      if (response.ok) {
        await fetchBankAccounts();
        setShowBankForm(false);
        setEditingBankIndex(null);
        setBankForm({
          bankName: '',
          accountName: '',
          accountNumber: '',
          swiftCode: '',
          accountType: 'Business',
          currency: 'ETB',
          isDefaultForSales: false,
          isDefaultForExpenses: false,
          coaAccountCode: '',
          department: 'Finance'
        });
        setSaveToast({ show: true, msg: 'Bank account saved successfully', type: 'success' });
        setTimeout(() => setSaveToast({ show: false, msg: '', type: 'success' }), 3000);
      } else {
        const error = await response.json();
        alert('Failed to save bank account: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to save bank account:', error);
      alert('Failed to save bank account. Please try again.');
    }
  };

  const deleteBankAccount = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bank account?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/finance/bank-accounts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchBankAccounts();
        setSaveToast({ show: true, msg: 'Bank account deleted successfully', type: 'success' });
        setTimeout(() => setSaveToast({ show: false, msg: '', type: 'success' }), 3000);
      } else {
        alert('Failed to delete bank account');
      }
    } catch (error) {
      console.error('Failed to delete bank account:', error);
      alert('Failed to delete bank account. Please try again.');
    }
  };

  React.useEffect(() => {
    if (!isManualBankDetailsEdit) {
      setInvoiceBankDetails(serializeBankDetails(bankAccounts));
    }
  }, [bankAccounts, isManualBankDetailsEdit]);

  // Policies local state
  const [policiesForm, setPoliciesForm] = useState({
    cancellationGraceHours: globalHotelSettings.cancellationGraceHours || 24,
    cancellationPenaltyPercent: globalHotelSettings.cancellationPenaltyPercent || 50,
    creditLimitDefault: globalHotelSettings.creditLimitDefault || 500,
    autoNightAuditTime: globalHotelSettings.autoNightAuditTime || '02:00',
    opHoursFrontDesk: globalHotelSettings.operatingHours?.frontDesk || '24 Hours',
    opHoursRestaurant: globalHotelSettings.operatingHours?.restaurant || '06:00 - 23:00',
    opHoursBar: globalHotelSettings.operatingHours?.bar || '10:00 - 02:00',
    opHoursSpa: globalHotelSettings.operatingHours?.spa || '08:00 - 20:00',
  });

  // Check-in Form Settings local state
  const [checkinFormSettings, setCheckinFormSettings] = useState({
    individualTitle: globalHotelSettings.checkin_form_title || 'Check-In Registration Form',
    hotelName: globalHotelSettings.checkin_form_hotel_name || 'SELEDA HOTEL',
    individualTerms: globalHotelSettings.checkin_form_terms || '• Guest agrees to comply with all hotel rules and regulations.\n• Check-out time is 11:00 AM. Late check-out may incur additional charges.\n• The hotel is not responsible for lost or stolen items.\n• Payment for all charges is due upon check-out.\n• Cancellation policy applies as per reservation terms.',
    individualSignatureLabel: globalHotelSettings.checkin_form_signature_label || 'Guest Signature',
    individualSignatureHint: globalHotelSettings.checkin_form_signature_hint || 'Please sign above to confirm check-in',
    groupTitle: globalHotelSettings.group_checkin_form_title || 'Group Check-In Registration Form',
    groupTerms: globalHotelSettings.group_checkin_form_terms || '• Group contact person agrees to comply with all hotel rules and regulations on behalf of all group members.\n• Check-out time is 11:00 AM. Late check-out may incur additional charges.\n• The hotel is not responsible for lost or stolen items.\n• Payment for all charges is due upon check-out.\n• Cancellation policy applies as per reservation terms.\n• Group leader is responsible for all charges incurred by group members.',
    groupSignatureLabel: globalHotelSettings.group_checkin_form_signature_label || 'Group Leader Signature',
    groupSignatureHint: globalHotelSettings.group_checkin_form_signature_hint || 'Please sign above to confirm group check-in',
  });
  const [policySections, setPolicySections] = useState<{id: string, title: string, content: string}[]>(
    globalHotelSettings.policySections || [
      { id: '1', title: '🏨 Section 1: Standard Guest Liability Waiver', content: globalHotelSettings.termsAdventureLiability || "The Hotel is not responsible for any loss or damage to guest property during their stay." },
      { id: '2', title: '🔍 Section 2: Booking and Waitlist Protocol', content: globalHotelSettings.termsWaitlistProtocol || "All online booking registrations are subject to verification." },
      { id: '3', title: '🌱 Section 3: Environmental Guidelines', content: globalHotelSettings.termsConservationDevotion || "Guests are encouraged to be mindful of water and electricity consumption." },
      { id: '4', title: '💳 Section 4: Billing and Cancellation', content: globalHotelSettings.termsBillingCancellation || "A valid credit/debit card is required for all bookings." },
    ]
  );


  // Active Change Control Proposals
  const [proposals, setProposals] = useState<ChangeProposal[]>([
    {
      id: 'CHG-301',
      title: 'Modify Global Service Charge policy parameter',
      description: 'Request adjustment of service charge levy from 10% to 12.5% to finance expanded benefits for housekeeping team.',
      department: 'Finance',
      type: 'Fee',
      urgency: 'Medium',
      proposer: 'Finance Director',
      dateProposed: '2026-06-02',
      status: 'Pending',
      effectedField: 'serviceChargePercent',
      effectedValue: 12.5
    },
    {
      id: 'CHG-302',
      title: 'Deploy Winter Off-Season billing multiplier',
      description: 'Set off-season standard billing models. Reconfigure VAT exception rules for regional luxury stays.',
      department: 'Revenue Admin',
      type: 'Configuration',
      urgency: 'High',
      proposer: 'General Manager',
      dateProposed: '2026-06-03',
      status: 'Pending'
    },
    {
      id: 'CHG-303',
      title: 'Update global baseline exchange ceiling',
      description: 'Authorize an update to our administrative exchange rate index, locking it at a new rate to conform to official bank mid-rates.',
      department: 'Treasury',
      type: 'Configuration',
      urgency: 'High',
      proposer: 'Chief Treasurer',
      dateProposed: '2026-06-03',
      status: 'Pending',
      effectedField: 'exchangeRate',
      effectedValue: 125
    },
    {
      id: 'CHG-304',
      title: 'Change checkout grace limit thresholds',
      description: 'Implement a strict 45-minute checkout extension grace limit across all premium tier resort suites.',
      department: 'Front Office',
      type: 'Policy',
      urgency: 'Low',
      proposer: 'Front Office Supervisor',
      dateProposed: '2026-06-01',
      status: 'Approved'
    }
  ]);

  // Create Change proposal form
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDept, setNewDept] = useState('Operations');
  const [newType, setNewType] = useState<'Policy' | 'Fee' | 'Configuration' | 'System'>('Configuration');
  const [newUrgency, setNewUrgency] = useState<'Low' | 'Medium' | 'High' | 'Emergency'>('Medium');

  const triggerToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setSaveToast({ show: true, msg, type });
    setTimeout(() => {
      setSaveToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const saveHotelDetails = (e: React.FormEvent) => {
    e.preventDefault();
    submitGlobalSettingsChange(
      'Update Hotel Details',
      `Property profile: ${hotelName}, Address: ${hotelAddress}, TIN: ${hotelTin}, VAT: ${hotelVatNo}`,
      'property-config',
      {
        customHotelName: hotelName,
        customHotelAddress: hotelAddress,
        hotelTin: hotelTin,
        hotelVatNo: hotelVatNo,
        hotelVatDate: hotelVatDate,
        hotelLogo,
        heroImageUrl: heroImage,
        checkInTime,
        checkOutTime,
        contactPhone,
        contactEmail,
        starRating
      }
    );

    addStructuredAuditLog({
      action: 'UPDATE_HOTEL_INFO',
      user: 'Superadmin (Platform)',
      details: `Modified primary hotel credentials. Name: "${hotelName}", Location: "${hotelAddress}".`,
      ipAddress: '192.168.1.10',
      status: 'Success',
      severity: 'Medium'
    });

    triggerToast('Primary Hotel Details successfully saved & deployed!', 'success');
  };

  const saveBillingParams = (e: React.FormEvent) => {
    e.preventDefault();

    // Derive legacy taxPercent/serviceChargePercent from fee components for backward compat
    const vatFee = feeComponents.find(f => f.name.toLowerCase().includes('vat') && f.isEnabled);
    const scFee = feeComponents.find(f => f.name.toLowerCase().includes('service charge') && f.isEnabled);

    submitGlobalSettingsChange(
      'Update Billing & Tax Configuration',
      `Exchange rate: ${exchangeRate}, Fees: ${feeComponents.filter(f => f.isEnabled).map(f => `${f.name} ${f.value}${f.feeType === 'percentage' ? '%' : ''}`).join(', ')}`,
      'revenue-mapping',
      {
        exchangeRate: Number(exchangeRate),
        feeComponents: feeComponents.map(f => ({ ...f })),
        taxPercent: vatFee ? vatFee.value : 0,
        serviceChargePercent: scFee ? scFee.value : 0,
        splitFolioRules
      }
    );

    addStructuredAuditLog({
      action: 'UPDATE_BILLING_CONFIG',
      user: 'Superadmin (Platform)',
      details: `Adjusted global fee components: ${feeComponents.filter(f => f.isEnabled).map(f => `${f.name} ${f.value}${f.feeType === 'percentage' ? '%' : ''}`).join(', ')}, Pegged Rate: ${exchangeRate} ETB.`,
      ipAddress: '192.168.1.10',
      status: 'Success',
      severity: 'High'
    });

    triggerToast('Billing matrices & exchange rates updated globally!', 'success');
  };

  const saveInvoiceSettings = (e: React.FormEvent) => {
    e.preventDefault();
    submitGlobalSettingsChange(
      'Update Invoice & Payment Settings',
      `Invoice template: ${invoiceTemplate}, Footer: ${invoiceFooterText}, Payment types: ${paymentTypesConfig.split(',').map(s => s.trim()).filter(Boolean).join(', ')}`,
      'global-setting',
      {
        invoiceTemplate: invoiceTemplate as any,
        invoiceFooterText,
        invoiceBankDetails,
        paymentTypes: paymentTypesConfig.split(',').map(s => s.trim()).filter(Boolean)
      }
    );

    addStructuredAuditLog({
      action: 'UPDATE_INVOICE_CONFIG',
      user: 'Superadmin (Platform)',
      details: `Adjusted invoice template, payment types, and footer details.`,
      ipAddress: '192.168.1.10',
      status: 'Success',
      severity: 'Medium'
    });

    triggerToast('Invoice & payment settings updated globally!', 'success');
  };

  const savePoliciesSettings = (e: React.FormEvent) => {
    e.preventDefault();
    submitGlobalSettingsChange(
      'Operational Policies Update',
      `Cancellation grace: ${policiesForm.cancellationGraceHours}h, Penalty: ${policiesForm.cancellationPenaltyPercent}%, Credit limit: ${policiesForm.creditLimitDefault}, Night audit: ${policiesForm.autoNightAuditTime}`,
      'operational-policy',
      {
        cancellationGraceHours: Number(policiesForm.cancellationGraceHours),
        cancellationPenaltyPercent: Number(policiesForm.cancellationPenaltyPercent),
        creditLimitDefault: Number(policiesForm.creditLimitDefault),
        autoNightAuditTime: policiesForm.autoNightAuditTime,
        operatingHours: {
          frontDesk: policiesForm.opHoursFrontDesk,
          restaurant: policiesForm.opHoursRestaurant,
          bar: policiesForm.opHoursBar,
          spa: policiesForm.opHoursSpa
        },
        policySections,
        termsAdventureLiability: policySections[0]?.content || '',
        termsWaitlistProtocol: policySections[1]?.content || '',
        termsConservationDevotion: policySections[2]?.content || '',
        termsBillingCancellation: policySections[3]?.content || '',
      }
    );

    addStructuredAuditLog({
      action: 'UPDATE_POLICIES_CONFIG',
      user: 'Superadmin (Platform)',
      details: `Updated operational policies, cancellation rules, and terms & conditions.`,
      ipAddress: '192.168.1.10',
      status: 'Success',
      severity: 'High'
    });

    triggerToast('Operational policies updated successfully!', 'success');
  };

  const saveCheckinFormSettings = (e: React.FormEvent) => {
    e.preventDefault();
    submitGlobalSettingsChange(
      'Check-In Form Settings Update',
      `Updated check-in form titles, terms, and signature labels`,
      'checkin-form-config',
      {
        checkin_form_title: checkinFormSettings.individualTitle,
        checkin_form_hotel_name: checkinFormSettings.hotelName,
        checkin_form_terms: checkinFormSettings.individualTerms,
        checkin_form_signature_label: checkinFormSettings.individualSignatureLabel,
        checkin_form_signature_hint: checkinFormSettings.individualSignatureHint,
        group_checkin_form_title: checkinFormSettings.groupTitle,
        group_checkin_form_terms: checkinFormSettings.groupTerms,
        group_checkin_form_signature_label: checkinFormSettings.groupSignatureLabel,
        group_checkin_form_signature_hint: checkinFormSettings.groupSignatureHint,
      }
    );

    addStructuredAuditLog({
      action: 'UPDATE_CHECKIN_FORM_CONFIG',
      user: 'Superadmin (Platform)',
      details: `Updated check-in form settings for individual and group check-ins.`,
      ipAddress: '192.168.1.10',
      status: 'Success',
      severity: 'Medium'
    });

    triggerToast('Check-in form settings updated successfully!', 'success');
  };




  const handleProposalDecision = (id: string, decision: 'Approved' | 'Declined') => {
    setProposals(prev => prev.map(p => {
      if (p.id !== id) return p;
      
      const updated = { ...p, status: decision };

      return updated;
    }));

    const targetProp = proposals.find(p => p.id === id);
    const label = targetProp ? targetProp.title : id;

    addStructuredAuditLog({
      action: `CHANGE_CONTROL_${decision.toUpperCase()}`,
      user: 'Administrator (Business Admin)',
      details: `${decision} business change request: "${label}" (${id}).`,
      ipAddress: '192.168.1.45',
      status: 'Success',
      severity: 'High'
    });

    triggerToast(`Proposal ${id} was successfully ${decision.toLowerCase()}!`, decision === 'Approved' ? 'success' : 'info');
  };

  const submitNewChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const newId = `CHG-${Math.floor(305 + Math.random() * 100)}`;
    const newProp: ChangeProposal = {
      id: newId,
      title: newTitle,
      description: newDesc,
      department: newDept,
      type: newType,
      urgency: newUrgency,
      proposer: 'Administrator',
      dateProposed: currentSystemDate,
      status: 'Pending'
    };

    setProposals(prev => [newProp, ...prev]);
    setShowApplyModal(false);

    addStructuredAuditLog({
      action: 'CHANGE_CONTROL_PROPOSED',
      user: 'Administrator (Proposer)',
      details: `Initiated active business configuration proposal: "${newTitle}" (${newId}).`,
      ipAddress: '192.168.1.45',
      status: 'Success',
      severity: 'Medium'
    });

    triggerToast(`New change initiative ${newId} submitted for review!`, 'success');
    setNewTitle('');
    setNewDesc('');
  };

  const currentConfigLogs = structuredAuditLogs.filter(
    log => log.action?.includes('HOTEL') || log.action?.includes('BILLING') || log.action?.includes('CHANGE_CONTROL')
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 space-y-4" id="business-admin-viewport">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {saveToast.show && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-sans font-bold border border-emerald-100 ${
              saveToast.type === 'success' ? 'bg-emerald-50 text-emerald-800' :
              saveToast.type === 'error' ? 'bg-rose-50 text-rose-800' : 'bg-indigo-50 text-indigo-800'
            }`}
          >
            <CheckCircle2 size={16} className={saveToast.type === 'success' ? "text-emerald-600" : "text-indigo-600"} />
            <span>{saveToast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-6 pt-4 flex justify-center">
        <div className="flex flex-wrap bg-slate-100 p-1 border border-slate-200 rounded-xl gap-1">
          <button 
            id="tab-details"
            onClick={() => setActiveTab('details')}
            className={`px-3 py-2 flex items-center gap-2 rounded-lg text-[10px] font-sans font-black uppercase tracking-wider transition ${
              activeTab === 'details' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 bg-white'
            }`}
          >
            <Building2 size={13} />
            Profile
          </button>
          <button 
            id="tab-billing"
            onClick={() => setActiveTab('billing')}
            className={`px-3 py-2 flex items-center gap-2 rounded-lg text-[10px] font-sans font-black uppercase tracking-wider transition ${
              activeTab === 'billing' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 bg-white'
            }`}
          >
            <Sliders size={13} />
            Billing
          </button>
          <button 
            id="tab-invoice-settings"
            onClick={() => setActiveTab('invoice_settings')}
            className={`px-3 py-2 flex items-center gap-2 rounded-lg text-[10px] font-sans font-black uppercase tracking-wider transition ${
              activeTab === 'invoice_settings' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 bg-white'
            }`}
          >
            <FileText size={13} />
            Invoicing
          </button>
          <button
            id="tab-policies"
            onClick={() => setActiveTab('policies')}
            className={`px-3 py-2 flex items-center gap-2 rounded-lg text-[10px] font-sans font-black uppercase tracking-wider transition ${
              activeTab === 'policies' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 bg-white'
            }`}
          >
            <Gavel size={13} />
            Policies
          </button>
          <button
            id="tab-checkin-forms"
            onClick={() => setActiveTab('checkin_forms')}
            className={`px-3 py-2 flex items-center gap-2 rounded-lg text-[10px] font-sans font-black uppercase tracking-wider transition ${
              activeTab === 'checkin_forms' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 bg-white'
            }`}
          >
            <FileText size={13} />
            Check-In Forms
          </button>
        </div>
      </div>

      {/* WORKSPACE AREA */}
      <div className="flex-1 overflow-y-auto pb-8">
        
        {/* TAB 1: HOTEL DETAILS */}
        {activeTab === 'details' && (
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            
            {/* Form column */}
            <form onSubmit={saveHotelDetails} className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 space-y-6 shadow-sm" id="hotel-profile-form">
              <div>
                <h3 className="text-sm font-sans font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-1">
                  <Building2 size={16} className="text-indigo-600" />
                  Primary Lodge Identity
                </h3>
                <p className="text-xs text-slate-400">Legal corporate details shown on official invoices, folios, and registries.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-450 font-bold block">Trade Name / Brand</label>
                  <input 
                    type="text" 
                    value={hotelName} 
                    onChange={e => setHotelName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-sans focus:ring-1 focus:ring-indigo-600 focus:outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-450 font-bold block">Physical Address</label>
                  <input 
                    type="text" 
                    value={hotelAddress} 
                    onChange={e => setHotelAddress(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-sans focus:ring-1 focus:ring-indigo-600 focus:outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-450 font-bold block">TIN Certificate</label>
                  <input 
                    type="text" 
                    value={hotelTin} 
                    onChange={e => setHotelTin(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-mono focus:ring-1 focus:ring-indigo-600 focus:outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-450 font-bold block">VAT Registration Number</label>
                  <input 
                    type="text" 
                    value={hotelVatNo} 
                    onChange={e => setHotelVatNo(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-mono focus:ring-1 focus:ring-indigo-600 focus:outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-450 font-bold block">VAT Activation Date</label>
                  <input 
                    type="date" 
                    value={hotelVatDate} 
                    onChange={e => setHotelVatDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-mono focus:ring-1 focus:ring-indigo-600 focus:outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-450 font-bold block">Hotel Logo URL</label>
                  <input 
                    type="url" 
                    value={hotelLogo} 
                    onChange={e => setHotelLogo(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-sans focus:ring-1 focus:ring-indigo-600 focus:outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-450 font-bold block">Hero Image URL</label>
                  <input 
                    type="url" 
                    value={heroImage} 
                    onChange={e => setHeroImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-sans focus:ring-1 focus:ring-indigo-600 focus:outline-none" 
                  />
                </div>
              </div>

              <hr className="border-slate-100" />
              
              <div>
                <h3 className="text-sm font-sans font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-1">
                  <Clock size={16} className="text-indigo-600" />
                  Service & Operator Settings
                </h3>
                <p className="text-xs text-slate-400">Times and contacts loaded for auto check-in protocols and guest alerts.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-450 font-bold block">Standard Check-In Hour</label>
                  <input 
                    type="text" 
                    value={checkInTime} 
                    onChange={e => setCheckInTime(e.target.value)}
                    placeholder="e.g. 02:00 PM"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-sans focus:ring-1 focus:ring-indigo-600 focus:outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-450 font-bold block">Standard Check-Out Hour</label>
                  <input 
                    type="text" 
                    value={checkOutTime} 
                    onChange={e => setCheckOutTime(e.target.value)}
                    placeholder="e.g. 11:00 AM"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-sans focus:ring-1 focus:ring-indigo-600 focus:outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-450 font-bold block">Reception Contact Phone</label>
                  <input 
                    type="text" 
                    value={contactPhone} 
                    onChange={e => setContactPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-sans focus:ring-1 focus:ring-indigo-600 focus:outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-450 font-bold block">Public Email Channel</label>
                  <input 
                    type="email" 
                    value={contactEmail} 
                    onChange={e => setContactEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-sans focus:ring-1 focus:ring-indigo-600 focus:outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-450 font-bold block">Hotel Brand Rating (Stars)</label>
                  <select 
                    value={starRating} 
                    onChange={e => setStarRating(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-sans focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                  >
                    <option value="3">3 Star Boutique</option>
                    <option value="4">4 Star Premium</option>
                    <option value="5">5 Star Ultra Luxury Resort</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  id="btn-save-details"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition flex items-center gap-2 shadow-md shadow-indigo-100"
                >
                  <Save size={14} />
                  Deploy Identity Parameters
                </button>
              </div>
            </form>

            {/* Sidebar metadata column */}
            <div className="space-y-6">
              <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden">
                <div className="absolute right-[-10px] top-[-10px] opacity-10">
                  <Building2 size={120} />
                </div>
                <span className="inline-block px-2.5 py-1 bg-white/10 rounded text-[9px] uppercase font-mono font-black tracking-widest">Active System State</span>
                <h4 className="text-lg font-black tracking-tight">{hotelName}</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{hotelAddress}</p>
                <div className="pt-2 border-t border-white/10 flex justify-between text-3xs font-mono text-slate-400">
                  <span>SYSTEM SECURE: YES</span>
                  <span>SYSTEM DATE: {currentSystemDate}</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
                <h4 className="text-xs font-sans font-black uppercase tracking-wider text-slate-850 flex items-center gap-1.5">
                  <BookmarkCheck size={14} className="text-indigo-600" />
                  Taxes & Invoicing Check
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">Ensure active validation settings matches local revenue authorities criteria. Incorrect TIN configurations may lead to failure logs in Night Audit processing pipelines.</p>
                <div className="p-3 bg-indigo-50 border border-indigo-100/50 rounded-xl text-indigo-900 text-xs flex gap-2">
                  <Info size={16} className="text-indigo-600 shrink-0" />
                  <span>State invoices will generate utilizing physical and legal info declared on the left.</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: BILLING & TOLLS */}
        {activeTab === 'billing' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <form onSubmit={saveBillingParams} className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 shadow-sm" id="billing-config-form">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-sans font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-1">
                    <Sliders size={16} className="text-indigo-600" />
                    Exchange, Taxes & Fees Matrix
                  </h3>
                  <p className="text-xs text-slate-400">Global variables used by checkout modules to compute line charges and foreign currencies.</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-3xs font-mono uppercase text-slate-450 font-bold">Base Workspace Default Currency:</span>
                  <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200">
                    <button 
                      type="button"
                      onClick={() => setCurrency('USD')}
                      className={`px-3 py-1 text-3xs font-sans font-bold uppercase rounded-lg transition ${currency === 'USD' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'}`}
                    >
                      USD ($)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setCurrency('ETB')}
                      className={`px-3 py-1 text-3xs font-sans font-bold uppercase rounded-lg transition ${currency === 'ETB' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'}`}
                    >
                      ETB (Br)
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-6 pt-2">
                <div className="space-y-2 p-5 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-200/60 transition">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-450 font-bold block">USD Exchange Rate (ETB)</label>
                  <p className="text-[11px] text-slate-400 leading-tight">System pegged parity rate for converting room charges to native ETB.</p>
                  <div className="relative pt-2">
                    <input
                      type="number"
                      value={exchangeRate}
                      onChange={e => setExchangeRate(Number(e.target.value))}
                      className="w-full px-4 py-2.5 pl-12 bg-white border border-slate-250 rounded-xl text-xs font-sans font-bold focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                    />
                    <span className="absolute left-3 top-5 text-slate-400 text-3xs font-mono font-bold">1 USD =</span>
                    <span className="absolute right-3 top-5 text-slate-400 text-3xs font-mono font-bold">ETB</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-dashed border-slate-200 rounded-2xl flex items-center justify-between text-xs bg-slate-50/20">
                <div className="flex gap-2 items-center">
                  <Globe2 size={16} className="text-indigo-600" />
                  <span className="text-slate-600">Active Peg: <strong className="text-slate-800">1.00 USD = {globalHotelSettings.exchangeRate} ETB</strong></span>
                  <span className="mx-2 text-slate-200">|</span>
                  <span className="text-slate-650">Fee Formula: <strong className="text-slate-850">Base Price + {feeComponents.filter(f => f.isEnabled).map(f => `${f.name} ${f.value}${f.feeType === 'percentage' ? '%' : ''}`).join(' + ')}</strong></span>
                </div>
                <div className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-black uppercase">Live Deployed Parameters</div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Fee Components</h3>
                  <p className="text-[11px] text-slate-500">Configure taxes, service charges, environmental fees, and other surcharges applied to folio charges. Percentage fees are calculated on the base amount. Fixed amount fees are added as-is.</p>
                </div>

                <div className="space-y-2">
                  {(feeComponents || []).map((fee, index) => (
                    <div key={fee.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFeeComponents(prev => prev.map((f, i) => i === index ? { ...f, isEnabled: !f.isEnabled } : f))}
                        className={`p-2 rounded-lg text-xs font-bold transition ${fee.isEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}
                        title={fee.isEnabled ? 'Active' : 'Disabled'}
                      >
                        {fee.isEnabled ? 'ON' : 'OFF'}
                      </button>
                      <div className="flex-1 bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 font-bold">
                        {fee.name}
                      </div>
                      <div className="w-20 bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 font-mono text-right">
                        {fee.feeType === 'percentage' ? `${fee.value}%` : `$${fee.value}`}
                      </div>
                      <div className="w-24 bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-500 text-center">
                        {fee.feeType === 'percentage' ? 'Percentage' : 'Fixed'}
                      </div>
                      <input
                        type="number"
                        value={fee.value}
                        onChange={e => setFeeComponents(prev => prev.map((f, i) => i === index ? { ...f, value: Number(e.target.value) } : f))}
                        className="w-20 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-center"
                      />
                      <button
                        type="button"
                        onClick={() => setFeeComponents(prev => prev.filter((_, i) => i !== index))}
                        className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                  <div className="flex items-center gap-2 pt-2 flex-wrap">
                    <input
                      type="text"
                      placeholder="e.g. Environmental Tax"
                      value={newFeeName}
                      onChange={e => setNewFeeName(e.target.value)}
                      className="flex-1 min-w-[140px] px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <select
                      value={newFeeType}
                      onChange={e => setNewFeeType(e.target.value as any)}
                      className="w-28 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed_amount">Fixed $</option>
                    </select>
                    <input
                      type="number"
                      placeholder={newFeeType === 'percentage' ? '%' : '$'}
                      value={newFeeValue}
                      onChange={e => setNewFeeValue(e.target.value)}
                      className="w-24 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-center"
                    />
                    <select
                      value={newFeeAccount}
                      onChange={e => setNewFeeAccount(e.target.value)}
                      className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">Account</option>
                      {(chartOfAccounts || []).map(a => (
                        <option key={a.code} value={a.code}>{a.code} - {a.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (newFeeName.trim() && newFeeValue) {
                          setFeeComponents(prev => [...prev, {
                            id: `fc-${Date.now()}`,
                            name: newFeeName.trim(),
                            feeType: newFeeType,
                            value: Number(newFeeValue),
                            isEnabled: true,
                            displayOrder: prev.length + 1,
                            accountCode: newFeeAccount || undefined
                          }]);
                          setNewFeeName('');
                          setNewFeeValue('');
                          setNewFeeAccount('');
                        }
                      }}
                      disabled={!newFeeName.trim() || !newFeeValue}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase disabled:opacity-50"
                    >
                      Add Fee
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <SettingListManager
                  title="Accepted Payment Methods"
                  icon={<CreditCard size={14} />}
                  items={globalHotelSettings.paymentTypes || []}
                  onUpdate={(items) => submitGlobalSettingsChange('Payment Methods', `Update accepted payment methods: ${items.join(', ') || 'none'}`, 'global-setting', { paymentTypes: items })}
                  placeholder="Add payment method..."
                />
              </div>

              {/* CORPORATE SPLIT-FOLIO ROUTING ENGINE CONFIGURATION */}
              <div className="pt-6 border-t border-slate-150 space-y-4">
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-slate-450 font-bold block mb-1">
                    💼 Corporate Split-Folio Routing Engine
                  </h3>
                  <p className="text-xs text-slate-400">
                    Define automated billing profiles used by the checkout register to split room rates/tariffs into corporate A-Folios and personal discretionary services (spa, minibar, lounge) into guest B-Folios.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-1">
                  {(splitFolioRules || []).map((rule, index) => (
                    <div key={rule.id || index} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 transition shadow-2xs">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-sans font-black uppercase text-slate-800 tracking-tight">{rule.name}</span>
                          {rule.corporateBillingOnly && (
                            <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-[9px] text-indigo-700 font-sans font-extrabold rounded-full uppercase tracking-wider">Corporate Standard</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-450 leading-normal">{rule.description}</p>
                        
                        <div className="flex flex-wrap gap-2 pt-1 font-mono text-[9px]">
                          <div className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                            <strong>A-Folio Primary:</strong> <span className="font-sans font-bold text-emerald-700">{rule.primaryTypes.join(', ') || 'No corporate routing'}</span>
                          </div>
                          <div className="bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-100 flex items-center gap-1">
                            <strong>B-Folio Personal:</strong> <span className="font-sans font-bold text-amber-700">{rule.secondaryTypes.join(', ') || 'All charges'}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSplitFolioRules(prev => prev.filter((_, i) => i !== index));
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition duration-150 shrink-0 self-start md:self-center"
                        title="Delete Billing Rule Profile"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}

                  {/* Add New Custom Profile Form */}
                  <div className="p-5 border border-dashed border-slate-200 hover:bg-slate-50/10 rounded-2xl space-y-4 bg-slate-50/20">
                    <div className="flex items-center gap-2">
                      <Plus size={14} className="text-indigo-600" />
                      <span className="text-xs font-bold uppercase text-slate-705 tracking-wide">Add Custom Routing Rule</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block font-bold">Profile Name</label>
                        <input
                          type="text"
                          id="new-rule-name"
                          placeholder="e.g. VIP Conference Package"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-sans outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block font-bold">Brief Description</label>
                        <input
                          type="text"
                          id="new-rule-desc"
                          placeholder="e.g. Routes Room Rate + Airport Transfer to A-Folio, and other charges to guest."
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-sans outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block font-bold">A-Folio Core Categories (Primary Billing)</label>
                        <input
                          type="text"
                          id="new-rule-primary-types"
                          placeholder="Room, Extra, Transfer"
                          defaultValue="Room, Extra"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                        />
                        <p className="text-[10px] text-slate-450">Comma separated: Room, F&B, Extra, Minibar, Laundry, Transfer, Other</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block font-bold">B-Folio Personal Incidentals (Guest Settlement)</label>
                        <input
                          type="text"
                          id="new-rule-secondary-types"
                          placeholder="Minibar, Spa, F&B, Laundry, Other"
                          defaultValue="Minibar, Spa, F&B, Laundry, Other"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                        />
                        <p className="text-[10px] text-slate-450">Comma separated: Room, F&B, Extra, Minibar, Laundry, Transfer, Other</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          const nameInput = document.getElementById('new-rule-name') as HTMLInputElement;
                          const descInput = document.getElementById('new-rule-desc') as HTMLInputElement;
                          const primaryInput = document.getElementById('new-rule-primary-types') as HTMLInputElement;
                          const secondaryInput = document.getElementById('new-rule-secondary-types') as HTMLInputElement;
                          
                          if (nameInput?.value && descInput?.value) {
                            const newRule = {
                              id: `rule-${Date.now()}`,
                              name: nameInput.value.trim(),
                              description: descInput.value.trim(),
                              corporateBillingOnly: true,
                              primaryTypes: primaryInput.value.split(',').map(t => t.trim()).filter(Boolean),
                              secondaryTypes: secondaryInput.value.split(',').map(t => t.trim()).filter(Boolean)
                            };
                            
                            setSplitFolioRules(prev => [...prev, newRule]);
                            
                            nameInput.value = '';
                            descInput.value = '';
                            primaryInput.value = 'Room, Extra';
                            secondaryInput.value = 'Minibar, Spa, F&B, Laundry, Other';
                          }
                        }}
                        className="px-4 py-2 bg-slate-900 border border-slate-850 text-white text-[10px] uppercase font-bold tracking-wider rounded-xl hover:bg-slate-800 flex items-center gap-1.5 transition duration-150"
                      >
                        <Plus size={13} />
                        Add Routing Rule Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  id="btn-save-billing"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition flex items-center gap-2 shadow-md shadow-indigo-100"
                >
                  <Save size={14} />
                  Deploy Settings Matrix
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB INVOICE SETTINGS */}
        {activeTab === 'invoice_settings' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <form onSubmit={saveInvoiceSettings} className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 shadow-sm" id="invoice-config-form">
              <div>
                <h3 className="text-sm font-sans font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-1">
                  <FileText size={16} className="text-indigo-600" />
                  Invoice & Receipt Templates
                </h3>
                <p className="text-xs text-slate-400">Configure global layout formats, footers, and payment instructions printed on guest folios.</p>
              </div>

              <div className="grid grid-cols-1 gap-6 pt-2">
                
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-450 font-bold block">Base Template Layout</label>
                  <p className="text-[11px] text-slate-400 leading-tight mb-2">Select the visual arrangement for generated PDF receipts and A4 folios.</p>
                  <select 
                    value={invoiceTemplate}
                    onChange={e => setInvoiceTemplate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-sans focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                  >
                    <option value="classic">Classic (Detailed breakdown with top header)</option>
                    <option value="modern">Modern (Clean layout with right-aligned totals)</option>
                    <option value="minimalist">Minimalist (Compact layout, eco-friendly printing)</option>
                    <option value="thermal">Thermal POS (For narrow width tape printers)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-450 font-bold block">Invoice Footer Text / Terms</label>
                  <p className="text-[11px] text-slate-400 leading-tight mb-2">Notice printed at the bottom of the invoice (e.g., return policies, thank you note).</p>
                  <textarea 
                    value={invoiceFooterText}
                    onChange={e => setInvoiceFooterText(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-sans focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                    placeholder="Thank you for your business!"
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-450 font-bold block">Payment Types / Options</label>
                  <p className="text-[11px] text-slate-400 leading-tight mb-2">Comma-separated list of payment methods available across the system.</p>
                  <input 
                    type="text"
                    value={paymentTypesConfig}
                    onChange={e => setPaymentTypesConfig(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-sans focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                    placeholder="Cash, Credit Card, Mobile Money"
                  />
                </div>

                <div className="space-y-4 border-t border-slate-100 pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-widest text-slate-450 font-bold block">Bank & Wiring Details</label>
                      <p className="text-[11px] text-slate-400 leading-tight">Provide the default banking coordinates displayed for wire transfer or B2B payment instructions.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsManualBankDetailsEdit(!isManualBankDetailsEdit);
                      }}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition uppercase tracking-wider cursor-pointer"
                    >
                      {isManualBankDetailsEdit ? 'Switch to Smart Editor' : 'Switch to Manual Editor'}
                    </button>
                  </div>

                  {isManualBankDetailsEdit ? (
                    <div className="space-y-2">
                      <textarea 
                        value={invoiceBankDetails}
                        onChange={e => setInvoiceBankDetails(e.target.value)}
                        rows={5}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-sans font-mono focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                        placeholder="Bank Name: ..."
                      />
                      <p className="text-[10px] text-slate-400 italic">Editing in raw text mode. Make sure blocks are separated by double newlines for proper public-facing display.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Active Accounts Grid - Database Backed */}
                      {loadingBankAccounts ? (
                        <div className="text-center py-8 text-slate-400 text-xs">Loading bank accounts...</div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {dbBankAccounts.map((acc, idx) => (
                            <div key={acc.id} className={`border ${acc.is_active ? 'border-slate-200 bg-slate-50/50' : 'border-slate-200 bg-slate-100/50 opacity-60'} rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-200 transition relative group`}>
                              <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                  <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 truncate pr-8">
                                    <Building2 size={13} className="text-indigo-500" /> {acc.bank_name}
                                  </span>
                                  <div className="flex items-center gap-1 absolute right-3 top-3">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setBankForm({
                                          bankName: acc.bank_name,
                                          accountName: acc.account_name,
                                          accountNumber: acc.account_number,
                                          swiftCode: acc.swift_bic_code || '',
                                          accountType: acc.account_type,
                                          currency: acc.currency,
                                          isDefaultForSales: acc.is_default_for_sales,
                                          isDefaultForExpenses: acc.is_default_for_expenses,
                                          coaAccountCode: acc.coa_account_code || '',
                                          department: acc.department || 'Finance'
                                        });
                                        setEditingBankIndex(idx);
                                        setShowBankForm(true);
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                                      title="Edit account details"
                                    >
                                      <Edit2 size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => deleteBankAccount(acc.id)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                      title="Delete account"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="text-[11px] space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Account Name:</span>
                                    <span className="font-semibold text-slate-700">{acc.account_name}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Account Number:</span>
                                    <span className="font-mono font-bold text-slate-800">{acc.account_number}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Type:</span>
                                    <span className="font-semibold text-slate-600">{acc.account_type}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Currency:</span>
                                    <span className="font-semibold text-slate-600">{acc.currency}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Current Balance:</span>
                                    <span className="font-mono font-bold text-green-600">{acc.currency} {acc.current_balance.toLocaleString()}</span>
                                  </div>
                                  {acc.coa_account_code && (
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">COA Account Code:</span>
                                      <span className="font-mono text-indigo-600 font-semibold">{acc.coa_account_code}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Department:</span>
                                    <span className="font-semibold text-slate-600">{acc.department || 'Finance'}</span>
                                  </div>
                                  {acc.swift_bic_code && (
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">SWIFT / BIC:</span>
                                      <span className="font-mono text-slate-600 font-semibold">{acc.swift_bic_code}</span>
                                    </div>
                                  )}
                                  <div className="flex gap-2 pt-1">
                                    {acc.is_default_for_sales && (
                                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[9px] font-bold rounded-full">Default for Sales</span>
                                    )}
                                    {acc.is_default_for_expenses && (
                                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold rounded-full">Default for Expenses</span>
                                    )}
                                    {!acc.is_active && (
                                      <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[9px] font-bold rounded-full">Inactive</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}

                          {dbBankAccounts.length === 0 && (
                            <div className="md:col-span-2 text-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                              No bank accounts added yet. Click "Add Bank Account" below to register one.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Add/Edit Account Inline Drawer form */}
                      {showBankForm ? (
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 animate-fade-in relative">
                          <button
                            type="button"
                            onClick={() => {
                              setShowBankForm(false);
                              setEditingBankIndex(null);
                            }}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                          
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                            <Building2 size={13} className="text-indigo-500" />
                            {editingBankIndex !== null ? 'Edit Bank Account Coordinates' : 'Register New Bank Account'}
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-450">Bank Name</label>
                              <input
                                type="text"
                                required
                                value={bankForm.bankName}
                                onChange={e => setBankForm(prev => ({ ...prev, bankName: e.target.value }))}
                                placeholder="Commercial Bank of Ethiopia (CBE)"
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500 transition font-medium text-slate-750"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-450">Account Name</label>
                              <input
                                type="text"
                                required
                                value={bankForm.accountName}
                                onChange={e => setBankForm(prev => ({ ...prev, accountName: e.target.value }))}
                                placeholder="SELEDA Resort PLC"
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500 transition font-medium text-slate-750"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-450">Account Number</label>
                              <input
                                type="text"
                                required
                                value={bankForm.accountNumber}
                                onChange={e => setBankForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                                placeholder="1000 4829 3819 1932"
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500 transition font-mono font-bold text-slate-800"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-450">Account Type</label>
                              <select
                                value={bankForm.accountType}
                                onChange={e => setBankForm(prev => ({ ...prev, accountType: e.target.value }))}
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500 transition font-medium text-slate-750"
                              >
                                <option value="Business">Business</option>
                                <option value="Corporate">Corporate</option>
                                <option value="Checking">Checking</option>
                                <option value="Savings">Savings</option>
                                <option value="Current">Current</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-450">Currency</label>
                              <select
                                value={bankForm.currency}
                                onChange={e => setBankForm(prev => ({ ...prev, currency: e.target.value }))}
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500 transition font-medium text-slate-750"
                              >
                                <option value="ETB">ETB - Ethiopian Birr</option>
                                <option value="USD">USD - US Dollar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="GBP">GBP - British Pound</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-450">SWIFT / BIC Code (Optional)</label>
                              <input
                                type="text"
                                value={bankForm.swiftCode}
                                onChange={e => setBankForm(prev => ({ ...prev, swiftCode: e.target.value }))}
                                placeholder="CBETETAA"
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500 transition font-mono font-semibold text-slate-700"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-450">COA Account Code (Optional)</label>
                              <select
                                value={bankForm.coaAccountCode}
                                onChange={e => setBankForm(prev => ({ ...prev, coaAccountCode: e.target.value }))}
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500 transition font-mono font-semibold text-slate-700"
                              >
                                <option value="">Auto-assign based on type</option>
                                {(chartOfAccounts || []).filter(a => a.category === 'Asset' && (a.subCategory === 'Bank' || a.subCategory === 'Cash')).map(a => (
                                  <option key={a.code} value={a.code}>{a.code} - {a.name}</option>
                                ))}
                              </select>
                              <p className="text-[9px] text-slate-400 italic">Links to Chart of Accounts for double-entry posting</p>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-450">Department (USALI)</label>
                              <select
                                value={bankForm.department}
                                onChange={e => setBankForm(prev => ({ ...prev, department: e.target.value }))}
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500 transition font-medium text-slate-750"
                              >
                                <option value="Finance">Finance</option>
                                <option value="Front Office">Front Office</option>
                                <option value="F&B">Food & Beverage</option>
                                <option value="Rooms">Rooms</option>
                                <option value="General">General</option>
                              </select>
                              <p className="text-[9px] text-slate-400 italic">USALI departmental tagging for reporting</p>
                            </div>
                          </div>

                          <div className="flex gap-4 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={bankForm.isDefaultForSales}
                                onChange={e => setBankForm(prev => ({ ...prev, isDefaultForSales: e.target.checked }))}
                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="text-[10px] font-semibold text-slate-700">Default for Sales (Revenue)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={bankForm.isDefaultForExpenses}
                                onChange={e => setBankForm(prev => ({ ...prev, isDefaultForExpenses: e.target.checked }))}
                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="text-[10px] font-semibold text-slate-700">Default for Expenses</span>
                            </label>
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setShowBankForm(false);
                                setEditingBankIndex(null);
                              }}
                              className="px-4 py-2 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-slate-100 transition cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!bankForm.bankName || !bankForm.accountName || !bankForm.accountNumber) {
                                  alert('Please fill in Bank Name, Account Name, and Account Number.');
                                  return;
                                }
                                saveBankAccount();
                              }}
                              className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-indigo-700 transition flex items-center gap-1 cursor-pointer"
                            >
                              <Check size={12} /> {editingBankIndex !== null ? 'Update Account' : 'Register Account'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setBankForm({ 
                              bankName: '', 
                              accountName: '', 
                              accountNumber: '', 
                              swiftCode: '',
                              accountType: 'Business',
                              currency: 'ETB',
                              isDefaultForSales: false,
                              isDefaultForExpenses: false,
                              coaAccountCode: '',
                              department: 'Finance'
                            });
                            setEditingBankIndex(null);
                            setShowBankForm(true);
                          }}
                          className="px-4 py-2.5 border border-dashed border-indigo-200 hover:border-indigo-400 text-indigo-600 bg-indigo-50/10 hover:bg-indigo-50/30 font-bold text-[10px] uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer w-full"
                        >
                          <Plus size={14} /> Add Bank Account Profile
                        </button>
                      )}
                    </div>
                  )}
                </div>

              </div>
              
              <div className="flex justify-end pt-2 border-t border-slate-100 pb-2">
                <button 
                  type="submit" 
                  id="btn-save-invoice"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition flex items-center gap-2 shadow-md shadow-indigo-100"
                >
                  <Save size={14} />
                  Deploy Template Settings
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: POLICIES */}
        {activeTab === 'policies' && (
          <div className="max-w-5xl mx-auto animate-fade-in">
            <form onSubmit={savePoliciesSettings} className="space-y-6" id="policies-form">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
                  <Gavel size={18} className="text-indigo-500" /> Operational & Cancellation Policies
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-200/60">
                    <h4 className="text-[10px] font-mono font-black uppercase text-indigo-600 tracking-widest">Cancellation Rules</h4>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-450 font-bold block">Grace Period (Hours)</label>
                        <input type="number" value={policiesForm.cancellationGraceHours} onChange={e => setPoliciesForm(f => ({ ...f, cancellationGraceHours: Number(e.target.value) }))} className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-sans" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-450 font-bold block">Penalty Percent (%)</label>
                        <input type="number" value={policiesForm.cancellationPenaltyPercent} onChange={e => setPoliciesForm(f => ({ ...f, cancellationPenaltyPercent: Number(e.target.value) }))} className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-sans" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-200/60">
                    <h4 className="text-[10px] font-mono font-black uppercase text-indigo-600 tracking-widest">Credit & Audit</h4>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-450 font-bold block">Default Guest Credit Limit</label>
                        <input type="number" value={policiesForm.creditLimitDefault} onChange={e => setPoliciesForm(f => ({ ...f, creditLimitDefault: Number(e.target.value) }))} className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-sans font-bold" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-450 font-bold block">Scheduled Night Audit (Time)</label>
                        <input type="time" value={policiesForm.autoNightAuditTime} onChange={e => setPoliciesForm(f => ({ ...f, autoNightAuditTime: e.target.value }))} className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-sans" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-5 bg-slate-900 rounded-2xl text-white mt-6">
                  <h4 className="text-[10px] font-mono font-black uppercase text-indigo-400 tracking-widest">Departmental Operating Hours</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-400">Front Desk</label>
                      <input type="text" value={policiesForm.opHoursFrontDesk} onChange={e => setPoliciesForm(f => ({ ...f, opHoursFrontDesk: e.target.value }))} className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-[10px]" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-400">Restaurant</label>
                      <input type="text" value={policiesForm.opHoursRestaurant} onChange={e => setPoliciesForm(f => ({ ...f, opHoursRestaurant: e.target.value }))} className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-[10px]" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-400">Bar Module</label>
                      <input type="text" value={policiesForm.opHoursBar} onChange={e => setPoliciesForm(f => ({ ...f, opHoursBar: e.target.value }))} className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-[10px]" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-400">Spa / Wellness</label>
                      <input type="text" value={policiesForm.opHoursSpa} onChange={e => setPoliciesForm(f => ({ ...f, opHoursSpa: e.target.value }))} className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-[10px]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-mono font-black uppercase text-amber-800 tracking-widest flex items-center gap-1.5">
                    <FileText size={12} className="text-amber-600" /> Public Booking Portal Terms & Conditions
                  </h4>
                  <button 
                    type="button" 
                    onClick={() => setPolicySections(prev => [...prev, {id: Date.now().toString(), title: 'New Section', content: ''}])}
                    className="flex items-center gap-1.5 text-[9px] font-black uppercase text-indigo-700 bg-white px-2 py-1 rounded-lg border border-indigo-200 hover:bg-indigo-50"
                  >
                    <Plus size={10} /> Add Section
                  </button>
                </div>
                <div className="space-y-4 pt-4">
                  {policySections.map((section, idx) => (
                    <div key={section.id} className="space-y-1 relative group">
                      <label className="text-[10px] font-mono uppercase text-slate-500 font-bold block flex justify-between">
                        <input 
                          value={section.title}
                          onChange={e => setPolicySections(prev => prev.map((s, i) => i === idx ? {...s, title: e.target.value} : s))}
                          className="bg-transparent border-none w-full p-0 flex-1 focus:outline-none"
                        />
                        <button 
                          type="button"
                          onClick={() => setPolicySections(prev => prev.filter((_, i) => i !== idx))}
                          className="opacity-0 group-hover:opacity-100 text-rose-500"
                        >
                          <Trash2 size={12} />
                        </button>
                      </label>
                      <textarea 
                        rows={3}
                        value={section.content} 
                        onChange={e => setPolicySections(prev => prev.map((s, i) => i === idx ? {...s, content: e.target.value} : s))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-sans focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-sans font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition">
                  <Save size={16} />
                  Save Policies
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 5: CHECK-IN FORMS */}
        {activeTab === 'checkin_forms' && (
          <div className="max-w-5xl mx-auto animate-fade-in">
            <form onSubmit={saveCheckinFormSettings} className="space-y-6" id="checkin-forms-form">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
                  <FileText size={18} className="text-indigo-500" /> Check-In Form Configuration
                </h2>
                <p className="text-xs text-slate-500 mb-6">Customize the content and appearance of check-in forms for individual guests and group bookings.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Individual Check-In Form Settings */}
                  <div className="space-y-4 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-200/60">
                    <h4 className="text-[10px] font-mono font-black uppercase text-indigo-600 tracking-widest">Individual Check-In Form</h4>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-450 font-bold block">Form Title</label>
                        <input
                          type="text"
                          value={checkinFormSettings.individualTitle}
                          onChange={e => setCheckinFormSettings(f => ({ ...f, individualTitle: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-sans"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-450 font-bold block">Hotel Name</label>
                        <input
                          type="text"
                          value={checkinFormSettings.hotelName}
                          onChange={e => setCheckinFormSettings(f => ({ ...f, hotelName: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-sans"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-450 font-bold block">Terms & Conditions</label>
                        <textarea
                          rows={4}
                          value={checkinFormSettings.individualTerms}
                          onChange={e => setCheckinFormSettings(f => ({ ...f, individualTerms: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-sans"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-450 font-bold block">Signature Label</label>
                        <input
                          type="text"
                          value={checkinFormSettings.individualSignatureLabel}
                          onChange={e => setCheckinFormSettings(f => ({ ...f, individualSignatureLabel: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-sans"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-450 font-bold block">Signature Hint</label>
                        <input
                          type="text"
                          value={checkinFormSettings.individualSignatureHint}
                          onChange={e => setCheckinFormSettings(f => ({ ...f, individualSignatureHint: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Group Check-In Form Settings */}
                  <div className="space-y-4 p-5 bg-purple-50/50 rounded-2xl border border-purple-200/60">
                    <h4 className="text-[10px] font-mono font-black uppercase text-purple-600 tracking-widest">Group Check-In Form</h4>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-450 font-bold block">Form Title</label>
                        <input
                          type="text"
                          value={checkinFormSettings.groupTitle}
                          onChange={e => setCheckinFormSettings(f => ({ ...f, groupTitle: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-sans"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-450 font-bold block">Terms & Conditions</label>
                        <textarea
                          rows={4}
                          value={checkinFormSettings.groupTerms}
                          onChange={e => setCheckinFormSettings(f => ({ ...f, groupTerms: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-sans"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-450 font-bold block">Signature Label</label>
                        <input
                          type="text"
                          value={checkinFormSettings.groupSignatureLabel}
                          onChange={e => setCheckinFormSettings(f => ({ ...f, groupSignatureLabel: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-sans"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-450 font-bold block">Signature Hint</label>
                        <input
                          type="text"
                          value={checkinFormSettings.groupSignatureHint}
                          onChange={e => setCheckinFormSettings(f => ({ ...f, groupSignatureHint: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-sans"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-sans font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition">
                    <Save size={16} />
                    Save Check-In Form Settings
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

    {activeTab === 'pos_categories' && (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-8 pb-12">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-[32px] p-8 shadow-sm space-y-8">
        <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-850 pb-6">
          <div>
            <h3 className="text-lg font-sans font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mb-1">
              <LayoutGrid size={20} className="text-indigo-600" />
              POS Environment Configuration
            </h3>
            <p className="text-xs text-slate-400">Define POS Outlets, Item Categorizations, and Physical Printer Network mappings.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">POS Engine Online</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* POS Outlets */}
          <SettingListManager
            title="Sales Outlets"
            icon={<Store size={14} />}
            items={globalHotelSettings.posOutlets || []}
            onUpdate={(items) => submitGlobalSettingsChange('POS Outlet List', `Update POS outlets: ${items.join(', ') || 'none'}`, 'pos-config', { posOutlets: items })}
            placeholder="Add new Outlet..."
          />

          {/* POS Categories */}
          <SettingListManager
            title="Item Categories"
            icon={<LayoutGrid size={14} />}
            items={globalHotelSettings.posCategories || []}
            onUpdate={(items) => submitGlobalSettingsChange('POS Category List', `Update POS categories: ${items.join(', ') || 'none'}`, 'pos-config', { posCategories: items })}
            placeholder="Add new Category..."
          />

          {/* POS Printers */}
          <SettingListManager
            title="Receipt Printers"
            icon={<Printer size={14} />}
            items={globalHotelSettings.posPrinters || []}
            onUpdate={(items) => submitGlobalSettingsChange('POS Printer List', `Update POS printers: ${items.join(', ') || 'none'}`, 'pos-config', { posPrinters: items })}
            placeholder="Add new Printer..."
          />
        </div>

        {/* Granular POS Category Mapping */}
        <div className="pt-8 border-t border-slate-100 dark:border-slate-850 space-y-6">
          <div className="flex items-center gap-2">
             <LayoutGrid size={18} className="text-amber-500" />
             <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Granular Mapping: Categories by Outlet</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {(globalHotelSettings.posOutlets || []).map((outlet, idx) => (
              <div key={idx} className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-3 min-w-[200px]">
                   <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600">
                     <Store size={18} />
                   </div>
                   <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{outlet}</div>
                      <p className="text-[9px] text-slate-400">Select categories visible at this terminal</p>
                   </div>
                </div>

                <div className="flex flex-wrap gap-2 flex-1">
                  {(globalHotelSettings.posCategories || []).map((cat, cIdx) => {
                     const isAssigned = (globalHotelSettings.posOutletCategories?.[outlet] || []).includes(cat);
                     return (
                       <button
                         key={cIdx}
                         type="button"
                         onClick={() => {
                           const current = globalHotelSettings.posOutletCategories?.[outlet] || [];
                           const next = isAssigned 
                             ? current.filter(c => c !== cat) 
                             : [...current, cat];
                           
                           submitGlobalSettingsChange(
                             `POS Mapping: ${outlet}`,
                             `Assign categories [${next.join(', ')}] to outlet "${outlet}"`,
                             'pos-config',
                             {
                               posOutletCategories: {
                                 ...(globalHotelSettings.posOutletCategories || {}),
                                 [outlet]: next
                               }
                             }
                           );
                         }}
                         className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                           isAssigned
                             ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                             : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white'
                         }`}
                       >
                         {cat}
                       </button>
                     );
                  })}
                  {(!globalHotelSettings.posCategories || globalHotelSettings.posCategories.length === 0) && (
                    <span className="text-[10px] text-slate-400 italic font-mono">No categories globally defined.</span>
                  )}
                </div>
              </div>
            ))}
            {(!globalHotelSettings.posOutlets || globalHotelSettings.posOutlets.length === 0) && (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                <p className="text-xs text-slate-400 font-sans">Declare your Sales Outlets above to enable terminal mapping.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-8 bg-indigo-950 rounded-[32px] text-white flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden gap-6">
        <div className="absolute left-[-20px] top-[-20px] opacity-10 rotate-12">
          <Settings size={200} />
        </div>
        <div className="relative z-10 space-y-2">
          <h4 className="text-xl font-black uppercase tracking-widest">Network Synchronization</h4>
          <p className="text-sm opacity-70 max-w-lg leading-relaxed">Changes to your POS environment are pushed to terminals in real-time. All active terminal sessions should be refreshed after large-scale category modifications.</p>
        </div>
        <div className="flex gap-4 relative z-10">
          <button 
            type="button"
            onClick={() => triggerToast('Terminals synchronized with central POS config successfully!', 'info')}
            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest transition active:scale-95"
          >
            Test Print All
          </button>
          <button 
            type="button"
            onClick={() => triggerToast('Master POS synchronization completed! All terminals updated.', 'success')}
            className="px-8 py-4 bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition hover:shadow-xl hover:shadow-indigo-500/20 active:scale-95"
          >
            Sync Terminals
          </button>
        </div>
      </div>
    </div>
  )}




        {/* TAB 3: CHANGE CONTROL COUNCIL */}
        {activeTab === 'change_control' && (
          <div className="max-w-5xl mx-auto space-y-6 animate-fade-in" id="change-control-council">
            
            {/* Upper state banner */}
            <div className="bg-white hover:border-indigo-200 border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition">
              <div className="flex gap-3 items-center">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-sans font-black uppercase text-slate-800 tracking-wider">Change Governance Mode: ACTIVE</h4>
                  <p className="text-xs text-slate-500 mt-1">Dual-factor review triggers automatically on changes affecting core ledger ratios or billing metrics.</p>
                </div>
              </div>
              <button 
                id="btn-raise-change"
                onClick={() => setShowApplyModal(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 transition"
              >
                <Plus size={14} /> Raise Change Initiative
              </button>
            </div>

            {/* List of active proposals */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-slate-400">Proposals Queue</span>
                <span className="text-[10px] font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                  {proposals.filter(p => p.status === 'Pending').length} Pending Review
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {proposals.map((prop) => (
                  <div key={prop.id} className="bg-white border rounded-3xl border-slate-205 p-6 shadow-sm hover:shadow-md transition space-y-4 relative overflow-hidden">
                    
                    {/* Corner badge for status */}
                    <div className="absolute right-6 top-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-mono font-black uppercase border select-none ${
                        prop.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        prop.status === 'Declined' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {prop.status}
                      </span>
                    </div>

                    <div className="space-y-2 max-w-[85%]">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-mono font-bold uppercase">{prop.id}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Proposed by {prop.proposer} on {prop.dateProposed}</span>
                      </div>
                      <h4 className="text-sm font-sans font-black text-slate-900 group hover:text-indigo-600 transition leading-snug">{prop.title}</h4>
                      <p className="text-xs text-slate-550 leading-relaxed font-sans">{prop.description}</p>
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
                      <div className="flex gap-4">
                        <span>Scope: <strong className="text-slate-600 font-medium">{prop.department} ({prop.type})</strong></span>
                        <span>Urgency: 
                          <strong className={`font-black uppercase ml-1 px-1 rounded text-[9px] ${
                            prop.urgency === 'Emergency' ? 'bg-rose-100 text-rose-700' :
                            prop.urgency === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {prop.urgency}
                          </strong>
                        </span>
                        {prop.effectedField && prop.status === 'Pending' && (
                          <span className="text-indigo-600 animate-pulse font-bold">
                            ★ Direct Effect: Set {prop.effectedField} to {prop.effectedValue}
                          </span>
                        )}
                        {prop.effectedField && prop.status === 'Approved' && (
                          <span className="text-emerald-600 font-medium">
                            ✓ Direct Effect Applied
                          </span>
                        )}
                      </div>

                      {prop.status === 'Pending' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleProposalDecision(prop.id, 'Declined')}
                            id={`btn-deny-${prop.id}`}
                            className="px-3 py-1.5 border border-rose-150 text-rose-600 hover:bg-rose-50 rounded-xl font-sans font-bold flex items-center gap-1 transition"
                          >
                            <X size={12} /> Decline
                          </button>
                          <button 
                            onClick={() => handleProposalDecision(prop.id, 'Approved')}
                            id={`btn-approve-${prop.id}`}
                            className="px-3.5 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-sans font-black uppercase text-[10px] tracking-wider transform hover:scale-[1.02] transition shadow-lg shadow-indigo-100"
                          >
                            <Check size={12} className="inline mr-0.5" /> Approve Proposal
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* APYLY/PROPOSE MODAL */}
      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-[32px] p-8 space-y-6 shadow-2xl border border-slate-100"
              id="pop-change-proposal"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-sans font-black text-slate-900 uppercase tracking-tight">Propose Configuration Change</h3>
                  <p className="text-xs text-slate-450 mt-1">Submit a formal change control record to the Governance Board.</p>
                </div>
                <button onClick={() => setShowApplyModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition"><X size={18} className="text-slate-400" /></button>
              </div>

              <form onSubmit={submitNewChange} className="space-y-4">
                <div>
                  <label className="text-3xs font-mono uppercase text-slate-400 font-black tracking-widest block mb-1">Proposed Change Label</label>
                  <input 
                    type="text" 
                    value={newTitle} 
                    onChange={e => setNewTitle(e.target.value)} 
                    placeholder="e.g. Alter accommodation VAT ceiling to 14.5%"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="text-3xs font-mono uppercase text-slate-400 font-black tracking-widest block mb-1">Technical Context & Justification</label>
                  <textarea 
                    value={newDesc} 
                    onChange={e => setNewDesc(e.target.value)} 
                    placeholder="Provide a thorough overview of why this system parameter or policy option adjustment is requested."
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 font-sans"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-3xs font-mono uppercase text-slate-450 font-black tracking-widest block mb-1">Target Module</label>
                    <select 
                      value={newDept}
                      onChange={e => setNewDept(e.target.value)}
                      className="w-full px-2.5 py-2 border border-slate-205 rounded-xl text-xs font-sans focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    >
                      <option value="Finance">Finance</option>
                      <option value="Revenue Management">Revenue</option>
                      <option value="Front Office">Front Office</option>
                      <option value="Housekeeping">Housekeeping</option>
                      <option value="System Hub">System Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-3xs font-mono uppercase text-slate-455 font-black tracking-widest block mb-1">Change Type</label>
                    <select 
                      value={newType}
                      onChange={e => setNewType(e.target.value as any)}
                      className="w-full px-2.5 py-2 border border-slate-205 rounded-xl text-xs font-sans focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    >
                      <option value="Configuration">Configuration</option>
                      <option value="Policy">Policy</option>
                      <option value="Fee">Fee / Pricing</option>
                      <option value="System">System Setting</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-3xs font-mono uppercase text-slate-455 font-black tracking-widest block mb-1">Urgency Priority</label>
                    <select 
                      value={newUrgency}
                      onChange={e => setNewUrgency(e.target.value as any)}
                      className="w-full px-2.5 py-2 border border-slate-205 rounded-xl text-xs font-sans focus:outline-none focus:ring-1 focus:ring-indigo-600 font-bold"
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High Priority</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setShowApplyModal(false)} className="px-5 py-2 border rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition">Cancel</button>
                  <button 
                    type="submit" 
                    id="btn-confirm-raise-change"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition hover:scale-105"
                  >
                    Submit Initiative
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// --------------- HELPER: SETTING LIST MANAGER ---------------
const SettingListManager = ({ 
  title, 
  items, 
  onUpdate, 
  placeholder = "Add...", 
  icon 
}: { 
  title: string, 
  items: string[], 
  onUpdate: (items: string[]) => void, 
  placeholder?: string,
  icon?: React.ReactNode
}) => {
  const [newItem, setNewItem] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = () => {
    if (newItem.trim() && !items.includes(newItem.trim())) {
      onUpdate([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleRemove = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onUpdate(updated);
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(items[index]);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      const updated = [...items];
      updated[editingIndex] = editValue.trim();
      onUpdate(updated);
      setEditingIndex(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-mono font-black uppercase text-slate-800 dark:text-slate-200 tracking-widest flex items-center gap-2">
          {icon}
          {title}
        </h4>
        <div className="px-2 py-0.5 bg-slate-100 dark:bg-slate-850 rounded text-[9px] font-bold text-slate-400">
          {items.length} ACTIVE
        </div>
      </div>
      
      <div className="space-y-2 min-h-[160px] p-4 bg-slate-50 dark:bg-slate-950 rounded-[28px] border dark:border-slate-850 overflow-y-auto max-h-[300px]">
        {items.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[10px] text-slate-400 italic">No definitions mapped.</div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl transition hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-black/20 group">
              {editingIndex === idx ? (
                <div className="flex gap-2 w-full">
                  <input 
                    autoFocus
                    className="flex-1 bg-slate-50 dark:bg-slate-850 border-none rounded-lg p-1 text-xs font-bold focus:outline-none"
                    value={editValue} 
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveEdit()}
                  />
                  <button onClick={saveEdit} className="text-emerald-500 hover:scale-110 transition cursor-pointer"><Check size={16} /></button>
                  <button onClick={() => setEditingIndex(null)} className="text-slate-400 hover:scale-110 transition cursor-pointer"><X size={16} /></button>
                </div>
              ) : (
                <>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{item}</span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <button 
                      onClick={() => startEdit(idx)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button 
                      onClick={() => handleRemove(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <input 
          type="text" 
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
        />
        <button 
          onClick={handleAdd}
          disabled={!newItem.trim()}
          className="w-12 h-12 bg-indigo-600 disabled:opacity-50 text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
};
