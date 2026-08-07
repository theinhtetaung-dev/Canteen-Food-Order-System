import React, { useState, useRef } from "react";
import { User, ShieldCheck, PenTool, Edit2, LogOut, CheckCircle2 } from "lucide-react";
import { updateUserProfile } from "@furniture/api/auth.api";
import { useAuth } from "@furniture/hooks/useAuth";

export const Profile: React.FC = () => {
  const { logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const initialData = () => {
    const saved = localStorage.getItem("campus_bites_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      fullName: "kaung thant",
      role: "Super Admin",
      email: "kaung.thant@campusbites.edu",
      phone: "+1 (555) 234-5678",
      staffId: "CB-ADM-2024-001",
      bio: "Managing kitchen operations and menu planning for the Central Campus Dining Hall since 2021.",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    };
  };

  const [formData, setFormData] = useState(initialData);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state, localStorage, and sidebar instantly on every change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      localStorage.setItem("campus_bites_profile", JSON.stringify(updated));
      window.dispatchEvent(new Event("profileUpdated"));
      return updated;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => {
        const updated = { ...prev, avatar: imageUrl };
        localStorage.setItem("campus_bites_profile", JSON.stringify(updated));
        window.dispatchEvent(new Event("profileUpdated"));
        return updated;
      });
    }
  };

  const handleSave = async () => {
    try {
      await updateUserProfile("me", {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      });
      localStorage.setItem("campus_bites_profile", JSON.stringify(formData));
      window.dispatchEvent(new Event("profileUpdated"));
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to update profile on the backend.");
    }
  };

  const handleDiscard = () => {
    const resetData = initialData();
    setFormData(resetData);
    localStorage.setItem("campus_bites_profile", JSON.stringify(resetData));
    window.dispatchEvent(new Event("profileUpdated"));
    setIsEditing(false);
  };

  const permissions = [
    "Full Menu Management",
    "Staff Payroll & Scheduling",
    "Inventory Procurement",
    "Global Settings Access",
  ];

  return (
    <div className="p-8 space-y-8 bg-[#fdfefb] min-h-screen">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* 1. Page Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <img
              src={formData.avatar}
              alt="Profile Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-[#e2f3be] shadow-sm"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              className="absolute bottom-0 right-0 bg-[#3f5d13] p-2 rounded-full border-2 border-white text-white hover:scale-110 transition-transform shadow-md"
              title="Change Profile Picture"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            {/* Connected directly to formData.fullName so it updates live */}
            <h1 className="text-3xl font-bold text-[#0f172a]">{formData.fullName}</h1>
            <span className="inline-block bg-[#e2f3be] text-[#3f5d13] font-extrabold text-[11px] px-2.5 py-1 rounded-md tracking-wider uppercase mt-1">
              {formData.role}
            </span>
          </div>
        </div>

        <div>
          {isEditing ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDiscard}
                className="bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors shadow-sm"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="bg-[#0f4d2a] text-white px-5 py-2 rounded-xl font-semibold text-sm hover:bg-[#0b3b20] transition-colors shadow-sm"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="bg-[#0f4d2a] text-white flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0b3b20] transition-colors"
            >
              <PenTool className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Main Content Grid */}
      <main className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        <div className="xl:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-emerald-100/60">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-emerald-800" />
              <h2 className="text-xl font-bold text-gray-950">Personal Information</h2>
            </div>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-emerald-800 text-sm font-semibold flex items-center gap-1.5 hover:text-emerald-950"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Fields</span>
              </button>
            )}
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  disabled={!isEditing}
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-xl text-sm transition-all outline-none ${
                    isEditing
                      ? "bg-white border-2 border-emerald-500 text-gray-900 shadow-sm focus:ring-2 focus:ring-emerald-200"
                      : "bg-[#f2f4ee] border border-gray-200/80 text-gray-800"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  disabled={!isEditing}
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-xl text-sm transition-all outline-none ${
                    isEditing
                      ? "bg-white border-2 border-emerald-500 text-gray-900 shadow-sm focus:ring-2 focus:ring-emerald-200"
                      : "bg-[#f2f4ee] border border-gray-200/80 text-gray-800"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  disabled={!isEditing}
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-xl text-sm transition-all outline-none ${
                    isEditing
                      ? "bg-white border-2 border-emerald-500 text-gray-900 shadow-sm focus:ring-2 focus:ring-emerald-200"
                      : "bg-[#f2f4ee] border border-gray-200/80 text-gray-800"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Staff ID</label>
                <input
                  type="text"
                  name="staffId"
                  disabled={!isEditing}
                  value={formData.staffId}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-xl text-sm italic transition-all outline-none ${
                    isEditing
                      ? "bg-white border-2 border-emerald-500 text-gray-900 shadow-sm focus:ring-2 focus:ring-emerald-200"
                      : "bg-[#f2f4ee] border border-gray-200/80 text-gray-600"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Short Bio</label>
              <textarea
                rows={3}
                name="bio"
                disabled={!isEditing}
                value={formData.bio}
                onChange={handleChange}
                className={`w-full p-3.5 rounded-xl text-sm leading-relaxed transition-all outline-none ${
                  isEditing
                    ? "bg-white border-2 border-emerald-500 text-gray-900 shadow-sm focus:ring-2 focus:ring-emerald-200"
                    : "bg-[#f2f4ee] border border-gray-200/80 text-gray-800"
                }`}
              />
            </div>
          </form>
        </div>

        {/* Role & Access Panel */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-100/60 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <ShieldCheck className="w-5 h-5 text-emerald-800" />
            <h2 className="text-xl font-bold text-gray-950">Role & Access</h2>
          </div>

          <div className="bg-[#f0f7e4] rounded-2xl p-5 mb-8 border border-[#e2f3be]">
            <p className="text-[11px] font-bold text-[#577227] tracking-wider mb-1 uppercase">Primary Role</p>
            <p className="text-lg font-extrabold text-[#2d4608]">{formData.role}</p>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-700">Key Permissions:</p>
            <ul className="space-y-3.5">
              {permissions.map((permission) => (
                <li key={permission} className="flex items-center gap-3 text-sm font-semibold text-gray-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  <span>{permission}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      {/* 3. Footer: Critical Action Banner */}
      <div className="bg-[#fdf4f4] border border-red-200/80 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-1">Critical Action</p>
          <p className="text-sm font-medium text-gray-600">
            Logging out will terminate your current administrative session across all devices.
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="bg-[#b91c1c] text-white flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#991b1b] transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout from System</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;