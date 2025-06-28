import React, { useState } from 'react';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Button, SpecialButton } from '../buttons';

interface DateRangeSelectorProps {
  fromDate: Date | null;
  toDate: Date | null;
  onDateRangeChange: (fromDate: Date | null, toDate: Date | null) => void;
  onClose: () => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  fromDate,
  toDate,
  onDateRangeChange,
  onClose
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [tempFromDate, setTempFromDate] = useState<Date | null>(fromDate);
  const [tempToDate, setTempToDate] = useState<Date | null>(toDate);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [nextMonth, setNextMonth] = useState<Date>(() => {
    const next = new Date();
    next.setMonth(next.getMonth() + 1);
    return next;
  });

  const presetOptions = [
    'Custom',
    'Today',
    'Yesterday', 
    'This Week',
    'Last Week',
    'This Month',
    'Last Month',
    'This Year',
    'Last Year'
  ];
  const formatDateDisplay = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit', 
      year: 'numeric'
    });
  };

  const getDateRange = (preset: string): [Date | null, Date | null] => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    switch (preset) {
      case 'Today':
        return [startOfToday, startOfToday];
      case 'Yesterday':
        const yesterday = new Date(startOfToday);
        yesterday.setDate(yesterday.getDate() - 1);
        return [yesterday, yesterday];
      case 'This Week':
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
        return [startOfWeek, startOfToday];
      case 'Last Week':
        const lastWeekStart = new Date(startOfToday);
        lastWeekStart.setDate(startOfToday.getDate() - startOfToday.getDay() - 7);
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
        return [lastWeekStart, lastWeekEnd];
      case 'This Month':
        const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);
        return [startOfMonth, startOfToday];
      case 'Last Month':
        const lastMonthStart = new Date(startOfToday.getFullYear(), startOfToday.getMonth() - 1, 1);
        const lastMonthEnd = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 0);
        return [lastMonthStart, lastMonthEnd];
      case 'This Year':
        const startOfYear = new Date(startOfToday.getFullYear(), 0, 1);
        return [startOfYear, startOfToday];
      case 'Last Year':
        const lastYearStart = new Date(startOfToday.getFullYear() - 1, 0, 1);
        const lastYearEnd = new Date(startOfToday.getFullYear() - 1, 11, 31);
        return [lastYearStart, lastYearEnd];
      default:
        return [null, null];
    }
  };

  const handlePresetSelect = (preset: string) => {
    setSelectedPreset(preset);
    if (preset === 'Custom') {
      setIsOpen(true);
    } else {
      const [from, to] = getDateRange(preset);
      setTempFromDate(from);
      setTempToDate(to);
    }
  };

  const handleDateSelect = (date: Date, isFrom: boolean) => {
    if (isFrom) {
      setTempFromDate(date);
      if (tempToDate && date > tempToDate) {
        setTempToDate(date);
      }
    } else {
      if (tempFromDate && date < tempFromDate) {
        setTempFromDate(date);
      }
      setTempToDate(date);
    }
  };
  const renderCalendar = (month: Date, isFrom: boolean) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const date = new Date(current);
      const isCurrentMonth = date.getMonth() === monthIndex;
      const isSelected = (isFrom && tempFromDate && date.toDateString() === tempFromDate.toDateString()) ||
                        (!isFrom && tempToDate && date.toDateString() === tempToDate.toDateString());
      const isInRange = tempFromDate && tempToDate && date >= tempFromDate && date <= tempToDate;
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <button
          key={i}
          onClick={() => handleDateSelect(date, isFrom)}
          className={`
            w-8 h-8 text-sm rounded-full transition-colors duration-200
            ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
            ${isSelected ? 'bg-teal-500 text-white' : ''}
            ${isInRange && !isSelected ? 'bg-teal-100 text-teal-700' : ''}
            ${isToday && !isSelected ? 'bg-gray-200 font-semibold' : ''}
            ${isCurrentMonth && !isSelected && !isInRange ? 'hover:bg-gray-100' : ''}
          `}
        >
          {date.getDate()}
        </button>
      );
      current.setDate(current.getDate() + 1);
    }

    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              if (isFrom) {
                const prev = new Date(currentMonth);
                prev.setMonth(prev.getMonth() - 1);
                setCurrentMonth(prev);
              } else {
                const prev = new Date(nextMonth);
                prev.setMonth(prev.getMonth() - 1);
                setNextMonth(prev);
              }
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <FaChevronLeft className="text-gray-500" />
          </button>
          <h3 className="font-semibold text-gray-700">
            {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={() => {
              if (isFrom) {
                const next = new Date(currentMonth);
                next.setMonth(next.getMonth() + 1);
                setCurrentMonth(next);
              } else {
                const next = new Date(nextMonth);
                next.setMonth(next.getMonth() + 1);
                setNextMonth(next);
              }
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <FaChevronRight className="text-gray-500" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  const handleApply = () => {
    onDateRangeChange(tempFromDate, tempToDate);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempFromDate(fromDate);
    setTempToDate(toDate);
    setIsOpen(false);
    onClose();
  };
  return (
    <div className="relative">
      {/* Select Dates Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        icon={<FaCalendarAlt />}
      >
        {(fromDate || toDate) 
          ? `${formatDateDisplay(fromDate) || 'Start'} - ${formatDateDisplay(toDate) || 'End'}`
          : 'Select Dates'
        }
      </Button>

      {/* Date Range Selector Modal */}
      {isOpen && (
        <div className="fixed inset-0 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border-2 border-teal-500 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center mr-3">
                  <FaCalendarAlt className="text-white" size={16} />
                </div>
                <h3 className="text-lg font-semibold text-teal-600">Select Dates</h3>
              </div>

              <div className="flex flex-col lg:flex-row gap-6">
                {/* Preset Options */}
                <div className="lg:w-1/4">
                  <h4 className="font-medium text-gray-700 mb-3">Quick Select</h4>
                  <div className="space-y-1">
                    {presetOptions.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => handlePresetSelect(preset)}
                        className={`
                          w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200
                          ${selectedPreset === preset 
                            ? 'bg-teal-100 text-teal-700 font-medium' 
                            : 'text-gray-600 hover:bg-gray-100'
                          }
                        `}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>                {/* Calendar Section */}
                {selectedPreset === 'Custom' && (
                  <div className="lg:w-3/4">
                    {/* Manual Date Input */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Manual Date Entry</h5>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
                          <input
                            type="date"
                            value={tempFromDate ? tempFromDate.toISOString().split('T')[0] : ''}
                            onChange={(e) => setTempFromDate(e.target.value ? new Date(e.target.value) : null)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                          <input
                            type="date"
                            value={tempToDate ? tempToDate.toISOString().split('T')[0] : ''}
                            onChange={(e) => setTempToDate(e.target.value ? new Date(e.target.value) : null)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-gray-600">
                        From: {formatDateDisplay(tempFromDate) || 'Select date'}
                      </div>
                      <div className="text-sm text-gray-600">
                        To: {formatDateDisplay(tempToDate) || 'Select date'}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderCalendar(currentMonth, true)}
                      {renderCalendar(nextMonth, false)}
                    </div>
                  </div>
                )}

                {/* Date Range Preview for Presets */}
                {selectedPreset !== 'Custom' && selectedPreset && (
                  <div className="lg:w-3/4 flex items-center justify-center">
                    <div className="text-center p-8 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-gray-700 mb-2">
                        {selectedPreset}
                      </div>
                      <div className="text-sm text-gray-600">
                        {tempFromDate && tempToDate ? (
                          <>
                            <div>From: {formatDateDisplay(tempFromDate)}</div>
                            <div>To: {formatDateDisplay(tempToDate)}</div>
                          </>
                        ) : (
                          'Date range will be applied'
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <SpecialButton
                  variant="modal-cancel"
                  onClick={handleCancel}
                >
                  Cancel
                </SpecialButton>
                <SpecialButton
                  variant="modal-add"
                  onClick={handleApply}
                >
                  Apply
                </SpecialButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;
