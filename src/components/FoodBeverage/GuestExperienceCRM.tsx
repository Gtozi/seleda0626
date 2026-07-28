/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState } from 'react';
import {
  Users,
  Heart,
  AlertCircle,
  Star,
  Award,
  MessageSquare,
  TrendingUp,
  Search,
  Filter,
  Plus,
  History,
  Gift,
  Tag,
  ShieldCheck,
  ThumbsUp
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export default function GuestExperienceCRM() {
  const { addNotification } = useERP();
  const [activeTab, setActiveTab] = useState<'dining-history' | 'favorites' | 'allergies' | 'vip' | 'loyalty' | 'feedback'>('dining-history');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'dining-history', label: 'Dining History', icon: History },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'allergies', label: 'Allergies & Diet', icon: AlertCircle },
    { id: 'vip', label: 'VIP Recognition', icon: Award },
    { id: 'loyalty', label: 'Loyalty Points', icon: Star },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Guest Experience & CRM</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Guest dining profiles, preferences, and loyalty management</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add Guest Profile</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Guests</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">1,247</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">VIP Guests</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">89</p>
            </div>
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Loyalty Points Issued</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">45.2K</p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Avg Satisfaction</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">4.7</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <ThumbsUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        {activeTab === 'dining-history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search guest history..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm w-64"
                  />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">Filter</span>
                </button>
              </div>
            </div>

            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Dining History module</p>
              <p className="text-xs mt-1">View complete dining history for each guest across all outlets</p>
            </div>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="space-y-4">
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Favorites module</p>
              <p className="text-xs mt-1">Track favorite dishes, drinks, and dining preferences</p>
            </div>
          </div>
        )}

        {activeTab === 'allergies' && (
          <div className="space-y-4">
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Allergies & Dietary Restrictions module</p>
              <p className="text-xs mt-1">Manage guest allergies, dietary restrictions, and special requirements</p>
            </div>
          </div>
        )}

        {activeTab === 'vip' && (
          <div className="space-y-4">
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">VIP Recognition module</p>
              <p className="text-xs mt-1">Identify and manage VIP guests with special recognition and service</p>
            </div>
          </div>
        )}

        {activeTab === 'loyalty' && (
          <div className="space-y-4">
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Loyalty Points module</p>
              <p className="text-xs mt-1">Manage loyalty points, rewards, and personalized offers</p>
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="space-y-4">
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Feedback module</p>
              <p className="text-xs mt-1">Track guest feedback, complaints, and satisfaction scores</p>
            </div>
          </div>
        )}
      </div>

      {/* Personalized Offers Panel */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Personalized Offers Engine
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Tag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Targeted Promotions</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Send personalized offers based on guest preferences</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Behavioral Targeting</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Analyze dining patterns to suggest relevant offers</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Compliance Safe</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Respect guest privacy and communication preferences</p>
          </div>
        </div>
      </div>
    </div>
  );
}
