import { useState, useEffect } from 'react';
import { adminService, User } from '../../services/adminService';
import { DataTable } from '../../components/admin/DataTable';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'staff' | 'manager' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [formData, setFormData] = useState<{
    email: string;
    first_name: string;
    last_name: string;
    role: 'staff' | 'manager' | 'admin';
    is_active: boolean;
  }>({
    email: '',
    first_name: '',
    last_name: '',
    role: 'staff',
    is_active: true,
  });

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      user.email.toLowerCase().includes(searchLower) ||
      user.first_name.toLowerCase().includes(searchLower) ||
      user.last_name.toLowerCase().includes(searchLower);

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role as 'staff' | 'manager' | 'admin',
      is_active: user.is_active,
    });
    setShowModal(true);
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Delete user ${user.email}?`)) return;

    try {
      await adminService.deleteUser(user.id);
      toast.success('User deleted');
      setUsers(users.filter(u => u.id !== user.id));
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        await adminService.updateUser(editingUser.id, formData);
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
        toast.success('User updated');
      }
      setShowModal(false);
      setEditingUser(null);
    } catch (error) {
      toast.error('Failed to save user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button
          onClick={() => {
            setEditingUser(null);
            setFormData({ email: '', first_name: '', last_name: '', role: 'staff', is_active: true });
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full pl-10"
          />
          <svg
            className="w-5 h-5 absolute left-3 top-3 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="input w-full"
            >
              <option value="all">All Roles</option>
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="input w-full"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-600 flex items-center justify-between">
          <span>
            Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users
          </span>
          {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setStatusFilter('all');
              }}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <DataTable<User>
        columns={[
          { key: 'email', label: 'Email' },
          { key: 'first_name', label: 'First Name' },
          { key: 'last_name', label: 'Last Name' },
          { key: 'role', label: 'Role', render: (val) => <span className="capitalize font-medium text-primary-700">{val}</span> },
          {
            key: 'is_active',
            label: 'Status',
            render: (val) => (
              <span className={`px-2 py-1 rounded text-xs font-semibold ${val ? 'bg-success-100 text-success-800' : 'bg-red-100 text-red-800'}`}>
                {val ? 'Active' : 'Inactive'}
              </span>
            ),
          },
          {
            key: 'created_at',
            label: 'Created',
            render: (val) => format(new Date(val), 'MMM d, yyyy'),
          },
        ]}
        data={filteredUsers}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        idField="id"
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input w-full"
                  disabled={!!editingUser}
                />
                {editingUser && (
                  <p className="text-xs text-gray-500 mt-1">Cannot change email</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'staff' | 'manager' | 'admin' })}
                  className="input w-full"
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded cursor-pointer"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700 cursor-pointer">
                  User is active and can log in
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
