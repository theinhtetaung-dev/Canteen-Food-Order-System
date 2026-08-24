import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  CheckCircle2,
  LogOut,
  PenTool,
  Edit2,
  X,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@user/context/AuthContext";
import { fetchAllUsers } from "@user/api/user.api";
import { changePassword } from "@user/api/auth.api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProfileSideCard {
  /** Card heading icon */
  icon?: LucideIcon;
  /** Card title (default: "Role & Access") */
  title?: string;
  /** Primary role display text (default: "Super Administrator") */
  primaryRole?: string;
  /** List of permission strings to render with checkmarks */
  permissions: string[];
}

export interface ProfileLayoutProps {
  /**
   * Human-readable label shown in the role pill beneath the name.
   * e.g. "Student", "Canteen Manager", "Super Admin"
   */
  roleBadgeLabel: string;
  /**
   * Label for the ID field in the Personal Information grid.
   * e.g. "User ID", "Staff ID"
   */
  idFieldLabel: string;
  /**
   * Optional side panel card config.
   * When provided, the layout switches to a 2/3 + 1/3 grid.
   * When omitted, Personal Information fills the full width.
   */
  sideCard?: ProfileSideCard;
  /** Show the Critical Action logout banner at the bottom (default: true) */
  showLogoutBanner?: boolean;
  /** Custom logout callback – falls back to useAuth().logout if omitted */
  onLogout?: () => void;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getInitials(name?: string, fallback = "U"): string {
  if (!name) return fallback;
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Consistent field classes
const fieldBase =
  "w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all outline-none";
const fieldView = "bg-gray-50 border border-gray-100 text-gray-800";
const fieldEdit =
  "bg-white border-2 border-gray-200 focus:border-brand text-gray-900";
const fieldViewItalic = "bg-gray-50 border border-gray-100 text-gray-600 italic";
const fieldEditItalic =
  "bg-white border-2 border-gray-200 focus:border-brand text-gray-900 italic";
const textareaBase =
  "w-full p-3.5 rounded-xl text-sm font-medium transition-all outline-none resize-none";
const textareaView = "bg-gray-50 border border-gray-100 text-gray-700";
const textareaEdit =
  "bg-white border-2 border-gray-200 focus:border-brand text-gray-900";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ProfileLayout: React.FC<ProfileLayoutProps> = ({
  roleBadgeLabel,
  idFieldLabel,
  sideCard,
  showLogoutBanner = true,
  onLogout,
}) => {
  const { user, logout, updateProfile } = useAuth();

  // ---- State ---------------------------------------------------------------
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  // Preferences state
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem("campus_bites_preferences");
      return saved ? JSON.parse(saved) : {
        emailNotifications: true,
        fastCheckout: true,
        smsReminders: false,
      };
    } catch (e) {
      return {
        emailNotifications: true,
        fastCheckout: true,
        smsReminders: false,
      };
    }
  });

  useEffect(() => {
    localStorage.setItem("campus_bites_preferences", JSON.stringify(preferences));
  }, [preferences]);

  const buildInitialProfile = () => {
    let savedBio = "";
    try {
      const saved = localStorage.getItem("campus_bites_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.bio) {
          savedBio = parsed.bio;
        }
      }
    } catch (e) {
      console.error(e);
    }

    const isManagerOrAdmin = 
      roleBadgeLabel?.toLowerCase().includes("manager") || 
      roleBadgeLabel?.toLowerCase().includes("admin");
    
    return {
      fullName: user?.name || user?.rollNumber || "",
      email: user?.email || (user?.rollNumber ? `${user.rollNumber}@miit.edu.mm` : ""),
      phone: user?.phone || "",
      staffId: user?.rollNumber || "",
      bio: savedBio || (isManagerOrAdmin 
        ? "Managing kitchen operations and menu planning for the Central Campus Dining Hall."
        : ""),
    };
  };

  const [profile, setProfile] = useState(buildInitialProfile);
  const [formData, setFormData] = useState(profile);

  // Password change state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [passwordError, setPasswordError] = useState("");

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    setPasswordStatus("idle");
    setPasswordError("");
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordStatus("error");
      setPasswordError("New passwords do not match.");
      return;
    }
    setPasswordStatus("loading");
    setPasswordError("");
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordStatus("success");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      setTimeout(() => {
        closePasswordModal();
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setPasswordStatus("error");
      const errMsg = err?.response?.data?.message || err?.message || "";
      setPasswordError(errMsg.includes("Incorrect") ? "Incorrect current password." : "Failed to update password.");
    }
  };

  // Hydrate from DB (same pattern as existing Admin/SuperAdmin pages)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function loadFromDb() {
      try {
        const allUsers = await fetchAllUsers();
        const dbUser = allUsers.find(
          (u) => u.userName.toLowerCase() === (user?.rollNumber ?? "").toLowerCase()
        );
        if (dbUser && !cancelled) {
          const updated = {
            fullName: dbUser.fullName || dbUser.userName,
            email: dbUser.email || `${dbUser.userName}@miit.edu.mm`,
            phone: dbUser.phoneNumber || "",
            staffId: dbUser.userName,
            bio: profile.bio,
          };
          setProfile(updated);
          setFormData(updated);
        }
      } catch (err) {
        console.error("ProfileLayout: failed to fetch DB user", err);
      }
    }
    loadFromDb();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Re-sync when auth context user object updates (e.g. after updateProfile)
  useEffect(() => {
    if (user && !isEditing) {
      setProfile((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        staffId: user.rollNumber || prev.staffId,
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ---- Handlers ------------------------------------------------------------
  const handleEditClick = () => {
    setFormData(profile);
    setIsEditing(true);
    setSaveStatus("idle");
  };

  const handleDiscard = () => {
    setFormData(profile);
    setIsEditing(false);
    setSaveStatus("idle");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      await updateProfile({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      });
      setProfile(formData);
      setIsEditing(false);
      setSaveStatus("success");
      // Notify admin sidebar (if present) of profile change
      window.dispatchEvent(new Event("profileUpdated"));
      localStorage.setItem(
        "campus_bites_profile",
        JSON.stringify({ ...formData, role: roleBadgeLabel })
      );
    } catch (err) {
      console.error("ProfileLayout: save failed", err);
      setSaveStatus("error");
    }
  };

  const handleLogout = onLogout ?? logout;

  if (!user) return null;

  const initials = getInitials(profile.fullName, user.rollNumber?.slice(0, 2).toUpperCase() ?? "U");
  const resolvedSideCard = sideCard || (roleBadgeLabel.toLowerCase() === "student" ? {
    icon: CheckCircle2,
    title: "Account Status & Preferences",
    primaryRole: "Active Student",
    permissions: [
      "Status: Active",
      "Email Notifications: Enabled",
      "Fast Checkout: Enabled",
      "SMS Order Reminders: Active",
    ]
  } : {
    icon: Shield,
    title: "Role & Access",
    primaryRole: roleBadgeLabel || "Canteen Manager",
    permissions: [
      "Walk-in POS Sales",
      "Real-time Order Updates",
      "Menu Category Control",
      "Daily Sales Report Access",
    ]
  });

  // ---- Render --------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* ================================================================ */}
      {/* 1. Profile Header                                                  */}
      {/* ================================================================ */}
      <header className="flex items-center justify-between gap-4">
        {/* Left: Avatar + Name + Badge */}
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-brand-light text-brand-dark border-2 border-brand shrink-0 text-xl font-black select-none shadow-sm flex items-center justify-center">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">
              {profile.fullName || user.rollNumber}
            </h1>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-brand-light text-brand-dark text-[11px] font-black uppercase rounded-full tracking-wider">
              {roleBadgeLabel}
            </span>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="shrink-0 flex items-center gap-3">
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className="bg-white border border-gray-200 text-gray-700 flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
            >
              <Shield className="w-4 h-4 text-gray-400" />
              <span>Change Password</span>
            </button>
          )}
          {isEditing ? (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleDiscard}
                className="bg-white border border-gray-200 text-gray-700 px-5 py-2 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saveStatus === "saving"}
                className="bg-brand text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-brand-dark transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
              >
                {saveStatus === "saving" ? "Saving…" : "Save Changes"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleEditClick}
              className="bg-brand text-white flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm hover:bg-brand-dark transition-colors shadow-sm cursor-pointer"
            >
              <PenTool className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </header>

      {/* Save status feedback */}
      {saveStatus === "success" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-2xl border border-gray-100 shadow-xl p-6 space-y-6 animate-slideUp text-center">
            <div className="flex flex-col items-center gap-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              <h3 className="text-xl font-bold text-gray-900">Success</h3>
              <p className="text-sm text-gray-500">Profile updated successfully.</p>
            </div>
            <button
              onClick={() => setSaveStatus("idle")}
              className="w-full bg-brand text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-dark transition-colors shadow-sm cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {saveStatus === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          Failed to save changes. Please try again.
        </div>
      )}

      {/* ================================================================ */}
      {/* 2. Personal Information                                            */}
      {/* ================================================================ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6 w-full">
        {/* Card header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 text-gray-900 font-bold">
            <User className="w-4 h-4 text-gray-500" />
            <h2 className="text-base">Personal Information</h2>
          </div>
        </div>

        {/* 2-column field grid */}
        <form
          className="space-y-6"
          onSubmit={(e) => { e.preventDefault(); handleSave(); }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                disabled={!isEditing}
                value={isEditing ? formData.fullName : profile.fullName}
                onChange={handleChange}
                className={`${fieldBase} ${isEditing ? fieldEdit : fieldView}`}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                disabled={!isEditing}
                value={isEditing ? formData.email : profile.email}
                onChange={handleChange}
                className={`${fieldBase} ${isEditing ? fieldEdit : fieldView}`}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                disabled={!isEditing}
                value={isEditing ? formData.phone : profile.phone}
                onChange={handleChange}
                className={`${fieldBase} ${isEditing ? fieldEdit : fieldView}`}
              />
            </div>


          </div>

          {/* Short Bio – full width */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-gray-500">
              Short Bio
            </label>
            {isEditing ? (
              <textarea
                rows={3}
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className={`${textareaBase} ${textareaEdit}`}
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className={`text-sm leading-relaxed ${profile.bio ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                {profile.bio || "No bio added yet. Click 'Edit Profile' to add one."}
              </p>
            )}
          </div>
        </form>
      </div>



      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl border border-gray-100 shadow-xl p-6 space-y-6 animate-slideUp">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-gray-900 font-extrabold">
                <Shield className="w-5 h-5 text-brand" />
                <h2 className="text-lg">Change Password</h2>
              </div>
              <button
                type="button"
                onClick={closePasswordModal}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                    className={`${fieldBase} ${fieldEdit}`}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    className={`${fieldBase} ${fieldEdit}`}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmNewPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                    required
                    className={`${fieldBase} ${fieldEdit}`}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {passwordStatus === "success" && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700">
                  ✓ Password changed successfully.
                </div>
              )}
              {passwordStatus === "error" && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600">
                  {passwordError || "Failed to change password. Please verify current password."}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordStatus === "loading"}
                  className="bg-brand text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-dark transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
                >
                  {passwordStatus === "loading" ? "Updating…" : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileLayout;
