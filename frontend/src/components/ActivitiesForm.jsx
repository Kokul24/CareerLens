import React, { useState } from 'react';

const COLUMNS = [
  { key: 'activityName', label: 'Activity Name', icon: '📌', type: 'text', placeholder: 'e.g. Hackathon, Workshop' },
  { key: 'description', label: 'Description', icon: '📝', type: 'text', placeholder: 'Brief description' },
  { key: 'date', label: 'Date', icon: '📅', type: 'date', placeholder: '' },
  { key: 'category', label: 'Category', icon: '🏷️', type: 'text', placeholder: 'e.g. Technical, Sports' },
  { key: 'duration', label: 'Duration', icon: '⏱️', type: 'text', placeholder: 'e.g. 2h, 3 days' },
  { key: 'location', label: 'Location', icon: '📍', type: 'text', placeholder: 'e.g. Online, Campus' },
  { key: 'participants', label: 'Participants', icon: '👥', type: 'text', placeholder: 'e.g. 4 members' },
  { key: 'notes', label: 'Notes', icon: '🗒️', type: 'text', placeholder: 'Additional notes (optional)' },
];

const EMPTY_FORM = Object.fromEntries(COLUMNS.map((c) => [c.key, '']));

export default function ActivitiesForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingIndex, setPendingIndex] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate required fields (all except notes)
    const missing = COLUMNS.filter((c) => c.key !== 'notes' && !form[c.key].trim());
    if (missing.length > 0) return;
    setPendingAction(editIndex !== null ? 'update' : 'insert');
    setShowConfirm(true);
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setForm(activities[index]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (index) => {
    setPendingAction('delete');
    setPendingIndex(index);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (pendingAction === 'insert') {
      setActivities([...activities, { ...form }]);
    } else if (pendingAction === 'update') {
      const updated = [...activities];
      updated[editIndex] = { ...form };
      setActivities(updated);
    } else if (pendingAction === 'delete') {
      setActivities(activities.filter((_, i) => i !== pendingIndex));
    }
    resetState();
  };

  const resetState = () => {
    setForm(EMPTY_FORM);
    setEditIndex(null);
    setShowConfirm(false);
    setPendingAction(null);
    setPendingIndex(null);
  };

  const filteredActivities = activities.filter((a) =>
    a.activityName.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase()) ||
    a.date.includes(search)
  );

  return (
    <>
      {/* ── Form Section ── */}
      <section className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 md:p-8 mb-10">
        <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
          {editIndex !== null ? '✏️ Update Activity' : '➕ Add New Activity'}
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          {editIndex !== null
            ? 'Modify the fields below and save your changes.'
            : 'Fill in the details for your activity.'}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {COLUMNS.map((col) => (
              <div key={col.key}>
                <label className="block text-sm text-gray-300 mb-1">
                  {col.icon} {col.label}
                </label>
                <input
                  name={col.key}
                  type={col.type}
                  value={form[col.key]}
                  onChange={handleChange}
                  placeholder={col.placeholder}
                  required={col.key !== 'notes'}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 font-medium transition-all"
            >
              {editIndex !== null ? '💾 Update Activity' : '➕ Add Activity'}
            </button>
            {editIndex !== null && (
              <button
                type="button"
                onClick={resetState}
                className="px-6 py-2.5 rounded-lg border border-white/20 text-gray-300 hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* ── History Section ── */}
      <section className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">📋 Activity Log</h2>
        <p className="text-gray-400 text-sm mb-6">
          View, search, edit or delete your recorded activities.
        </p>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search by name, category or date…"
            className="w-full sm:max-w-md px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>

        {/* Table */}
        {activities.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No activities logged yet. Add your first one above!
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No activities match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-white/10">
                  {COLUMNS.map((col) => (
                    <th key={col.key} className="pb-3 pr-4 whitespace-nowrap">
                      {col.icon} {col.label}
                    </th>
                  ))}
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((a, i) => {
                  const realIndex = activities.indexOf(a);
                  return (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      {COLUMNS.map((col) => (
                        <td key={col.key} className="py-3 pr-4 whitespace-nowrap">
                          {col.type === 'date' && a[col.key]
                            ? new Date(a[col.key]).toLocaleDateString()
                            : a[col.key] || '—'}
                        </td>
                      ))}
                      <td className="py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(realIndex)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-all mr-2"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(realIndex)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Confirmation Modal ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">
              {pendingAction === 'delete' ? '🗑️ Confirm Delete' : pendingAction === 'update' ? '✏️ Confirm Update' : '➕ Confirm Add'}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to {pendingAction === 'delete' ? 'delete' : pendingAction === 'update' ? 'update' : 'add'} this activity?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={resetState}
                className="px-5 py-2 rounded-lg border border-white/20 text-gray-300 hover:bg-white/5 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${
                  pendingAction === 'delete'
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white'
                }`}
              >
                {pendingAction === 'delete' ? 'Delete' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
