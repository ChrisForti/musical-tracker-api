import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import type { Actor } from "~/lib/types";

interface ActorPerformance {
  id: number;
  date: string;
  time: string;
  musical: {
    id: number;
    title: string;
    composer: string;
  };
  theater: {
    name: string;
    city: string;
    address: string;
  };
  role: {
    characterName: string;
  };
}

export const PublicActorDetail: React.FC = () => {
  const { id } = useParams();
  const [actor, setActor] = useState<Actor | null>(null);
  const [performances, setPerformances] = useState<ActorPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchActorData();
    }
  }, [id]);

  const fetchActorData = async () => {
    try {
      // Fetch actor details
      const actorResponse = await fetch(`http://localhost:3000/v2/actor/${id}`);
      if (!actorResponse.ok) {
        throw new Error("Actor not found");
      }
      const actorData = await actorResponse.json();

      if (!actorData.verified) {
        throw new Error("Actor profile not publicly available");
      }

      setActor(actorData);

      // Fetch actor's performances through castings
      const castingsResponse = await fetch(`http://localhost:3000/v2/casting`);
      if (castingsResponse.ok) {
        const castings = await castingsResponse.json();
        const actorCastings = castings.filter(
          (casting: any) => casting.actorId === parseInt(id!)
        );

        // Fetch performance details for each casting
        const performancesResponse = await fetch(
          `http://localhost:3000/v2/performance`
        );
        const rolesResponse = await fetch(`http://localhost:3000/v2/role`);

        if (performancesResponse.ok && rolesResponse.ok) {
          const allPerformances = await performancesResponse.json();
          const allRoles = await rolesResponse.json();

          const actorPerformances = actorCastings
            .map((casting: any) => {
              const performance = allPerformances.find(
                (p: any) => p.id === casting.performanceId
              );
              const role = allRoles.find((r: any) => r.id === casting.roleId);

              if (performance && role) {
                return {
                  ...performance,
                  role: role,
                };
              }
              return null;
            })
            .filter(Boolean);

          // Sort by date (upcoming first, then past)
          actorPerformances.sort((a: any, b: any) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            const now = new Date();

            // Upcoming performances first
            if (dateA > now && dateB <= now) return -1;
            if (dateA <= now && dateB > now) return 1;

            // Both upcoming or both past - sort by date
            return dateA.getTime() - dateB.getTime();
          });

          setPerformances(actorPerformances);
        }
      }
    } catch (error) {
      console.error("Error fetching actor data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load actor profile"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600 dark:text-gray-400">
              Loading actor profile...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !actor) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              {error || "Actor not found"}
            </h3>
            <div className="mt-6">
              <Link
                to="/public/actors"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-teal-700 bg-teal-100 hover:bg-teal-200 dark:text-teal-400 dark:bg-teal-900 dark:hover:bg-teal-800"
              >
                Browse All Actors
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const upcomingPerformances = performances.filter(
    (p) => new Date(p.date) > new Date()
  );
  const pastPerformances = performances.filter(
    (p) => new Date(p.date) <= new Date()
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link
                to="/public/actors"
                className="text-teal-600 hover:text-teal-500"
              >
                Actors
              </Link>
            </li>
            <li className="text-gray-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </li>
            <li className="text-gray-900 dark:text-gray-100 font-medium">
              {actor.name}
            </li>
          </ol>
        </nav>

        {/* Actor Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
          <div className="md:flex">
            {/* Profile Image */}
            <div className="md:w-1/3">
              <div className="h-64 md:h-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                {actor.profileImageUrl ? (
                  <img
                    src={actor.profileImageUrl}
                    alt={actor.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-white text-8xl font-bold">
                    {actor.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Actor Info */}
            <div className="md:w-2/3 p-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {actor.name}
              </h1>

              {actor.bio && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Biography
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {actor.bio}
                  </p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    {upcomingPerformances.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Upcoming Shows
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    {performances.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Performances
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Performances */}
        {upcomingPerformances.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Upcoming Performances
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingPerformances.map((performance) => (
                <div
                  key={performance.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-teal-500"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {performance.musical.title}
                  </h3>
                  <p className="text-teal-600 dark:text-teal-400 font-medium mb-1">
                    as {performance.role.characterName}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    by {performance.musical.composer}
                  </p>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {new Date(performance.date).toLocaleDateString()}
                      {performance.time && ` at ${performance.time}`}
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {performance.theater.name}, {performance.theater.city}
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link
                      to={`/public/musical/${performance.musical.id}`}
                      className="text-teal-600 dark:text-teal-400 hover:text-teal-500 text-sm font-medium"
                    >
                      View Musical Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Performances */}
        {pastPerformances.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Past Performances
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Musical & Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Theater
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {pastPerformances.reverse().map((performance) => (
                      <tr
                        key={performance.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {performance.musical.title}
                            </div>
                            <div className="text-sm text-teal-600 dark:text-teal-400">
                              as {performance.role.characterName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {new Date(performance.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {performance.theater.name}, {performance.theater.city}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* No Performances */}
        {performances.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              No performances yet
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              This actor's performances will appear here once they're scheduled.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
