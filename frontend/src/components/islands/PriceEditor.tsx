import { useState } from 'react';

interface PriceVariant {
  id?: number;
  name: string;
  price: number;
  compare_at_price: number | null;
  is_default: boolean;
}

interface PriceEditorProps {
  prices: PriceVariant[];
  onChange: (prices: PriceVariant[]) => void;
}

export default function PriceEditor({ prices, onChange }: PriceEditorProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<PriceVariant>({
    name: '',
    price: 0,
    compare_at_price: null,
    is_default: false,
  });

  const labelClass = 'block text-base font-medium text-amber-100/90';
  const inputClass =
    'w-full px-4 py-3 text-base rounded-lg bg-black/75 border border-amber-400/25 text-amber-50 placeholder:text-amber-200/45 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400/80 outline-none transition-colors';

  const handleAdd = () => {
    setFormData({
      name: '',
      price: 0,
      compare_at_price: null,
      is_default: prices.length === 0,
    });
    setEditingIndex(null);
    setShowForm(true);
  };

  const handleEdit = (index: number) => {
    setFormData({ ...prices[index] });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleSave = () => {
    if (formData.price < 0) {
      alert('Gia phai lon hon hoac bang 0');
      return;
    }

    let newPrices = [...prices];
    
    // If setting as default, unset other defaults
    if (formData.is_default) {
      newPrices = newPrices.map(p => ({ ...p, is_default: false }));
    }

    if (editingIndex !== null) {
      newPrices[editingIndex] = formData;
    } else {
      newPrices.push(formData);
    }

    onChange(newPrices);
    setShowForm(false);
    setFormData({ name: '', price: 0, compare_at_price: null, is_default: false });
  };

  const handleDelete = (index: number) => {
    if (!confirm('Are you sure you want to delete this price variant?')) {
      return;
    }

    const newPrices = prices.filter((_, i) => i !== index);
    
    // If deleted item was default and there are other items, make first one default
    if (prices[index].is_default && newPrices.length > 0) {
      newPrices[0].is_default = true;
    }

    onChange(newPrices);
  };

  const handleSetDefault = (index: number) => {
    const newPrices = prices.map((p, i) => ({
      ...p,
      is_default: i === index
    }));
    onChange(newPrices);
  };

  return (
    <div className="space-y-4 text-base">
      <div className="flex justify-between items-center">
        <label className={labelClass}>
          Price Variants <span className="text-rose-400">*</span>
        </label>
        <button
          type="button"
          onClick={handleAdd}
          className="text-base text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
        >
          + Add Variant
        </button>
      </div>

      {/* Price List */}
      {prices.length > 0 && (
        <div className="space-y-2">
          {prices.map((price, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 border border-amber-400/20 rounded-lg bg-black/60"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-medium text-amber-50">{price.name?.trim() || 'Don gia mac dinh'}</span>
                  {price.is_default && (
                    <span className="px-2 py-1 text-sm font-semibold bg-amber-500/15 text-amber-200 rounded">
                      Default
                    </span>
                  )}
                </div>
                <div className="text-base text-amber-100/80 mt-1">
                  ${price.price.toFixed(2)}
                  {price.compare_at_price && (
                    <span className="ml-2 line-through text-amber-200/45">
                      ${price.compare_at_price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!price.is_default && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(index)}
                    className="text-sm text-amber-200 hover:text-amber-100 transition-colors cursor-pointer"
                  >
                    Set Default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleEdit(index)}
                    className="text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  className="text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {prices.length === 0 && !showForm && (
        <div className="text-center py-8 border-2 border-dashed border-amber-400/20 rounded-lg">
          <p className="text-base text-amber-200/70">No price variants yet</p>
          <button
            type="button"
            onClick={handleAdd}
            className="mt-2 text-base text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
          >
            Add your first variant
          </button>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="p-4 border border-amber-400/20 rounded-lg bg-black/60 space-y-3">
          <h4 className="text-lg font-medium text-amber-100">
            {editingIndex !== null ? 'Edit' : 'Add'} Price Variant
          </h4>
          
          <div>
            <label className="block text-base font-medium text-amber-100/90 mb-2">
              Variant Name (Optional)
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="De trong neu la don gia mac dinh"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-base font-medium text-amber-100/90 mb-2">
                Price <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-base font-medium text-amber-100/90 mb-2">
                Compare at Price
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.compare_at_price || ''}
                onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="Optional"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_default"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="w-4 h-4 text-amber-400 border-zinc-600 rounded focus:ring-amber-500/40"
            />
            <label htmlFor="is_default" className="ml-2 text-base text-zinc-100">
              Set as default price
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-3 text-base text-amber-100 bg-black/70 border border-amber-400/30 rounded-lg hover:bg-amber-400/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-3 text-base text-black bg-amber-500 rounded-lg hover:bg-amber-400 transition-colors cursor-pointer"
            >
              {editingIndex !== null ? 'Update' : 'Add'} Variant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
