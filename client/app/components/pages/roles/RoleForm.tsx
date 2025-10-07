import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageTemplate } from '../../common/PageTemplate';

interface Musical {
  id: string;
  name: string;
}

interface Role {
  id: string;
  name: string;
  musicalId: string;
  verified: boolean;
}

export function RoleForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    musicalId: '',
  });
  const [musicals, setMusicals] = useState<Musical[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMusicals = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/v2/musical', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch musicals');
      }

      const data = await response.json();
      setMusicals(data);
    } catch (err) {
      setError('Failed to load musicals');
      console.error('Error fetching musicals:', err);
    }
  };

  const fetchRole = async (roleId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/v2/role/${roleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch role');
      }

      const role: Role = await response.json();
      setFormData({
        name: role.name,
        musicalId: role.musicalId,
      });
    } catch (err) {
      setError('Failed to load role');
      console.error('Error fetching role:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Role name is required');
      return;
    }

    if (!formData.musicalId) {
      setError('Musical selection is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const url = isEditing 
        ? `http://localhost:3000/v2/role/${id}`
        : 'http://localhost:3000/v2/role';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          musicalId: formData.musicalId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} role`);
      }

      // Navigate back to roles list
      navigate('/roles');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/roles');
  };

  useEffect(() => {
    fetchMusicals();
    
    if (isEditing && id) {
      fetchRole(id);
    }
  }, [isEditing, id]);

  return (
    <PageTemplate title={isEditing ? 'Edit Role' : 'New Role'}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Role' : 'Create New Role'}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            {error && (
              <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="text-sm text-red-700 dark:text-red-400">
                  {error}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Character Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter character name (e.g., Elphaba, Jean Valjean)"
                required
              />
            </div>

            <div>
              <label htmlFor="musicalId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Musical *
              </label>
              <select
                id="musicalId"
                name="musicalId"
                value={formData.musicalId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select a musical...</option>
                {musicals.map((musical) => (
                  <option key={musical.id} value={musical.id}>
                    {musical.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditing ? 'Update Role' : 'Create Role'
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-2">
            <strong>Tips:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Use the character's full name as it appears in the script</li>
            <li>For ensemble roles, use descriptive names (e.g., "Ensemble Member 1", "Townsperson")</li>
            <li>Leading roles should use the character's primary name</li>
            <li>Newly created roles require admin verification before they can be used in casting</li>
          </ul>
        </div>
      </div>
    </PageTemplate>
  );
}