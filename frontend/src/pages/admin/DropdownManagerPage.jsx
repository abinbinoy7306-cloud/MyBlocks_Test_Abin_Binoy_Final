import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { createLookupOption, getLookupAdmin, toggleLookupOption, updateLookupOption } from '../../api/lookupOptions.api';

export default function DropdownManagerPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState({});
  const [category, setCategory] = useState('plans');
  const [value, setValue] = useState('');
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { const { data } = await getLookupAdmin(); setItems(data.data || []); setCategories(data.categories || {}); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to load dropdown values'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const visible = useMemo(() => items.filter((item) => item.category === category), [items, category]);
  const add = async (event) => {
    event.preventDefault();
    try { await createLookupOption({ category, value, label }); toast.success('Dropdown value added'); setValue(''); setLabel(''); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to add value'); }
  };
  const edit = async (item) => {
    const nextLabel = window.prompt('Display label', item.label);
    if (nextLabel === null || !nextLabel.trim()) return;
    try { await updateLookupOption(item.id, { label: nextLabel.trim() }); toast.success('Dropdown value updated'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to update value'); }
  };
  const toggle = async (item) => {
    try { await toggleLookupOption(item.id); toast.success('Dropdown value status updated'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to update status'); }
  };

  return <div className="max-w-5xl mx-auto space-y-6">
    <div><h1 className="text-2xl font-semibold text-gray-900">Dropdown Manager</h1><p className="text-sm text-gray-500 mt-1">Manage database-backed selection values used throughout the application.</p></div>
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="bg-white border rounded-xl p-3 h-fit"><p className="text-xs font-semibold text-gray-400 uppercase px-2 pb-2">Lookup groups</p>{Object.entries(categories).map(([key, name]) => <button key={key} onClick={() => setCategory(key)} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${key === category ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>{name}</button>)}</aside>
      <section className="space-y-4">
        <form onSubmit={add} className="bg-white border rounded-xl p-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-end">
          <label className="text-sm text-gray-700">Value<input value={value} onChange={(e) => setValue(e.target.value)} placeholder="internal_value" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" required /></label>
          <label className="text-sm text-gray-700">Label<input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Display label" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" required /></label>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 font-medium" type="submit">Add value</button>
        </form>
        <div className="bg-white border rounded-xl overflow-hidden"><div className="px-4 py-3 border-b font-medium text-gray-900">{categories[category] || category}</div>{loading ? <p className="p-4 text-gray-500">Loading…</p> : <table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="text-left px-4 py-3">Value</th><th className="text-left px-4 py-3">Label</th><th className="text-left px-4 py-3">Status</th><th className="text-right px-4 py-3">Actions</th></tr></thead><tbody>{visible.map((item) => <tr key={item.id} className="border-t"><td className="px-4 py-3 font-mono text-xs">{item.value}</td><td className="px-4 py-3">{item.label}</td><td className="px-4 py-3">{item.is_active ? <span className="text-green-600">Active</span> : <span className="text-gray-400">Paused</span>}</td><td className="px-4 py-3 text-right space-x-3"><button className="text-indigo-600" onClick={() => edit(item)}>Edit</button><button className="text-gray-600" onClick={() => toggle(item)}>{item.is_active ? 'Pause' : 'Activate'}</button></td></tr>)}</tbody></table>}</div>
      </section>
    </div>
  </div>;
}
