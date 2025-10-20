import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  getCategories,
  deleteCategory,
  toggleCategoryPublished,
  buildCategoryTree,
  Category,
  CategoryTreeNode,
} from '../../lib/firestore/categories';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  GripVertical,
} from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
      setCategoryTree(buildCategoryTree(data));
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublished = async (id: string, currentStatus: boolean) => {
    try {
      await toggleCategoryPublished(id, !currentStatus);
      fetchCategories();
    } catch (error) {
      console.error('Error toggling category status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      fetchCategories();
      setDeleteConfirm(null);
    } catch (error: any) {
      alert(error.message || 'Помилка видалення категорії');
      setDeleteConfirm(null);
    }
  };

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const renderCategoryNode = (node: CategoryTreeNode, depth: number = 0) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);

    return (
      <div key={node.id}>
        <div
          className="flex items-center gap-3 py-3 px-4 hover:bg-slate-50 border-b border-slate-100 group"
          style={{ paddingLeft: `${depth * 32 + 16}px` }}
        >
          <GripVertical className="w-5 h-5 text-slate-400 cursor-grab" />

          {hasChildren ? (
            <button
              onClick={() => toggleNode(node.id)}
              className="p-1 hover:bg-slate-200 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-600" />
              )}
            </button>
          ) : (
            <div className="w-6"></div>
          )}

          {node.icon_url ? (
            <img src={node.icon_url} alt="" className="w-8 h-8 object-cover rounded" />
          ) : (
            <div className="w-8 h-8 bg-slate-200 rounded flex items-center justify-center">
              <span className="text-xs text-slate-500">—</span>
            </div>
          )}

          <div className="flex-1">
            <p className="font-medium text-slate-900">{node.name}</p>
            {node.description && (
              <p className="text-sm text-slate-600 truncate">{node.description}</p>
            )}
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              node.is_published
                ? 'bg-green-100 text-green-800'
                : 'bg-slate-100 text-slate-800'
            }`}
          >
            {node.is_published ? 'Опубліковано' : 'Приховано'}
          </span>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleTogglePublished(node.id, node.is_published)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title={node.is_published ? 'Приховати' : 'Опублікувати'}
            >
              {node.is_published ? (
                <EyeOff className="w-5 h-5 text-slate-600" />
              ) : (
                <Eye className="w-5 h-5 text-slate-600" />
              )}
            </button>
            <button
              onClick={() => navigate(`/admin/categories/edit/${node.id}`)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Редагувати"
            >
              <Edit className="w-5 h-5 text-blue-600" />
            </button>
            {deleteConfirm === node.id ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(node.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                >
                  Так
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm rounded transition-colors"
                >
                  Ні
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDeleteConfirm(node.id)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Видалити"
              >
                <Trash2 className="w-5 h-5 text-red-600" />
              </button>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>{node.children.map((child) => renderCategoryNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Категорії</h1>
            <p className="text-slate-600 mt-2">Всього категорій: {categories.length}</p>
          </div>
          <button
            onClick={() => navigate('/admin/categories/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Додати категорію
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12">
            <div className="text-center">
              <p className="text-slate-600 text-lg">Категорій не знайдено</p>
              <button
                onClick={() => navigate('/admin/categories/new')}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Додати першу категорію
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <p className="text-sm text-slate-600">
                Перетягуйте категорії для зміни порядку. Розгорніть категорії зі стрілками для
                перегляду підкатегорій.
              </p>
            </div>
            <div>{categoryTree.map((node) => renderCategoryNode(node))}</div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
