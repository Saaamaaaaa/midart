import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { projectAPI } from '../../services/api';

export default function ProjectCalendar({ projectId, isOwner, startDate, endDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalContent, setModalContent] = useState('');
  const [saving, setSaving] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  useEffect(() => {
    fetchEntries();
  }, [projectId, currentDate]);

  const fetchEntries = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await projectAPI.getCalendarEntries(projectId, year, month);
      const entriesMap = {};
      (response.data || []).forEach((entry) => {
        entriesMap[entry.date] = entry.content;
      });
      setEntries(entriesMap);
    } catch (error) {
      console.error('Error fetching calendar entries:', error);
    }
  };

  const handleDayClick = (day) => {
    if (!isOwner) return;
    const dateStr = format(day, 'yyyy-MM-dd');
    setSelectedDate(day);
    setModalContent(entries[dateStr] || '');
  };

  const handleSaveEntry = async () => {
    if (!selectedDate) return;
    setSaving(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      await projectAPI.saveCalendarEntry(projectId, dateStr, modalContent);
      setEntries((prev) => ({
        ...prev,
        [dateStr]: modalContent,
      }));
      setSelectedDate(null);
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setSaving(false);
    }
  };

  const projectStart = startDate ? new Date(startDate) : null;
  const projectEnd = endDate ? new Date(endDate) : null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-medium text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="text-center text-xs text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const hasEntry = entries[dateStr];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isStart = projectStart && isSameDay(day, projectStart);
          const isEnd = projectEnd && isSameDay(day, projectEnd);

          return (
            <div
              key={dateStr}
              onClick={() => handleDayClick(day)}
              className={`
                relative min-h-[60px] p-1 border rounded text-xs
                ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-300'}
                ${hasEntry ? 'border-blue-200 bg-blue-50' : 'border-gray-100'}
                ${isOwner ? 'cursor-pointer hover:border-gray-300' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <span className={`${isCurrentMonth ? 'text-gray-700' : 'text-gray-300'}`}>
                  {format(day, 'd')}
                </span>
                {isStart && (
                  <span className="px-1 py-0.5 text-[10px] bg-green-100 text-green-700 rounded">
                    START
                  </span>
                )}
                {isEnd && (
                  <span className="px-1 py-0.5 text-[10px] bg-red-100 text-red-700 rounded">
                    END
                  </span>
                )}
              </div>
              {hasEntry && (
                <p className="mt-1 text-[10px] text-gray-600 line-clamp-2">
                  {entries[dateStr]}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {!isOwner && (
        <p className="text-xs text-gray-400 mt-3 text-center">
          Only the project creator can edit this calendar.
        </p>
      )}

      {/* Edit modal */}
      <Modal
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title={`Edit: ${selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}`}
      >
        <textarea
          value={modalContent}
          onChange={(e) => setModalContent(e.target.value)}
          rows={5}
          placeholder="Add notes for this day..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none mb-4"
        />
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setSelectedDate(null)}>
            Cancel
          </Button>
          <Button onClick={handleSaveEntry} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
