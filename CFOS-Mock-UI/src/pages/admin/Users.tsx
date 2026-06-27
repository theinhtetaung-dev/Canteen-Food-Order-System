import { useState, useEffect } from 'react';
import { axiosPrivate } from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, X, Edit2, Trash2, UserPlus, Loader2 } from 'lucide-react';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Pagination } from '../../components/ui/Pagination';

interface UserResModel {
  userId: number;
  roleName: string;
  userName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  status: string; // ACTIVE or INACTIVE
  deleteFlag: boolean;
  createdAt: string;
  updatedAt: string;
}

const ROLES = [
  { roleId: 1, name: 'Admin' },
  { roleId: 2, name: 'Manager' },
  { roleId: 3, name: 'User' },
];

const AdminUsers = () => {
  const [users, setUsers] = useState<UserResModel[]>([]);
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed page for backend
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResModel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation States
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    userName: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    roleId: 3, // Default to User
    status: 'ACTIVE',
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // GET /api/users?page={currentPage}&size=10
      const response = await axiosPrivate.get(`/users?page=${currentPage}&size=10`);
      setUsers(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch users', error);
      toast.error('Failed to load users list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const handleOpenModal = (user: UserResModel | null = null) => {
    if (user) {
      setEditingUser(user);
      const role = ROLES.find(r => r.name === user.roleName);
      setFormData({
        userName: user.userName,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        password: '', // password not updated in regular edit
        roleId: role ? role.roleId : 3,
        status: user.status,
      });
    } else {
      setEditingUser(null);
      setFormData({
        userName: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        roleId: 3,
        status: 'ACTIVE',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingUser) {
        // Edit flow — PUT /api/users/{id}
        // Body: roleId, userName, fullName, email, phoneNumber, status
        await axiosPrivate.put(`/users/${editingUser.userId}`, {
          roleId: formData.roleId,
          userName: formData.userName,
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          status: formData.status,
        });
        toast.success('User updated successfully');
      } else {
        // Create flow — POST /api/users
        // Body: roleId, userName, fullName, email, password, phoneNumber (No status)
        await axiosPrivate.post('/users', {
          roleId: formData.roleId,
          userName: formData.userName,
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
        });
        toast.success('User created successfully');
      }
      handleCloseModal();
      fetchUsers();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to save user';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (userId: number) => {
    setDeleteUserId(userId);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteUserId) return;
    try {
      await axiosPrivate.delete(`/users/${deleteUserId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete user');
    } finally {
      setIsConfirmOpen(false);
      setDeleteUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button
          onClick={() => handleOpenModal(null)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create User
        </button>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.userId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-950">
                    {user.userName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {user.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.phoneNumber || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {user.roleName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      user.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button
                      onClick={() => handleOpenModal(user)}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(user.userId)}
                      className="text-red-600 hover:text-red-900 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <Pagination
              current_page={currentPage}
              total_pages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}

      {/* Create / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-orange-600" />
                {editingUser ? 'Edit User details' : 'Register New User'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                />
              </div>

              {/* Password is only required when creating a new user */}
              {!editingUser && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    className="input-field"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 6 characters"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Role
                  </label>
                  <select
                    className="input-field"
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: parseInt(e.target.value) })}
                  >
                    {ROLES.map((role) => (
                      <option key={role.roleId} value={role.roleId}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status selection is only displayed during edit */}
                {editingUser && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <select
                      className="input-field"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingUser ? 'Save changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Soft Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

export default AdminUsers;
