import React, { useState, useEffect } from "react";
import { useToast } from "~/components/common/ToastProvider";

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'performance_update' | 'casting_change' | 'announcement' | 'reminder';
  enabled: boolean;
  created_at: string;
}

interface NotificationLog {
  id: string;
  template_id: string;
  recipient_email: string;
  subject: string;
  sent_at: string;
  status: 'sent' | 'failed' | 'pending';
}

interface EmailSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass: string;
  from_email: string;
  from_name: string;
  enabled: boolean;
}

const EmailNotifications: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'templates' | 'settings' | 'logs'>('templates');
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [settings, setSettings] = useState<EmailSettings>({
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_pass: '',
    from_email: '',
    from_name: 'Musical Tracker',
    enabled: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'announcement' as NotificationTemplate['type'],
    enabled: true
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockTemplates: NotificationTemplate[] = [
      {
        id: '1',
        name: 'Performance Update',
        subject: 'Performance Schedule Change - {{musical_title}}',
        content: 'Dear {{recipient_name}},\n\nWe want to notify you of a schedule change for "{{musical_title}}".\n\nNew Date: {{new_date}}\nNew Time: {{new_time}}\nVenue: {{theater_name}}\n\nFor any questions, please contact us.\n\nBest regards,\nThe Musical Tracker Team',
        type: 'performance_update',
        enabled: true,
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        name: 'Casting Change Notification',
        subject: 'Casting Update for {{musical_title}}',
        content: 'Hello {{recipient_name}},\n\nThere has been a casting change for "{{musical_title}}":\n\nRole: {{role_name}}\nNew Actor: {{new_actor_name}}\nPrevious Actor: {{previous_actor_name}}\n\nPerformance Date: {{performance_date}}\nVenue: {{theater_name}}\n\nThank you for your understanding.\n\nBest,\nMusical Tracker Team',
        type: 'casting_change',
        enabled: true,
        created_at: '2024-01-15T10:35:00Z'
      },
      {
        id: '3',
        name: 'General Announcement',
        subject: 'Important Announcement: {{announcement_title}}',
        content: 'Dear {{recipient_name}},\n\n{{announcement_content}}\n\nFor more information, visit our website or contact us directly.\n\nSincerely,\nThe Musical Tracker Team',
        type: 'announcement',
        enabled: true,
        created_at: '2024-01-15T10:40:00Z'
      }
    ];

    const mockLogs: NotificationLog[] = [
      {
        id: '1',
        template_id: '1',
        recipient_email: 'actor@example.com',
        subject: 'Performance Schedule Change - Hamilton',
        sent_at: '2024-01-15T14:30:00Z',
        status: 'sent'
      },
      {
        id: '2',
        template_id: '2',
        recipient_email: 'director@example.com',
        subject: 'Casting Update for The Lion King',
        sent_at: '2024-01-15T15:45:00Z',
        status: 'sent'
      },
      {
        id: '3',
        template_id: '3',
        recipient_email: 'audience@example.com',
        subject: 'Important Announcement: New Season Launch',
        sent_at: '2024-01-15T16:20:00Z',
        status: 'failed'
      }
    ];

    setTimeout(() => {
      setTemplates(mockTemplates);
      setLogs(mockLogs);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTemplate) {
        // Update existing template
        const updatedTemplate: NotificationTemplate = {
          ...editingTemplate,
          ...formData,
        };
        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? updatedTemplate : t));
        toast.addToast({ type: 'success', title: 'Template updated successfully' });
      } else {
        // Create new template
        const newTemplate: NotificationTemplate = {
          id: Date.now().toString(),
          ...formData,
          created_at: new Date().toISOString()
        };
        setTemplates(prev => [...prev, newTemplate]);
        toast.addToast({ type: 'success', title: 'Template created successfully' });
      }
      
      setShowTemplateForm(false);
      setEditingTemplate(null);
      setFormData({
        name: '',
        subject: '',
        content: '',
        type: 'announcement',
        enabled: true
      });
    } catch (error) {
      toast.addToast({ type: 'error', title: 'Failed to save template' });
    }
  };

  const handleEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      type: template.type,
      enabled: template.enabled
    });
    setShowTemplateForm(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      toast.addToast({ type: 'success', title: 'Template deleted successfully' });
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // In a real app, this would make an API call
      setTimeout(() => {
        toast.addToast({ type: 'success', title: 'Email settings saved successfully' });
      }, 500);
    } catch (error) {
      toast.addToast({ type: 'error', title: 'Failed to save email settings' });
    }
  };

  const handleTestEmail = async () => {
    try {
      // In a real app, this would send a test email
      toast.addToast({ type: 'info', title: 'Sending test email...' });
      setTimeout(() => {
        toast.addToast({ type: 'success', title: 'Test email sent successfully' });
      }, 2000);
    } catch (error) {
      toast.addToast({ type: 'error', title: 'Failed to send test email' });
    }
  };

  const toggleTemplateStatus = async (templateId: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId ? { ...t, enabled: !t.enabled } : t
    ));
  };

  const getStatusColor = (status: NotificationLog['status']) => {
    switch (status) {
      case 'sent': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: NotificationTemplate['type']) => {
    switch (type) {
      case 'performance_update': return 'text-blue-600 bg-blue-100';
      case 'casting_change': return 'text-purple-600 bg-purple-100';
      case 'announcement': return 'text-green-600 bg-green-100';
      case 'reminder': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Email Notifications
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage email templates, settings, and notification logs
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'templates', label: 'Templates' },
            { key: 'settings', label: 'Settings' },
            { key: 'logs', label: 'Logs' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Email Templates
            </h2>
            <button
              onClick={() => {
                setShowTemplateForm(true);
                setEditingTemplate(null);
                setFormData({
                  name: '',
                  subject: '',
                  content: '',
                  type: 'announcement',
                  enabled: true
                });
              }}
              className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
            >
              Create Template
            </button>
          </div>

          {showTemplateForm && (
            <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h3>
              
              <form onSubmit={handleSaveTemplate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as NotificationTemplate['type'] }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="performance_update">Performance Update</option>
                      <option value="casting_change">Casting Change</option>
                      <option value="announcement">Announcement</option>
                      <option value="reminder">Reminder</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Use {{variable_name}} for dynamic content"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Use {{variable_name}} for dynamic content like {{recipient_name}}, {{musical_title}}, etc."
                    required
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Available variables: {"{"}{"{"} recipient_name {"}"}{"}"}
                    , {"{"}{"{"} musical_title {"}"}{"}"}
                    , {"{"}{"{"} performance_date {"}"}{"}"}
                    , {"{"}{"{"} theater_name {"}"}{"}"}
                    , {"{"}{"{"} role_name {"}"}{"}"}
                    , {"{"}{"{"} actor_name {"}"}{"}"}</p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={formData.enabled}
                    onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enabled" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Enable this template
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTemplateForm(false);
                      setEditingTemplate(null);
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                  >
                    {editingTemplate ? 'Update' : 'Create'} Template
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid gap-4">
            {templates.map(template => (
              <div
                key={template.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {template.name}
                    </h3>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                        {template.type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        template.enabled ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                      }`}>
                        {template.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleTemplateStatus(template.id)}
                      className={`p-2 rounded-md ${
                        template.enabled 
                          ? 'text-yellow-600 hover:bg-yellow-50' 
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={template.enabled ? 'Disable' : 'Enable'}
                    >
                      {template.enabled ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 102 0v3a1 1 0 11-2 0V9zm4 0a1 1 0 10-2 0v3a1 1 0 102 0V9z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{template.subject}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content Preview:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line line-clamp-3">
                    {template.content.slice(0, 200)}...
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Email Configuration
          </h2>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="email-enabled"
                checked={settings.enabled}
                onChange={(e) => setSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label htmlFor="email-enabled" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Enable email notifications
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={settings.smtp_host}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtp_host: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={settings.smtp_port}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtp_port: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SMTP Username
                </label>
                <input
                  type="text"
                  value={settings.smtp_user}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtp_user: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SMTP Password
                </label>
                <input
                  type="password"
                  value={settings.smtp_pass}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtp_pass: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  From Email
                </label>
                <input
                  type="email"
                  value={settings.from_email}
                  onChange={(e) => setSettings(prev => ({ ...prev, from_email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                  placeholder="noreply@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  From Name
                </label>
                <input
                  type="text"
                  value={settings.from_name}
                  onChange={(e) => setSettings(prev => ({ ...prev, from_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleTestEmail}
                className="px-4 py-2 text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 dark:hover:bg-teal-900"
              >
                Send Test Email
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Notification Logs
          </h2>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Sent At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {log.recipient_email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {log.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(log.sent_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailNotifications;