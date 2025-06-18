import { FaStumbleuponCircle } from 'react-icons/fa';

const EmployeeForm = () => {
  return (
    <div className=''>
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 max-w-5xl mx-auto mt-10">
      <h1 className="text-2xl font-bold text-[#03414C] mb-6">Create Your Store </h1>

      <div className="border-b border-[#d8d2d2] pb-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Store Name</label>
            <input type="text" placeholder="Enter your full name" className="w-full border rounded-md px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Store email:</label>
            <input type="text" placeholder="Enter your ID" className="w-full border rounded-md px-3 py-2" />
          </div>

          {/* <div>
            <label className="block text-sm font-medium mb-1">Select your Industry</label>
            <select className="w-full border rounded-md px-3 py-2">
              <option>Retail</option>
              <option>WearHouse</option>
            </select>
          </div> */}


          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input type="text" placeholder="Enter your Phone Number" className="w-full border rounded-md px-3 py-2" />
          </div>
        </div>
          <div>
            <label className="block text-sm font-medium mb-1">Store Password</label>
            <input type="Password" placeholder="Enter your Password" className="w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input type="Password" placeholder="Enter your Password" className="w-full border rounded-md px-3 py-2" />
          </div>

        {/* Right Side Permissions */}
        
      </div>

      {/* Other Details Section */}
      <div>
       
        

        <button className="flex items-center justify-center gap-2 bg-[#03414C] text-white font-medium px-6 py-2 rounded-md">
          <FaStumbleuponCircle className="text-sm" /> Create Store
        </button>
      </div>
    </div>
    </div>
  );
};

export default EmployeeForm;
