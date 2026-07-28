/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState, useEffect } from 'react';
import {
  ChefHat,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Scale,
  Clock,
  DollarSign,
  Layers,
  Package,
  RefreshCw,
  X,
  Leaf
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

interface Recipe {
  id: string;
  menu_item_id: string;
  yield: number;
  portions: number;
  created_at: string;
  updated_at: string;
  menu_items?: {
    name: string;
    selling_price: number;
  };
}

export default function RecipeProductionManagement() {
  const { formatAmount, addNotification } = useERP();
  const [activeTab, setActiveTab] = useState<'recipes' | 'sub-recipes' | 'batch' | 'planning'>('recipes');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [formData, setFormData] = useState({
    menu_item_id: '',
    yield: 1,
    portions: 1
  });

  const tabs = [
    { id: 'recipes', label: 'Recipes', icon: BookOpen },
    { id: 'sub-recipes', label: 'Sub Recipes', icon: Layers },
    { id: 'batch', label: 'Batch Production', icon: Package },
    { id: 'planning', label: 'Production Planning', icon: Clock },
  ];

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/fb/recipes');
      if (!response.ok) throw new Error('Failed to fetch recipes');
      const data = await response.json();
      setRecipes(data.data || data || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      addNotification('Failed to load recipes', 'warning', 'F&B');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleCreateRecipe = () => {
    setEditingRecipe(null);
    setFormData({
      menu_item_id: '',
      yield: 1,
      portions: 1
    });
    setShowModal(true);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setFormData({
      menu_item_id: recipe.menu_item_id,
      yield: recipe.yield,
      portions: recipe.portions
    });
    setShowModal(true);
  };

  const handleSaveRecipe = async () => {
    try {
      const url = editingRecipe 
        ? `/api/fb/recipes/${editingRecipe.id}`
        : '/api/fb/recipes';
      
      const method = editingRecipe ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save recipe');

      addNotification(editingRecipe ? 'Recipe updated successfully' : 'Recipe created successfully', 'success', 'F&B');
      setShowModal(false);
      fetchRecipes();
    } catch (error) {
      console.error('Error saving recipe:', error);
      addNotification('Failed to save recipe', 'warning', 'F&B');
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    
    try {
      const response = await fetch(`/api/fb/recipes/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete recipe');

      addNotification('Recipe deleted successfully', 'success', 'F&B');
      fetchRecipes();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      addNotification('Failed to delete recipe', 'warning', 'F&B');
    }
  };

  const totalRecipes = recipes.length;
  const avgYield = recipes.length > 0 ? recipes.reduce((sum, r) => sum + r.yield, 0) / recipes.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Recipe & Production Management</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">The operational heart of the F&B department</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchRecipes} className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button onClick={handleCreateRecipe} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Recipe</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Recipes" value={String(totalRecipes)} icon={BookOpen} color="indigo" />
        <KPICard label="Avg Yield" value={avgYield.toFixed(2)} icon={Scale} color="purple" />
        <KPICard label="Batch Productions" value="0" icon={Package} color="amber" />
        <KPICard label="Active Plans" value="0" icon={Clock} color="green" />
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
        {activeTab === 'recipes' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-slate-500">Loading recipes...</div>
            ) : recipes.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recipes found</p>
                <p className="text-xs mt-1">Click "Add Recipe" to create your first recipe</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recipes.map((recipe) => (
                  <div key={recipe.id} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-600 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{recipe.menu_items?.name || 'Unknown Item'}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Yield: {recipe.yield} • Portions: {recipe.portions}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleEditRecipe(recipe)} className="p-1 text-slate-400 hover:text-indigo-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteRecipe(recipe.id)} className="p-1 text-slate-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'sub-recipes' && (
          <div className="space-y-4">
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Layers className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Sub Recipes module</p>
              <p className="text-xs mt-1">Manage sauces, stocks, doughs, and other sub-recipes</p>
            </div>
          </div>
        )}

        {activeTab === 'batch' && (
          <div className="space-y-4">
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Batch Production module</p>
              <p className="text-xs mt-1">Manage batch production workflows</p>
            </div>
          </div>
        )}

        {activeTab === 'planning' && (
          <div className="space-y-4">
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Production Planning module</p>
              <p className="text-xs mt-1">Plan production, reserve ingredients, and track quality</p>
            </div>
          </div>
        )}
      </div>

      {/* Recipe Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingRecipe ? 'Edit Recipe' : 'New Recipe'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Menu Item ID</label>
                <input
                  type="text"
                  value={formData.menu_item_id}
                  onChange={(e) => setFormData({ ...formData, menu_item_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Yield</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.yield}
                  onChange={(e) => setFormData({ ...formData, yield: parseFloat(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Portions</label>
                <input
                  type="number"
                  value={formData.portions}
                  onChange={(e) => setFormData({ ...formData, portions: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveRecipe}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingRecipe ? 'Update Recipe' : 'Create Recipe'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function KPICard({ label, value, icon: Icon, color }: any) {
  const colorClasses = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    amber: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function Calendar({ className }: any) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
