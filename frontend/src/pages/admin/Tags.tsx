import { useState, useEffect } from 'react';
import { adminService, Tag } from '../../services/adminService';
import { DataTable } from '../../components/admin/DataTable';
import toast from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function TagManagement() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    emoji: '',
    color: '#FF6B6B',
    description: '',
  });

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const data = await adminService.getTags();
      setTags(data);
    } catch (error) {
      toast.error('Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      emoji: tag.emoji || '',
      color: tag.color || '#FF6B6B',
      description: tag.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (tag: Tag) => {
    if (!confirm(`Delete tag "${tag.name}"?`)) return;

    try {
      await adminService.deleteTag(tag.id);
      toast.success('Tag deleted');
      setTags(tags.filter(t => t.id !== tag.id));
    } catch (error) {
      toast.error('Failed to delete tag');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Tag name is required');
      return;
    }

    try {
      if (editingTag) {
        const updated = await adminService.updateTag(editingTag.id, formData);
        setTags(tags.map(t => t.id === editingTag.id ? updated : t));
        toast.success('Tag updated');
      } else {
        const created = await adminService.createTag(formData);
        setTags([...tags, created]);
        toast.success('Tag created');
      }
      setShowModal(false);
      setEditingTag(null);
    } catch (error) {
      toast.error('Failed to save tag');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Tag Management</h2>
        <button
          onClick={() => {
            setEditingTag(null);
            setFormData({ name: '', emoji: '', color: '#FF6B6B', description: '' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Tag
        </button>
      </div>

      <DataTable<Tag>
        columns={[
          {
            key: 'emoji',
            label: 'Icon',
            render: (val) => <span className="text-2xl">{val}</span>,
          },
          { key: 'name', label: 'Name' },
          {
            key: 'color',
            label: 'Color',
            render: (val) => (
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: val }}
                />
                <span className="text-sm text-gray-600">{val}</span>
              </div>
            ),
          },
          { key: 'description', label: 'Description' },
        ]}
        data={tags}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        idField="id"
      />

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingTag ? 'Edit Tag' : 'Add Tag'}
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
                  placeholder="e.g., Food Provided"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emoji
                  </label>
                  <input
                    type="text"
                    value={formData.emoji}
                    onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-2xl"
                    placeholder="🍕"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="What does this tag represent?"
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
                  {editingTag ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
