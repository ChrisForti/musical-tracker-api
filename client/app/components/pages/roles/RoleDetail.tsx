import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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

export function RoleDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [role, setRole] = useState<Role | null>(null);
  const [musical, setMusical] = useState<Musical | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRole = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`http://localhost:3000/v2/role/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch role');
      }

      const roleData: Role = await response.json();
      setRole(roleData);

      // Fetch the musical details
      const musicalResponse = await fetch(`http://localhost:3000/v2/musical/${roleData.musicalId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (musicalResponse.ok) {
        const musicalData: Musical = await musicalResponse.json();
        setMusical(musicalData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!role || !confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/v2/role/${role.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete role');
      }

      navigate('/roles');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete role');
    }
  };

  const handleVerify = async () => {
    if (!role) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/v2/role/${role.id}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to verify role');
      }

      // Update the role status
      setRole(prev => prev ? { ...prev, verified: true } : null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to verify role');
    }
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
    fetchRole();
  }, [id]);

  if (loading) {
    return (
      <PageTemplate title="Role Details">
        <div className="text-center">Loading role...</div>
      </PageTemplate>
    );
  }

  if (error || !role) {
    return (
      <PageTemplate title="Role Details">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">
            {error || 'Role not found'}
          </div>
          <Link
            to="/roles"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Back to Roles
          </Link>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title={`Role: ${role.name}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {role.name}
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  role.verified
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}
              >
                {role.verified ? 'Verified' : 'Pending Verification'}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {!role.verified && isAdmin() && (
              <button
                onClick={handleVerify}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                Verify Role
              </button>
            )}
            <Link
              to={`/roles/${role.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Edit Role
            </Link>
            {isAdmin() && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                Delete Role
              </button>
            )}
          </div>
        </div>

        {/* Role Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Role Information
              </h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Character Name
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {role.name}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Musical
                </dt>
                <dd className="mt-1">
                  {musical ? (
                    <Link
                      to={`/musicals/${musical.id}`}
                      className="text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                    >
                      {musical.name}
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-900 dark:text-white">
                      Loading musical...
                    </span>
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Verification Status
                </dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      role.verified
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}
                  >
                    {role.verified ? 'Verified' : 'Pending Verification'}
                  </span>
                </dd>
              </div>
            </div>
          </div>

          {/* Actions & Related */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Quick Actions
              </h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <Link
                  to="/roles"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  ← Back to All Roles
                </Link>
              </div>

              {musical && (
                <div>
                  <Link
                    to={`/roles?musicalId=${musical.id}`}
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                  >
                    View All Roles for "{musical.name}"
                  </Link>
                </div>
              )}

              <div>
                <Link
                  to="/roles/new"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  + Create Another Role
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Future casting information could go here */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-200 mb-2">
            Coming Soon: Casting Information
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Once the casting management system is implemented, you'll be able to see which actors have been cast in this role across different performances.
          </p>
        </div>
      </div>
    </PageTemplate>
  );
}