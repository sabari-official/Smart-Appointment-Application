import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { providerService } from "../../services/apiService";

const ProviderReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ avgRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadReviews(); }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await providerService.getReviews();
      if (res.success) {
        setReviews(res.data || []);
        setStats(res.stats || { avgRating: 0, totalReviews: 0 });
      }
    } catch { } finally { setLoading(false); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const ratingDist = [5, 4, 3, 2, 1].map(r => ({
    stars: r,
    count: reviews.filter(rv => Math.round(rv.rating) === r).length,
    pct: reviews.length > 0 ? Math.round((reviews.filter(rv => Math.round(rv.rating) === r).length / reviews.length) * 100) : 0,
  }));

  return (
    <DashboardLayout theme="provider">
      <div className="page-header">
        <h1 style={{ color: 'var(--text-primary)' }}>
          <span className="text-gradient">Reviews</span> ⭐
        </h1>
        <p>See what your customers are saying</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-3xl">
        <div className="card p-8 text-center">
          <p className="text-5xl font-bold font-display mb-2" style={{ color: '#fbbf24' }}>
            {(stats.avgRating || 0).toFixed(1)}
          </p>
          <div className="flex justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map(s => (
              <span key={s} className="text-2xl" style={{ color: s <= Math.round(stats.avgRating || 0) ? '#fbbf24' : '#64748b' }}>★</span>
            ))}
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Based on {stats.totalReviews || 0} reviews</p>
        </div>

        <div className="card p-8">
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Rating Distribution</h3>
          {ratingDist.map(r => (
            <div key={r.stars} className="flex items-center gap-3 mb-2">
              <span className="text-sm w-12 font-medium" style={{ color: '#fbbf24' }}>{r.stars} ★</span>
              <div className="flex-1 progress-bar">
                <div className="progress-bar-fill" style={{ width: `${r.pct}%`, background: '#fbbf24' }}></div>
              </div>
              <span className="text-xs w-8 text-right" style={{ color: 'var(--text-muted)' }}>{r.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="skeleton h-32"></div>)}</div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map(rv => (
            <div key={rv._id} className="card p-5 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="avatar">{(rv.customer?.name || "C")[0]}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{rv.customer?.name || "Customer"}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(rv.createdAt)}</span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <span key={s} className="text-sm" style={{ color: s <= rv.rating ? '#fbbf24' : '#64748b' }}>★</span>
                    ))}
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{rv.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state py-16">
          <div className="empty-state-icon">⭐</div>
          <p className="empty-state-title">No Reviews Yet</p>
          <p className="empty-state-text">Reviews will appear here after customers rate your service</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProviderReviews;
