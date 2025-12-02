import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface EmailLog {
  id: string;
  recipient_email: string;
  subject?: string;
  template_name?: string;
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  error_message?: string;
  sent_at?: string;
  created_at: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  is_active: boolean;
}

export default function EmailManagement() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sent' | 'failed'>('all');
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    html_body: '',
    template_variables: '',
    is_active: true,
  });
  const [savingTemplate, setSavingTemplate] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const [logsRes] = await Promise.all([
        axios.get(`/api/email/logs?status=${filter === 'all' ? '' : filter}&limit=50`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        // Optionally fetch templates if you have an endpoint
      ]);

      setLogs(logsRes.data.rows);
    } catch (error: any) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTemplate.name || !newTemplate.subject || !newTemplate.html_body) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSavingTemplate(true);
      const token = localStorage.getItem('token');

      await axios.post(
        '/api/email/template',
        {
          name: newTemplate.name,
          subject: newTemplate.subject,
          html_body: newTemplate.html_body,
          template_variables: newTemplate.template_variables
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean),
          is_active: newTemplate.is_active,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Template saved!');
      setNewTemplate({
        name: '',
        subject: '',
        html_body: '',
        template_variables: '',
        is_active: true,
      });
      setShowTemplateForm(false);
    } catch (error: any) {
      toast.error('Failed to save template');
      console.error(error);
    } finally {
      setSavingTemplate(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <ExclamationCircleIcon className="w-5 h-5 text-yellow-600" />;
      default:
        return <EnvelopeIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Management</h1>
          <p className="text-gray-600 mt-1">Track emails and manage templates</p>
        </div>
        <button
          onClick={() => setShowTemplateForm(!showTemplateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5" />
          New Template
        </button>
      </div>

      {/* Template Form */}
      {showTemplateForm && (
        <div className="mb-8 bg-white rounded-lg shadow p-6 border">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Create Email Template</h2>
          <form onSubmit={handleSaveTemplate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="e.g., session_reminder"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Subject *
                </label>
                <input
                  type="text"
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                  placeholder="e.g., Reminder: {{session_title}}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HTML Body *
              </label>
              <textarea
                value={newTemplate.html_body}
                onChange={(e) => setNewTemplate({ ...newTemplate, html_body: e.target.value })}
                placeholder="Enter HTML content. Use {{variable_name}} for placeholders."
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Variables (comma-separated)
              </label>
              <input
                type="text"
                value={newTemplate.template_variables}
                onChange={(e) => setNewTemplate({ ...newTemplate, template_variables: e.target.value })}
                placeholder="e.g., first_name, session_title, session_date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                These variables should match the placeholders in your subject and body
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={newTemplate.is_active}
                onChange={(e) => setNewTemplate({ ...newTemplate, is_active: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">
                Active
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={savingTemplate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {savingTemplate ? 'Saving...' : 'Save Template'}
              </button>
              <button
                type="button"
                onClick={() => setShowTemplateForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Email Logs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Email Logs</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('sent')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'sent'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sent
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'failed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Failed
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No email logs found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Template
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Sent At
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className={`border-b ${getStatusColor(log.status)}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <span className="text-sm font-medium capitalize">{log.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{log.recipient_email}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {log.subject || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.template_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.sent_at ? new Date(log.sent_at).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Error Info */}
      {logs.some((log) => log.status === 'failed') && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-900 mb-2">Failed Emails</h3>
          <div className="space-y-2">
            {logs
              .filter((log) => log.status === 'failed')
              .map((log) => (
                <div key={log.id} className="text-sm text-red-800">
                  <strong>{log.recipient_email}</strong>: {log.error_message || 'Unknown error'}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
