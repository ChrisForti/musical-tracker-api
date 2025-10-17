import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Musical {
  id: number;
  title: string;
  composer: string;
  lyricist: string;
  genre: string;
  synopsis: string;
  imageUrl?: string;
  verified: boolean;
  createdAt: string;
}

interface Performance {
  id: number;
  date: string;
  theater: {
    name: string;
    city: string;
  };
}

export const PublicMusicalDirectory: React.FC = () => {
  const [musicals, setMusicals] = useState<Musical[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [performances, setPerformances] = useState<{ [key: number]: Performance[] }>({});

  useEffect(() => {
    fetchMusicals();
    fetchPerformances();
  }, []);

  const fetchMusicals = async () => {
    try {
      const response = await fetch('/v2/musicals?verified=true');
      if (response.ok) {
        const data = await response.json();
        setMusicals(data);
      }
    } catch (error) {
      console.error('Error fetching musicals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformances = async () => {
    try {
      const response = await fetch('/v2/performances');
      if (response.ok) {
        const data = await response.json();
        const performancesByMusical = data.reduce((acc: { [key: number]: Performance[] }, perf: any) => {
          if (!acc[perf.musicalId]) {
            acc[perf.musicalId] = [];
          }
          acc[perf.musicalId].push(perf);
          return acc;
        }, {});
        setPerformances(performancesByMusical);
      }
    } catch (error) {
      console.error('Error fetching performances:', error);
    }
  };

  const filteredMusicals = musicals.filter(musical => {
    const matchesSearch = musical.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         musical.composer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         musical.lyricist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = !selectedGenre || musical.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const uniqueGenres = [...new Set(musicals.map(m => m.genre))];

  const getUpcomingPerformances = (musicalId: number) => {
    const musicalPerformances = performances[musicalId] || [];
    const upcoming = musicalPerformances.filter(perf => new Date(perf.date) > new Date());
    return upcoming.slice(0, 3); // Show only next 3 performances
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600 dark:text-gray-400">Loading musicals...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Musical Directory
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore our collection of musical productions
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search musicals, composers, or lyricists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="md:w-48">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Genres</option>
                {uniqueGenres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredMusicals.length} of {musicals.length} musicals
          </p>
        </div>

        {/* Musical Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMusicals.map((musical) => {
            const upcomingPerformances = getUpcomingPerformances(musical.id);
            
            return (
              <div
                key={musical.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                {/* Image */}
                {musical.imageUrl ? (
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <img
                      src={musical.imageUrl}
                      alt={musical.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <div className="text-white text-2xl font-bold">
                      {musical.title.charAt(0)}
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {musical.title}
                    </h3>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                      {musical.genre}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div>Music: {musical.composer}</div>
                    <div>Lyrics: {musical.lyricist}</div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {musical.synopsis}
                  </p>

                  {/* Upcoming Performances */}
                  {upcomingPerformances.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Upcoming Shows:
                      </h4>
                      <div className="space-y-1">
                        {upcomingPerformances.map((perf) => (
                          <div key={perf.id} className="text-xs text-gray-600 dark:text-gray-400">
                            {new Date(perf.date).toLocaleDateString()} - {perf.theater.name}, {perf.theater.city}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link
                    to={`/public/musical/${musical.id}`}
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    View Details
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMusicals.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 text-lg">
              No musicals found matching your search criteria.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};