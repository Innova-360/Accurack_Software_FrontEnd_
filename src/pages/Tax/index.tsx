import { useState, useMemo } from "react";
import Pencil from "/edit.png"
import Trash from "/bin.png"
import Copy from "/eye.png"
import Navbar from "../../components/Header";
import { ChevronDown, Plus } from 'lucide-react';
// import { Link } from "react-router-dom";
import { useParams, useNavigate } from 'react-router-dom'
import { useGetTaxRatesQuery } from '../../store/slices/taxSlice';
import Loading from "../../components/Loading";




interface TaxItem {
    id: string;
    name: string;
    description: string;
    rate: string;
    type: string;
    status: string;
    assigned: string;
    date: string;
    time: string;
    region?: string;
    taxCode?: string;
    assignments?: number;
}

// Define a type for the taxRate object from API
interface TaxRateApi {
    id: string;
    taxType?: {
        name?: string;
        description?: string;
    };
    rate: number;
    rateType: 'PERCENTAGE' | 'FIXED';
    createdAt: string;
    region?: {
        name?: string;
    };
    taxCode?: {
        code?: string;
    };
    assignments?: Assignment[]; // Assuming assignments is an array of Assignment objects
}

 interface Assignment {
  id: string;                 
  entityId: string;           
  entityType: 'STORE' | 'PRODUCT' | 'USER';     
  assignedAt: string;         
  entity: string | null;         
}

