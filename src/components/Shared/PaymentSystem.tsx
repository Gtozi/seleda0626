/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 * 
 * Shared Payment System Component
 * Provides unified multi-payment functionality across all POS systems
 * Based on the advanced folio payment system from CheckInOutModule
 */

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Coins, 
  Smartphone, 
  Landmark, 
  Plus, 
  X, 
  Receipt,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export interface PaymentSplit {
  amount: number;
  method: string;
  reference: string;
  bankAccountId: string;
}

export interface PaymentSystemProps {
  totalAmount: number;
  availableMethods: string[];
  currency?: string;
  onPaymentComplete: (splits: PaymentSplit[], receiptUrl?: string) => void;
  onCancel?: () => void;
  initialMethod?: string;
  requireReference?: boolean;
  requireBankAccount?: boolean;
  allowReceiptUpload?: boolean;
  isRoomChargeAvailable?: boolean;
  selectedRoomId?: string;
  bankAccounts?: any[];
}

export default function PaymentSystem({
  totalAmount,
  availableMethods,
  currency = 'USD',
  onPaymentComplete,
  onCancel,
  initialMethod = 'Cash',
  requireReference = false,
  requireBankAccount = false,
  allowReceiptUpload = true,
  isRoomChargeAvailable = false,
  selectedRoomId,
  bankAccounts = []
}: PaymentSystemProps) {
  const [paymentSplits, setPaymentSplits] = useState<PaymentSplit[]>([
    { amount: totalAmount, method: initialMethod, reference: '', bankAccountId: '' }
  ]);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Recalculate splits when total amount changes
  useEffect(() => {
    if (paymentSplits.length === 1) {
      setPaymentSplits([{ 
        ...paymentSplits[0], 
        amount: totalAmount 
      }]);
    }
  }, [totalAmount]);

  const sumOfSplits = paymentSplits.reduce((sum, s) => sum + (s.amount || 0), 0);
  const remainingAmount = Math.max(0, totalAmount - sumOfSplits);

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'Cash':
        return <Coins size={16} />;
      case 'Credit Card':
      case 'Debit Card':
        return <CreditCard size={16} />;
      case 'Mobile Money':
        return <Smartphone size={16} />;
      case 'Bank Transfer':
        return <Landmark size={16} />;
      default:
        return <Receipt size={16} />;
    }
  };

  const updateSplit = (index: number, field: keyof PaymentSplit, value: any) => {
    const newSplits = [...paymentSplits];
    newSplits[index] = { ...newSplits[index], [field]: value };
    setPaymentSplits(newSplits);
  };

  const addSplit = () => {
    setPaymentSplits([...paymentSplits, { 
      amount: remainingAmount, 
      method: availableMethods[0] || 'Cash', 
      reference: '', 
      bankAccountId: '' 
    }]);
  };

  const removeSplit = (index: number) => {
    if (paymentSplits.length > 1) {
      setPaymentSplits(paymentSplits.filter((_, i) => i !== index));
    }
  };

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

  const handlePaymentSubmit = async () => {
    // Validation
    const nonZeroSplits = paymentSplits.filter(s => s.amount > 0);
    
    if (nonZeroSplits.length === 0) {
      setUploadError('At least one payment method with amount > 0 is required');
      return;
    }

    const totalSplits = nonZeroSplits.reduce((sum, s) => sum + s.amount, 0);
    
    if (Math.abs(totalSplits - totalAmount) > 0.01) {
      setUploadError(`Payment total (${totalSplits.toFixed(2)}) must equal order total (${totalAmount.toFixed(2)})`);
      return;
    }

    // Overpayment safeguard
    if (totalSplits > totalAmount + 0.01) {
      setUploadError(`Overpayment warning: Payment total exceeds order total. Please adjust payment amounts.`);
      return;
    }

    // Room charge validation
    const roomChargeSplit = nonZeroSplits.find(s => 
      s.method === 'RoomCharge' || s.method === 'Room Charge' || s.method.includes('Room')
    );
    if (roomChargeSplit && roomChargeSplit.amount > 0) {
      if (!isRoomChargeAvailable) {
        setUploadError('Room charge is not available for this transaction');
        return;
      }
      if (!selectedRoomId) {
        setUploadError('Please select a room for the folio charge portion');
        return;
      }
    }

    // Reference validation for non-cash methods
    const needsReference = nonZeroSplits.some(s => 
      !['Cash', 'Room Charge', 'RoomCharge'].includes(s.method) && 
      (!s.reference || s.reference.trim() === '')
    );
    if (requireReference && needsReference) {
      setUploadError('Reference number is required for non-cash payment methods');
      return;
    }

    // Upload receipt if provided
    let receiptUrl: string | undefined;
    if (paymentScreenshot && allowReceiptUpload) {
      setIsUploading(true);
      setUploadError(null);
      receiptUrl = await uploadPaymentReceipt(paymentScreenshot);
      setIsUploading(false);
      
      if (!receiptUrl) {
        setUploadError('Failed to upload receipt screenshot. Transaction will proceed without receipt attachment.');
      }
    }

    // Submit payment
    onPaymentComplete(nonZeroSplits, receiptUrl);
  };

  const formatAmount = (amount: number) => {
    return `${currency} ${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
          Payment Details
        </h3>
        <div className="text-right">
          <div className="text-lg font-black text-slate-900 dark:text-white">
            {formatAmount(totalAmount)}
          </div>
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            Total Due
          </div>
        </div>
      </div>

      {/* Payment Splits */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold">
            Payment Methods
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {paymentSplits.length > 1 ? `${paymentSplits.length} methods` : 'Single method'}
          </span>
        </div>

        {paymentSplits.map((split, index) => (
          <div key={index} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {paymentSplits.length > 1 ? `Method ${index + 1}` : 'Amount & Method'}
              </span>
              {paymentSplits.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSplit(index)}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <X size={12} className="text-red-500" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Amount */}
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-500 font-semibold block mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={totalAmount}
                  value={split.amount || ''}
                  onChange={(e) => updateSplit(index, 'amount', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Method */}
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-500 font-semibold block mb-1">
                  Method
                </label>
                <select
                  value={split.method}
                  onChange={(e) => updateSplit(index, 'method', e.target.value)}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {availableMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reference Number */}
            {!['Cash', 'Room Charge', 'RoomCharge'].includes(split.method) && (
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-500 font-semibold block mb-1">
                  Reference Number {requireReference && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={split.reference}
                  onChange={(e) => updateSplit(index, 'reference', e.target.value)}
                  placeholder="Transaction reference..."
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Bank Account */}
            {requireBankAccount && (
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-500 font-semibold block mb-1">
                  Bank Account
                </label>
                <select
                  value={split.bankAccountId}
                  onChange={(e) => updateSplit(index, 'bankAccountId', e.target.value)}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select bank account...</option>
                  {bankAccounts && bankAccounts.length > 0 ? (
                    bankAccounts.filter((acc: any) => acc.is_active).map((acc: any) => {
                      const bankName = acc.bank_name || acc.account_name || acc.name || 'Unknown Bank';
                      return (
                        <option key={acc.id} value={acc.id}>
                          {bankName}-{acc.account_number}
                        </option>
                      );
                    })
                  ) : (
                    <option value="" disabled>No bank accounts available</option>
                  )}
                </select>
              </div>
            )}
          </div>
        ))}

        {/* Add Another Method Button */}
        {paymentSplits.length < availableMethods.length && (
          <button
            type="button"
            onClick={addSplit}
            className="w-full px-3 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus size={12} /> Add Another Payment Method
          </button>
        )}
      </div>

      {/* Payment Summary */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-600 dark:text-slate-400">Payment Total</span>
          <span className="font-bold text-slate-900 dark:text-white">{formatAmount(sumOfSplits)}</span>
        </div>
        {remainingAmount > 0.01 && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-amber-600 dark:text-amber-400">Remaining</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">{formatAmount(remainingAmount)}</span>
          </div>
        )}
      </div>

      {/* Receipt Upload */}
      {allowReceiptUpload && (
        <div>
          <label className="text-[10px] font-mono uppercase text-slate-500 font-semibold block mb-2">
            Payment Receipt (Optional)
          </label>
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center hover:border-indigo-500 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPaymentScreenshot(file);
              }}
              className="hidden"
              id="receipt-upload"
            />
            <label
              htmlFor="receipt-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              {paymentScreenshot ? (
                <>
                  <ImageIcon size={24} className="text-indigo-500" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {paymentScreenshot.name}
                  </span>
                </>
              ) : (
                <>
                  <Upload size={24} className="text-slate-400" />
                  <span className="text-xs text-slate-500">Click to upload receipt</span>
                </>
              )}
            </label>
          </div>
        </div>
      )}

      {/* Error Message */}
      {uploadError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-xs text-red-700 dark:text-red-400">
          {uploadError}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handlePaymentSubmit}
          disabled={isUploading || remainingAmount > 0.01}
          className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>Uploading...</>
          ) : (
            <>
              <Receipt size={14} />
              Complete Payment
            </>
          )}
        </button>
      </div>
    </div>
  );
}
