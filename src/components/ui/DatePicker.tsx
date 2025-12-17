import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  getDay,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ko } from 'date-fns/locale';

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function DatePicker({ value, onChange, minDate, maxDate, className }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value);

  const days = useMemo(() => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [viewDate]);

  const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1));
  const handleNextMonth = () => setViewDate(addMonths(viewDate, 1));

  const handleDateClick = (date: Date) => {
    onChange(date);
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    setViewDate(today);
    onChange(today);
    setIsOpen(false);
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  // Year quick navigation
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = minDate ? minDate.getFullYear() : currentYear - 10;
    const endYear = maxDate ? maxDate.getFullYear() : currentYear + 1;
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  }, [minDate, maxDate]);

  return (
    <div className={cn('relative', className)}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200',
          'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700',
          'hover:border-primary-300 dark:hover:border-primary-600',
          'text-sm font-medium text-slate-700 dark:text-slate-300'
        )}
      >
        <Calendar className="w-4 h-4 text-slate-400" />
        <span>{format(value, 'yyyy년 M월 d일', { locale: ko })}</span>
        {isToday(value) && (
          <span className="text-xs text-primary-500 font-medium">(오늘)</span>
        )}
      </button>

      {/* Dropdown calendar */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Calendar */}
          <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 min-w-[300px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-500" />
              </button>
              <div className="flex items-center gap-2">
                <select
                  value={viewDate.getFullYear()}
                  onChange={(e) => setViewDate(new Date(parseInt(e.target.value), viewDate.getMonth(), 1))}
                  className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 border-none"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}년
                    </option>
                  ))}
                </select>
                <span className="text-lg font-semibold text-slate-900 dark:text-white">
                  {format(viewDate, 'M월', { locale: ko })}
                </span>
              </div>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                <div
                  key={day}
                  className={cn(
                    'text-center text-xs font-medium py-1',
                    i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-400'
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const isSelected = isSameDay(day, value);
                const isCurrentMonth = isSameMonth(day, viewDate);
                const isTodayDate = isToday(day);
                const isDisabled = isDateDisabled(day);
                const dayOfWeek = getDay(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => !isDisabled && handleDateClick(day)}
                    disabled={isDisabled}
                    className={cn(
                      'w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200',
                      !isCurrentMonth && 'text-slate-300 dark:text-slate-600',
                      isCurrentMonth && !isSelected && 'text-slate-700 dark:text-slate-300',
                      isCurrentMonth && dayOfWeek === 0 && !isSelected && 'text-red-500 dark:text-red-400',
                      isCurrentMonth && dayOfWeek === 6 && !isSelected && 'text-blue-500 dark:text-blue-400',
                      isTodayDate && !isSelected && 'ring-1 ring-primary-400',
                      isSelected && 'bg-primary-500 text-white',
                      !isSelected && !isDisabled && 'hover:bg-slate-100 dark:hover:bg-slate-800',
                      isDisabled && 'opacity-30 cursor-not-allowed'
                    )}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between">
              <Button variant="ghost" size="sm" onClick={handleToday}>
                오늘
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                닫기
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
