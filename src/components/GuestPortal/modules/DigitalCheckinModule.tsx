/**
 * Digital Check-in Module
 * Online registration, identity verification, passport upload, signature capture
 */

import { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Upload,
  FileText,
  PenTool,
  CreditCard,
  MapPin,
  Calendar,
  User,
  Shield,
  ChevronRight,
  LogIn
} from 'lucide-react';

interface DigitalCheckinModuleProps {
  reservationId?: string;
}

interface CheckinStatus {
  status: 'Pending' | 'Approved' | 'CheckedIn';
  currentStep: number;
  completedSteps: string[];
}

interface CheckinData {
  estimatedArrival: string;
  roomPreference: string;
  paymentVerified: boolean;
  identityVerified: boolean;
  signatureCaptured: boolean;
}

const DigitalCheckinModule: React.FC<DigitalCheckinModuleProps> = ({
  reservationId
}) => {
  const [checkinStatus, setCheckinStatus] = useState<CheckinStatus>({
    status: 'Pending',
    currentStep: 1,
    completedSteps: []
  });

  const [checkinData, setCheckinData] = useState<CheckinData>({
    estimatedArrival: '',
    roomPreference: '',
    paymentVerified: false,
    identityVerified: false,
    signatureCaptured: false
  });

  const [uploading, setUploading] = useState(false);

  const steps = [
    { id: 1, name: 'Registration', icon: <User size={20} /> },
    { id: 2, name: 'Identity Verification', icon: <Shield size={20} /> },
    { id: 3, name: 'Payment Verification', icon: <CreditCard size={20} /> },
    { id: 4, name: 'Room Preferences', icon: <MapPin size={20} /> },
    { id: 5, name: 'Signature', icon: <PenTool size={20} /> }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      'Pending': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400',
      'Approved': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400',
      'CheckedIn': 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400'
    };
    return colors[status as keyof typeof colors] || colors['Pending'];
  };

  const handleStepComplete = (stepId: number) => {
    if (!checkinStatus.completedSteps.includes(stepId.toString())) {
      setCheckinStatus({
        ...checkinStatus,
        completedSteps: [...checkinStatus.completedSteps, stepId.toString()],
        currentStep: Math.min(checkinStatus.currentStep + 1, steps.length)
      });
    }
  };

  const handlePassportUpload = () => {
    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      setUploading(false);
      setCheckinData({ ...checkinData, identityVerified: true });
      handleStepComplete(2);
    }, 2000);
  };

  const handleSignatureCapture = () => {
    setCheckinData({ ...checkinData, signatureCaptured: true });
    handleStepComplete(5);
  };

  const handleSubmitCheckin = () => {
    setCheckinStatus({
      ...checkinStatus,
      status: 'Approved',
      currentStep: steps.length + 1
    });
  };

  const progressPercentage = (checkinStatus.completedSteps.length / steps.length) * 100;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Digital Check-in</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete your check-in online for a faster arrival experience
          </p>
        </div>
        <div className={`px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(checkinStatus.status)}`}>
          {checkinStatus.status}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Check-in Progress</h3>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {checkinStatus.completedSteps.length} of {steps.length} steps completed
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-6">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((step, index) => {
            const isCompleted = checkinStatus.completedSteps.includes(step.id.toString());
            const isCurrent = checkinStatus.currentStep === step.id;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition ${
                  isCompleted 
                    ? 'bg-emerald-100 border-emerald-500 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-400 dark:text-emerald-400'
                    : isCurrent
                    ? 'bg-indigo-100 border-indigo-500 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-400 dark:text-indigo-400'
                    : 'bg-slate-100 border-slate-300 text-slate-400 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-500'
                }`}>
                  {isCompleted ? <CheckCircle2 size={20} /> : step.icon}
                </div>
                <div className={`text-xs font-medium mt-2 text-center ${
                  isCompleted 
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : isCurrent
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {step.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        {checkinStatus.currentStep === 1 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Registration Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue="John Doe"
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue="john.doe@example.com"
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  defaultValue="+251 911 123 456"
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nationality
                </label>
                <input
                  type="text"
                  defaultValue="Ethiopian"
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => handleStepComplete(1)}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                Continue
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {checkinStatus.currentStep === 2 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Identity Verification</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center">
                <Upload size={48} className="mx-auto text-slate-400 mb-4" />
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Upload your passport or ID document
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                  Supported formats: PDF, JPG, PNG (Max 5MB)
                </p>
                <button
                  onClick={handlePassportUpload}
                  disabled={uploading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Choose File'}
                </button>
              </div>

              {checkinData.identityVerified && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700/50">
                  <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <div className="font-medium text-emerald-900 dark:text-emerald-100">Identity Verified</div>
                    <div className="text-sm text-emerald-700 dark:text-emerald-300">Your document has been verified successfully</div>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => handleStepComplete(2)}
                disabled={!checkinData.identityVerified}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {checkinStatus.currentStep === 3 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Payment Verification</h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Payment Method</span>
                  <span className="text-sm text-slate-900 dark:text-white">Credit Card **** 4242</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Pre-authorization Amount</span>
                  <span className="text-sm text-slate-900 dark:text-white">USD 200.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className="text-sm text-emerald-600 dark:text-emerald-400">Verified</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setCheckinData({ ...checkinData, paymentVerified: true });
                  handleStepComplete(3);
                }}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition text-sm font-medium"
              >
                Update Payment Method
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => handleStepComplete(3)}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                Continue
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {checkinStatus.currentStep === 4 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Room Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Estimated Arrival Time
                </label>
                <div className="relative">
                  <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="time"
                    value={checkinData.estimatedArrival}
                    onChange={(e) => setCheckinData({ ...checkinData, estimatedArrival: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Special Room Requests
                </label>
                <textarea
                  value={checkinData.roomPreference}
                  onChange={(e) => setCheckinData({ ...checkinData, roomPreference: e.target.value })}
                  placeholder="Any special requests for your room..."
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => handleStepComplete(4)}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                Continue
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {checkinStatus.currentStep === 5 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Signature Capture</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center bg-slate-50 dark:bg-slate-900/20">
                <PenTool size={48} className="mx-auto text-slate-400 mb-4" />
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Sign below to complete your digital check-in
                </p>
                <div className="h-32 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  <span className="text-slate-400 dark:text-slate-500 text-sm">Signature area</span>
                </div>
              </div>

              <button
                onClick={handleSignatureCapture}
                disabled={checkinData.signatureCaptured}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkinData.signatureCaptured ? 'Signature Captured' : 'Capture Signature'}
              </button>
            </div>
          </div>
        )}

        {checkinStatus.currentStep > steps.length && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={40} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Check-in Complete!</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Your digital check-in has been completed successfully. Proceed to the front desk for key collection.
            </p>
            <button
              onClick={handleSubmitCheckin}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium mx-auto"
            >
              <LogIn size={18} />
              Complete Check-in
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DigitalCheckinModule;
