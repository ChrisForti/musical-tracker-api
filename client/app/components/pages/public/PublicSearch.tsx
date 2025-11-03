import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Musical, Actor } from "~/lib/types";

interface SearchResult {
  type: "musical" | "actor";
  item: Musical | Actor;
}

export const PublicSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchType, setSearchType] = useState<"all" | "musicals" | "actors">(
    "all"
  );

  const handleSearch = async (query: string = searchTerm) => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const searchResults: SearchResult[] = [];

      // Search musicals if type is 'all' or 'musicals'
      if (searchType === "all" || searchType === "musicals") {
        const musicalsResponse = await fetch(
          "http://localhost:3000/v2/musical/public"
        );
        if (musicalsResponse.ok) {
          const musicals = await musicalsResponse.json();
          const filteredMusicals = musicals
            .filter(
              (musical: Musical) =>
                // Public endpoint already returns only verified musicals
                musical.name?.toLowerCase().includes(query.toLowerCase()) ||
                musical.composer?.toLowerCase().includes(query.toLowerCase()) ||
                musical.lyricist?.toLowerCase().includes(query.toLowerCase()) ||
                musical.synopsis?.toLowerCase().includes(query.toLowerCase())
            )
            .map((musical: Musical) => ({
              type: "musical" as const,
              item: musical,
            }));

          searchResults.push(...filteredMusicals);
        }
      }

      // Search actors if type is 'all' or 'actors'
      if (searchType === "all" || searchType === "actors") {
        const actorsResponse = await fetch(
          "http://localhost:3000/v2/actor/public"
        );
        if (actorsResponse.ok) {
          const actors = await actorsResponse.json();
          const filteredActors = actors
            .filter((actor: Actor) =>
              // Public endpoint already returns only verified actors
              actor.name?.toLowerCase().includes(query.toLowerCase())
            )
            .map((actor: Actor) => ({
              type: "actor" as const,
              item: actor,
            }));

          searchResults.push(...filteredActors);
        }
      }

      // Sort results: exact matches first, then partial matches
      searchResults.sort((a, b) => {
        const aName =
          a.type === "musical"
            ? (a.item as Musical).name
            : (a.item as Actor).name;
        const bName =
          b.type === "musical"
            ? (b.item as Musical).name
            : (b.item as Actor).name;

        const aExact = aName.toLowerCase() === query.toLowerCase();
        const bExact = bName.toLowerCase() === query.toLowerCase();

        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        return aName.localeCompare(bName);
      });

      setResults(searchResults);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Load all content on component mount
  useEffect(() => {
    loadAllContent();
  }, []);

  // Load all verified content
  const loadAllContent = async () => {
    setLoading(true);
    try {
      const searchResults: SearchResult[] = [];

      // Load all musicals from public endpoint (no auth needed)
      const musicalsResponse = await fetch(
        "http://localhost:3000/v2/musical/public"
      );
      if (musicalsResponse.ok) {
        const musicals = await musicalsResponse.json();
        musicals.forEach((musical: Musical) => {
          searchResults.push({ type: "musical", item: musical });
        });
      }

      // Load all actors from public endpoint (no auth needed)
      const actorsResponse = await fetch(
        "http://localhost:3000/v2/actor/public"
      );
      if (actorsResponse.ok) {
        const actors = await actorsResponse.json();
        actors.forEach((actor: Actor) => {
          searchResults.push({ type: "actor", item: actor });
        });
      }

      setResults(searchResults);
    } catch (error) {
      console.error("Failed to load content:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm) {
        handleSearch();
      } else {
        // If search is cleared, reload all content
        loadAllContent();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, searchType]);

  const musicalResults = results.filter((r) => r.type === "musical");
  const actorResults = results.filter((r) => r.type === "actor");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Search Musical Theater
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find musicals, actors, and performances in one place
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="space-y-4">
            {/* Search Input */}
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
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search for musicals, actors, composers..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-lg"
              />
            </div>

            {/* Search Type Filter */}
            <div className="flex justify-center">
              <div className="inline-flex rounded-md shadow-sm">
                <button
                  onClick={() => setSearchType("all")}
                  className={`px-4 py-2 text-sm font-medium border rounded-l-md ${
                    searchType === "all"
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSearchType("musicals")}
                  className={`px-4 py-2 text-sm font-medium border-t border-b ${
                    searchType === "musicals"
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  Musicals
                </button>
                <button
                  onClick={() => setSearchType("actors")}
                  className={`px-4 py-2 text-sm font-medium border rounded-r-md ${
                    searchType === "actors"
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  Actors
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-teal-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-gray-600 dark:text-gray-400">
                Searching...
              </span>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && (
          <div>
            {/* Results Count */}
            <div className="mb-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                {hasSearched ? (
                  <>
                    {results.length} result{results.length !== 1 ? "s" : ""}{" "}
                    found
                    {searchTerm && ` for "${searchTerm}"`}
                  </>
                ) : (
                  <>
                    Showing all {results.length} musical
                    {results.filter((r) => r.type === "musical").length !== 1
                      ? "s"
                      : ""}{" "}
                    and actor
                    {results.filter((r) => r.type === "actor").length !== 1
                      ? "s"
                      : ""}
                  </>
                )}
              </p>
            </div>

            {results.length === 0 ? (
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  No results found
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Try different keywords or browse our directory
                </p>
                <div className="mt-6">
                  <Link
                    to="/public/musicals"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-teal-700 bg-teal-100 hover:bg-teal-200 dark:text-teal-400 dark:bg-teal-900 dark:hover:bg-teal-800 mr-3"
                  >
                    Browse Musicals
                  </Link>
                  <Link
                    to="/public/actors"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-teal-700 bg-teal-100 hover:bg-teal-200 dark:text-teal-400 dark:bg-teal-900 dark:hover:bg-teal-800"
                  >
                    Browse Actors
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Musical Results */}
                {musicalResults.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Musicals ({musicalResults.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {musicalResults.map((result) => {
                        const musical = result.item as Musical;
                        return (
                          <Link
                            key={musical.id}
                            to={`/public/musical/${musical.id}`}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                          >
                            <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                              {musical.posterUrl ? (
                                <img
                                  src={musical.posterUrl}
                                  alt={musical.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="text-white text-2xl font-bold text-center px-4">
                                  {musical.name}
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {musical.name}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                                by {musical.composer}
                              </p>
                              <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full">
                                {musical.composer}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Actor Results */}
                {actorResults.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Actors ({actorResults.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {actorResults.map((result) => {
                        const actor = result.item as Actor;
                        return (
                          <Link
                            key={actor.id}
                            to={`/public/actor/${actor.id}`}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                          >
                            <div className="h-48 bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                              {actor.profileImageUrl ? (
                                <img
                                  src={actor.profileImageUrl}
                                  alt={actor.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="text-white text-4xl font-bold">
                                  {actor.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {actor.name}
                              </h3>
                              {actor.bio && (
                                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                                  {actor.bio}
                                </p>
                              )}
                              <span className="inline-block px-2 py-1 text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 rounded-full mt-2">
                                Actor
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Browse Links (when no search and no content) */}
        {!hasSearched && results.length === 0 && !loading && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Browse Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Link
                to="/public/musicals"
                className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 group"
              >
                <div className="text-purple-600 dark:text-purple-400 mb-4">
                  <svg
                    className="w-12 h-12 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  Musicals
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Discover amazing musical productions and their stories
                </p>
              </Link>

              <Link
                to="/public/actors"
                className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 group"
              >
                <div className="text-teal-600 dark:text-teal-400 mb-4">
                  <svg
                    className="w-12 h-12 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                  Actors
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Explore talented performers and their career highlights
                </p>
              </Link>

              <Link
                to="/public/calendar"
                className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 group"
              >
                <div className="text-indigo-600 dark:text-indigo-400 mb-4">
                  <svg
                    className="w-12 h-12 mx-auto"
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
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  Performance Calendar
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  See upcoming shows and plan your theater visits
                </p>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
