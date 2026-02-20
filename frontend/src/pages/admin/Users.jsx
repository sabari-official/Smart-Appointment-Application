import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { adminService } from "../../services/apiService";
import toast from "react-hot-toast";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllUsers();
      if (res.success) setUsers(res.data || []);
    } catch { } finally { setLoading(false); }
  };

  const toggleSuspend = async (userId, isSuspended) => {
    try {
      if (isSuspended) {
        await adminService.unsuspendUser(userId);
        toast.success("User unsuspended");
      } else {
        await adminService.suspendUser(userId);
        toast.success("User suspended");
      }
      loadUsers();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const filtered = users.filter(u => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || u.role?.toLowerCase().includes(s));
  });

  return (
    <DashboardLayout theme="admin">
      <div className="page-header">
        <h1 style={{ color: 'var(--text-primary)' }}>Manage <span className="text-gradient">Users</span> 👥</h1>
        <p>View and manage all registered users</p>
      </div>

      <div className="search-bar mb-6 max-w-lg">
        <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
        <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton h-16"></div>)}</div>
      ) : filtered.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar avatar-sm">{(u.name || "U")[0]}</div>
                        <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{u.name}</span>
                      </div>
                    </td>
                    <td><span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{u.email}</span></td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-primary' : u.role === 'provider' ? 'badge-success' : 'badge-info'}`}>{u.role}</span></td>
                    <td><span className={`badge ${u.isSuspended ? 'badge-danger' : 'badge-success'}`}>{u.isSuspended ? "Suspended" : "Active"}</span></td>
                    <td>
                      {u.role !== "admin" && (
                        <button onClick={() => toggleSuspend(u._id, u.isSuspended)} className={`btn btn-sm ${u.isSuspended ? 'btn-success' : 'btn-warning'}`}>
                          {u.isSuspended ? "Unsuspend" : "Suspend"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty-state py-16">
          <div className="empty-state-icon">👥</div>
          <p className="empty-state-title">No Users Found</p>
          <p className="empty-state-text">{search ? "Try a different search term" : "No users registered yet"}</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Users;
