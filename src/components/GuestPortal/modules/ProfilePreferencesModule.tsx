/**
 * Profile & Preferences Module
 * Manages guest personal information and stay preferences
 */

import { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Globe,
  DollarSign,
  Bed,
  Coffee,
  Thermometer,
  Heart,
  Accessibility,
  Save,
  Edit,
  CheckCircle2
} from 'lucide-react';

interface ProfilePreferencesModuleProps {
  guestId?: string;
}

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  preferredLanguage: 'en' | 'am' | 'ti';
  preferredCurrency: 'USD' | 'EUR' | 'ETB';
}

interface StayPreferences {
  bedType: 'King' | 'Queen' | 'Twin' | 'Double';
  pillowType: 'Soft' | 'Medium' | 'Firm';
  floorPreference: 'Lower' | 'Middle' | 'Higher' | 'Any';
  smokingPreference: 'Non-Smoking' | 'Smoking';
  roomTemperature: number;
  dietaryPreferences: string[];
  allergies: string[];
  accessibilityNeeds: string[];
}

const ProfilePreferencesModule: React.FC<ProfilePreferencesModuleProps> = ({
  guestId
}) => {
  const [editing, setEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+251 911 123 456',
    nationality: 'Ethiopian',
    preferredLanguage: 'en',
    preferredCurrency: 'USD'
  });

  const [stayPreferences, setStayPreferences] = useState<StayPreferences>({
    bedType: 'King',
    pillowType: 'Medium',
    floorPreference: 'Higher',
    smokingPreference: 'Non-Smoking',
    roomTemperature: 22,
    dietaryPreferences: ['Vegetarian'],
    allergies: ['Peanuts'],
    accessibilityNeeds: []
  });

  const handleSave = () => {
    setEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    // API call to save preferences would go here
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleDietaryToggle = (preference: string) => {
    if (stayPreferences.dietaryPreferences.includes(preference)) {
      setStayPreferences({
        ...stayPreferences,
        dietaryPreferences: stayPreferences.dietaryPreferences.filter(p => p !== preference)
      });
    } else {
      setStayPreferences({
        ...stayPreferences,
        dietaryPreferences: [...stayPreferences.dietaryPreferences, preference]
      });
    }
  };

  const handleAllergyToggle = (allergy: string) => {
    if (stayPreferences.allergies.includes(allergy)) {
      setStayPreferences({
        ...stayPreferences,
        allergies: stayPreferences.allergies.filter(a => a !== allergy)
      });
    } else {
      setStayPreferences({
        ...stayPreferences,
        allergies: [...stayPreferences.allergies, allergy]
      });
    }
  };

  const handleAccessibilityToggle = (need: string) => {
    if (stayPreferences.accessibilityNeeds.includes(need)) {
      setStayPreferences({
        ...stayPreferences,
        accessibilityNeeds: stayPreferences.accessibilityNeeds.filter(n => n !== need)
      });
    } else {
      setStayPreferences({
        ...stayPreferences,
        accessibilityNeeds: [...stayPreferences.accessibilityNeeds, need]
      });
    }
  };

  const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Kosher', 'Halal'];
  const allergyOptions = ['Peanuts', 'Tree Nuts', 'Shellfish', 'Dairy', 'Eggs', 'Soy', 'Wheat'];
  const accessibilityOptions = ['Wheelchair Access', 'Hearing Assistance', 'Visual Assistance', 'Service Animal'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile & Preferences</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal information and stay preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={18} />
              <span className="text-sm font-medium">Saved successfully</span>
            </div>
          )}
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
            >
              <Edit size={16} />
              Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
            <User size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Personal Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={personalInfo.firstName}
              onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
              disabled={!editing}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={personalInfo.lastName}
              onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
              disabled={!editing}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={personalInfo.email}
                onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                disabled={!editing}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Phone
            </label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={personalInfo.phone}
                onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                disabled={!editing}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Nationality
            </label>
            <input
              type="text"
              value={personalInfo.nationality}
              onChange={(e) => setPersonalInfo({ ...personalInfo, nationality: e.target.value })}
              disabled={!editing}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Preferred Language
            </label>
            <div className="relative">
              <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={personalInfo.preferredLanguage}
                onChange={(e) => setPersonalInfo({ ...personalInfo, preferredLanguage: e.target.value as any })}
                disabled={!editing}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="en">English</option>
                <option value="am">Amharic</option>
                <option value="ti">Tigrinya</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Preferred Currency
            </label>
            <div className="relative">
              <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={personalInfo.preferredCurrency}
                onChange={(e) => setPersonalInfo({ ...personalInfo, preferredCurrency: e.target.value as any })}
                disabled={!editing}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="ETB">ETB - Ethiopian Birr</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stay Preferences */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
            <Bed size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Stay Preferences</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Bed Type
            </label>
            <select
              value={stayPreferences.bedType}
              onChange={(e) => setStayPreferences({ ...stayPreferences, bedType: e.target.value as any })}
              disabled={!editing}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="King">King</option>
              <option value="Queen">Queen</option>
              <option value="Twin">Twin</option>
              <option value="Double">Double</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Pillow Type
            </label>
            <select
              value={stayPreferences.pillowType}
              onChange={(e) => setStayPreferences({ ...stayPreferences, pillowType: e.target.value as any })}
              disabled={!editing}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="Soft">Soft</option>
              <option value="Medium">Medium</option>
              <option value="Firm">Firm</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Floor Preference
            </label>
            <select
              value={stayPreferences.floorPreference}
              onChange={(e) => setStayPreferences({ ...stayPreferences, floorPreference: e.target.value as any })}
              disabled={!editing}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="Lower">Lower Floors</option>
              <option value="Middle">Middle Floors</option>
              <option value="Higher">Higher Floors</option>
              <option value="Any">No Preference</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Smoking Preference
            </label>
            <select
              value={stayPreferences.smokingPreference}
              onChange={(e) => setStayPreferences({ ...stayPreferences, smokingPreference: e.target.value as any })}
              disabled={!editing}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="Non-Smoking">Non-Smoking</option>
              <option value="Smoking">Smoking</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Preferred Room Temperature
            </label>
            <div className="flex items-center gap-3">
              <Thermometer size={18} className="text-slate-400" />
              <input
                type="range"
                min="16"
                max="26"
                value={stayPreferences.roomTemperature}
                onChange={(e) => setStayPreferences({ ...stayPreferences, roomTemperature: parseInt(e.target.value) })}
                disabled={!editing}
                className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="text-sm font-medium text-slate-900 dark:text-white w-12 text-right">
                {stayPreferences.roomTemperature}°C
              </span>
            </div>
          </div>
        </div>

        {/* Dietary Preferences */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Dietary Preferences
          </label>
          <div className="flex flex-wrap gap-2">
            {dietaryOptions.map((option) => (
              <button
                key={option}
                onClick={() => editing && handleDietaryToggle(option)}
                disabled={!editing}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                  stayPreferences.dietaryPreferences.includes(option)
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400'
                    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Allergies
          </label>
          <div className="flex flex-wrap gap-2">
            {allergyOptions.map((option) => (
              <button
                key={option}
                onClick={() => editing && handleAllergyToggle(option)}
                disabled={!editing}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                  stayPreferences.allergies.includes(option)
                    ? 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/20 dark:border-red-700/50 dark:text-red-400'
                    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Accessibility Needs */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Accessibility Needs
          </label>
          <div className="flex flex-wrap gap-2">
            {accessibilityOptions.map((option) => (
              <button
                key={option}
                onClick={() => editing && handleAccessibilityToggle(option)}
                disabled={!editing}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition flex items-center gap-1.5 ${
                  stayPreferences.accessibilityNeeds.includes(option)
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900/20 dark:border-indigo-700/50 dark:text-indigo-400'
                    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                <Accessibility size={14} />
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePreferencesModule;
