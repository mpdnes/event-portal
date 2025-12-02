import { useState, useEffect } from 'react';
import { adminService, Presenter } from '../../services/adminService';
import { DataTable } from '../../components/admin/DataTable';
import toast from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function PresenterManagement() {
  const [presenters, setPresenters] = useState<Presenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPresenter, setEditingPresenter] = useState<Presenter | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    availability_notes: '',
  });

  useEffect(() => {
    loadPresenters();
  }, []);

  const loadPresenters = async () => {
    try {
      const data = await adminService.getPresenters();
      setPresenters(data);
    } catch (error) {
      toast.error('Failed to load presenters');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (presenter: Presenter) => {
    setEditingPresenter(presenter);
    setFormData({
      name: presenter.name,
      email: presenter.email || '',
      phone: presenter.phone || '',
      bio: presenter.bio || '',
      availability_notes: presenter.availability_notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (presenter: Presenter) => {
    if (!confirm(`Delete presenter "${presenter.name}"?`)) return;

    try {
      await adminService.deletePresenter(presenter.id);
      toast.success('Presenter deleted');
      setPresenters(presenters.filter(p => p.id !== presenter.id));
    } catch (error) {
      toast.error('Failed to delete presenter');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Presenter name is required');
      return;
    }

    try {
      if (editingPresenter) {
        const updated = await adminService.updatePresenter(editingPresenter.id, formData);
        setPresenters(presenters.map(p => p.id === editingPresenter.id ? updated : p));
        toast.success('Presenter updated');
      } else {
        const created = await adminService.createPresenter(formData);
        setPresenters([...presenters, created]);
        toast.success('Presenter created');
      }
      setShowModal(false);
      setEditingPresenter(null);
    } catch (error) {
      toast.error('Failed to save presenter');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Presenter Management</h2>
        <button
          onClick={() => {
            setEditingPresenter(null);
            setFormData({ name: '', email: '', phone: '', bio: '', availability_notes: '' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Presenter
        </button>
      </div>

      <DataTable<Presenter>
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'bio', label: 'Bio' },
          { key: 'availability_notes', label: 'Availability' },
        ]}
        data={presenters}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        idField="id"
      />

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingPresenter ? 'Edit Presenter' : 'Add Presenter'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Brief biography and qualifications"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Availability Notes
                </label>
                <textarea
                  value={formData.availability_notes}
                  onChange={(e) => setFormData({ ...formData, availability_notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  rows={2}
                  placeholder="e.g., Available Tuesdays and Thursdays after 2pm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingPresenter ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
