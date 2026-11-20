import React, { useState } from 'react';
import api from '../../api/axios';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLookupOptions } from '../../hooks/useLookupOptions';

export default function ApiKeyForm({ initialData, onClose }) {
  const isEdit = Boolean(initialData);
  const [name, setName] = useState(initialData?.name || '');
  const [key, setKey] = useState('');
  const [type, setType] = useState(initialData?.type || 'text');
  const [limit, setLimit] = useState(initialData?.tokenLimit || 1000000);
  const [loading, setLoading] = useState(false);
  const taskTypes = useLookupOptions('task_types');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedName = name.trim();
    if (!normalizedName || !key.trim() && !isEdit) {
      toast.error(isEdit ? 'Enter a name' : 'Enter a name and API key');
      return;
    }
    if (!Number.isInteger(Number(limit)) || Number(limit) < 1) {
      toast.error('Token limit must be a positive whole number');
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/apikeys/${initialData.id}`, {
          name: normalizedName,
          key,
          type,
          tokenLimit: limit,
        });
      } else {
        await api.post('/apikeys', {
          name: normalizedName,
          key: key.trim(),
          type,
          tokenLimit: limit,
        });
      }
      toast.success(isEdit ? 'API key updated' : 'API key added');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to save API key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white text-gray-900 p-6 rounded-2xl shadow-2xl w-96 relative">
        <button
          className="absolute top-2 right-2"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold mb-4">{isEdit ? 'Edit' : 'Add'} API Key</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block mb-1">Name</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Key (secret){isEdit && ' — leave blank to keep current'}</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              type="password"
              required={!isEdit}
            />
          </div>
          <div>
            <label className="block mb-1">Task type</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {taskTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-1">Token limit</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
              type="number"
              min="1"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            />
          </div>
          <button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded font-medium transition-colors disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving…' : isEdit ? 'Update' : 'Create'}
          </button>
        </form>
      </div>
    </div>
  );
}
