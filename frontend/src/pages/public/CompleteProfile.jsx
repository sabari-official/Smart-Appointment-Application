import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { profileService } from "../../services/apiService";
import toast from "react-hot-toast";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, profileComplete } = useAuth();
  const [loading, setLoading] = useState(false);
  const isProvider = user?.role === "provider";

  const [customerForm, setCustomerForm] = useState({ name: user?.name || "", phone: "", address: "", gender: "" });
  const [providerForm, setProviderForm] = useState({
    businessName: "", domain: "", description: "", contactNumber: "", address: "",
    workingHoursStart: "09:00", workingHoursEnd: "17:00", appointmentInstructions: "",
  });

  useEffect(() => {
    if (profileComplete) {
      const dashboards = { customer: "/customer-dashboard", provider: "/provider-dashboard", admin: "/admin-dashboard" };
      navigate(dashboards[user?.role] || "/");
    }
  }, [profileComplete]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let payload;
      if (isProvider) {
        if (!providerForm.businessName || !providerForm.domain || !providerForm.contactNumber) {
          toast.error("Please fill required fields");
          setLoading(false);
          return;
        }
        payload = {
          ...providerForm,
          workingHours: { start: providerForm.workingHoursStart, end: providerForm.workingHoursEnd },
        };
      } else {
        if (!customerForm.name || !customerForm.phone || !customerForm.address) {
          toast.error("Please fill required fields");
          setLoading(false);
          return;
        }
        payload = customerForm;
      }

      const res = await profileService.updateProfile(payload);
      if (res.success) {
        toast.success("Profile completed! 🎉");
        updateProfile({ profileCompleted: true });
        const dashboards = { customer: "/customer-dashboard", provider: "/provider-dashboard", admin: "/admin-dashboard" };
        navigate(dashboards[user?.role] || "/");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center grid-bg px-6 py-12" style={{ background: '#0a0a1a' }}>
      <div className="bg-orb bg-orb-1"></div>
      <div className="w-full max-w-xl relative z-10 animate-fade-in-up">
        <div className="card p-10">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl" style={{ background: isProvider ? 'rgba(20,184,166,0.15)' : 'rgba(14,165,233,0.15)' }}>
              {isProvider ? "🏥" : "👤"}
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#f1f5f9' }}>Complete Your Profile</h1>
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              Fill in your details to get started as a {isProvider ? "Provider" : "Customer"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isProvider ? (
              <>
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#94a3b8' }}>Business Name *</label>
                    <input className="form-input" placeholder="Dr. Smith's Clinic" value={providerForm.businessName} onChange={e => setProviderForm(p => ({ ...p, businessName: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#94a3b8' }}>Domain/Specialty *</label>
                    <input className="form-input" placeholder="e.g. Dentist" value={providerForm.domain} onChange={e => setProviderForm(p => ({ ...p, domain: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#94a3b8' }}>Description</label>
                  <textarea className="form-input" rows={3} placeholder="Describe your services..." value={providerForm.description} onChange={e => setProviderForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#94a3b8' }}>Contact Number *</label>
                    <input className="form-input" placeholder="+1 234 567 890" value={providerForm.contactNumber} onChange={e => setProviderForm(p => ({ ...p, contactNumber: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#94a3b8' }}>Address</label>
                    <input className="form-input" placeholder="123 Main St" value={providerForm.address} onChange={e => setProviderForm(p => ({ ...p, address: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#94a3b8' }}>Working Hours Start</label>
                    <input type="time" className="form-input" value={providerForm.workingHoursStart} onChange={e => setProviderForm(p => ({ ...p, workingHoursStart: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#94a3b8' }}>Working Hours End</label>
                    <input type="time" className="form-input" value={providerForm.workingHoursEnd} onChange={e => setProviderForm(p => ({ ...p, workingHoursEnd: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#94a3b8' }}>Appointment Instructions</label>
                  <textarea className="form-input" rows={2} placeholder="Any special instructions for patients..." value={providerForm.appointmentInstructions} onChange={e => setProviderForm(p => ({ ...p, appointmentInstructions: e.target.value }))} />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#94a3b8' }}>Full Name *</label>
                  <input className="form-input" value={customerForm.name} onChange={e => setCustomerForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#94a3b8' }}>Phone Number *</label>
                  <input className="form-input" placeholder="+1 234 567 890" value={customerForm.phone} onChange={e => setCustomerForm(p => ({ ...p, phone: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#94a3b8' }}>Address *</label>
                  <textarea className="form-input" rows={3} placeholder="Your full address" value={customerForm.address} onChange={e => setCustomerForm(p => ({ ...p, address: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#94a3b8' }}>Gender</label>
                  <select className="form-input" value={customerForm.gender} onChange={e => setCustomerForm(p => ({ ...p, gender: e.target.value }))}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? "Saving..." : "Complete Profile ✨"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
