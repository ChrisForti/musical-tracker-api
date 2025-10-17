import React, { useState, useEffect } from 'react';

interface Performance {
  id: number;
  date: string;
  time: string;
  musical: {
    id: number;
    title: string;
  };
  theater: {
    id: number;
    name: string;
    city: string;
  };
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  performances: Performance[];
}

export const PerformanceCalendar: React.FC = () => {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformances();
  }, []);

  const fetchPerformances = async () => {
    try {
      const response = await fetch('/v2/performances');
      if (response.ok) {
        const data = await response.json();
        setPerformances(data);
      }
    } catch (error) {
      console.error('Error fetching performances:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from the Sunday of the week containing the first day
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());
    
    // End at the Saturday of the week containing the last day
    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
    
    const days: CalendarDay[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayPerformances = performances.filter(perf => {
        const perfDate = new Date(perf.date);
        return perfDate.toDateString() === current.toDateString();
      });
      
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        performances: dayPerformances
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(null);
  };

  const calendarDays = getCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const selectedDayPerformances = selectedDay 
    ? performances.filter(perf => {
        const perfDate = new Date(perf.date);
        return perfDate.toDateString() === selectedDay.toDateString();
      })
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600 dark:text-gray-400">Loading calendar...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Performance Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View scheduled performances by date
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={goToToday}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-6">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    const isToday = day.date.toDateString() === new Date().toDateString();
                    const isSelected = selectedDay && day.date.toDateString() === selectedDay.toDateString();
                    const hasPerformances = day.performances.length > 0;

                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDay(day.date)}
                        className={`
                          p-2 min-h-[80px] text-left border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700
                          ${!day.isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'}
                          ${isToday ? 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700' : ''}
                          ${isSelected ? 'bg-blue-100 dark:bg-blue-800 border-blue-300 dark:border-blue-600' : ''}
                        `}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-sm ${isToday ? 'font-bold' : ''}`}>
                            {day.date.getDate()}
                          </span>
                          {hasPerformances && (
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          )}
                        </div>
                        
                        {day.performances.slice(0, 2).map((perf, perfIndex) => (
                          <div key={perfIndex} className="text-xs text-blue-600 dark:text-blue-400 truncate mb-1">
                            {perf.musical.title}
                          </div>
                        ))}
                        
                        {day.performances.length > 2 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            +{day.performances.length - 2} more
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Performance Details */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {selectedDay 
                  ? `Performances on ${selectedDay.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'long', 
                      day: 'numeric'
                    })}`
                  : 'Select a date to view performances'
                }
              </h3>

              {selectedDayPerformances.length > 0 ? (
                <div className="space-y-4">
                  {selectedDayPerformances.map(perf => (
                    <div key={perf.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {perf.musical.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {perf.time} at {perf.theater.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {perf.theater.city}
                      </p>
                    </div>
                  ))}
                </div>
              ) : selectedDay ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No performances scheduled for this date.
                </p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  Click on a calendar date to view scheduled performances.
                </p>
              )}

              {/* Legend */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Legend</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-gray-600 dark:text-gray-400">Has performances</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded mr-2"></span>
                    <span className="text-gray-600 dark:text-gray-400">Today</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};