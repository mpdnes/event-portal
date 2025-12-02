import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { EventClickArg } from '@fullcalendar/core';
import { sessionService } from '../services/sessionService';
import { registrationService } from '../services/registrationService';
import { PDSession, Registration } from '../types';
import { toast } from 'react-hot-toast';
import {
  Cog6ToothIcon as Settings, CalendarIcon, EyeIcon, EyeSlashIcon,
  MapPinIcon as MapPin, UserGroupIcon as Users, ClockIcon as Clock,
  XMarkIcon as X, UserIcon as User
} from '@heroicons/react/24/outline';
import { getTagIcon } from '../utils/tagIcons';

const Calendar: React.FC = () => {
  const [sessions, setSessions] = useState<PDSession[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  // Right sidebar for event details
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<PDSession | null>(null);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState<PDSession[]>([]);
  const [showDateSidebar, setShowDateSidebar] = useState(false);

  // Customization
  const [calendarView, setCalendarView] = useState('dayGridMonth');
  const [showWeekends, setShowWeekends] = useState(false); // Default to hiding weekends
  const [showCustomization, setShowCustomization] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<'purple' | 'blue' | 'green' | 'orange'>('purple');
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'registered'>('all');
  const [selectedTags, setSelectedTags] = useState<Set<number>>(new Set());



  const calendarRef = useRef<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Removed drag-and-drop functionality - using one-click registration instead

  const fetchData = async () => {
    try {
      setLoading(true);

      const sessionsData = await sessionService.getAllSessions();
      const registrationsData = await registrationService.getMyRegistrations();

      setSessions(sessionsData);
      setRegistrations(registrationsData);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
      const errorStatus = error.response?.status || 'No status';
      toast.error(`Failed to load calendar data: ${errorMsg} (Status: ${errorStatus})`);
      console.error('Calendar data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get user's registered session IDs
  const registeredSessionIds = new Set(
    registrations
      .filter(r => r.status === 'registered')
      .map(r => r.session_id)
  );

  // Get calendar events - show ALL published PD sessions by default
  const getCalendarEvents = () => {
    const events = sessions
      .filter(s => s.is_published)
      .filter(s => scheduleFilter === 'all' ? true : registeredSessionIds.has(s.id))
      .filter(s => {
        // Filter by selected tags - if no tags selected, show all; if tags selected, show only sessions with those tags
        if (selectedTags.size === 0) return true;
        return s.tags?.some(t => selectedTags.has(t.id)) || false;
      })
      .map((session) => {
        // Handle session_date being either a string or ISO datetime
        let dateStr = session.session_date;
        if (typeof dateStr === 'string' && dateStr.includes('T')) {
          // If it's an ISO datetime, extract just the date part
          dateStr = dateStr.split('T')[0];
        }
        
        const startDateTime = `${dateStr}T${session.start_time}`;
        const endDateTime = `${dateStr}T${session.end_time}`;
        const isRegistered = registeredSessionIds.has(session.id);
        const registration = registrations.find(r => r.session_id === session.id);

        const backgroundColor = session.tags?.[0]?.color || '#8b5cf6';
        const borderColor = adjustColor(backgroundColor, -20);
        const textColor = isColorLight(backgroundColor) ? '#000000' : '#ffffff';

        return {
          id: session.id,
          title: session.title,
          start: startDateTime,
          end: endDateTime,
          backgroundColor,
          borderColor,
          textColor,
          classNames: [isRegistered ? 'registered-event' : 'available-event'],
          extendedProps: {
            session,
            registration: registration || null,
            registrationCount: session.registration_count || 0,
            capacity: session.capacity,
            location: session.location,
            presenter: session.presenter_name,
            tags: session.tags,
            isRegistered
          }
        };
      });
    
    if (events.length > 0) {
      console.log('Calendar events loaded');
    }
    
    return events;
  };

  // Handle event click - show details in sidebar
  const handleEventClick = (info: EventClickArg) => {
    const session = info.event.extendedProps.session as PDSession;
    const registration = info.event.extendedProps.registration as Registration | undefined;
    
    setSelectedEvent(session);
    setSelectedRegistration(registration || null);
    setSidebarOpen(true);
  };

  // Handle date click - show all events for that day
  const handleDateClick = (arg: any) => {
    const dateStr = arg.dateStr;
    const dayEvents = sessions.filter(s => 
      s.is_published && 
      (s.session_date as string).startsWith(dateStr)
    );
    
    if (dayEvents.length > 0) {
      setSelectedDateEvents(dayEvents);
      setShowDateSidebar(true);
    }
  };

  // Helper functions
  const adjustColor = (color: string, amount: number): string => {
    const clamp = (val: number) => Math.min(Math.max(val, 0), 255);
    const num = parseInt(color.replace('#', ''), 16);
    const r = clamp((num >> 16) + amount);
    const g = clamp(((num >> 8) & 0x00FF) + amount);
    const b = clamp((num & 0x0000FF) + amount);
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  };

  // Get unique tags from all sessions
  const getAllTags = () => {
    const tagMap = new Map<number, { id: number; name: string; color: string }>();
    sessions.forEach(session => {
      session.tags?.forEach(tag => {
        if (!tagMap.has(tag.id)) {
          tagMap.set(tag.id, tag);
        }
      });
    });
    return Array.from(tagMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  const allTags = getAllTags();

  const isColorLight = (color: string): boolean => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <CalendarIcon className="w-16 h-16 text-purple-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  // Get theme colors based on selected theme
  const themeColors = {
    purple: { primary: '#8b5cf6', secondary: '#a78bfa', light: '#f3e8ff' },
    blue: { primary: '#3b82f6', secondary: '#60a5fa', light: '#eff6ff' },
    green: { primary: '#10b981', secondary: '#34d399', light: '#ecfdf5' },
    orange: { primary: '#f97316', secondary: '#fb923c', light: '#fff7ed' }
  };

  const theme = themeColors[selectedTheme];

  return (
    <div className="flex h-screen bg-gray-50">
      <style>{`
        .fc {
          font-family: inherit;
        }
        
        .fc .fc-button-primary {
          background-color: ${theme.primary};
          border-color: ${theme.primary};
          text-transform: capitalize;
          font-weight: 500;
          padding: 6px 12px;
          font-size: 13px;
        }
        
        .fc .fc-button-primary:hover {
          background-color: ${adjustColor(theme.primary, -10)};
          border-color: ${adjustColor(theme.primary, -10)};
        }
        
        .fc .fc-button-primary.fc-button-active {
          background-color: ${adjustColor(theme.primary, -15)};
          border-color: ${adjustColor(theme.primary, -15)};
        }
        
        .fc .fc-button-primary:not(:disabled).fc-button-active:focus {
          box-shadow: none;
        }
        
        .fc .fc-daygrid-day:hover {
          background-color: ${theme.light};
          cursor: pointer;
        }
        
        .fc .fc-event {
          border: none !important;
          padding: 0 !important;
          background-color: transparent !important;
        }
        
        .fc .fc-event-main {
          padding: 0 !important;
          background-color: transparent !important;
        }
        
        .fc .fc-daygrid-event {
          margin-bottom: 2px !important;
          border-radius: 12px !important;
          border: 2px solid #e5e7eb !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          font-size: 11px !important;
          line-height: 1.3;
          overflow: hidden;
          background-color: rgba(255, 255, 255, 0.95) !important;
        }
        
        .fc .fc-daygrid-event:hover {
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
          transition: all 0.2s ease;
          border-color: ${theme.primary} !important;
        }
        
        .fc-event-title {
          font-weight: 600 !important;
          white-space: normal !important;
          overflow: hidden !important;
          color: #1f2937;
        }
        
        .fc .fc-col-header-cell {
          padding: 16px 8px !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          color: ${theme.primary};
          border-color: #e5e7eb;
          background-color: #fafafa;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: normal;
        }
        
        .fc .fc-daygrid-day-number {
          padding: 10px 8px !important;
          font-weight: 700 !important;
          font-size: 14px !important;
          color: #374151;
        }
        
        .fc .fc-daygrid-day {
          border-color: #e5e7eb;
          background-color: #fff;
        }
        
        .fc .fc-daygrid-day.fc-day-other {
          background-color: #fafafa;
        }
        
        .fc .fc-today {
          background-color: ${theme.light} !important;
        }
        
        .fc .fc-today .fc-daygrid-day-number {
          color: ${theme.primary};
          background: white;
          border-radius: 6px;
          padding: 6px !important;
          display: inline-block;
        }
        
        .fc .fc-toolbar {
          padding: 0 !important;
          gap: 12px !important;
        }
        
        .fc .fc-toolbar-title {
          font-size: 20px !important;
          font-weight: 700 !important;
          color: #1f2937;
        }
        
        .fc .fc-button-group {
          gap: 4px;
        }
        
        .fc .fc-daygrid-day-frame {
          min-height: 80px;
          max-height: 80px;
          height: 80px;
        }

        /* Popover for more events */
        .fc-popover {
          z-index: 100;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          border: none;
        }

        .fc-popover-header {
          background-color: ${theme.light};
          color: ${theme.primary};
          font-weight: 700;
          padding: 12px 16px !important;
          border-radius: 12px 12px 0 0;
          border: none;
        }

        .fc-popover-body {
          padding: 12px;
          max-height: 500px;
          overflow-y: auto;
          background: white;
          border-radius: 0 0 12px 12px;
        }

        .fc-daygrid-more-popover .fc-event {
          margin-bottom: 8px;
        }
        
        .fc-daygrid-more-popover .fc-event:last-child {
          margin-bottom: 0;
        }
        
        body > .fc-popover {
          position: fixed !important;
          max-width: 500px;
        }

        /* Time Grid (Week/Day View) Styling */
        .fc .fc-timegrid-slot {
          height: 3em;
        }

        .fc .fc-col-time-cell {
          vertical-align: middle;
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
          padding: 0 8px !important;
        }

        .fc .fc-timegrid-cell {
          border-color: #e5e7eb;
          background-color: #fff;
        }

        .fc .fc-timegrid-body {
          border-color: #e5e7eb;
        }

        .fc .fc-daygrid-day-number,
        .fc .fc-timegrid-axis .fc-timegrid-slot {
          font-size: 13px;
        }

        .fc .fc-timegrid-event {
          border-radius: 8px !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
          overflow: visible !important;
          border: none !important;
        }

        .fc .fc-timegrid-event:hover {
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
          transform: translateY(-2px);
          transition: all 0.2s ease;
        }

        .fc .fc-timegrid-event-chunk {
          padding: 4px 6px !important;
        }

        .fc-event-title {
          font-weight: 600 !important;
          font-size: 13px !important;
          white-space: normal !important;
          overflow: visible !important;
          line-height: 1.4;
        }

        .fc-event-time {
          font-size: 12px !important;
          font-weight: 500;
        }

        .fc .fc-now-indicator {
          border-color: ${theme.primary};
          border-top-width: 2px;
        }

        /* Adjust timegrid to show times better */
        .fc-timegrid-axis {
          width: 60px;
        }

        .fc .fc-timegrid-slot {
          border-color: #f3f4f6;
        }

        /* Zoom out calendar */
        .fc {
          font-size: 0.85em;
        }

        .fc .fc-col-header-cell {
          padding: 8px 4px !important;
          font-size: 11px !important;
        }

        .fc .fc-daygrid-day-number {
          padding: 4px 4px !important;
          font-size: 12px !important;
        }

        .fc .fc-toolbar-title {
          font-size: 18px !important;
        }

        .fc .fc-button-primary {
          padding: 4px 8px !important;
          font-size: 12px !important;
        }
      `}</style>
      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col overflow-hidden max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex justify-between items-start gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg" style={{ backgroundColor: theme.light }}>
                  <CalendarIcon className="w-6 h-6" style={{ color: theme.primary }} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">My PD Calendar</h1>
              </div>
              <p className="text-sm text-gray-500">Browse and register for professional development sessions</p>
            </div>

            <div className="flex gap-3 items-center">
              <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setScheduleFilter('all')}
                  className={`px-4 py-2 rounded-md font-medium transition-all text-sm ${
                    scheduleFilter === 'all'
                      ? 'text-white shadow-sm'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                  style={{ 
                    backgroundColor: scheduleFilter === 'all' ? theme.primary : 'transparent'
                  }}
                >
                  All Events
                </button>
                <button
                  onClick={() => setScheduleFilter('registered')}
                  className={`px-4 py-2 rounded-md font-medium transition-all text-sm ${
                    scheduleFilter === 'registered'
                      ? 'text-white shadow-sm'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                  style={{ 
                    backgroundColor: scheduleFilter === 'registered' ? theme.primary : 'transparent'
                  }}
                >
                  My Schedule
                </button>
              </div>

              <button
                onClick={() => setShowCustomization(!showCustomization)}
                className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 border border-gray-300 hover:bg-gray-50 transition-colors bg-white"
              >
                <Settings className="w-4 h-4" />
                Customize
              </button>
            </div>
          </div>
        </div>

        {/* Tag Filter Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 overflow-x-auto">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-gray-600">Filter by tag:</span>
            <button
              onClick={() => setSelectedTags(new Set())}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedTags.size === 0
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Tags
            </button>
            {allTags.map(tag => {
              const TagIcon = getTagIcon(tag.name);
              const isSelected = selectedTags.has(tag.id);
              const textColor = isColorLight(tag.color) ? '#000000' : '#ffffff';
              
              return (
                <button
                  key={tag.id}
                  onClick={() => {
                    const newSelected = new Set(selectedTags);
                    if (newSelected.has(tag.id)) {
                      newSelected.delete(tag.id);
                    } else {
                      newSelected.add(tag.id);
                    }
                    setSelectedTags(newSelected);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    isSelected ? 'shadow-md' : 'border border-gray-300'
                  }`}
                  style={{
                    backgroundColor: isSelected ? tag.color : '#f9fafb',
                    color: isSelected ? textColor : '#374151',
                  }}
                >
                  {TagIcon && <TagIcon className="w-4 h-4" style={{ color: isSelected ? textColor : tag.color }} />}
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Customization Panel */}
        {showCustomization && (
          <div className="bg-white border-b border-gray-200 px-8 py-4">
            <div className="flex items-center gap-8 flex-wrap">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Calendar View</label>
                <select
                  value={calendarView}
                  onChange={(e) => {
                    setCalendarView(e.target.value);
                    calendarRef.current?.getApi().changeView(e.target.value);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm font-medium"
                >
                  <option value="dayGridMonth">Month</option>
                  <option value="timeGridWeek">Week</option>
                  <option value="timeGridDay">Day</option>
                  <option value="listWeek">List</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Weekends</label>
                <button
                  onClick={() => setShowWeekends(!showWeekends)}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all text-sm ${
                    showWeekends
                      ? 'bg-gray-200 text-gray-700'
                      : 'text-white'
                  }`}
                  style={{ backgroundColor: showWeekends ? '#d1d5db' : theme.primary }}
                >
                  {showWeekends ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                  {showWeekends ? 'Showing' : 'Hidden'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Color Theme</label>
                <div className="flex gap-3">
                  {(['purple', 'blue', 'green', 'orange'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTheme(t)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedTheme === t ? 'border-gray-800 ring-2 ring-offset-2' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: themeColors[t].primary }}
                      title={t.charAt(0).toUpperCase() + t.slice(1)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Container */}
        <div className="h-screen max-h-[700px] overflow-y-auto p-6 bg-gray-50">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView={calendarView}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
              }}
              events={getCalendarEvents()}
              selectable={false}
              selectMirror={false}
              dayMaxEvents={2}
              eventMaxStack={2}
              weekends={showWeekends}
              eventClick={handleEventClick}
              dateClick={handleDateClick}
              select={() => {}}
              height="auto"
              slotMinTime="07:00:00"
              slotMaxTime="19:00:00"
              slotDuration="00:30:00"
              allDaySlot={false}
              nowIndicator={true}
              eventTimeFormat={{
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short'
              }}
              displayEventTime={true}
              displayEventEnd={false}
              eventContent={(arg) => {
                const { event, view } = arg;
                const tags = event.extendedProps.tags || [];
                const isRegistered = event.extendedProps.isRegistered;
                const isWeekView = view.type.includes('timeGrid');
                const borderColor = tags[0]?.color || '#8b5cf6';

                // For month view, show a simple compact dot indicator
                if (!isWeekView) {
                  const startTime = event.startStr.split('T')[1]?.substring(0, 5) || '';
                  const formatTime = (time24: string) => {
                    const [hours, minutes] = time24.split(':');
                    const hour = parseInt(hours);
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    const hour12 = hour % 12 || 12;
                    return `${hour12} ${ampm}`;
                  };
                  const startFormatted = startTime ? formatTime(startTime) : '';
                  const firstTag = tags[0];
                  const TagIcon = firstTag ? getTagIcon(firstTag.name) : null;

                  return (
                    <div 
                      className="w-full h-full flex items-center px-1 py-0.5 cursor-pointer hover:opacity-80 transition-opacity gap-1.5"
                      title={event.title}
                    >
                      <span className="text-xs font-medium text-gray-700 truncate flex-1">
                        {startFormatted && <span className="text-gray-500 mr-1">{startFormatted}</span>}
                        {event.title}
                      </span>
                      {firstTag && TagIcon && (
                        <div
                          className="inline-flex items-center justify-center rounded-full w-6 h-6 flex-shrink-0 shadow-sm"
                          style={{ 
                            backgroundColor: firstTag.color || '#8b5cf6'
                          }}
                          title={firstTag.name}
                        >
                          <TagIcon className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </div>
                  );
                }

                // For week/day view, show more details
                const startTime = event.startStr.split('T')[1]?.substring(0, 5) || '';
                const endTime = event.endStr.split('T')[1]?.substring(0, 5) || '';

                // Convert 24h to 12h AM/PM format
                const formatTime = (time24: string) => {
                  const [hours, minutes] = time24.split(':');
                  const hour = parseInt(hours);
                  const ampm = hour >= 12 ? 'PM' : 'AM';
                  const hour12 = hour % 12 || 12;
                  return `${hour12}:${minutes}${ampm}`;
                };

                const startFormatted = startTime ? formatTime(startTime) : '';
                const endFormatted = endTime ? formatTime(endTime) : '';
                const timeRange = startFormatted && endFormatted ? `${startFormatted} - ${endFormatted}` : '';

                return (
                  <div 
                    className={`fc-event-main-frame px-1.5 py-1 overflow-hidden w-full h-full flex flex-col justify-between group relative`}
                    style={{ borderLeft: `4px solid ${borderColor}` }}
                  >
                    <div className={`flex-1 min-w-0`}>
                      <div className="fc-event-title font-semibold text-xs truncate leading-tight text-gray-900">
                        {event.title}
                      </div>
                      {timeRange && (
                        <div className="text-xs opacity-75 font-medium leading-tight mt-0.5 text-gray-600">
                          {timeRange}
                        </div>
                      )}
                    </div>
                    
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {tags.slice(0, 3).map((tag: any) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-white whitespace-nowrap shadow-sm"
                            style={{ 
                              backgroundColor: tag.color || '#8b5cf6',
                              opacity: 0.92
                            }}
                            title={tag.name}
                          >
                            <span className="text-sm">{tag.name}</span>
                            <span className="text-xs">{tag.name}</span>
                          </span>
                        ))}
                        {tags.length > 3 && (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-gray-200 text-gray-700 whitespace-nowrap">
                            +{tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const session = event.extendedProps.session as PDSession;
                        if (isRegistered) {
                          registrationService.cancel(session.id).then(() => {
                            toast.success('Registration cancelled');
                            // Update local state instead of refetching
                            setRegistrations(registrations.filter(r => r.session_id !== session.id));
                          }).catch((error: any) => {
                            toast.error('Failed to cancel registration');
                          });
                        } else {
                          registrationService.register(session.id).then(() => {
                            toast.success(`Registered!`);
                            // Update local state instead of refetching
                            setRegistrations([...registrations, { 
                              id: Math.random().toString(),
                              session_id: session.id,
                              user_id: '',
                              status: 'registered',
                              registered_at: new Date().toISOString(),
                              updated_at: new Date().toISOString()
                            }]);
                          }).catch((error: any) => {
                              toast.error(error.response?.data?.error || 'Registration failed');
                            });
                          }
                        }}
                      className={`text-xs font-semibold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mt-1 w-full py-1 px-2`}
                      style={{ 
                        backgroundColor: isRegistered ? '#ef4444' : theme.primary,
                        color: 'white'
                      }}
                      title={isRegistered ? 'Cancel' : 'Register'}
                    >
                      {isRegistered ? 'Cancel' : 'Register'}
                      </button>
                  </div>
                );
              }}
            />
          </div>
        </div>
      </div>

      {/* Event Details Sidebar */}
      {sidebarOpen && selectedEvent && (
        <div 
          className="fixed right-8 top-24 w-[500px] max-h-[calc(100vh-120px)] bg-white shadow-lg border border-gray-200 rounded-lg flex flex-col overflow-hidden z-40"
        >
          {/* Sidebar Header */}
          <div 
            className="p-8"
            style={{ backgroundColor: theme.primary }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold leading-tight mb-3 text-white">{selectedEvent.title}</h2>
                {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedEvent.tags.map(tag => {
                      const TagIcon = getTagIcon(tag.name);
                      const textColor = isColorLight(tag.color) ? '#000000' : '#ffffff';
                      return (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: tag.color,
                            color: textColor
                          }}
                        >
                          {TagIcon && <TagIcon className="w-3.5 h-3.5" />}
                          <span>{tag.name}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  setSelectedEvent(null);
                  setSelectedRegistration(null);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0 ml-4 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Registration Button in Header */}
            {selectedRegistration ? (
              <button
                onClick={async () => {
                  try {
                    await registrationService.cancel(selectedEvent.id);
                    toast.success('Registration cancelled');
                    fetchData();
                    setSidebarOpen(false);
                    setSelectedEvent(null);
                  } catch (error: any) {
                    toast.error('Failed to cancel registration');
                  }
                }}
                className="w-full py-2 rounded-lg font-semibold text-white transition-all hover:opacity-90 bg-red-600 text-sm"
              >
                Cancel Registration
              </button>
            ) : (
              <button
                onClick={async () => {
                  try {
                    await registrationService.register(selectedEvent.id);
                    toast.success(`✅ Registered for ${selectedEvent.title}!`);
                    fetchData();
                  } catch (error: any) {
                    toast.error(error.response?.data?.error || 'Registration failed');
                  }
                }}
                className="w-full py-2 rounded-lg font-semibold text-white transition-all hover:opacity-90 text-sm bg-white/30 border border-white/40 hover:bg-white/40"
              >
                Register
              </button>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {selectedEvent.description && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="text-xs font-bold text-blue-900 mb-2 uppercase tracking-wide">Professional Development Description</h3>
                <p className="text-blue-900 text-sm leading-relaxed whitespace-pre-wrap">{selectedEvent.description}</p>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Details</h3>
              
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg flex-shrink-0" style={{ backgroundColor: theme.light }}>
                  <Clock className="w-5 h-5" style={{ color: theme.primary }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Date & Time</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{new Date(selectedEvent.session_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                  <p className="text-sm font-semibold text-gray-700">{selectedEvent.start_time} - {selectedEvent.end_time}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg flex-shrink-0" style={{ backgroundColor: theme.light }}>
                  <MapPin className="w-5 h-5" style={{ color: theme.primary }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Location</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{selectedEvent.location}</p>
                </div>
              </div>

              {selectedEvent.registration_count !== undefined && (
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg flex-shrink-0" style={{ backgroundColor: theme.light }}>
                    <Users className="w-5 h-5" style={{ color: theme.primary }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-medium">Registrations</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedEvent.registration_count || 0}/{selectedEvent.capacity || 'No limit'}</p>
                  </div>
                </div>
              )}

              {selectedEvent.presenter_name && (
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg flex-shrink-0" style={{ backgroundColor: theme.light }}>
                    <User className="w-5 h-5" style={{ color: theme.primary }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-medium">Presenter</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedEvent.presenter_name}</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Day Events Sidebar */}
      {showDateSidebar && selectedDateEvents.length > 0 && (
        <div className="fixed right-8 top-24 w-[500px] max-h-[calc(100vh-120px)] bg-white shadow-2xl border border-gray-200 rounded-lg flex flex-col overflow-hidden z-40">
          {/* Header */}
          <div className="p-6 text-white" style={{ backgroundColor: theme.primary }}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold">Events This Day</h2>
              <button
                onClick={() => {
                  setShowDateSidebar(false);
                  setSelectedDateEvents([]);
                }}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-white/90">
              {selectedDateEvents[0] && new Date(selectedDateEvents[0].session_date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Events List */}
          <div className="flex-1 overflow-y-auto">
            {selectedDateEvents.map((event, idx) => (
              <div 
                key={event.id}
                onClick={() => {
                  setSelectedEvent(event);
                  setSelectedRegistration(registrations.find(r => r.session_id === event.id) || null);
                  setSidebarOpen(true);
                  setShowDateSidebar(false);
                }}
                className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-1 h-12 rounded-full flex-shrink-0"
                    style={{ backgroundColor: event.tags?.[0]?.color || theme.primary }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
                    <p className="text-sm text-gray-600 font-medium">
                      {event.start_time} - {event.end_time}
                    </p>
                    {event.location && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </p>
                    )}
                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {event.tags.map(tag => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center gap-1 bg-gray-100 rounded-full px-2 py-0.5 text-xs"
                          >
                            <span>{tag.name}</span>
                            <span className="text-gray-700">{tag.name}</span>
                          </span>
                        ))}
                      </div>
                    )}
                    {registrations.find(r => r.session_id === event.id) && (
                      <p className="text-xs font-semibold text-green-600 mt-2">✓ Registered</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50 text-center text-sm text-gray-600">
            Click an event to view full details
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
