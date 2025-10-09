import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageTemplate } from '../../common/PageTemplate';

interface Casting {
  id: string;
  roleId: string;
  actorId: string;
  performanceId: string;
}

interface Actor {
  id: string;
  firstName: string;
  lastName: string;
}

interface Role {
  id: string;
  name: string;
  musicalId: string;
}

interface Performance {
  id: string;
  musicalId: string;
  date: string;
  time: string;
}

interface Musical {
  id: string;
  name: string;
}

export function CastingDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [casting, setCasting] = useState<Casting | null>(null);
  const [actor, setActor] = useState<Actor | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [musical, setMusical] = useState<Musical | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCastingDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Fetch the casting
      const castingResponse = await fetch(`http://localhost:3000/v2/casting/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!castingResponse.ok) {
        throw new Error('Failed to fetch casting');
      }

      const castingData: Casting = await castingResponse.json();
      setCasting(castingData);

      // Fetch related data
      const [actorRes, roleRes, performanceRes] = await Promise.all([
        fetch(`http://localhost:3000/v2/actor/${castingData.actorId}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        }),
        fetch(`http://localhost:3000/v2/role/${castingData.roleId}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        }),
        fetch(`http://localhost:3000/v2/performance/${castingData.performanceId}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        }),
      ]);

      if (actorRes.ok) {
        const actorData = await actorRes.json();
        setActor(actorData);
      }

      if (roleRes.ok) {
        const roleData = await roleRes.json();
        setRole(roleData);
        
        // Fetch musical data using role's musicalId
        if (roleData.musicalId) {
          const musicalRes = await fetch(`http://localhost:3000/v2/musical/${roleData.musicalId}`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          });
          if (musicalRes.ok) {
            setMusical(await musicalRes.json());
          }
        }
      }

      if (performanceRes.ok) {
        const performanceData = await performanceRes.json();
        setPerformance(performanceData);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!casting || !confirm('Are you sure you want to delete this casting assignment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/v2/casting/${casting.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete casting');
      }

      navigate('/castings');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete casting');
    }
  };

  useEffect(() => {
    fetchCastingDetails();
  }, [id]);

  if (loading) {
    return (
      <PageTemplate title="Casting Details">
        <div className="text-center">Loading casting details...</div>
      </PageTemplate>
    );
  }

  if (error || !casting) {
    return (
      <PageTemplate title="Casting Details">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">
            {error || 'Casting not found'}
          </div>
          <Link
            to="/castings"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Back to Castings
          </Link>
        </div>
      </PageTemplate>
    );
  }

  const actorName = actor ? `${actor.firstName} ${actor.lastName}` : 'Loading...';
  const roleName = role?.name || 'Loading...';
  const musicalName = musical?.name || 'Loading...';
  const performanceDate = performance ? new Date(performance.date).toLocaleDateString() : 'Loading...';
  const performanceTime = performance?.time || 'Loading...';

  return (
    <PageTemplate title={`Casting: ${actorName} as ${roleName}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Cast Assignment
            </h1>
            <div className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              {actorName} as {roleName}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              to={`/castings/${casting.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Edit Assignment
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              Delete Assignment
            </button>
          </div>
        </div>

        {/* Casting Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Actor Information */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Actor Information
              </h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Actor Name
                </dt>
                <dd className="mt-1">
                  {actor ? (
                    <Link
                      to={`/actors/${actor.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                    >
                      {actorName}
                    </Link>
                  ) : (
                    <span className="text-gray-900 dark:text-white">Loading...</span>
                  )}
                </dd>
              </div>
            </div>
          </div>

          {/* Role Information */}
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
                <dd className="mt-1">
                  {role ? (
                    <Link
                      to={`/roles/${role.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                    >
                      {roleName}
                    </Link>
                  ) : (
                    <span className="text-gray-900 dark:text-white">Loading...</span>
                  )}
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
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                    >
                      {musicalName}
                    </Link>
                  ) : (
                    <span className="text-gray-900 dark:text-white">Loading...</span>
                  )}
                </dd>
              </div>
            </div>
          </div>

          {/* Performance Information */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg lg:col-span-2">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Performance Information
              </h2>
            </div>
            <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Musical
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {musicalName}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Performance Date
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {performanceDate}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Performance Time
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {performanceTime}
                </dd>
              </div>

              <div className="sm:col-span-3 mt-4">
                <Link
                  to={`/performances/${casting.performanceId}`}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  View Full Performance Details →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Quick Actions
            </h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/castings"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
              >
                ← Back to All Castings
              </Link>

              <Link
                to="/castings/new"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
              >
                + Create Another Casting
              </Link>

              {performance && (
                <Link
                  to={`/castings?performanceId=${performance.id}`}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  View All Castings for This Performance
                </Link>
              )}

              {actor && (
                <Link
                  to={`/actors/${actor.id}`}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  View Actor Profile
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}