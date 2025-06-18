import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaSearch, FaRegSun, FaTimes, FaStore } from 'react-icons/fa';
import dayjs from 'dayjs';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDebounceSearch } from '../hooks/useDebounceSearch';
import { useAppSelector } from '../store/hooks';

const TopBar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date('2025-05-12'));
  const [showCalendar, setShowCalendar] = useState(false);
  const { searchTerm, updateSearchTerm } = useDebounceSearch(300);
  const { currentStore } = useAppSelector((state) => state.stores);

  const handlePrev = () => setSelectedDate(prev => dayjs(prev).subtract(1, 'day').toDate());
  const handleNext = () => setSelectedDate(prev => dayjs(prev).add(1, 'day').toDate());

  const formattedDate = dayjs(selectedDate).format('dddd MMMM D, YYYY');

  return (
    <div className= "hidden lg:block bg-white w-full px-4 py-2  relative">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2">
        {/* Date Selection Section */}
        <div className="flex items-center flex-wrap relative">
          <div className="flex items-center border-2 border-cyan-600 rounded-full overflow-hidden">
            {/* Arrows and Date */}
            <div className="flex items-center px-4 py-[6px] space-x-3">
              <FaChevronLeft className="text-cyan-600 text-sm cursor-pointer" onClick={handlePrev} />
              <span className="text-cyan-600 font-medium whitespace-nowrap">
                {formattedDate}
              </span>
              <FaChevronRight className="text-cyan-600 text-sm cursor-pointer" onClick={handleNext} />
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-cyan-600" />

            {/* Select Date (trigger calendar) */}
            <div
              className="px-4 py-[6px] text-cyan-900 cursor-pointer font-medium"
              onClick={() => setShowCalendar(prev => !prev)}
            >
              Select Date
            </div>
          </div>

          {/* DatePicker shown below on toggle */}
          {showCalendar && (
            <div className="absolute top-full left-0 mt-2 z-10">
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => {
                  if (date) {
                    setSelectedDate(date);
                  }
                  setShowCalendar(false);
                }}
                inline
              />
            </div>
          )}
        </div>        {/* Greeting and Search */}
        {/* Combined: Greeting + Search in ONE container */}
<div className="flex items-center bg-white rounded-xl px-4 py-2 shadow-sm border-2 border-[#EDEDED] w-full sm:w-auto gap-4">
  {/* Hello + Icon */}
  <div className="flex items-center mr-4">
    <FaRegSun className="text-yellow-400 mr-2" />
    <span>Hello, Michael Doe</span>
  </div>
  
  {/* Store Info */}
  {currentStore && (
    <div className="flex items-center mr-4 px-3 py-1 bg-teal-50 rounded-md border border-teal-200">
      <FaStore className="text-teal-600 mr-2 text-sm" />
      <span className="text-teal-700 text-sm font-medium">{currentStore.name}</span>
    </div>
  )}

  {/* Search Box */}
  <div className="flex items-center bg-gray-100 px-3 py-[6px] rounded-md w-full sm:w-64 relative">
    <FaSearch className="text-gray-400 mr-2" />
    <input
      type="text"
      placeholder="Search cards..."
      value={searchTerm}
      onChange={(e) => updateSearchTerm(e.target.value)}
      className="bg-transparent outline-none text-sm w-full pr-6"
    />
    {searchTerm && (
      <button
        onClick={() => updateSearchTerm('')}
        className="absolute right-2 text-gray-400 hover:text-gray-600 transition-colors"
        title="Clear search"
      >
        <FaTimes className="text-xs" />
      </button>
    )}
  </div>
</div>


        {/* Time Range Button */}
        <div className="mt-2 lg:mt-0 border-2 border-[#EDEDED] rounded-4xl">
          <button className="border border-white text-cyan-600 px-4 py-2 rounded-full whitespace-nowrap transition">
            Open time – Close time
          </button>
        </div>
      </div>
      <br />
      <hr  className='text-[#E5E5E5]'/>

      {/* Bottom */}
      <div className="mt-3  pt-2 text-right text-1xl text-gray-700  font-semibold ">
        <span className='hover:border-b-2 border-[#E5E5E5]'>Daily Entry</span>
        <span className="mx-2">|</span>
        <span className='hover:border-b-2 border-[#E5E5E5]'>Open New Day</span>
      </div>
    </div>
  );
};

export default TopBar;
