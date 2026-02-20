import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { notificationService } from "../../services/apiService";
import toast from "react-hot-toast";

const Notifications = ({ theme = "customer" }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications();
      if (res.success) setNotifications(res.data || []);
    } catch { } finally { setLoading(false); }
  };

  const markRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch { }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success("All marked as read");
    } catch { }
  };

  const deleteNotif = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success("Deleted");
    } catch { }
  };

  const clearAll = async () => {
    try {
      await notificationService.clearAll();
      setNotifications([]);
      toast.success("All notifications cleared");
    } catch { }
  };

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DashboardLayout theme={theme}>
      <div className="page-header">
        <h1 style={{ color: 'var(--text-primary)' }}>
          <span className="text-gradient">Notifications</span> 🔔
        </h1>
        <p>{unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : "You're all caught up!"}</p>
      </div>

      {notifications.length > 0 && (
        <div className="flex gap-3 mb-6">
          {unreadCount > 0 && <button onClick={markAllRead} className="btn btn-sm btn-primary">Mark All Read</button>}
          <button onClick={clearAll} className="btn btn-sm btn-danger">Clear All</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-20 w-full"></div>)}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n._id} className={`card p-4 flex items-start gap-4 transition-all ${!n.read ? 'glow-border' : ''}`} style={{ opacity: n.read ? 0.7 : 1 }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: !n.read ? 'rgba(99,102,241,0.1)' : 'var(--bg-glass)' }}>
                🔔
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{n.title}</h4>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>}
                </div>
                <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{timeAgo(n.createdAt)}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {!n.read && <button onClick={() => markRead(n._id)} className="btn btn-sm btn-ghost" title="Mark read">✓</button>}
                <button onClick={() => deleteNotif(n._id)} className="btn btn-sm btn-ghost text-red-400" title="Delete">×</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state py-16">
          <div className="empty-state-icon">🔔</div>
          <p className="empty-state-title">No Notifications</p>
          <p className="empty-state-text">You'll be notified about appointments, reviews, and system updates</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Notifications;
