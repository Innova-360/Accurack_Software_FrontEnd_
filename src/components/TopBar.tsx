import {
  // FaChevronLeft,
  // FaChevronRight,
  FaSearch,
  FaRegSun,
  FaTimes,
} from "react-icons/fa";
// import dayjs from "dayjs";
// import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDebounceSearch } from "../hooks/useDebounceSearch";
import { useAppSelector } from "../store/hooks";

const TopBar: React.FC = () => {
  // const [selectedDate, setSelectedDate] = useState(new Date("2025-05-12"));
  // const [showCalendar, setShowCalendar] = useState(false);
  const { searchTerm, updateSearchTerm } = useDebounceSearch(300);
  const { user } = useAppSelector((state) => state.user);

  // const handlePrev = () =>
  //   setSelectedDate((prev) => dayjs(prev).subtract(1, "day").toDate());
  // const handleNext = () =>
  //   setSelectedDate((prev) => dayjs(prev).add(1, "day").toDate());

  // const formattedDate = dayjs(selectedDate).format("dddd MMMM D, YYYY");

  // Get user's display name
  const displayName = user ? `${user.firstName} ${user.lastName}` : "Guest";

  return (
    <div className="hidden lg:block bg-white w-full px-4 py-2 relative">
      <div className="flex items-center w-full">
        {/* Greeting and Search */}
        {/* Combined: Greeting + Search in ONE container */}
        <div className="flex items-center justify-between bg-white rounded-xl px-4 py-2 shadow-sm border-2 border-[#EDEDED] w-full">
          {/* Hello + Icon */}
          <div className="flex items-center w-60">
            <FaRegSun className="text-yellow-400 mr-2" />
            <span>Hello, {displayName}</span>
          </div>
          {/* Search Box - positioned on the right */}
          <div className="flex items-center bg-gray-100 px-3 py-[6px] rounded-md w-[40%] relative ml-auto">
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
                onClick={() => updateSearchTerm("")}
                className="absolute right-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear search"
              >
                <FaTimes className="text-xs" />
              </button>
            )}
          </div>
        </div>

        {/* Time Range Button */}
        {/* <div className="mt-2 lg:mt-0 border-2 border-[#EDEDED] rounded-4xl">
          <button className="border border-white text-cyan-600 px-4 py-2 rounded-full whitespace-nowrap transition">
            Open time – Close time
          </button>
        </div> */}
      </div>
      <br />
      <hr className="text-[#E5E5E5]" />

      {/* Bottom */}
      {/* <div className="mt-3  pt-2 text-right text-1xl text-gray-700  font-semibold ">
        <span className='hover:border-b-2 border-[#E5E5E5]'>Daily Entry</span>
        <span className="mx-2">|</span>
        <span className='hover:border-b-2 border-[#E5E5E5]'>Open New Day</span>
      </div> */}
    </div>
  );
};

export default TopBar;
