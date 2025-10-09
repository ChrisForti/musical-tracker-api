import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

export function CastingPage() {
  const [castings, setCastings] = useState<Casting[]>([]);
  const [actors, setActors] = useState<Actor[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [musicals, setMusicals] = useState<Musical[]>([]);
  const [selectedPerformanceId, setSelectedPerformanceId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCastings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:3000/v2/casting', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch castings');
      }

      const data = await response.json();
      setCastings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Fetch all related data in parallel
      const [actorsRes, rolesRes, performancesRes, musicalsRes] = await Promise.all([
        fetch('http://localhost:3000/v2/actor', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        }),
        fetch('http://localhost:3000/v2/role', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        }),
        fetch('http://localhost:3000/v2/performance', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        }),
        fetch('http://localhost:3000/v2/musical', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        }),
      ]);

      if (actorsRes.ok) setActors(await actorsRes.json());
      if (rolesRes.ok) setRoles(await rolesRes.json());
      if (performancesRes.ok) setPerformances(await performancesRes.json());
      if (musicalsRes.ok) setMusicals(await musicalsRes.json());
    } catch (err) {
      console.error('Error fetching related data:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this casting?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/v2/casting/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete casting');
      }

      // Refresh the castings list
      await fetchCastings();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete casting');
    }
  };

  const getActorName = (actorId: string) => {
    const actor = actors.find(a => a.id === actorId);
    return actor ? `${actor.firstName} ${actor.lastName}` : 'Unknown Actor';
  };

  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.name || 'Unknown Role';
  };

  const getPerformanceInfo = (performanceId: string) => {
    const performance = performances.find(p => p.id === performanceId);
    const musical = performance ? musicals.find(m => m.id === performance.musicalId) : null;
    
    if (!performance || !musical) {
      return 'Unknown Performance';
    }

    const date = new Date(performance.date).toLocaleDateString();
    return `${musical.name} - ${date}`;
  };

  const getMusicalName = (performanceId: string) => {
    const performance = performances.find(p => p.id === performanceId);
    const musical = performance ? musicals.find(m => m.id === performance.musicalId) : null;
    return musical?.name || 'Unknown Musical';
  };

  const handlePerformanceFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPerformanceId(e.target.value);
  };

  const filteredCastings = selectedPerformanceId 
    ? castings.filter(casting => casting.performanceId === selectedPerformanceId)
    : castings;

  useEffect(() => {
    fetchCastings();
    fetchRelatedData();
  }, []);

  if (loading) {
    return (
      <PageTemplate title="Castings">
        <div className="text-center">Loading castings...</div>
      </PageTemplate>
    );
  }

  if (error) {
    return (
      <PageTemplate title="Castings">
        <div className="text-red-600 dark:text-red-400 text-center">
          Error: {error}
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title="Castings">
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Cast Assignments
            </h1>
            
            {/* Performance Filter */}
            <select
              value={selectedPerformanceId}
              onChange={handlePerformanceFilter}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Performances</option>
              {performances.map((performance) => {
                const musical = musicals.find(m => m.id === performance.musicalId);
                const date = new Date(performance.date).toLocaleDateString();
                return (
                  <option key={performance.id} value={performance.id}>
                    {musical?.name} - {date}
                  </option>
                );
              })}
            </select>
          </div>
          
          <Link
            to="/castings/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Add New Casting
          </Link>
        </div>

        {/* Casting Count */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredCastings.length} casting{filteredCastings.length !== 1 ? 's' : ''} found
          {selectedPerformanceId && (
            <span> for "{getPerformanceInfo(selectedPerformanceId)}"</span>
          )}
        </div>

        {/* Castings List */}
        {filteredCastings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
              {selectedPerformanceId ? 'No castings found for this performance' : 'No castings found'}
            </div>
            <Link
              to="/castings/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Create the first casting
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Musical
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCastings.map((casting) => (
                    <tr key={casting.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {getActorName(casting.actorId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {getRoleName(casting.roleId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {getPerformanceInfo(casting.performanceId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {getMusicalName(casting.performanceId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link
                          to={`/castings/${casting.id}/edit`}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                        >
                          Edit
                        </Link>
                        <Link
                          to={`/castings/${casting.id}`}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(casting.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                        >
                          Delete
                        </button>
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