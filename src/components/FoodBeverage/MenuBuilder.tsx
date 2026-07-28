import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  X,
  Utensils,
  Layers,
  Calendar,
  CheckCircle2,
  DollarSign,
  Store,
  ChefHat,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

interface Menu {
  id: string;
  name: string;
  description: string | null;
  menu_type: 'a_la_carte' | 'table_dhote' | 'fixed_course' | 'rotational';
  base_price: number | null;
  day_part: string | null;
  status: 'draft' | 'active' | 'archived';
  valid_from: string | null;
  valid_to: string | null;
  created_at: string;
}

interface Course {
  id: string;
  menu_id: string;
  sequence_number: number;
  name: string;
  choice_count: number;
  fire_mode: 'immediate' | 'hold_until_prior_served';
  day_of_week?: string | null;
}

interface CourseItem {
  id: string;
  menu_id: string;
  course_id: string | null;
  item_id: string;
  price_override: number | null;
  is_supplement: boolean;
  supplement_price: number | null;
  sort_order: number;
  item?: {
    id: string;
    name: string;
    selling_price: number;
    is_available: boolean;
    image_url: string | null;
    item_type: string;
  };
}

interface OutletAssignment {
  id: string;
  menu_id: string;
  outlet_id: string;
  is_primary: boolean;
  active_from: string | null;
  active_to: string | null;
  outlet?: {
    id: string;
    name: string;
    outlet_type: string;
    code: string;
  };
}

interface POSOutlet {
  id: string;
  name: string;
  outlet_type: string;
  code: string;
}

interface MenuItemOption {
  id: string;
  name: string;
  selling_price: number;
  is_available: boolean;
  item_type: string;
  recipe_id?: string | null;
}

interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit_of_measure: string;
  current_cost: number;
}

interface RecipeLineInput {
  ingredient_id: string;
  quantity: number;
  unit: string;
  cost_at_time_of_costing: number;
}

interface RecipeDetail {
  id: string;
  menu_item_id: string;
  yield: number;
  portions: number;
  recipe_lines: Array<{
    id: string;
    ingredient_id: string;
    quantity: number;
    unit: string;
    cost_at_time_of_costing: number;
    ingredients?: Ingredient;
  }>;
  total_ingredient_cost: number;
  adjusted_plate_cost: number;
  cost_per_portion: number;
  ingredient_breakdown: Array<{
    ingredient_id: string;
    ingredient_name: string;
    quantity: number;
    unit: string;
    cost_per_unit: number;
    line_cost: number;
  }>;
}

interface MenuDetail extends Menu {
  courses: Course[];
  course_items: CourseItem[];
  outlet_assignments: OutletAssignment[];
}

const MENU_TYPE_LABELS: Record<string, string> = {
  a_la_carte: 'À la carte',
  table_dhote: 'Table d\'hôte',
  fixed_course: 'Fixed Course',
  rotational: 'Rotational',
};