const Tax = () => {
    const { data: taxRatesData, isLoading, error } = useGetTaxRatesQuery();
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');


    // Transform API data to match component structure, memoized
    const allTaxes = useMemo<TaxItem[]>(() => {
        return (
            taxRatesData?.data?.map((taxRate: TaxRateApi) => ({
                id: taxRate.id,
                name: taxRate.taxType?.name || 'Unknown',
                description: taxRate.taxType?.description || 'No description',
                rate: taxRate.rateType === 'PERCENTAGE' ? `${(taxRate.rate * 100).toFixed(2)}%` : `$${taxRate.rate.toFixed(2)}`,
                type: taxRate.rateType === 'PERCENTAGE' ? 'Percentage' : 'Fixed',
                status: 'Active', // API doesn't provide status, defaulting to Active
                assigned: 'Not Assigned', // Placeholder until assignment data is available
                date: new Date(taxRate.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                }),
                time: new Date(taxRate.createdAt).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }),
                region: taxRate.region?.name,
                taxCode: taxRate.taxCode?.code,
                assignments: taxRate.assignments ? taxRate.assignments.length : 0
            })) || []
        );
    }, [taxRatesData]);


    // Filter and search logic
    const taxes = useMemo(() => {
        return allTaxes.filter(tax => {
            const matchesSearch = searchTerm === '' ||
                tax.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tax.description.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesType = typeFilter === '' || tax.type === typeFilter;
            const matchesStatus = statusFilter === '' || tax.status === statusFilter;

            return matchesSearch && matchesType && matchesStatus;
        });
    }, [allTaxes, searchTerm, typeFilter, statusFilter]);

    const { id } = useParams(); // gets store ID from the URL
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/store/${id}/add-tax`);
    };

    if (isLoading) {
        return (
            <>
                <Navbar />
                <Loading label="Tax Rates" />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-lg text-red-600">Error loading tax rates</div>
                </div>
            </>
        );
    }


    return (
        <>
            <Navbar />
            <div className="mx-4 lg:mx-15 my-4 lg:my-15 rounded-xl">
                <div className="pb-8">
                    <h2 className="text-xl font-semibold ">Tax Management</h2>
                    <p>Manage tax rates and assignments for your inventory</p>
                </div>

                <div className="overflow-x-auto border-[#E5E7EB] border-2 rounded-3xl">
                    <div className="p-4 lg:p-8 flex flex-col md:flex-row gap-4 items-center">
                        <div className="w-full md:w-1/2">
                            <div className="relative">
                                <img src="/search.png" alt="" className="absolute top-1/2 left-[10px] transform -translate-y-1/2 w-5" />
                                <input
                                    type="text"
                                    placeholder="Search Tax Name.."
                                    className="w-full md:w-3/4 border-[#E5E7EB] border-2 p-3 rounded-xl pl-12"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                        </div>
                        <div className="w-full md:w-1/2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-x-4 justify-end">
                            {/* Type Drop down */}
                            <div className="relative inline-block w-full sm:w-42">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                                <select
                                    className="block w-full pl-3 pr-4 py-2 text-sm border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                >
                                    <option value="">Type: ALL</option>
                                    <option value="Percentage">Percentage</option>
                                    <option value="Fixed">Fixed</option>
                                </select>
                            </div>
                            {/* Status Dropdpwn */}
                            <div className="relative inline-block w-full sm:w-42">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                                <select
                                    className="block w-full pl-3 pr-4 py-2 text-sm border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">Status: ALL</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <button className="w-full sm:w-auto bg-[#043E49] py-2 px-3 text-white rounded-xl pr-4 flex items-center justify-center gap-x-3" onClick={handleClick}>

                                <Plus />
                                Add  New Tax


                            </button>

                        </div>
                    </div>
                    {/* Desktop Table */}
                    <div className="hidden md:block">
                        <table className="min-w-full table-auto border-collapse border-none divide-none">
                            <thead className="bg-gray-100 text-gray-700 text-sm font-medium">
                                <tr>
                                    <th className="px-4 py-3 text-left">Tax Name</th>
                                    <th className="px-4 py-3 text-left">Rate</th>
                                    <th className="px-4 py-3 text-left">Type</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">Assigned To</th>
                                    <th className="px-4 py-3 text-left">Last Updated</th>
                                    {/* <th className="px-4 py-3 text-center">Actions</th> */}
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-700">


                                {taxes.map((tax: TaxItem, idx: number) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{tax.name}</div>
                                            <div className="text-gray-500 text-xs">{tax.description}</div>
                                        </td>
                                        <td className="px-4 py-3">{tax.rate}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tax.type === 'Percentage' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                                                }`}>
                                                {tax.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tax.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                {tax.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-pre-line"><span className="bg-[#E5E7EB] rounded-2xl py-1 px-2 text-xs">Assigned to {tax.assignments}</span></td>
                                        <td className="px-4 py-3">
                                            <div>{tax.date}</div>
                                            <div className="text-xs text-gray-400">{tax.time}</div>
                                        </td>
                                        {/* <td className="px-4 py-3 text-center space-x-2">
                                            <button className="text-gray-500 hover:text-blue-600" title="Copy">
                                                <img src={Copy} alt="" />
                                            </button>
                                            <button className="text-gray-500 hover:text-yellow-600" title="Edit">
                                                <img src={Pencil} alt="" />
                                            </button>
                                            <button className="text-gray-500 hover:text-red-600" title="Delete">
                                                <img src={Trash} alt="" />
                                            </button>
                                        </td> */}
                                    </tr>
                                ))}
                            </tbody>
                            {
                                taxes.length === 0 && (
                                    <tbody>
                                        <tr>
                                            <td colSpan={7} className="text-center py-4 text-gray-500">
                                                No tax rates found
                                            </td>
                                        </tr>
                                    </tbody>
                                )
                            }
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="block md:hidden">
                        {taxes.map((tax, idx: number) => (
                            <div key={idx} className="bg-white border-b border-gray-200 p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="font-medium text-base">{tax.name}</div>
                                        <div className="text-gray-500 text-sm">{tax.description}</div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button className="text-gray-500 hover:text-blue-600" title="Copy">
                                            <img src={Copy} alt="" className="w-4 h-4" />
                                        </button>
                                        <button className="text-gray-500 hover:text-yellow-600" title="Edit">
                                            <img src={Pencil} alt="" className="w-4 h-4" />
                                        </button>
                                        <button className="text-gray-500 hover:text-red-600" title="Delete">
                                            <img src={Trash} alt="" className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-500">Rate:</span>
                                        <div className="font-medium">{tax.rate}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Type:</span>
                                        <div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tax.type === 'Percentage' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                                                }`}>
                                                {tax.type}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Status:</span>
                                        <div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tax.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                {tax.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Updated:</span>
                                        <div className="text-xs">
                                            <div>{tax.date}</div>
                                            <div className="text-gray-400">{tax.time}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <span className="text-gray-500 text-sm">Assigned To:</span>
                                    <div className="mt-1">
                                        <span className="bg-[#E5E7EB] rounded-2xl py-1 px-2 text-xs">{tax.assigned}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Tax;
