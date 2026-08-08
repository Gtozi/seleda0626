/**
 * Guest Account Module
 * Sign up, login, view reservations, saved searches, wishlist, and payment methods
 */

import { useState } from 'react';
import { User, Calendar, Heart, CreditCard, LogIn, UserPlus } from 'lucide-react';

const GuestAccountModule: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">My Account</h1>
        <p className="text-lg opacity-90">Manage your bookings and preferences</p>
      </div>

      {!isLoggedIn ? (
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'login' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'register' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Register
              </button>
            </div>

            {activeTab === 'login' ? (
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input type="email" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                  <input type="password" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white" />
                </div>
                <button
                  type="button"
                  onClick={() => setIsLoggedIn(true)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <LogIn size={20} />
                  Login
                </button>
              </form>
            ) : (
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input type="email" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                  <input type="password" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white" />
                </div>
                <button
                  type="button"
                  onClick={() => setIsLoggedIn(true)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <UserPlus size={20} />
                  Create Account
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <Calendar size={32} className="text-indigo-600 mb-3" />
              <h3 className="font-semibold text-slate-900 dark:text-white">My Reservations</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">View and manage bookings</p>
            </button>
            <button className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <Heart size={32} className="text-indigo-600 mb-3" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Wishlist</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Saved properties</p>
            </button>
            <button className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <CreditCard size={32} className="text-indigo-600 mb-3" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Payment Methods</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Manage cards</p>
            </button>
            <button className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <User size={32} className="text-indigo-600 mb-3" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Profile Settings</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Update information</p>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Recent Reservations</h2>
            <div className="space-y-4">
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Deluxe Room - SELEDA Grand Hotel</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Aug 15-20, 2026</p>
                  </div>
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm">Confirmed</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsLoggedIn(false)}
            className="w-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 py-3 rounded-lg font-semibold transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default GuestAccountModule;