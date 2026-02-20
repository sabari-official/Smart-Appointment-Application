import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { adminService } from "../../services/apiService";
import toast from "react-hot-toast";

const Providers = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { loadProviders(); }, []);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllProviders();
      if (res.success) setProviders(res.data || []);
    } catch { } finally { setLoading(false); }
  };

  const toggleSuspension = async (id) => {
    try {
      await adminService.toggleProviderSuspension(id);
      toast.success("Updated!");
      loadProviders();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const filtered = providers.filter(p => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (p.user?.name?.toLowerCase().includes(s) || p.businessName?.toLowerCase().includes(s) || p.domain?.toLowerCase().includes(s));
  });

  return (
    <DashboardLayout theme="admin">
      <div className="page-header">
        <h1 style={{ color: 'var(--text-primary)' }}>Manage <span className="text-gradient">Providers</span> 🏥</h1>
        <p>View and manage all registered service providers</p>
      </div>

      <div className="search-bar mb-6 max-w-lg">
        <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
        <input placeholder="Search providers..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">{[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-40"></div>)}</div>
      ) : filtered.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((p, i) => (
            <div key={p._id || i} className="card p-5 animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start gap-4 mb-3">
                <div className="avatar avatar-lg" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
                  {(p.businessName || p.user?.name || "P")[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate" style={{ color: 'var(--text-primary)' }}>{p.businessName || p.user?.name}</h3>
                  <p className="text-sm" style={{ color: 'var(--primary)' }}>{p.domain || "General"}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{p.user?.email}</p>
                </div>
                <span className={`badge ${p.user?.isSuspended ? 'badge-danger' : 'badge-success'}`}>
                  {p.user?.isSuspended ? "Suspended" : "Active"}
                </span>
              </div>
              {p.description && <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--text-secondary)' }}>{p.description}</p>}
              <div className="flex gap-2">
                <button onClick={() => toggleSuspension(p.user?._id || p._id)} className={`btn btn-sm ${p.user?.isSuspended ? 'btn-success' : 'btn-warning'}`}>
                  {p.user?.isSuspended ? "Unsuspend" : "Suspend"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state py-16">
          <div className="empty-state-icon">🏥</div>
          <p className="empty-state-title">No Providers Found</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Providers;
