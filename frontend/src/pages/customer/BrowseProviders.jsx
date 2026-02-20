import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { customerService } from "../../services/apiService";
import toast from "react-hot-toast";

const BrowseProviders = () => {
  const [providers, setProviders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => { loadProviders(); }, []);

  const loadProviders = async (searchQuery = "") => {
    searchQuery ? setSearching(true) : setLoading(true);
    try {
      const res = await customerService.getProviders(searchQuery ? { search: searchQuery } : {});
      if (res.success) setProviders(res.data || []);
    } catch (err) {
      toast.error("Failed to load providers");
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) loadProviders(search.trim());
    else loadProviders();
  };

  return (
    <DashboardLayout theme="customer">
      <div className="page-header">
        <h1 style={{ color: 'var(--text-primary)' }}>
          <span className="text-gradient">Browse</span> Providers 🔍
        </h1>
        <p>Find the perfect provider for your needs with AI-powered recommendations</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-3 max-w-2xl">
          <div className="search-bar flex-1">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input
              type="text"
              placeholder="Search providers, specialties (e.g. 'dentist', 'cardiologist')..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="search-providers"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={searching}>
            {searching ? (
              <span className="spinner spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }}></span>
            ) : (
              <>🤖 AI Search</>
            )}
          </button>
          {search && (
            <button type="button" onClick={() => { setSearch(""); loadProviders(); }} className="btn btn-ghost">
              Clear
            </button>
          )}
        </div>
        {search && (
          <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            🤖 AI is semantically matching providers to your search...
          </p>
        )}
      </form>

      {/* Results */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-12 w-12 rounded-full mb-4"></div>
              <div className="skeleton h-5 w-3/4 mb-2"></div>
              <div className="skeleton h-4 w-1/2 mb-4"></div>
              <div className="skeleton h-16 w-full mb-4"></div>
              <div className="skeleton h-10 w-full"></div>
            </div>
          ))}
        </div>
      ) : providers.length > 0 ? (
        <>
          <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Showing {providers.length} provider{providers.length !== 1 ? "s" : ""}
            {search && <span className="ml-1 font-medium" style={{ color: 'var(--primary)' }}>for "{search}"</span>}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((p, i) => {
              const id = p.providerId || p.user?._id;
              return (
                <div key={id || i} className="card card-hover p-6 animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="avatar avatar-lg" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
                      {(p.businessName || p.user?.name || "P")[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                        {p.businessName || p.user?.name || "Provider"}
                      </h3>
                      <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                        {p.domain || "General"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold" style={{ color: '#fbbf24' }}>
                          ★ {(p.rating || 0).toFixed(1)}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          ({p.reviewCount || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {p.description && (
                    <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {p.description}
                    </p>
                  )}

                  {p._matchScore !== undefined && p._matchScore > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <span className="badge badge-primary">🤖 AI Match: {Math.round(p._matchScore)}%</span>
                    </div>
                  )}

                  <Link to={`/view-slots/${id}`} className="btn btn-primary w-full btn-sm">
                    View Slots →
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="empty-state py-16">
          <div className="empty-state-icon">🔍</div>
          <p className="empty-state-title">No Providers Found</p>
          <p className="empty-state-text">
            {search ? "Try a different search term" : "No providers are currently available"}
          </p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default BrowseProviders;
