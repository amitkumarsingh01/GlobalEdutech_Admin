import React, { useEffect, useMemo, useState } from 'react';
import ApiService, { type NotificationItem } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const NotificationsPage: React.FC = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');

  const loadAll = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.getNotifications();
      setItems((res.notifications || []).slice().reverse());
    } catch (e: any) {
      setError(e?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadAll(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => [it.title, it.message, it.type].some((v) => v.toLowerCase().includes(q)));
  }, [items, query]);

  const onDelete = async (id: string): Promise<void> => {
    if (!token) { setError('Not authorized'); return; }
    if (!confirm('Delete this notification?')) return;
    try {
      await ApiService.deleteNotification(id, token);
      await loadAll();
    } catch (e: any) { setError(e?.message || 'Delete failed'); }
  };

  if (loading) return <div className="text-gray-600">Loading notifications...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
            <p className="text-gray-600">Total: {items.length}</p>
          </div>
          <input className="border rounded-lg px-3 py-2 w-full md:w-80" placeholder="Search notifications" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((it) => (
              <tr key={it._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{it.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{it.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(it.updated_at).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button onClick={() => onDelete(it._id)} className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotificationsPage;

