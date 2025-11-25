import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import type { Musical, Performance } from "~/lib/types";

interface ExtendedPerformance extends Performance {
  theater: {
    id: number;
    name: string;
    city: string;
    address: string;
  };
}

interface Role {
  id: number;
  characterName: string;
  description: string;
}

interface Casting {
  id: number;
  actor: {
    id: number;
    name: string;
  };
  role: {
    id: number;
    characterName: string;
  };
  performanceId: number;
}

export const PublicMusicalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [musical, setMusical] = useState<Musical | null>(null);
  const [performances, setPerformances] = useState<ExtendedPerformance[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [castings, setCastings] = useState<Casting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchMusicalData();
    }
  }, [id]);

  const fetchMusicalData = async () => {
    try {
      const [musicalRes, performancesRes, rolesRes, castingsRes] =
        await Promise.all([
          fetch(`/v2/musicals/${id}`),
          fetch(`/v2/performances?musicalId=${id}`),
          fetch(`/v2/roles?musicalId=${id}`),
          fetch(`/v2/castings?musicalId=${id}`),
        ]);

      if (musicalRes.ok) {
        const musicalData = await musicalRes.json();
        setMusical(musicalData);
      }

      if (performancesRes.ok) {
        const performancesData = await performancesRes.json();
        setPerformances(performancesData);
      }

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setRoles(rolesData);
      }

      if (castingsRes.ok) {
        const castingsData = await castingsRes.json();
        setCastings(castingsData);
      }
    } catch (error) {
      console.error("Error fetching musical data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCastForPerformance = (performanceId: number) => {
    return castings.filter(
      (casting) => casting.performanceId === performanceId
    );
  };

  const upcomingPerformances = performances.filter(
    (perf) => new Date(perf.date) >= new Date()
  );
  const pastPerformances = performances.filter(
    (perf) => new Date(perf.date) < new Date()
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600 dark:text-gray-400">
              Loading musical details...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!musical) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 text-lg">
              Musical not found or not available.
            </div>
            <Link
              to="/public/musicals"
              className="inline-flex items-center mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              ← Back to Musical Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/public/musicals"
          className="inline-flex items-center mb-6 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          <svg
            className="mr-2 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Musical Directory
        </Link>

        {/* Musical Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="md:flex">
            {musical.imageUrl ? (
              <div className="md:w-1/3">
                <img
                  src={musical.imageUrl}
                  alt={musical.title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
            ) : (
              <div className="md:w-1/3 h-64 md:h-auto bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <div className="text-white text-6xl font-bold">
                  {musical.title.charAt(0)}
                </div>
              </div>
            )}

            <div className="p-6 md:w-2/3">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {musical.title}
                </h1>
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                  {musical.genre}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Music by:</span>{" "}
                  {musical.composer}
                </div>
                <div className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Lyrics by:</span>{" "}
                  {musical.lyricist}
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {musical.synopsis}
              </p>
            </div>
          </div>
        </div>

        {/* Performance Schedule */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Performance Schedule
          </h2>

          {upcomingPerformances.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Upcoming Performances
              </h3>
              <div className="space-y-4">
                {upcomingPerformances.map((performance) => {
                  const cast = getCastForPerformance(performance.id);
                  return (
                    <div
                      key={performance.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                        <div>
                          <div className="text-lg font-medium text-gray-900 dark:text-white">
                            {new Date(performance.date).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            {performance.time} at {performance.theater.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-500">
                            {performance.theater.address},{" "}
                            {performance.theater.city}
                          </div>
                        </div>
                      </div>

                      {cast.length > 0 && (
                        <div className="mt-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Cast:
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                            {cast.map((casting) => (
                              <div
                                key={casting.id}
                                className="text-gray-600 dark:text-gray-400"
                              >
                                <span className="font-medium">
                                  {casting.role.characterName}:
                                </span>{" "}
                                {casting.actor.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {pastPerformances.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Past Performances
              </h3>
              <div className="space-y-2">
                {pastPerformances.slice(0, 5).map((performance) => (
                  <div
                    key={performance.id}
                    className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                  >
                    <div>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(performance.date).toLocaleDateString()}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 ml-2">
                        at {performance.theater.name},{" "}
                        {performance.theater.city}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {performances.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No performances scheduled at this time.
            </div>
          )}
        </div>

        {/* Character Roles */}
        {roles.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Character Roles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {role.characterName}
                  </h3>
                  {role.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {role.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
