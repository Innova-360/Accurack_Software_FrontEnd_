// import {useState }from "react";
import Pencil from "/edit.png"
import Trash from "/bin.png"
import Copy from "/eye.png"
import Navbar from "../../components/Header";
import { ChevronDown, Plus } from 'lucide-react';
import { Link } from "react-router-dom";

const Tax = () => {
    const taxes = [
        {
            name: "VAT",
            description: "Value Added Tax",
            rate: "7.5%",
            type: "Percentage",
            status: "Active",
            assigned: "All Products",
            date: "Jun 12, 2023",
            time: "10:23 AM"
        },
        {
            name: "Luxury Duty",
            description: "Special tax for luxury items",
            rate: "$100.00",
            type: "Fixed",
            status: "Active",
            assigned: "Luxury Category",
            date: "May 28, 2023",
            time: "3:45 PM"
        },
        {
            name: "State Tax",
            description: "State-specific tax",
            rate: "4.25%",
            type: "Percentage",
            status: "Active",
            assigned: "Downtown Store, Mall Store",
            date: "Jun 5, 2023",
            time: "9:10 AM"
        },
        {
            name: "Environmental Fee",
            description: "Recycling fee",
            rate: "$5.00",
            type: "Fixed",
            status: "Inactive",
            assigned: "Electronics",
            date: "Apr 18, 2023",
            time: "2:30 PM"
        },
        {
            name: "Import Duty",
            description: "Tax on imported goods",
            rate: "2.5%",
            type: "Percentage",
            status: "Active",
            assigned: "Imported Goods",
            date: "Jun 10, 2023",
            time: "11:15 AM"
        },
        {
            name: "Special Tax",
            description: "Holiday season tax",
            rate: "1.75%",
            type: "Percentage",
            status: "Inactive",
            assigned: "Seasonal, Gift items",
            date: "May 15, 2023",
            time: "4:20 PM"
        }
    ];


    return (
        <>
            <Navbar />
            <div className="m-15  rounded-xl">
                <div className="pb-8">
                    <h2 className="text-xl font-semibold ">Tax Management</h2>
                    <p>Manage tax rates and assignments for your inventory</p>
                </div>

                <div className="overflow-x-auto border-[#E5E7EB] border-2 rounded-3xl">
                    <div className="p-8 flex">
                        <div className="w-1/2">
                            <div className="relative">
                                <img src="/search.png" alt="" className="absolute top-1/2 left-[10px] transform -translate-y-1/2 w-5" />
                                <input type="text" placeholder="Search Tax Name.." className="w-3/4 border-[#E5E7EB] border-2 p-3 rounded-xl pl-12" />
                            </div>

                        </div>
                        <div className="w-1/2 flex items-center gap-x-4 justify-end">
                            {/* Type Drop down */}
                            <div className="relative inline-block w-42">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                                <select
                                    className="block w-full pl-3 pr-4 py-2 text-sm border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Type: ALL </option>
                                    <option value="option1">Option One</option>
                                    <option value="option2">Option Two</option>
                                    <option value="option3">Option Three</option>
                                </select>
                            </div>
                            {/* Status Dropdpwn */}
                            <div className="relative inline-block w-42">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                                <select
                                    className="block w-full pl-3 pr-4 py-2 text-sm border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Status: ALL </option>
                                    <option value="option1">Option One</option>
                                    <option value="option2">Option Two</option>
                                    <option value="option3">Option Three</option>
                                </select>
                            </div>
                            <button className=" bg-[#043E49] py-2 px-3 text-white rounded-xl pr-4" >
                                <Link to='/add-tax' className="flex items-center gap-x-3">
                                    <Plus />
                                    Add  New Tax
                                </Link>

                            </button>

                        </div>
                    </div>
                    <table className="min-w-full table-auto  border-collapse border-none divide-none">
                        <thead className="bg-gray-100 text-gray-700 text-sm font-medium">
                            <tr>
                                <th className="px-4 py-3 text-left ">Tax Name</th>
                                <th className="px-4 py-3 text-left ">Rate</th>
                                <th className="px-4 py-3 text-left ">Type</th>
                                <th className="px-4 py-3 text-left ">Status</th>
                                <th className="px-4 py-3 text-left ">Assigned To</th>
                                <th className="px-4 py-3 text-left ">Last Updated</th>
                                <th className="px-4 py-3 text-center ">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-700">
                            {taxes.map((tax, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 ">
                                        <div className="font-medium">{tax.name}</div>
                                        <div className="text-gray-500 text-xs">{tax.description}</div>
                                    </td>
                                    <td className="px-4 py-3 ">{tax.rate}</td>
                                    <td className="px-4 py-3 ">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tax.type === 'Percentage' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                                            }`}>
                                            {tax.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 ">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tax.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600'
                                            }`}>
                                            {tax.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3  whitespace-pre-line"><span className="bg-[#E5E7EB] rounded-2xl py-1 px-2 text-xs">{tax.assigned}</span></td>
                                    <td className="px-4 py-3 ">
                                        <div>{tax.date}</div>
                                        <div className="text-xs text-gray-400">{tax.time}</div>
                                    </td>
                                    <td className="px-4 py-3  text-center space-x-2">
                                        <button className="text-gray-500 hover:text-blue-600" title="Copy">
                                            <img src={Copy} alt="" />
                                        </button>
                                        <button className="text-gray-500 hover:text-yellow-600" title="Edit">
                                            <img src={Pencil} alt="" />
                                        </button>
                                        <button className="text-gray-500 hover:text-red-600" title="Delete">
                                            <img src={Trash} alt="" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex items-center justify-between px-4 py-4 border-t text-sm  border-[#E5E7EB]">
                        {/* Left: Entry Count */}
                        <div>
                            Showing <span className="font-medium">1</span> to <span className="font-medium">6</span> of <span className="font-medium">12</span> entries
                        </div>

                        {/* Right: Pagination Controls */}
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-600">Rows per page:</span>
                            <select className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500">
                                <option value="6">6</option>
                                <option value="10">10</option>
                                <option value="25">25</option>
                            </select>

                            {/* Pagination buttons */}
                            <button className="px-2 py-1 border rounded-md text-gray-500 hover:bg-gray-100">&lt;</button>
                            <button className="px-3 py-1 rounded-md text-white bg-teal-900 shadow">1</button>
                            <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-100">2</button>
                            <button className="px-2 py-1 border rounded-md text-gray-500 hover:bg-gray-100">&gt;</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Tax;
