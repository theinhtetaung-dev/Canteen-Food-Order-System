import React, { useState, useEffect } from 'react';
import { User, Shield, CheckCircle2, LogOut, Pencil } from 'lucide-react';
import { useAuth } from "@user/hooks/useAuth";

export const AdminProfile: React.FC = () => {
  const { logout, user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState({
    fullName: user?.name || 'Ta sone Ta yout',
    email: user?.email || 'second@miit.edu.mm',
    phone: user?.phone || '+95 9123456789',
    staffId: user?.rollNumber || 'CB-ADM-2024-001',
    bio: 'Managing kitchen operations and menu planning for the Central Campus Dining Hall since 2021.'
  });

  // Keep state updated if user changes (e.g. after async loading)
  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        staffId: user.rollNumber || prev.staffId,
      }));
    }
  }, [user]);

  // Temporary state while editing
  const [formData, setFormData] = useState(profile);

  const handleEditClick = () => {
    setFormData(profile);
    setIsEditing(true);
  };

  const handleDiscard = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      });
      setProfile(formData);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header Profile Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#E1EEB4] flex items-center justify-center text-[#3B5B11] border-2 border-[#88C425] shrink-0">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">
              {profile.fullName}
            </h2>
            <span className="inline-block mt-0.5 px-2 py-0.5 bg-[#E1EEB4] text-[#3B5B11] text-[10px] font-black uppercase rounded-full">
              SUPER ADMIN
            </span>
          </div>
        </div>

        {/* Dynamic Action Buttons */}
        <div>
          {!isEditing ? (
            <button
              onClick={handleEditClick}
              className="px-4 py-2 bg-[#056839] hover:bg-[#034C29] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDiscard}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#056839] hover:bg-[#034C29] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Form & Access Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Personal Information (2 Cols) */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2 text-gray-900 font-bold">
              <User className="w-4 h-4 text-gray-600" />
              <h3>Personal Information</h3>
            </div>
            <span className="text-xs text-gray-400 font-medium">
              {isEditing ? 'Editing Fields' : 'Edit Fields'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">Full Name</label>
              <input
                type="text"
                disabled={!isEditing}
                value={isEditing ? formData.fullName : profile.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all outline-none ${
                  isEditing
                    ? 'bg-white border-2 border-gray-200 focus:border-[#88C425] text-gray-900'
                    : 'bg-gray-50 border border-gray-100 text-gray-800'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">Email Address</label>
              <input
                type="email"
                disabled={!isEditing}
                value={isEditing ? formData.email : profile.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all outline-none ${
                  isEditing
                    ? 'bg-white border-2 border-gray-200 focus:border-[#88C425] text-gray-900'
                    : 'bg-gray-50 border border-gray-100 text-gray-800'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">Phone Number</label>
              <input
                type="text"
                disabled={!isEditing}
                value={isEditing ? formData.phone : profile.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all outline-none ${
                  isEditing
                    ? 'bg-white border-2 border-gray-200 focus:border-[#88C425] text-gray-900'
                    : 'bg-gray-50 border border-gray-100 text-gray-800'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">Staff ID</label>
              <input
                type="text"
                disabled={!isEditing}
                value={isEditing ? formData.staffId : profile.staffId}
                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm italic font-medium transition-all outline-none ${
                  isEditing
                    ? 'bg-white border-2 border-gray-200 focus:border-[#88C425] text-gray-900'
                    : 'bg-gray-50 border border-gray-100 text-gray-600'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">Short Bio</label>
            <textarea
              rows={3}
              disabled={!isEditing}
              value={isEditing ? formData.bio : profile.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className={`w-full p-3.5 rounded-xl text-sm font-medium transition-all outline-none resize-none ${
                isEditing
                  ? 'bg-white border-2 border-gray-200 focus:border-[#88C425] text-gray-900'
                  : 'bg-gray-50 border border-gray-100 text-gray-700'
              }`}
            />
          </div>
        </div>

        {/* Right Column: Role & Access (1 Col) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5 h-fit">
          <div className="flex items-center gap-2 text-gray-900 font-bold border-b border-gray-100 pb-3">
            <Shield className="w-4 h-4 text-gray-600" />
            <h3>Role & Access</h3>
          </div>

          <div className="bg-[#F8FBF2] p-4 rounded-xl border border-gray-100">
            <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">PRIMARY ROLE</p>
            <p className="text-base font-black text-gray-900 mt-0.5">Super Administrator</p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-400">Key Permissions:</p>
            <ul className="space-y-2 text-xs font-semibold text-gray-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#056839]" />
                Full Menu Management
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#056839]" />
                Staff Payroll & Scheduling
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#056839]" />
                Inventory Procurement
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#056839]" />
                Global Settings Access
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Critical Action Banner */}
      <div className="bg-[#FFF5F5] border border-red-200/60 p-5 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-xs font-black text-red-600 uppercase tracking-wider">CRITICAL ACTION</p>
          <p className="text-xs text-gray-600 mt-1 font-medium">
            Logging out will terminate your current administrative session across all devices.
          </p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#C5221F] hover:bg-[#A81B18] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          Logout from System
        </button>
      </div>
    </div>
  );
};
