import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const autonomyLabel = { assistive: 'Assistive', controlled: 'Controlled autonomy', fully_autonomous: 'Fully autonomous' };

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { const { data } = await api.get('/agents'); setAgents(Array.isArray(data) ? data : []); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to load AI agents'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const toggle = async (id) => {
    try { await api.put(`/agents/${id}/toggle`); toast.success('Agent status updated'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to update agent'); }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">AI Agents</h1>
        <p className="text-sm text-gray-500 mt-1">Configure autonomous LLM agents, their triggers, capabilities, approval rules, and task-specific key pools.</p>
      </div>
      {loading ? <p className="text-gray-500">Loading agents…</p> : (
        <div className="grid gap-4 md:grid-cols-2">
          {agents.map((agent) => (
            <article key={agent.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-gray-900">{agent.name}</h2>
                  <p className="text-xs text-indigo-600 mt-1 uppercase tracking-wide">{agent.role}</p>
                </div>
                <button onClick={() => toggle(agent.id)} className={`px-2.5 py-1 rounded-full text-xs font-medium ${agent.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {agent.status === 'active' ? 'Active' : 'Paused'}
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-3">{agent.description}</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-xs text-gray-400">Trigger</dt><dd className="font-medium text-gray-700">{agent.triggerEvent}</dd></div>
                <div><dt className="text-xs text-gray-400">Task type / key pool</dt><dd className="font-medium text-gray-700">{agent.taskType} / {agent.modelKeyPool}</dd></div>
                <div><dt className="text-xs text-gray-400">Autonomy</dt><dd className="font-medium text-gray-700">{autonomyLabel[agent.autonomy]}</dd></div>
                <div><dt className="text-xs text-gray-400">Approval</dt><dd className="font-medium text-gray-700">{agent.requiresApproval ? 'Required' : 'Not required'}</dd></div>
              </dl>
              <div className="mt-4 border-t pt-3">
                <p className="text-xs text-gray-400 mb-1">Automated actions</p>
                <div className="flex flex-wrap gap-1.5">{(agent.actions || []).map((action) => <span key={action} className="px-2 py-1 rounded bg-gray-100 text-xs text-gray-600">{action.replaceAll('_', ' ')}</span>)}</div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
