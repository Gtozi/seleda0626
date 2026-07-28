/**
 * Mobile Check-In/Check-Out Component
 * Enables guests to complete check-in and check-out processes via mobile device
 */

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  FileText,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Bed,
  Key,
  Shield,
  Camera,
  Upload,
  Download,
  ArrowRight,
  AlertCircle,
  Info,
  RefreshCw
} from 'lucide-react';

interface CheckInData {
  reservationId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  roomNumber: string;
  roomType: string;
  totalAmount: number;
  paymentStatus: 'paid' | 'pending' | 'partial';
  idDocument?: {
    type: 'passport' | 'id_card' | 'driver_license';
    number: string;
    expiryDate: string;
    frontImage?: string;
    backImage?: string;
  };
  signature?: string;
  specialRequests: string;
}

interface CheckOutData {
  reservationId: string;
  roomNumber: string;
  checkOutDate: string;
  roomCondition: 'clean' | 'damaged' | 'needs_cleaning';
  miniBarUsage: Array<{
    item: string;
    price: number;
    quantity: number;
  }>;
  additionalCharges: Array<{
    description: string;
    amount: number;
  }>;
  feedback: {
    rating: number;
    comments: string;
  };
  roomPhotos?: string[];
}

const MobileCheckInOut = () => {
  const [mode, setMode] = useState<'check-in' | 'check-out'>('check-in');
  const [step, setStep] = useState(1);
  const [reservationCode, setReservationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkInData, setCheckInData] = useState<CheckInData | null>(null);
  const [checkOutData, setCheckOutData] = useState<CheckOutData | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleLookupReservation = async () => {
    if (!reservationCode.trim()) {
      setError('Please enter a reservation code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'check-in' 
        ? `/api/guest/check-in/lookup?code=${reservationCode}`
        : `/api/guest/check-out/lookup?code=${reservationCode}`;

      const res = await fetch(endpoint);
      const data = await res.json();

      if (res.ok) {
        if (mode === 'check-in') {
          setCheckInData(data);
          setStep(2);
        } else {
          setCheckOutData(data);
          setStep(2);
        }
      } else {
        setError(data.error || 'Reservation not found');
      }
    } catch (error) {
      setError('Failed to lookup reservation');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteCheckIn = async () => {
    if (!checkInData) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/guest/check-in/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkInData)
      });

      if (res.ok) {
        setSuccess(true);
        setStep(4);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to complete check-in');
      }
    } catch (error) {
      setError('Failed to complete check-in');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteCheckOut = async () => {
    if (!checkOutData) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/guest/check-out/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkOutData)
      });

      if (res.ok) {
        setSuccess(true);
        setStep(4);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to complete check-out');
      }
    } catch (error) {
      setError('Failed to complete check-out');
    } finally {
      setLoading(false);
    }
  };

  const handleIdDocumentUpload = async (field: 'frontImage' | 'backImage', file: File) => {
    // In production, upload to cloud storage and get URL
    const reader = new FileReader();
    reader.onloadend = () => {
      if (checkInData) {
        setCheckInData({
          ...checkInData,
          idDocument: {
            ...checkInData.idDocument!,
            [field]: reader.result as string
          }
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRoomPhotoUpload = async (file: File) => {
    // In production, upload to cloud storage and get URL
    const reader = new FileReader();
    reader.onloadend = () => {
      if (checkOutData) {
        setCheckOutData({
          ...checkOutData,
          roomPhotos: [...(checkOutData.roomPhotos || []), reader.result as string]
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Smartphone size={32} className="text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Mobile Check-In/Out</h1>
          </div>
          <p className="text-slate-600">Complete your hotel arrival or departure from your mobile device</p>
        </div>

        {/* Mode Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => {
                setMode('check-in');
                setStep(1);
                setCheckInData(null);
                setError('');
                setSuccess(false);
              }}
              className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all ${
                mode === 'check-in'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Check-In
            </button>
            <button
              onClick={() => {
                setMode('check-out');
                setStep(1);
                setCheckOutData(null);
                setError('');
                setSuccess(false);
              }}
              className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all ${
                mode === 'check-out'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Check-Out
            </button>
          </div>

          {/* Step 1: Reservation Lookup */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reservation Code
                </label>
                <input
                  type="text"
                  value={reservationCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReservationCode(e.target.value)}
                  placeholder="Enter your reservation code (e.g., RES-123456)"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                  <AlertCircle size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <button
                onClick={handleLookupReservation}
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Looking up...
                  </>
                ) : (
                  <>
                    <ArrowRight size={16} />
                    Continue
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 2: Check-In - Guest Information */}
          {step === 2 && mode === 'check-in' && checkInData && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="font-semibold text-slate-900 mb-2">Reservation Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-slate-500" />
                    <span className="text-slate-900">{checkInData.guestName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bed size={16} className="text-slate-500" />
                    <span className="text-slate-900">{checkInData.roomNumber} ({checkInData.roomType})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-slate-500" />
                    <span className="text-slate-900">{checkInData.checkInDate} - {checkInData.checkOutDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-slate-500" />
                    <span className={`text-slate-900 ${checkInData.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                      {checkInData.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ID Document Type
                </label>
                <select
                  value={checkInData.idDocument?.type || ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setCheckInData({
                      ...checkInData,
                      idDocument: { ...checkInData.idDocument!, type: e.target.value as any }
                    })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                >
                  <option value="">Select document type</option>
                  <option value="passport">Passport</option>
                  <option value="id_card">National ID Card</option>
                  <option value="driver_license">Driver's License</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Document Number
                </label>
                <input
                  type="text"
                  value={checkInData.idDocument?.number || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCheckInData({
                      ...checkInData,
                      idDocument: { ...checkInData.idDocument!, number: e.target.value }
                    })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={checkInData.idDocument?.expiryDate || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCheckInData({
                      ...checkInData,
                      idDocument: { ...checkInData.idDocument!, expiryDate: e.target.value }
                    })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Document Photos
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Front</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files && handleIdDocumentUpload('frontImage', e.target.files[0])}
                        className="hidden"
                        id="front-upload"
                      />
                      <label htmlFor="front-upload" className="cursor-pointer">
                        {checkInData.idDocument?.frontImage ? (
                          <img src={checkInData.idDocument.frontImage} alt="Front" className="w-full h-32 object-cover rounded" />
                        ) : (
                          <div className="space-y-2">
                            <Camera size={24} className="mx-auto text-slate-400" />
                            <p className="text-sm text-slate-600">Tap to upload</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Back</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files && handleIdDocumentUpload('backImage', e.target.files[0])}
                        className="hidden"
                        id="back-upload"
                      />
                      <label htmlFor="back-upload" className="cursor-pointer">
                        {checkInData.idDocument?.backImage ? (
                          <img src={checkInData.idDocument.backImage} alt="Back" className="w-full h-32 object-cover rounded" />
                        ) : (
                          <div className="space-y-2">
                            <Camera size={24} className="mx-auto text-slate-400" />
                            <p className="text-sm text-slate-600">Tap to upload</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Special Requests
                </label>
                <textarea
                  value={checkInData.specialRequests}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setCheckInData({ ...checkInData, specialRequests: e.target.value })
                  }
                  placeholder="Any special requests or notes..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                  rows={3}
                />
              </div>

              <button
                onClick={handleCompleteCheckIn}
                disabled={loading}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Complete Check-In
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 2: Check-Out - Room Condition */}
          {step === 2 && mode === 'check-out' && checkOutData && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="font-semibold text-slate-900 mb-2">Check-Out Details</h3>
                <div className="text-sm text-slate-600">
                  <p>Room {checkOutData.roomNumber}</p>
                  <p>Check-out Date: {checkOutData.checkOutDate}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Room Condition
                </label>
                <select
                  value={checkOutData.roomCondition}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setCheckOutData({ ...checkOutData, roomCondition: e.target.value as any })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                >
                  <option value="clean">Clean</option>
                  <option value="needs_cleaning">Needs Cleaning</option>
                  <option value="damaged">Damaged</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Room Photos
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        Array.from(e.target.files).forEach(file => handleRoomPhotoUpload(file));
                      }
                    }}
                    className="hidden"
                    id="room-photos-upload"
                  />
                  <label htmlFor="room-photos-upload" className="cursor-pointer">
                    <div className="space-y-2">
                      <Camera size={24} className="mx-auto text-slate-400" />
                      <p className="text-sm text-slate-600">Tap to upload room photos</p>
                    </div>
                  </label>
                </div>
                {checkOutData.roomPhotos && checkOutData.roomPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {checkOutData.roomPhotos.map((photo, index) => (
                      <img key={index} src={photo} alt={`Room ${index + 1}`} className="w-full h-20 object-cover rounded" />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Feedback Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setCheckOutData({
                        ...checkOutData,
                        feedback: { ...checkOutData.feedback, rating: star }
                      })}
                      className={`p-2 rounded-lg ${checkOutData.feedback.rating >= star ? 'bg-amber-400' : 'bg-slate-200'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Comments
                </label>
                <textarea
                  value={checkOutData.feedback.comments}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setCheckOutData({
                      ...checkOutData,
                      feedback: { ...checkOutData.feedback, comments: e.target.value }
                    })
                  }
                  placeholder="Share your experience..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                  rows={3}
                />
              </div>

              <button
                onClick={handleCompleteCheckOut}
                disabled={loading}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Complete Check-Out
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && success && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {mode === 'check-in' ? 'Check-In Complete!' : 'Check-Out Complete!'}
              </h3>
              <p className="text-slate-600 mb-6">
                {mode === 'check-in' 
                  ? 'Your room is ready. Enjoy your stay!'
                  : 'Thank you for staying with us. We hope to see you again!'}
              </p>
              {mode === 'check-in' && checkInData && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Key size={20} className="text-blue-600" />
                    <span className="font-semibold text-slate-900">Room {checkInData.roomNumber}</span>
                  </div>
                  <p className="text-sm text-slate-600">Your digital key has been sent to your email</p>
                </div>
              )}
              <button
                onClick={() => {
                  setStep(1);
                  setReservationCode('');
                  setCheckInData(null);
                  setCheckOutData(null);
                  setSuccess(false);
                  setError('');
                }}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
              >
                Done
              </button>
            </div>
          )}

          {error && step > 1 && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-slate-600">
          <div className="flex items-center justify-center gap-2">
            <Shield size={16} />
            <span>Secure Mobile Check-In/Out</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileCheckInOut;
