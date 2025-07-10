import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, DollarSign, User, FileText } from 'lucide-react';
// import { SpecialButton } from '../../components/buttons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
// import type { InvoiceResponseData } from "../../types/invoice";
import { fetchInvoices } from '../../store/slices/invoiceSlice';
import { useParams } from 'react-router-dom';
import Header from "../../components/Header";


const Invoices: React.FC = () => {
    const dispatch = useAppDispatch();
    const { invoices, loading } = useAppSelector((state) => state.invoices);
    console.log('Invoices:', invoices);
    const { data } = invoices

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('');
    const { id } = useParams();

    // Mock data for demonstration - replace with actual API call
    useEffect(() => {
        dispatch(fetchInvoices({ storeId: id }));
    }, [dispatch, id]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const filteredInvoices = (data ?? []).filter(invoice => {
        const matchesSearch =
            invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.businessName?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || invoice.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // const handleViewInvoice = (invoiceId: string) => {
    //     // Navigate to invoice details or open modal
    //     console.log('View invoice:', invoiceId);
    // };

    // const handleDownloadInvoice = (invoiceId: string) => {
    //     // Download invoice PDF
    //     console.log('Download invoice:', invoiceId);
    // };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50 p-4">
                <div className='max-w-7xl mx-auto'>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                    <FileText className="w-8 h-8 text-blue-600" />
                                    Invoices
                                </h1>
                                <p className="text-gray-600 mt-1">Manage and track all your invoices</p>
                            </div>
                            <div className="mt-4 md:mt-0 flex items-center gap-3">
                                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                                    <span className="text-blue-600 font-semibold">{filteredInvoices.length}</span>
                                    <span className="text-blue-500 ml-1">Total Invoices</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search invoices, customers, or businesses..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <select
                                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>

                            {/* Date Filter */}
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="date"
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Invoices Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Invoice Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Business
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th> */}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredInvoices.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-gray-50 transition-colors duration-150">
                                            {/* Invoice Details */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {/* {invoice.logoUrl ? (
                                                    <img
                                                        src={invoice.logoUrl}
                                                        alt="Business Logo"
                                                        className="w-10 h-10 rounded-lg object-cover border border-gray-200 mr-3"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                                        <Building2 className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                )} */}
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {invoice.invoiceNumber}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {invoice.paymentMethod}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Customer */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                                        <User className="w-4 h-4 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {invoice.customerName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {invoice.customerPhone}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Business */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {invoice.businessName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Cashier: {invoice.cashierName}
                                                </div>
                                            </td>

                                            {/* Amount */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                                        <DollarSign className="w-4 h-4 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900">
                                                            {formatCurrency(invoice.totalAmount)}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            Tax: {formatCurrency(invoice.tax)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                                                        invoice.status
                                                    )}`}
                                                >
                                                    {invoice.status}
                                                </span>
                                            </td>

                                            {/* Date */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(invoice.createdAt)}
                                            </td>

                                            {/* Actions 
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <SpecialButton
                                                variant="secondary"
                                                onClick={() => handleViewInvoice(invoice.id)}
                                                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </SpecialButton>
                                        </td>
                                        */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Empty State */}
                    {filteredInvoices.length === 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices found</h3>
                            <p className="text-gray-600 mb-6">
                                {searchTerm || statusFilter !== 'ALL'
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'Get started by creating your first invoice'}
                            </p>
                        </div>
                    )}
                </div>

            </div>

        </>
    );
};

export default Invoices;