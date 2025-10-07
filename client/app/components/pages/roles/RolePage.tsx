import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageTemplate } from '../../common/PageTemplate';

interface Role {
  id: string;
  name: string;
  musicalId: string;
  verified: boolean;
}

interface Musical {
  id: string;
  name: string;
}

export function RolePage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [musicals, setMusicals] = useState<Musical[]>([]);
  const [selectedMusicalId, setSelectedMusicalId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = async (musicalId?: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const url = musicalId 
        ? `http://localhost:3000/v2/role?musicalId=${musicalId}` 
        : 'http://localhost:3000/v2/role';
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }

      const data = await response.json();
      setRoles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

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
      console.error('Error fetching musicals:', err);
    }
  };

  const handleDelete = async (id: string, roleName: string) => {
    if (!confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/v2/role/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete role');
      }

      // Refresh the roles list
      await fetchRoles(selectedMusicalId);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete role');
    }
  };

  const handleVerify = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/v2/role/${id}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to verify role');
      }

      // Update the role in the list
      setRoles(prev => prev.map(role => 
        role.id === id ? { ...role, verified: true } : role
      ));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to verify role');
    }
  };

  const handleMusicalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const musicalId = e.target.value;
    setSelectedMusicalId(musicalId);
    fetchRoles(musicalId || undefined);
  };

  const getMusicalName = (musicalId: string) => {
    const musical = musicals.find(m => m.id === musicalId);
    return musical?.name || 'Unknown Musical';
  };

  const isAdmin = () => {
    const user = localStorage.getItem('user');
    if (!user) return false;
    try {
      const userData = JSON.parse(user);
      return userData.role === 'admin';
    } catch {
      return false;
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchMusicals();
  }, []);

  if (loading) {
    return (
      <PageTemplate title="Roles">
        <div className="text-center">Loading roles...</div>
      </PageTemplate>
    );
  }

  if (error) {
    return (
      <PageTemplate title="Roles">
        <div className="text-red-600 dark:text-red-400 text-center">
          Error: {error}
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title="Roles">
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Character Roles
            </h1>
            
            {/* Musical Filter */}
            <select
              value={selectedMusicalId}
              onChange={handleMusicalChange}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Musicals</option>
              {musicals.map((musical) => (
                <option key={musical.id} value={musical.id}>
                  {musical.name}
                </option>
              ))}
            </select>
          </div>
          
          <Link
            to="/roles/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Add New Role
          </Link>
        </div>

        {/* Role Count */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {roles.length} role{roles.length !== 1 ? 's' : ''} found
          {selectedMusicalId && (
            <span> for "{getMusicalName(selectedMusicalId)}"</span>
          )}
        </div>

        {/* Roles List */}
        {roles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
              {selectedMusicalId ? 'No roles found for this musical' : 'No roles found'}
            </div>
            <Link
              to="/roles/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Add the first role
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Character Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Musical
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {roles.map((role) => (
                    <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {role.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {getMusicalName(role.musicalId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            role.verified
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}
                        >
                          {role.verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        {!role.verified && isAdmin() && (
                          <button
                            onClick={() => handleVerify(role.id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-200"
                          >
                            Verify
                          </button>
                        )}
                        <Link
                          to={`/roles/${role.id}/edit`}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                        >
                          Edit
                        </Link>
                        <Link
                          to={`/roles/${role.id}`}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                        >
                          View
                        </Link>
                        {isAdmin() && (
                          <button
                            onClick={() => handleDelete(role.id, role.name)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageTemplate>
  );
}
