import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Actor } from "~/lib/types";

interface ActorPerformance {
  id: number;
  date: string;
  musical: {
    title: string;
  };
  theater: {
    name: string;
    city: string;
  };
}

export const PublicActorDirectory: React.FC = () => {
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [performances, setPerformances] = useState<{
    [key: number]: ActorPerformance[];
  }>({});

  useEffect(() => {
    fetchActors();
    fetchPerformances();
  }, []);

  const fetchActors = async () => {
    try {
      const response = await fetch("http://localhost:3000/v2/actor");
      if (response.ok) {
        const data = await response.json();
        // Only show verified actors to public
        setActors(data.filter((actor: Actor) => actor.verified));
      }
    } catch (error) {
      console.error("Error fetching actors:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformances = async () => {
    try {
      const response = await fetch("http://localhost:3000/v2/performance");
      if (response.ok) {
        const data = await response.json();

        // We need to get castings to link actors to performances
        const castingsResponse = await fetch(
          "http://localhost:3000/v2/casting"
        );
        if (castingsResponse.ok) {
          const castings = await castingsResponse.json();

          // Group performances by actor
          const performancesByActor: { [key: number]: ActorPerformance[] } = {};

          castings.forEach((casting: any) => {
            if (!performancesByActor[casting.actorId]) {
              performancesByActor[casting.actorId] = [];
            }

            const performance = data.find(
              (p: any) => p.id === casting.performanceId
            );
            if (performance && new Date(performance.date) > new Date()) {
              performancesByActor[casting.actorId].push(performance);
            }
          });

          setPerformances(performancesByActor);
        }
      }
    } catch (error) {
      console.error("Error fetching performances:", error);
    }
  };

  const filteredActors = actors.filter((actor) =>
    actor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUpcomingPerformances = (actorId: number) => {
    const actorPerformances = performances[actorId] || [];
    return actorPerformances.slice(0, 2); // Show only next 2 performances
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600 dark:text-gray-400">
              Loading actors...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Actors
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover talented performers in musical theater. Browse their
            profiles and see their upcoming performances.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search actors by name..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        {searchTerm && (
          <div className="mb-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {filteredActors.length} actor
              {filteredActors.length !== 1 ? "s" : ""} found
            </p>
          </div>
        )}

        {/* Actors Grid */}
        {filteredActors.length === 0 ? (
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              {searchTerm ? "No actors found" : "No actors available"}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "Try adjusting your search terms."
                : "Actors will appear here once they are verified."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActors.map((actor) => {
              const upcomingPerformances = getUpcomingPerformances(actor.id);

              return (
                <div
                  key={actor.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Actor Profile Image */}
                  <div className="h-48 bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                    {actor.profileImageUrl ? (
                      <img
                        src={actor.profileImageUrl}
                        alt={actor.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-white text-6xl font-bold">
                        {actor.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Actor Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {actor.name}
                    </h3>

                    {actor.bio && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                        {actor.bio}
                      </p>
                    )}

                    {/* Upcoming Performances */}
                    {upcomingPerformances.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Upcoming Performances:
                        </h4>
                        <div className="space-y-1">
                          {upcomingPerformances.map((performance, index) => (
                            <div
                              key={index}
                              className="text-xs text-gray-600 dark:text-gray-400"
                            >
                              <span className="font-medium">
                                {performance.musical.title}
                              </span>
                              <span className="mx-1">•</span>
                              <span>
                                {new Date(
                                  performance.date
                                ).toLocaleDateString()}
                              </span>
                              <span className="mx-1">•</span>
                              <span>{performance.theater.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* View Profile Button */}
                    <Link
                      to={`/public/actor/${actor.id}`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-900 hover:bg-teal-200 dark:hover:bg-teal-800 transition-colors"
                    >
                      View Profile
                      <svg
                        className="ml-1 h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Browse Other Sections */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Explore More
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
            <Link
              to="/public/musicals"
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Browse Musicals
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Discover amazing musical productions
              </p>
            </Link>

            <Link
              to="/public/calendar"
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Performance Calendar
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                See upcoming shows and dates
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
