import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  getBanners,
  deleteBanner,
  toggleBannerActive,
  updateBannersOrder,
  Banner,
} from '../../lib/banners';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react';

function SortableBannerItem({ banner, onEdit, onDelete, onToggle, deleteConfirm }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: banner.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const placementLabels: Record<string, string> = {
    home: 'Головна сторінка',
    category: 'Сторінка категорії',
    promo: 'Промо-сторінка',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 py-4 px-6 bg-white border-b border-slate-200 hover:bg-slate-50 group"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-5 h-5 text-slate-400" />
      </div>

      <img
        src={banner.image_url}
        alt={banner.title}
        className="w-32 h-20 object-cover rounded-lg border border-slate-200"
      />

      <div className="flex-1">
        <h3 className="font-semibold text-slate-900">{banner.title}</h3>
        <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
          <span className="px-2 py-1 bg-slate-100 rounded">{placementLabels[banner.placement]}</span>
          {banner.link_url && (
            <span className="truncate max-w-xs" title={banner.link_url}>
              {banner.link_url}
            </span>
          )}
        </div>
      </div>

      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          banner.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
        }`}
      >
        {banner.is_active ? 'Активний' : 'Неактивний'}
      </span>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onToggle(banner.id, banner.is_active)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          title={banner.is_active ? 'Деактивувати' : 'Активувати'}
        >
          {banner.is_active ? (
            <EyeOff className="w-5 h-5 text-slate-600" />
          ) : (
            <Eye className="w-5 h-5 text-slate-600" />
          )}
        </button>
        <button
          onClick={() => onEdit(banner.id)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          title="Редагувати"
        >
          <Edit className="w-5 h-5 text-blue-600" />
        </button>
        {deleteConfirm === banner.id ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(banner.id)}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
            >
              Так
            </button>
            <button
              onClick={() => onDelete(null)}
              className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm rounded transition-colors"
            >
              Ні
            </button>
          </div>
        ) : (
          <button
            onClick={() => onDelete(banner.id)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Видалити"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterPosition, setFilterPosition] = useState<string>('');
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchBanners();
  }, [filterPosition]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await getBanners(filterPosition || undefined);
      setBanners(data);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await toggleBannerActive(id, !currentStatus);
      fetchBanners();
    } catch (error) {
      console.error('Error toggling banner status:', error);
    }
  };

  const handleDelete = async (id: string | null) => {
    if (id === null) {
      setDeleteConfirm(null);
      return;
    }

    if (deleteConfirm === id) {
      try {
        await deleteBanner(id);
        fetchBanners();
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Error deleting banner:', error);
      }
    } else {
      setDeleteConfirm(id);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = banners.findIndex((b) => b.id === active.id);
      const newIndex = banners.findIndex((b) => b.id === over.id);

      const newBanners = arrayMove(banners, oldIndex, newIndex);
      setBanners(newBanners);

      const updates = newBanners.map((banner, index) => ({
        id: banner.id,
        sort_order: index,
      }));

      try {
        await updateBannersOrder(updates);
      } catch (error) {
        console.error('Error updating banner order:', error);
        fetchBanners();
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Банери</h1>
            <p className="text-slate-600 mt-2">Всього банерів: {banners.length}</p>
          </div>
          <button
            onClick={() => navigate('/admin/banners/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Додати банер
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Фільтр за розміщенням
          </label>
          <select
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Всі розміщення</option>
            <option value="home">Головна сторінка</option>
            <option value="category">Сторінка категорії</option>
            <option value="promo">Промо-сторінка</option>
          </select>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          </div>
        ) : banners.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12">
            <div className="text-center">
              <p className="text-slate-600 text-lg">Банерів не знайдено</p>
              <button
                onClick={() => navigate('/admin/banners/new')}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Додати перший банер
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <p className="text-sm text-slate-600">
                Перетягуйте банери для зміни порядку відображення
              </p>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={banners.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                {banners.map((banner) => (
                  <SortableBannerItem
                    key={banner.id}
                    banner={banner}
                    onEdit={(id: string) => navigate(`/admin/banners/edit/${id}`)}
                    onDelete={handleDelete}
                    onToggle={handleToggleActive}
                    deleteConfirm={deleteConfirm}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
