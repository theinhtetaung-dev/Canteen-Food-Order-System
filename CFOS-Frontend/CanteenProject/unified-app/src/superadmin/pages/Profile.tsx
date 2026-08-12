import React, { useState, useRef } from "react";
import { User, ShieldCheck, PenTool, Edit2, LogOut, CheckCircle2 } from "lucide-react";
import { updateUserProfile } from "@furniture/api/auth.api";
import { useAuth } from "@furniture/hooks/useAuth";
import { fetchAllUsers } from "@furniture/api/user.api";

export const Profile: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const initialData = () => {
    if (user) {
      return {
        fullName: user.name || user.rollNumber || "",
        role: user.role === 'superadmin' ? 'Super Admin' : (user.role === 'admin' || user.role === 'manager' ? 'Canteen Manager' : 'Student'),
        email: user.email || `${user.rollNumber || ''}@miit.edu.mm`,
        phone: user.phone || "+95 9 123456789",
        staffId: user.rollNumber || "",
        bio: "Managing kitchen operations and menu planning for the Central Campus Dining Hall since 2021.",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      };
    }
    const saved = localStorage.getItem("campus_bites_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      fullName: "",
      role: "Canteen Manager",
      email: "",
      phone: "+95 9 123456789",
      staffId: "",
      bio: "Managing kitchen operations and menu planning for the Central Campus Dining Hall since 2021.",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    };
  };

  const [formData, setFormData] = useState(initialData);

  React.useEffect(() => {
    async function fetchUserData() {
      if (!user) return;
      try {
        const allUsers = await fetchAllUsers();
        const dbUser = allUsers.find(
          (u) => u.userName.toLowerCase() === user.rollNumber.toLowerCase()
        );
        if (dbUser) {
          setFormData({
            fullName: dbUser.fullName || dbUser.userName,
            role: dbUser.roleName.toLowerCase() === 'superadmin' 
              ? 'Super Admin' 
              : (dbUser.roleName.toLowerCase() === 'manager' ? 'Canteen Manager' : 'Student'),
            email: dbUser.email || `${dbUser.userName}@miit.edu.mm`,
            phone: dbUser.phoneNumber || "+95 9 123456789",
            staffId: dbUser.userName,
            bio: "Managing kitchen operations and menu planning for the Central Campus Dining Hall since 2021.",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
          });
        }
      } catch (err) {
        console.error("Failed to fetch user from Tbl_User", err);
      }
    }
    fetchUserData();
  }, [user]);

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
      await updateProfile({
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
          <div className="w-24 h-24 rounded-full bg-[#e2f3be] flex items-center justify-center border-4 border-white shadow-sm shrink-0">
            <User className="w-12 h-12 text-[#3f5d13]" />
          </div>
          <div>
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
      <main className="w-full items-start">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-100/60">
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