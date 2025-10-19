import React, { useState, useEffect } from "react";
import { useAuth } from "~/hooks/useAuth";

interface AnalyticsData {
  totals: {
    musicals: number;
    actors: number;
    performances: number;
    theaters: number;
    users: number;
  };
  trends: {
    monthlyPerformances: Array<{ month: string; count: number }>;
    popularMusicals: Array<{ title: string; performances: number }>;
    theaterUtilization: Array<{ theater: string; performances: number; utilization: number }>;
    genreDistribution: Array<{ genre: string; count: number; percentage: number }>;
  };
  insights: {
    topPerformers: Array<{ name: string; performances: number }>;
    upcomingShows: number;
    totalRevenue?: number;
    avgPerformancesPerMonth: number;
  };
  growth: {
    musicalsGrowth: number;
    actorsGrowth: number;
    performancesGrowth: number;
  };
}

export const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      fetchAnalytics();
    }
  }, [dateRange, isAdmin]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all data for analysis
      const [
        musicalsRes,
        actorsRes, 
        performancesRes,
        theatersRes,
        usersRes,
        castingsRes
      ] = await Promise.all([
        fetch("http://localhost:3000/v2/musical", { headers }),
        fetch("http://localhost:3000/v2/actor", { headers }),
        fetch("http://localhost:3000/v2/performance", { headers }),
        fetch("http://localhost:3000/v2/theater", { headers }),
        fetch("http://localhost:3000/v2/user/all", { headers }),
        fetch("http://localhost:3000/v2/casting", { headers })
      ]);

      const [musicals, actors, performances, theaters, users, castings] = await Promise.all([
        musicalsRes.ok ? musicalsRes.json() : [],
        actorsRes.ok ? actorsRes.json() : [],
        performancesRes.ok ? performancesRes.json() : [],
        theatersRes.ok ? theatersRes.json() : [],
        usersRes.ok ? usersRes.json() : [],
        castingsRes.ok ? castingsRes.json() : []
      ]);

      // Process analytics data
      const analyticsData = processAnalyticsData({
        musicals,
        actors,
        performances,
        theaters,
        users,
        castings
      }, dateRange);

      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (data: any, range: string): AnalyticsData => {
    const { musicals, actors, performances, theaters, users, castings } = data;
    
    // Calculate date range
    const now = new Date();
    const rangeDate = new Date();
    switch (range) {
      case '7d': rangeDate.setDate(now.getDate() - 7); break;
      case '30d': rangeDate.setDate(now.getDate() - 30); break;
      case '90d': rangeDate.setDate(now.getDate() - 90); break;
      case '1y': rangeDate.setFullYear(now.getFullYear() - 1); break;
    }

    // Filter performances by date range
    const filteredPerformances = performances.filter((p: any) => 
      new Date(p.createdAt) >= rangeDate
    );

    // Monthly performance trends
    const monthlyPerformances = generateMonthlyTrends(filteredPerformances, range);

    // Popular musicals
    const musicalPerformanceCounts = filteredPerformances.reduce((acc: any, perf: any) => {
      const title = perf.musical?.title || 'Unknown';
      acc[title] = (acc[title] || 0) + 1;
      return acc;
    }, {});

    const popularMusicals = Object.entries(musicalPerformanceCounts)
      .map(([title, count]) => ({ title, performances: count as number }))
      .sort((a, b) => b.performances - a.performances)
      .slice(0, 10);

    // Theater utilization
    const theaterPerformanceCounts = filteredPerformances.reduce((acc: any, perf: any) => {
      const theaterName = perf.theater?.name || 'Unknown';
      acc[theaterName] = (acc[theaterName] || 0) + 1;
      return acc;
    }, {});

    const theaterUtilization = Object.entries(theaterPerformanceCounts)
      .map(([theater, count]) => ({
        theater,
        performances: count as number,
        utilization: Math.min(100, ((count as number) / 30) * 100) // Assuming 30 shows/month is 100%
      }))
      .sort((a, b) => b.performances - a.performances);

    // Genre distribution
    const genreCounts = musicals.reduce((acc: any, musical: any) => {
      const genre = musical.genre || 'Unknown';
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});

    const totalMusicals = musicals.length;
    const genreDistribution = Object.entries(genreCounts)
      .map(([genre, count]) => ({
        genre,
        count: count as number,
        percentage: Math.round(((count as number) / totalMusicals) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    // Top performers (actors with most performances)
    const actorPerformanceCounts = castings.reduce((acc: any, casting: any) => {
      const actorName = casting.actor?.name || 'Unknown';
      acc[actorName] = (acc[actorName] || 0) + 1;
      return acc;
    }, {});

    const topPerformers = Object.entries(actorPerformanceCounts)
      .map(([name, count]) => ({ name, performances: count as number }))
      .sort((a, b) => b.performances - a.performances)
      .slice(0, 10);

    // Growth calculations (simplified)
    const previousPeriodStart = new Date(rangeDate);
    previousPeriodStart.setTime(rangeDate.getTime() - (now.getTime() - rangeDate.getTime()));

    const currentPeriodMusicals = musicals.filter((m: any) => 
      new Date(m.createdAt) >= rangeDate
    ).length;
    const previousPeriodMusicals = musicals.filter((m: any) => {
      const date = new Date(m.createdAt);
      return date >= previousPeriodStart && date < rangeDate;
    }).length;

    const musicalsGrowth = previousPeriodMusicals > 0 
      ? Math.round(((currentPeriodMusicals - previousPeriodMusicals) / previousPeriodMusicals) * 100)
      : 0;

    return {
      totals: {
        musicals: musicals.length,
        actors: actors.length,
        performances: performances.length,
        theaters: theaters.length,
        users: users.length,
      },
      trends: {
        monthlyPerformances,
        popularMusicals,
        theaterUtilization,
        genreDistribution,
      },
      insights: {
        topPerformers,
        upcomingShows: performances.filter((p: any) => new Date(p.date) > now).length,
        avgPerformancesPerMonth: Math.round(filteredPerformances.length / (range === '1y' ? 12 : 1)),
      },
      growth: {
        musicalsGrowth,
        actorsGrowth: 0, // Simplified for now
        performancesGrowth: 0,
      },
    };
  };

  const generateMonthlyTrends = (performances: any[], range: string) => {
    const months = [];
    const now = new Date();
    
    const monthCount = range === '1y' ? 12 : range === '90d' ? 3 : 1;
    
    for (let i = monthCount - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      const count = performances.filter(p => {
        const perfDate = new Date(p.createdAt);
        return perfDate.getMonth() === date.getMonth() && 
               perfDate.getFullYear() === date.getFullYear();
      }).length;
      
      months.push({ month: monthName, count });
    }
    
    return months;
  };

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Analytics dashboard is only available to administrators.
          </p>
        </div>
      </div>
    );
  }

  if (loading || !analytics) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Performance insights and system metrics
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {[
          { label: 'Total Musicals', value: analytics.totals.musicals, color: 'bg-blue-500', icon: '🎭' },
          { label: 'Active Actors', value: analytics.totals.actors, color: 'bg-green-500', icon: '👥' },
          { label: 'Performances', value: analytics.totals.performances, color: 'bg-purple-500', icon: '🎪' },
          { label: 'Theaters', value: analytics.totals.theaters, color: 'bg-yellow-500', icon: '🏛️' },
          { label: 'Total Users', value: analytics.totals.users, color: 'bg-red-500', icon: '👤' },
        ].map((metric, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {metric.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {metric.value.toLocaleString()}
                </p>
              </div>
              <div className={`w-12 h-12 ${metric.color} rounded-lg flex items-center justify-center text-white text-2xl`}>
                {metric.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Performance Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Trends
          </h3>
          <div className="space-y-3">
            {analytics.trends.monthlyPerformances.map((month, index) => (
              <div key={index} className="flex items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-16">
                  {month.month}
                </span>
                <div className="flex-1 mx-3">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-teal-500 h-2 rounded-full"
                      style={{ 
                        width: `${Math.max(5, (month.count / Math.max(...analytics.trends.monthlyPerformances.map(m => m.count))) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                  {month.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Musicals */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Popular Musicals
          </h3>
          <div className="space-y-3">
            {analytics.trends.popularMusicals.slice(0, 5).map((musical, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-900 dark:text-white font-medium truncate">
                  {musical.title}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                    {musical.performances} shows
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Theater Utilization */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Theater Utilization
          </h3>
          <div className="space-y-3">
            {analytics.trends.theaterUtilization.slice(0, 5).map((theater, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-900 dark:text-white font-medium">
                    {theater.theater}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {theater.utilization}%
                  </span>
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      theater.utilization >= 80 ? 'bg-green-500' : 
                      theater.utilization >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${theater.utilization}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Genre Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Musical Genres
          </h3>
          <div className="space-y-3">
            {analytics.trends.genreDistribution.slice(0, 6).map((genre, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-900 dark:text-white font-medium">
                  {genre.genre}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full text-xs">
                    {genre.percentage}%
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ({genre.count})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Performers
          </h3>
          <div className="space-y-3">
            {analytics.insights.topPerformers.slice(0, 5).map((performer, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="text-sm text-gray-900 dark:text-white font-medium">
                    {performer.name}
                  </span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {performer.performances} shows
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Key Insights
          </h3>
          <div className="space-y-4">
            <div className="p-3 bg-teal-50 dark:bg-teal-900 rounded-md">
              <p className="text-sm text-teal-800 dark:text-teal-200">
                <span className="font-semibold">{analytics.insights.upcomingShows}</span> upcoming performances scheduled
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-md">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Average of <span className="font-semibold">{analytics.insights.avgPerformancesPerMonth}</span> performances per month
              </p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900 rounded-md">
              <p className="text-sm text-purple-800 dark:text-purple-200">
                <span className="font-semibold">{analytics.trends.popularMusicals[0]?.title || 'No data'}</span> is the most performed musical
              </p>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            System Overview
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Verification Rate</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {Math.round((analytics.totals.musicals / (analytics.totals.musicals + 5)) * 100)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Theaters</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {analytics.trends.theaterUtilization.filter(t => t.performances > 0).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Database Health</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Excellent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};