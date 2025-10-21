import React, { useState, useEffect } from 'react';
import { Package, Loader2, MapPin, Clock } from 'lucide-react';
import { getWarehouses, NovaPoshtaWarehouse, formatWarehouseDisplay } from '../lib/novaPoshta';

interface WarehouseSelectProps {
  cityRef: string | null;
  value: NovaPoshtaWarehouse | null;
  onChange: (warehouse: NovaPoshtaWarehouse | null) => void;
  required?: boolean;
}

export default function WarehouseSelect({
  cityRef,
  value,
  onChange,
  required = false
}: WarehouseSelectProps) {
  const [warehouses, setWarehouses] = useState<NovaPoshtaWarehouse[]>([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState<NovaPoshtaWarehouse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    if (cityRef) {
      loadWarehouses(cityRef);
    } else {
      setWarehouses([]);
      setFilteredWarehouses([]);
      onChange(null);
    }
  }, [cityRef]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = warehouses.filter((warehouse) => {
        const number = warehouse.Number.toLowerCase();
        const address = warehouse.ShortAddress.toLowerCase();
        return number.includes(query) || address.includes(query);
      });
      setFilteredWarehouses(filtered);
    } else {
      setFilteredWarehouses(warehouses);
    }
  }, [searchQuery, warehouses]);

  const loadWarehouses = async (cityRef: string) => {
    setIsLoading(true);
    try {
      const data = await getWarehouses(cityRef);
      setWarehouses(data);
      setFilteredWarehouses(data);
    } catch (error) {
      console.error('Error loading warehouses:', error);
      setWarehouses([]);
      setFilteredWarehouses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectWarehouse = (warehouse: NovaPoshtaWarehouse) => {
    onChange(warehouse);
    setShowList(false);
    setSearchQuery('');
  };

  const getScheduleText = (warehouse: NovaPoshtaWarehouse) => {
    if (warehouse.Schedule?.Monday) {
      return `Пн-Пт: ${warehouse.Schedule.Monday}`;
    }
    return 'Розклад уточнюйте';
  };

  if (!cityRef) {
    return (
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Відділення Нової Пошти {required && '*'}
        </label>
        <div className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 text-center">
          Спочатку оберіть місто
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Відділення Нової Пошти {required && '*'}
        </label>
        <div className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-slate-600">Завантаження відділень...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Відділення Нової Пошти {required && '*'}
      </label>

      {value && !showList ? (
        <div className="border border-slate-300 rounded-lg p-4 bg-white">
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <div className="font-medium text-slate-900">
                Відділення №{value.Number}
              </div>
              <div className="text-sm text-slate-600 mt-1">
                {value.ShortAddress}
              </div>
              {value.Schedule?.Monday && (
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                  <Clock className="w-3 h-3" />
                  <span>{getScheduleText(value)}</span>
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowList(true)}
            className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Змінити відділення
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Пошук за номером або адресою..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <div className="border border-slate-300 rounded-lg max-h-96 overflow-y-auto">
            {filteredWarehouses.length === 0 ? (
              <div className="p-4 text-center text-slate-600">
                {warehouses.length === 0
                  ? 'Відділення не знайдено'
                  : 'Нічого не знайдено за вашим запитом'
                }
              </div>
            ) : (
              filteredWarehouses.map((warehouse) => (
                <button
                  key={warehouse.Ref}
                  type="button"
                  onClick={() => handleSelectWarehouse(warehouse)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <Package className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">
                        Відділення №{warehouse.Number}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        {warehouse.ShortAddress}
                      </div>
                      {warehouse.Schedule?.Monday && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{getScheduleText(warehouse)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {warehouses.length > 0 && (
            <div className="text-xs text-slate-500 text-center mt-2">
              Знайдено {filteredWarehouses.length} з {warehouses.length} відділень
            </div>
          )}
        </div>
      )}
    </div>
  );
}