const MENU_TYPE_COLORS: Record<string, string> = {
  a_la_carte: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  table_dhote: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  fixed_course: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  rotational: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  archived: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

interface PrepStation {
  id: string;
  station_name: string;
  station_type: string;
}

export default function MenuBuilder() {
  const { addNotification } = useERP();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [outlets, setOutlets] = useState<POSOutlet[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemOption[]>([]);
  const [prepStations, setPrepStations] = useState<PrepStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState<MenuDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    menu_type: 'a_la_carte' as Menu['menu_type'],
    base_price: '',
    day_part: '',
    status: 'draft' as Menu['status'],
    valid_from: '',
    valid_to: '',
  });

  // Course form
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({
    name: '',
    sequence_number: 1,
    choice_count: 1,
    fire_mode: 'immediate' as Course['fire_mode'],
    day_of_week: '' as string,
  });
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  // Item picker
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [itemPickerCourseId, setItemPickerCourseId] = useState<string | null>(null);
  const [itemSearch, setItemSearch] = useState('');

  // New item form (inside item picker)
  const [showCreateItem, setShowCreateItem] = useState(false);
  const [itemForm, setItemForm] = useState({
    name: '',
    selling_price: '',
    item_type: 'Prepared',
    prep_required: true,
    prep_station_id: '',
    outlet_id: '',
    description: '',
  });

  // Recipe management
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipeLines, setRecipeLines] = useState<RecipeLineInput[]>([]);
  const [showRecipeSection, setShowRecipeSection] = useState(false);
  const [viewingRecipe, setViewingRecipe] = useState<RecipeDetail | null>();
  const [recipeLoading, setRecipeLoading] = useState(false);

  // Outlet assignment
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignOutletId, setAssignOutletId] = useState('');
  const [assignIsPrimary, setAssignIsPrimary] = useState(false);

  const fetchMenus = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/pos/menus', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMenus(data.menus || []);
      } else {
        console.error('Failed to fetch menus:', res.status, res.statusText);
      }
    } catch (err) {
      console.error('Failed to fetch menus:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOutlets = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/pos/outlets-list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOutlets(data.outlets || []);
      }
    } catch (err) {
      console.error('Failed to fetch outlets:', err);
    }
  }, []);

  const fetchMenuItems = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/pos/menu-items?limit=500', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMenuItems(data.items || data.menuItems || []);
      }
    } catch (err) {
      console.error('Failed to fetch menu items:', err);
    }
  }, []);

  const fetchPrepStations = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/pos/prep-stations?is_active=true', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPrepStations(data.stations || []);
      }
    } catch (err) {
      console.error('Failed to fetch prep stations:', err);
    }
  }, []);

  const fetchIngredients = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/pos/ingredients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIngredients(data.ingredients || []);
      }
    } catch (err) {
      console.error('Failed to fetch ingredients:', err);
    }
  }, []);

  const fetchRecipeForItem = async (itemId: string) => {
    setRecipeLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/pos/menu-items/${itemId}/recipe`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setViewingRecipe(data);
      } else {
        setViewingRecipe(null);
      }
    } catch (err) {
      console.error('Failed to fetch recipe:', err);
      setViewingRecipe(null);
    } finally {
      setRecipeLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
    fetchOutlets();
    fetchMenuItems();
    fetchPrepStations();
    fetchIngredients();
  }, [fetchMenus, fetchOutlets, fetchMenuItems, fetchPrepStations, fetchIngredients]);

  const fetchMenuDetail = async (menuId: string) => {
    setLoadingDetail(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/pos/menus/${menuId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedMenu(data);
      }
    } catch (err) {
      console.error('Failed to fetch menu detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ── Menu CRUD ──────────────────────────────────────────────────────────

  const handleCreateMenu = async () => {
    if (!formData.name.trim()) {
      addNotification('Menu name is required', 'warning', 'F&B');
      return;
    }
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/pos/menus', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          menu_type: formData.menu_type,
          base_price: formData.base_price ? parseFloat(formData.base_price) : null,
          day_part: formData.day_part || null,
          status: formData.status,
          valid_from: formData.valid_from || null,
          valid_to: formData.valid_to || null,
        }),
      });
      if (res.ok) {
        addNotification('Menu created', 'success', 'F&B');
        setShowCreateModal(false);
        resetForm();
        fetchMenus();
      } else {
        const err = await res.json();
        addNotification(err.error || 'Failed to create menu', 'warning', 'F&B');
      }
    } catch (err) {
      addNotification('Failed to create menu', 'warning', 'F&B');
    }
  };

  const handleUpdateMenu = async () => {
    if (!selectedMenu) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/pos/menus/${selectedMenu.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          menu_type: formData.menu_type,
          base_price: formData.base_price ? parseFloat(formData.base_price) : null,
          day_part: formData.day_part || null,
          status: formData.status,
          valid_from: formData.valid_from || null,
          valid_to: formData.valid_to || null,
        }),
      });
      if (res.ok) {
        addNotification('Menu updated', 'success', 'F&B');
        setEditingMenu(false);
        setShowCreateModal(false);
        fetchMenus();
        fetchMenuDetail(selectedMenu.id);
      }
    } catch (err) {
      addNotification('Failed to update menu', 'warning', 'F&B');
    }
  };

  const handleDeleteMenu = async (menuId: string) => {
    if (!confirm('Delete this menu? All courses, item assignments, and outlet assignments will be removed.')) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/pos/menus/${menuId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        addNotification('Menu deleted', 'success', 'F&B');
        if (selectedMenu?.id === menuId) setSelectedMenu(null);
        fetchMenus();
      }
    } catch (err) {
      addNotification('Failed to delete menu', 'warning', 'F&B');
    }
  };

  // ── Course CRUD ────────────────────────────────────────────────────────

  const handleSaveCourse = async () => {
    if (!selectedMenu || !courseForm.name.trim()) {
      addNotification('Course name is required', 'warning', 'F&B');
      return;
    }
    try {
      const token = localStorage.getItem('auth_token');
      const url = editingCourseId
        ? `/api/pos/menus/${selectedMenu.id}/courses/${editingCourseId}`
        : `/api/pos/menus/${selectedMenu.id}/courses`;
      const method = editingCourseId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...courseForm,
          day_of_week: selectedMenu.menu_type === 'rotational' ? (courseForm.day_of_week || selectedDay) : null,
        }),
      });
      if (res.ok) {
        addNotification(editingCourseId ? 'Course updated' : 'Course added', 'success', 'F&B');
        setShowCourseModal(false);
        setEditingCourseId(null);
        setCourseForm({ name: '', sequence_number: 1, choice_count: 1, fire_mode: 'immediate', day_of_week: '' });
        fetchMenuDetail(selectedMenu.id);
      }
    } catch (err) {
      addNotification('Failed to save course', 'warning', 'F&B');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!selectedMenu) return;
    if (!confirm('Delete this course and all its item assignments?')) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/pos/menus/${selectedMenu.id}/courses/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        addNotification('Course deleted', 'success', 'F&B');
        fetchMenuDetail(selectedMenu.id);
      }
    } catch (err) {
      addNotification('Failed to delete course', 'warning', 'F&B');
    }
  };

  // ── Item Assignment ────────────────────────────────────────────────────

  const handleAddItem = async (itemId: string) => {
    if (!selectedMenu) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/pos/menus/${selectedMenu.id}/items`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: itemId,
          course_id: itemPickerCourseId || null,
        }),
      });
      if (res.ok) {
        addNotification('Item added to menu', 'success', 'F&B');
        fetchMenuDetail(selectedMenu.id);
      } else {
        const err = await res.json();
        addNotification(err.error || 'Failed to add item', 'warning', 'F&B');
      }
    } catch (err) {
      addNotification('Failed to add item', 'warning', 'F&B');
    }
  };

  const handleRemoveItem = async (courseItemId: string) => {
    if (!selectedMenu) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/pos/menus/${selectedMenu.id}/items/${courseItemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        addNotification('Item removed', 'success', 'F&B');
        fetchMenuDetail(selectedMenu.id);
      }
    } catch (err) {
      addNotification('Failed to remove item', 'warning', 'F&B');
    }
  };

  // ── Outlet Assignment ──────────────────────────────────────────────────

  const handleAssignOutlet = async () => {
    if (!selectedMenu || !assignOutletId) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/pos/menus/${selectedMenu.id}/assignments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ outlet_id: assignOutletId, is_primary: assignIsPrimary }),
      });
      if (res.ok) {
        addNotification('Menu assigned to outlet', 'success', 'F&B');
        setShowAssignModal(false);
        setAssignOutletId('');
        setAssignIsPrimary(false);
        fetchMenuDetail(selectedMenu.id);
      } else {
        const err = await res.json();
        addNotification(err.error || 'Failed to assign', 'warning', 'F&B');
      }
    } catch (err) {
      addNotification('Failed to assign outlet', 'warning', 'F&B');
    }
  };

  const handleUnassignOutlet = async (assignmentId: string) => {
    if (!selectedMenu) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/pos/menus/${selectedMenu.id}/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        addNotification('Outlet unassigned', 'success', 'F&B');
        fetchMenuDetail(selectedMenu.id);
      }
    } catch (err) {
      addNotification('Failed to unassign', 'warning', 'F&B');
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────

  const resetForm = () => {
    setFormData({
      name: '', description: '', menu_type: 'a_la_carte',
      base_price: '', day_part: '', status: 'draft', valid_from: '', valid_to: '',
    });
  };

  const openCreateModal = () => {
    setEditingMenu(false);
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = () => {
    if (!selectedMenu) return;
    setEditingMenu(true);
    setFormData({
      name: selectedMenu.name,
      description: selectedMenu.description || '',
      menu_type: selectedMenu.menu_type,
      base_price: selectedMenu.base_price?.toString() || '',
      day_part: selectedMenu.day_part || '',
      status: selectedMenu.status,
      valid_from: selectedMenu.valid_from || '',
      valid_to: selectedMenu.valid_to || '',
    });
    setShowCreateModal(true);
  };

  const openCourseModal = (course?: Course) => {
    if (course) {
      setEditingCourseId(course.id);
      setCourseForm({
        name: course.name,
        sequence_number: course.sequence_number,
        choice_count: course.choice_count,
        fire_mode: course.fire_mode,
        day_of_week: course.day_of_week || '',
      });
    } else {
      setEditingCourseId(null);
      const nextSeq = (selectedMenu?.courses?.filter(c => c.day_of_week === selectedDay).length || 0) + 1;
      setCourseForm({ name: '', sequence_number: nextSeq, choice_count: 1, fire_mode: 'immediate', day_of_week: selectedMenu?.menu_type === 'rotational' ? selectedDay : '' });
    }
    setShowCourseModal(true);
  };

  const assignedOutletIds = selectedMenu?.outlet_assignments?.map(a => a.outlet_id) || [];
  const availableOutlets = outlets.filter(o => !assignedOutletIds.includes(o.id));
  const filteredMenuItems = menuItems.filter(mi =>
    mi.name.toLowerCase().includes(itemSearch.toLowerCase())
  );

  const handleCreateItem = async () => {
    if (!itemForm.name.trim() || !itemForm.selling_price) {
      addNotification('Name and price are required', 'warning', 'F&B');
      return;
    }
    if (!itemForm.outlet_id) {
      addNotification('Please select an outlet', 'warning', 'F&B');
      return;
    }
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/pos/menu-items', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outlet_id: itemForm.outlet_id,
          name: itemForm.name,
          description: itemForm.description || null,
          selling_price: parseFloat(itemForm.selling_price),
          item_type: itemForm.item_type,
          prep_required: itemForm.prep_required,
          prep_station_id: itemForm.prep_station_id || null,
          is_available: true,
          is_active: true,
        }),
      });
      if (res.ok) {
        const newItem = await res.json();

        // Create recipe if ingredient lines were added
        if (recipeLines.length > 0 && recipeLines.some(l => l.ingredient_id)) {
          try {
            const recipeRes = await fetch(`/api/pos/menu-items/${newItem.id}/recipe`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                yield: 1.0,
                portions: 1,
                lines: recipeLines.filter(l => l.ingredient_id),
              }),
            });
            if (recipeRes.ok) {
              addNotification('Item created with recipe', 'success', 'F&B');
            } else {
              addNotification('Item created, but recipe failed', 'warning', 'F&B');
            }
          } catch {
            addNotification('Item created, but recipe failed', 'warning', 'F&B');
          }
        } else {
          addNotification('Item created', 'success', 'F&B');
        }

        setShowCreateItem(false);
        setItemForm({ name: '', selling_price: '', item_type: 'Prepared', prep_required: true, prep_station_id: '', outlet_id: '', description: '' });
        setRecipeLines([]);
        setShowRecipeSection(false);
        fetchMenuItems();
        if (selectedMenu) {
          handleAddItem(newItem.id);
        }
      } else {
        const err = await res.json();
        addNotification(err.error || 'Failed to create item', 'warning', 'F&B');
      }
    } catch (err) {
      addNotification('Failed to create item', 'warning', 'F&B');
    }
  };

  const isAlaCarte = selectedMenu?.menu_type === 'a_la_carte';
  const isRotational = selectedMenu?.menu_type === 'rotational';
  const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
  const dayCourses = (selectedMenu?.courses || []).filter(c => isRotational ? c.day_of_week === selectedDay : true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen size={24} className="text-amber-500" />
            Menu Builder
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Author à la carte, table d'hôte, and fixed course menus with courses, choice sets, and outlet assignments
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { fetchMenus(); fetchOutlets(); fetchMenuItems(); }}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
            title="Refresh"
          >
            <RefreshCw size={16} className="text-slate-500" />
          </button>
          <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-sm font-bold transition-all"
            >
              <Plus size={16} /> New Menu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu List */}
        <div className="lg:col-span-1 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
          ) : menus.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No menus yet</p>
              <p className="text-xs text-slate-400 mt-1">Create a menu to get started</p>
            </div>
          ) : (
            menus.map(menu => (
              <div
                key={menu.id}
                className={`bg-white dark:bg-slate-900 border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedMenu?.id === menu.id
                    ? 'border-amber-500 shadow-md'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
                onClick={() => fetchMenuDetail(menu.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{menu.name}</h3>
                    {menu.description && (
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{menu.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); }}
                      className="p-1 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded"
                      title="Delete"
                    >
                      <Trash2 size={12} className="text-rose-400" onClick={() => handleDeleteMenu(menu.id)} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${MENU_TYPE_COLORS[menu.menu_type]}`}>
                    {MENU_TYPE_LABELS[menu.menu_type]}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${STATUS_COLORS[menu.status]}`}>
                    {menu.status}
                  </span>
                  {menu.day_part && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {menu.day_part}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Menu Detail */}
        <div className="lg:col-span-2">
          {loadingDetail ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
          ) : !selectedMenu ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-sm text-slate-500">Select a menu to view details</p>
              <p className="text-xs text-slate-400 mt-1">Or create a new menu to start building</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
              {/* Menu Header */}
              <div className="flex items-start justify-between border-b dark:border-slate-800 pb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedMenu.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${MENU_TYPE_COLORS[selectedMenu.menu_type]}`}>
                      {MENU_TYPE_LABELS[selectedMenu.menu_type]}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${STATUS_COLORS[selectedMenu.status]}`}>
                      {selectedMenu.status}
                    </span>
                  </div>
                  {selectedMenu.description && (
                    <p className="text-xs text-slate-500">{selectedMenu.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                    {selectedMenu.base_price != null && (
                      <span className="flex items-center gap-1">
                        <DollarSign size={10} /> Base: {selectedMenu.base_price}
                      </span>
                    )}
                    {selectedMenu.day_part && (
                      <span className="flex items-center gap-1">
                        <Calendar size={10} /> {selectedMenu.day_part}
                      </span>
                    )}
                    {selectedMenu.valid_from && (
                      <span>From: {selectedMenu.valid_from}</span>
                    )}
                    {selectedMenu.valid_to && (
                      <span>To: {selectedMenu.valid_to}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={openEditModal}
                    className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                    title="Edit menu"
                  >
                    <Edit2 size={14} className="text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Outlet Assignments */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Store size={14} /> Outlet Assignments
                  </h4>
                  <button
                    onClick={() => setShowAssignModal(true)}
                    disabled={availableOutlets.length === 0}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                  >
                    <Plus size={12} /> Assign Outlet
                  </button>
                </div>
                {selectedMenu.outlet_assignments && selectedMenu.outlet_assignments.length > 0 ? (
                  <div className="space-y-2">
                    {selectedMenu.outlet_assignments.map((assign) => (
                      <div key={assign.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <Store size={14} className="text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {assign.outlet?.name || 'Unknown'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {assign.outlet?.outlet_type} · {assign.outlet?.code}
                              {assign.is_primary && ' · Primary'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnassignOutlet(assign.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-3">Not assigned to any outlet yet</p>
                )}
              </div>

              {/* Courses Section (only for table_dhote / fixed_course / rotational) */}
              {!isAlaCarte && (
                <div>
                  {/* Day-of-week tabs for rotational menus */}
                  {isRotational && (
                    <div className="flex items-center gap-1 mb-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      {DAYS_OF_WEEK.map((day) => {
                        const count = (selectedMenu?.courses || []).filter(c => c.day_of_week === day).length;
                        return (
                          <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                              selectedDay === day
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {day.slice(0, 3)}
                            {count > 0 && (
                              <span className={`text-[9px] px-1 rounded-full ${
                                selectedDay === day ? 'bg-purple-400 text-white' : 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                              }`}>{count}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Layers size={14} /> {isRotational ? `${selectedDay} Courses` : 'Courses'}
                    </h4>
                    <button
                      onClick={() => openCourseModal()}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
                    >
                      <Plus size={12} /> Add Course{isRotational ? ` to ${selectedDay}` : ''}
                    </button>
                  </div>
                  {dayCourses.length > 0 ? (
                    <div className="space-y-3">
                      {dayCourses
                        .sort((a, b) => a.sequence_number - b.sequence_number)
                        .map((course) => (
                          <div key={course.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center text-[10px] font-black">
                                  {course.sequence_number}
                                </span>
                                <div>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white">{course.name}</p>
                                  <p className="text-[10px] text-slate-400">
                                    Choose {course.choice_count} · {course.fire_mode === 'immediate' ? 'Fire immediately' : 'Hold until prior served'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => openCourseModal(course)}
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                                >
                                  <Edit2 size={12} className="text-slate-400" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCourse(course.id)}
                                  className="p-1 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded"
                                >
                                  <Trash2 size={12} className="text-rose-400" />
                                </button>
                              </div>
                            </div>
                            {/* Course Items */}
                            <div className="space-y-1.5">
                              {(selectedMenu.course_items || [])
                                .filter(ci => ci.course_id === course.id)
                                .map((ci) => (
                                  <div key={ci.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/30 rounded-lg px-3 py-2">
                                    <div className="flex items-center gap-2">
                                      <Utensils size={12} className="text-slate-400" />
                                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                        {ci.item?.name || 'Unknown item'}
                                      </span>
                                      {ci.price_override != null && (
                                        <span className="text-[10px] text-amber-600 font-bold">${ci.price_override}</span>
                                      )}
                                      {ci.is_supplement && (
                                        <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-amber-100 text-amber-700">
                                          Supplement +${ci.supplement_price || 0}
                                        </span>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => handleRemoveItem(ci.id)}
                                      className="p-1 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded"
                                    >
                                      <X size={10} />
                                    </button>
                                  </div>
                                ))}
                              <button
                                onClick={() => { setItemPickerCourseId(course.id); setShowItemPicker(true); setItemSearch(''); }}
                                className="w-full text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 py-1.5 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300"
                              >
                                + Add item to this course
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-3">
                      {isRotational ? `No courses for ${selectedDay} yet — add one to start building the day's menu` : 'No courses yet — add one to start building the sequence'}
                    </p>
                  )}
                </div>
              )}

              {/* Direct Items (à la carte or unassigned items in other menu types) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Utensils size={14} /> {isAlaCarte ? 'Menu Items' : 'Direct Items (no course)'}
                  </h4>
                  <button
                    onClick={() => { setItemPickerCourseId(null); setShowItemPicker(true); setItemSearch(''); }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold"
                  >
                    <Plus size={12} /> Add Item
                  </button>
                </div>
                {(selectedMenu.course_items || []).filter(ci => !ci.course_id).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(selectedMenu.course_items || [])
                      .filter(ci => !ci.course_id)
                      .map((ci) => (
                        <div key={ci.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/30 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                              <Utensils size={12} className="text-amber-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                                {ci.item?.name || 'Unknown'}
                              </p>
                              <p className="text-[9px] text-slate-400">
                                {ci.item?.is_available ? 'Available' : 'Unavailable'}
                                {ci.price_override != null ? ` · $${ci.price_override}` : ` · $${ci.item?.selling_price || 0}`}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(ci.id)}
                            className="p-1 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded shrink-0"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-3">No direct items yet</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Menu Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {editingMenu ? 'Edit Menu' : 'New Menu'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dinner Menu, Summer Tasting"
                  className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional"
                  className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Menu Type</label>
                <select
                  value={formData.menu_type}
                  onChange={e => setFormData({ ...formData, menu_type: e.target.value as any })}
                  className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="a_la_carte">À la carte (per-item pricing, no courses)</option>
                  <option value="table_dhote">Table d'hôte (set price, multi-choice courses)</option>
                  <option value="fixed_course">Fixed Course (set price, fixed sequence)</option>
                  <option value="rotational">Rotational (different menu per day of week)</option>
                </select>
              </div>
              {formData.menu_type !== 'a_la_carte' && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Base Price (set menu price)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.base_price}
                    onChange={e => setFormData({ ...formData, base_price: e.target.value })}
                    placeholder="e.g. 45.00"
                    className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Day Part</label>
                  <select
                    value={formData.day_part}
                    onChange={e => setFormData({ ...formData, day_part: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">All day</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Brunch">Brunch</option>
                    <option value="Tea Time">Tea Time</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Valid From</label>
                  <input
                    type="date"
                    value={formData.valid_from}
                    onChange={e => setFormData({ ...formData, valid_from: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Valid To</label>
                  <input
                    type="date"
                    value={formData.valid_to}
                    onChange={e => setFormData({ ...formData, valid_to: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { setShowCreateModal(false); setEditingMenu(false); }}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-bold"
              >
                Cancel
              </button>
              <button
                onClick={editingMenu ? handleUpdateMenu : handleCreateMenu}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-sm font-black"
              >
                {editingMenu ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Modal */}
      {showCourseModal && selectedMenu && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCourseModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {editingCourseId ? 'Edit Course' : 'Add Course'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Course Name</label>
                <input
                  type="text"
                  value={courseForm.name}
                  onChange={e => setCourseForm({ ...courseForm, name: e.target.value })}
                  placeholder="e.g. Appetizer, Main Course, Dessert"
                  className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Sequence #</label>
                  <input
                    type="number"
                    min="1"
                    value={courseForm.sequence_number}
                    onChange={e => setCourseForm({ ...courseForm, sequence_number: parseInt(e.target.value) || 1 })}
                    className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Choices</label>
                  <input
                    type="number"
                    min="1"
                    value={courseForm.choice_count}
                    onChange={e => setCourseForm({ ...courseForm, choice_count: parseInt(e.target.value) || 1 })}
                    className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[9px] text-slate-400 mt-0.5">1 = fixed, {'>'}1 = guest picks N</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Fire Mode</label>
                <select
                  value={courseForm.fire_mode}
                  onChange={e => setCourseForm({ ...courseForm, fire_mode: e.target.value as any })}
                  className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="immediate">Immediate (fire to kitchen right away)</option>
                  <option value="hold_until_prior_served">Hold until prior course served</option>
                </select>
              </div>
              {selectedMenu.menu_type === 'rotational' && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Day of Week</label>
                  <select
                    value={courseForm.day_of_week}
                    onChange={e => setCourseForm({ ...courseForm, day_of_week: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-indigo-500"
                  >
                    {DAYS_OF_WEEK.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { setShowCourseModal(false); setEditingCourseId(null); }}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCourse}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-black"
              >
                {editingCourseId ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Picker Modal */}
      {showItemPicker && selectedMenu && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setShowItemPicker(false); setShowCreateItem(false); }}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}>
            {showCreateItem ? (
              <>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Create New Menu Item</h3>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Item Name</label>
                    <input
                      type="text"
                      value={itemForm.name}
                      onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                      placeholder="e.g. Grilled Salmon, Draft Beer"
                      className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={itemForm.selling_price}
                        onChange={e => setItemForm({ ...itemForm, selling_price: e.target.value })}
                        placeholder="0.00"
                        className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Item Type</label>
                      <select
                        value={itemForm.item_type}
                        onChange={e => setItemForm({ ...itemForm, item_type: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="Prepared">Prepared (kitchen/bar)</option>
                        <option value="Retail">Retail (no prep)</option>
                        <option value="Beverage">Beverage</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Outlet</label>
                    <select
                      value={itemForm.outlet_id}
                      onChange={e => setItemForm({ ...itemForm, outlet_id: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Select outlet...</option>
                      {outlets.map(o => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Prep Station (for KDS routing)</label>
                    <select
                      value={itemForm.prep_station_id}
                      onChange={e => setItemForm({ ...itemForm, prep_station_id: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">No specific station</option>
                      {prepStations.map(ps => (
                        <option key={ps.id} value={ps.id}>{ps.station_name} ({ps.station_type})</option>
                      ))}
                    </select>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={itemForm.prep_required}
                      onChange={e => setItemForm({ ...itemForm, prep_required: e.target.checked })}
                      className="w-4 h-4 accent-amber-500"
                    />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Requires prep (sends to KDS)</span>
                  </label>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Description (optional)</label>
                    <input
                      type="text"
                      value={itemForm.description}
                      onChange={e => setItemForm({ ...itemForm, description: e.target.value })}
                      placeholder="Short description"
                      className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Recipe & Ingredients Section */}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                    <button
                      onClick={() => setShowRecipeSection(!showRecipeSection)}
                      className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-amber-600 transition"
                    >
                      <ChefHat size={14} />
                      {showRecipeSection ? 'Hide Recipe' : 'Add Recipe & Ingredients'}
                      {recipeLines.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-black">
                          {recipeLines.length} lines
                        </span>
                      )}
                    </button>
                    {showRecipeSection && (
                      <div className="mt-3 space-y-2">
                        {recipeLines.length === 0 && (
                          <p className="text-[10px] text-slate-400 text-center py-2">No ingredient lines yet. Add one below.</p>
                        )}
                        {recipeLines.map((line, i) => {
                          const ing = ingredients.find(x => x.id === line.ingredient_id);
                          const lineCost = line.quantity * (ing?.current_cost || 0);
                          return (
                            <div key={i} className="grid grid-cols-12 gap-1.5 items-center">
                              <div className="col-span-5">
                                <select
                                  value={line.ingredient_id}
                                  onChange={e => {
                                    const ing2 = ingredients.find(x => x.id === e.target.value);
                                    const updated = [...recipeLines];
                                    updated[i] = {
                                      ...updated[i],
                                      ingredient_id: e.target.value,
                                      unit: ing2?.unit_of_measure || 'pcs',
                                      cost_at_time_of_costing: ing2?.current_cost || 0,
                                    };
                                    setRecipeLines(updated);
                                  }}
                                  className="w-full px-2 py-1.5 text-[10px] font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                >
                                  <option value="">Select ingredient...</option>
                                  {ingredients.map(ingOpt => (
                                    <option key={ingOpt.id} value={ingOpt.id}>{ingOpt.name} (${ingOpt.current_cost}/{ingOpt.unit_of_measure})</option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-span-2">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={line.quantity}
                                  onChange={e => {
                                    const updated = [...recipeLines];
                                    updated[i] = { ...updated[i], quantity: parseFloat(e.target.value) || 0 };
                                    setRecipeLines(updated);
                                  }}
                                  className="w-full px-2 py-1.5 text-[10px] font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                  placeholder="Qty"
                                />
                              </div>
                              <div className="col-span-2">
                                <input
                                  type="text"
                                  value={line.unit}
                                  onChange={e => {
                                    const updated = [...recipeLines];
                                    updated[i] = { ...updated[i], unit: e.target.value };
                                    setRecipeLines(updated);
                                  }}
                                  className="w-full px-2 py-1.5 text-[10px] font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                  placeholder="Unit"
                                />
                              </div>
                              <div className="col-span-2 text-right">
                                <span className="text-[10px] font-mono font-black text-slate-600 dark:text-slate-300">${lineCost.toFixed(2)}</span>
                              </div>
                              <div className="col-span-1 flex justify-center">
                                <button
                                  onClick={() => setRecipeLines(recipeLines.filter((_, idx) => idx !== i))}
                                  className="p-1 text-rose-400 hover:text-rose-600"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        <button
                          onClick={() => setRecipeLines([...recipeLines, { ingredient_id: '', quantity: 1, unit: 'pcs', cost_at_time_of_costing: 0 }])}
                          className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 rounded-lg text-[10px] font-bold hover:bg-amber-100 transition"
                        >
                          <Plus size={12} /> Add Ingredient Line
                        </button>
                        {recipeLines.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">Total Cost</span>
                              <span className="text-sm font-black text-slate-900 dark:text-white">
                                ${recipeLines.reduce((s, l) => s + l.quantity * (ingredients.find(x => x.id === l.ingredient_id)?.current_cost || 0), 0).toFixed(2)}
                              </span>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2">
                              <span className="text-[9px] font-bold text-emerald-400 uppercase">Food Cost %</span>
                              <span className="text-sm font-black text-emerald-600">
                                {(() => {
                                  const total = recipeLines.reduce((s, l) => s + l.quantity * (ingredients.find(x => x.id === l.ingredient_id)?.current_cost || 0), 0);
                                  const price = parseFloat(itemForm.selling_price) || 0;
                                  return price > 0 && total > 0 ? `${(total / price * 100).toFixed(1)}%` : '—';
                                })()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowCreateItem(false)}
                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-bold"
                  >
                    Back to list
                  </button>
                  <button
                    onClick={handleCreateItem}
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-sm font-black"
                  >
                    Create & Add
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Add Item {itemPickerCourseId ? 'to Course' : 'to Menu'}
                  </h3>
                  <button
                    onClick={() => setShowCreateItem(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold"
                  >
                    <Plus size={12} /> New Item
                  </button>
                </div>
                <input
                  type="text"
                  value={itemSearch}
                  onChange={e => setItemSearch(e.target.value)}
                  placeholder="Search items..."
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-amber-500"
                />
                <div className="max-h-80 overflow-y-auto space-y-1.5">
                  {filteredMenuItems.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No items found</p>
                  ) : (
                    filteredMenuItems.map(mi => {
                      const alreadyAdded = (selectedMenu.course_items || []).some(ci => ci.item_id === mi.id && ci.course_id === itemPickerCourseId);
                      return (
                        <div
                          key={mi.id}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                            alreadyAdded
                              ? 'bg-slate-50 dark:bg-slate-800/30 opacity-50'
                              : 'bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-900/20'
                          }`}
                        >
                          <button
                            onClick={() => !alreadyAdded && handleAddItem(mi.id)}
                            disabled={alreadyAdded}
                            className="flex items-center gap-3 flex-1 min-w-0 text-left"
                          >
                            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                              <Utensils size={14} className="text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                                {mi.name}
                                {mi.recipe_id && (
                                  <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 text-[8px] font-black">
                                    <ChefHat size={8} /> Recipe
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                ${mi.selling_price} · {mi.item_type}
                                {!mi.is_available && ' · Unavailable'}
                              </p>
                            </div>
                            {alreadyAdded ? (
                              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                            ) : (
                              <Plus size={16} className="text-slate-400 shrink-0" />
                            )}
                          </button>
                          {mi.recipe_id && (
                            <button
                              onClick={(e) => { e.stopPropagation(); fetchRecipeForItem(mi.id); }}
                              className="p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg shrink-0"
                              title="View recipe"
                            >
                              <ChefHat size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
                <button
                  onClick={() => setShowItemPicker(false)}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-bold"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Outlet Assignment Modal */}
      {showAssignModal && selectedMenu && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAssignModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Assign to Outlet</h3>
            {availableOutlets.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">All outlets are already assigned</p>
            ) : (
              <>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableOutlets.map(outlet => (
                    <button
                      key={outlet.id}
                      onClick={() => setAssignOutletId(outlet.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                        assignOutletId === outlet.id
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Store size={16} />
                      <div>
                        <p className="text-sm font-bold">{outlet.name}</p>
                        <p className={`text-[10px] ${assignOutletId === outlet.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {outlet.outlet_type} · {outlet.code}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={assignIsPrimary}
                    onChange={e => setAssignIsPrimary(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500"
                  />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Set as primary menu for this outlet</span>
                </label>
              </>
            )}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignOutlet}
                disabled={!assignOutletId}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-black disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recipe View Modal */}
      {viewingRecipe !== undefined && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewingRecipe(undefined)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <ChefHat size={20} className="text-indigo-500" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Recipe Details</h3>
            </div>
            {recipeLoading ? (
              <p className="text-sm text-slate-400 text-center py-8">Loading recipe...</p>
            ) : viewingRecipe === null ? (
              <p className="text-sm text-slate-400 text-center py-8">No recipe found for this item.</p>
            ) : viewingRecipe ? (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Portions</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{viewingRecipe.portions}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Yield</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{viewingRecipe.yield?.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Ingredients</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{viewingRecipe.ingredient_breakdown?.length || 0}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3 text-center">
                    <p className="text-[9px] font-bold text-indigo-400 uppercase">Total Cost</p>
                    <p className="text-lg font-black text-indigo-600">${(viewingRecipe.total_ingredient_cost || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center">
                    <p className="text-[9px] font-bold text-amber-400 uppercase">Plate Cost</p>
                    <p className="text-lg font-black text-amber-600">${(viewingRecipe.adjusted_plate_cost || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center">
                    <p className="text-[9px] font-bold text-emerald-400 uppercase">Cost/Portion</p>
                    <p className="text-lg font-black text-emerald-600">${(viewingRecipe.cost_per_portion || 0).toFixed(2)}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Ingredient Lines</h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {(viewingRecipe.ingredient_breakdown || []).map((line, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <ChefHat size={12} className="text-slate-400" />
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{line.ingredient_name}</p>
                            <p className="text-[9px] text-slate-400">{line.quantity} {line.unit} @ ${line.cost_per_unit}/{line.unit}</p>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-black text-slate-700 dark:text-slate-300">${line.line_cost.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
            <button
              onClick={() => setViewingRecipe(undefined)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
