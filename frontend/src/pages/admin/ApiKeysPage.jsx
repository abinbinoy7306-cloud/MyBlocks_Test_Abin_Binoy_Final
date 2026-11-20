import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import ApiKeyForm from '../../components/ui/ApiKeyForm';
import toast from 'react-hot-toast';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState([]); // ensure array
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editKey, setEditKey] = useState(null);

  const fetchKeys = async () => {
    try {
      const { data } = await api.get('/apikeys');
      setKeys(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load API keys');
      setKeys([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/apikeys/${id}`);
      toast.success('API key deleted');
      fetchKeys();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete API key'); }
  };

  const handleActivate = async (id) => {
    try {
      await api.put(`/apikeys/${id}/activate`);
      toast.success('Active key updated');
      fetchKeys();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to activate API key'); }
  };

  const handleEdit = (key) => {
    setEditKey(key);
    setShowForm(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="flex items-center mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">API Keys</h1>
          <p className="text-sm text-gray-500 mt-1">Assign keys by task type. When a key reaches its token limit, the next available key is selected automatically.</p>
        </div>
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-medium transition-colors"
          onClick={() => {
            setEditKey(null);
            setShowForm(true);
          }}
        >
          Add New Key
        </button>
      </header>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <table className="w-full table-auto border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Active for type</th>
              <th className="p-2 text-left">Usage</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id} className="border-t">
                <td className="p-2">{k.name}</td>
                <td className="p-2 capitalize">{k.type}</td>
                <td className="p-2">
                  {k.active ? (
                    <span className="text-green-600 font-medium">Active</span>
                  ) : (
                    <button
                      className="text-blue-600 underline"
                      onClick={() => handleActivate(k.id)}
                    >
                      Activate
                    </button>
                  )}
                </td>
                <td className="p-2">{k.tokensUsed} / {k.tokenLimit}</td>
                <td className="p-2 space-x-2">
                  <button
                    className="text-indigo-600 underline"
                    onClick={() => handleEdit(k)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 underline"
                    onClick={() => handleDelete(k.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <ApiKeyForm
          initialData={editKey}
          onClose={() => {
            setShowForm(false);
            fetchKeys();
          }}
        />
      )}
    </div>
  );
}
