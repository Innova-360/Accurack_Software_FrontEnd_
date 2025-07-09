const InvoicePreview = () => {
    return (
        <>
            <div className="max-w-6xl mx-auto">
                {/* Success Message */}
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 print:hidden">
                    <div className="flex items-center">
                        <FaCheck className="text-green-600 mr-2" />
                        <span className="text-green-800 font-medium">Invoice generated successfully!</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200 print:hidden">
                    <button
                        onClick={() => setCurrentStep(3)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <FaArrowLeft size={16} />
                        Back to Edit
                    </button>
                    <div className="flex gap-3">
                        <SpecialButton
                            variant="secondary"
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            <FaPrint size={16} />
                            Print Invoice
                        </SpecialButton>
                        <SpecialButton
                            variant="primary"
                            onClick={handleBackToSales}
                            className="px-4 py-2 bg-[#03414C] hover:bg-[#025561] text-white"
                        >
                            Back to Sales
                        </SpecialButton>
                    </div>
                </div>

                {/* Invoice Preview - Customer Copy and Company Copy */}
                <div className="invoice-print space-y-12">
                    {/* Customer Copy */}
                    <div className="bg-white border-2 border-gray-800 p-6">
                        {/* Header with Blue Background */}
                        <div className="bg-blue-600 text-white text-center py-4 mb-6 -mx-6 -mt-6">
                            <h1 className="text-2xl font-bold tracking-wider">INVOICE</h1>
                        </div>

                        {/* Company and Invoice Info */}
                        <div className="grid grid-cols-2 gap-8 mb-8">
                            {/* Company Info */}
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-2">
                                    {invoiceResponse?.data?.business?.businessName || 'Your Company Name'}
                                </h2>
                                <div className="text-sm text-gray-700 space-y-1">
                                    <p>{invoiceResponse?.data?.business?.address || '89 Your Company Street, City, State, Country'}</p>
                                    <p>{invoiceResponse?.data?.business?.contactNo || '123-456-7890'}</p>
                                    <p>{invoiceResponse?.data?.customerMail || 'your@companyemail.com'}</p>
                                    <p>{invoiceResponse?.data?.business?.website || 'yourwebsite.com'}</p>
                                </div>
                            </div>

                            {/* Invoice Info */}
                            <div className="text-right">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="font-medium">Invoice No</span>
                                        <span>: {invoiceResponse?.data?.invoiceNumber?.split('-').pop()?.slice(-6) || '000001'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Account No</span>
                                        <span>: {invoiceResponse?.data?.customerId?.slice(-8) || '00002234'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Issue Date</span>
                                        <span>: {new Date(invoiceResponse?.data?.createdAt || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Due Date</span>
                                        <span>: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Billed To */}
                        <div className="mb-8">
                            <h3 className="font-bold text-gray-900 mb-2">Billed To</h3>
                            <div className="text-sm text-gray-700 space-y-1">
                                <p className="font-medium">{invoiceResponse?.data?.customerName || customerDetails.name}</p>
                                <p>{invoiceResponse?.data?.customerAddress || customerDetails.address}</p>
                                <p>{invoiceResponse?.data?.customerPhone || customerDetails.phone}</p>
                                <p>{invoiceResponse?.data?.customerMail || customerDetails.email}</p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <table className="w-full border-collapse mb-8">
                            <thead>
                                <tr className="bg-blue-600 text-white">
                                    <th className="border border-blue-600 px-4 py-3 text-left font-bold">Item Details</th>
                                    <th className="border border-blue-600 px-4 py-3 text-center font-bold w-20">Qty</th>
                                    <th className="border border-blue-600 px-4 py-3 text-center font-bold w-24">Unit Price</th>
                                    <th className="border border-blue-600 px-4 py-3 text-center font-bold w-24">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(invoiceResponse?.data?.sale?.saleItems || invoiceData.products).map((item: any, index: number) => (
                                    <tr key={item.id || index} className="border-b">
                                        <td className="border border-gray-300 px-4 py-3">
                                            <div className="font-medium text-gray-900">{item.productName || item.name}</div>
                                            <div className="text-sm text-gray-600">Your Product Detailed Description</div>
                                        </td>
                                        <td className="border border-gray-300 px-4 py-3 text-center">{item.quantity}</td>
                                        <td className="border border-gray-300 px-4 py-3 text-center">$ {(item.sellingPrice || item.price)?.toFixed(2)}</td>
                                        <td className="border border-gray-300 px-4 py-3 text-center">$ {(item.totalPrice || item.total)?.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Custom Fields */}
                        {invoiceResponse?.data?.customFields && invoiceResponse.data.customFields.length > 0 && (
                            <div className="mb-6">
                                <h4 className="font-medium text-gray-900 mb-2">Additional Information</h4>
                                <div className="text-sm space-y-1">
                                    {invoiceResponse.data.customFields.map((field: any) => (
                                        <div key={field.id} className="flex">
                                            <span className="font-medium w-32">{field.fieldName}:</span>
                                            <span>{field.fieldValue}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-80">
                                <div className="border border-gray-300">
                                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                                        <div className="flex justify-between font-bold">
                                            <span>Subtotal:</span>
                                            <span>$ {((invoiceResponse?.data?.totalAmount || invoiceData.finalTotal) - (invoiceResponse?.data?.tax || invoiceData.taxAmount)).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="px-4 py-2 border-b border-gray-300">
                                        <div className="flex justify-between">
                                            <span>Tax:</span>
                                            <span>$ {(invoiceResponse?.data?.tax || invoiceData.taxAmount).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="bg-blue-600 text-white px-4 py-3">
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Total:</span>
                                            <span>$ {(invoiceResponse?.data?.totalAmount || invoiceData.finalTotal).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Copy Label */}
                        <div className="text-center mt-8 font-bold text-sm border-t pt-4">CUSTOMER COPY</div>
                    </div>

                    {/* Page Break */}
                    <div className="page-break"></div>

                    {/* Company Copy */}
                    <div className="bg-white border-2 border-gray-800 p-6">
                        {/* Header with Blue Background */}
                        <div className="bg-blue-600 text-white text-center py-4 mb-6 -mx-6 -mt-6">
                            <h1 className="text-2xl font-bold tracking-wider">INVOICE</h1>
                        </div>

                        {/* Company and Invoice Info */}
                        <div className="grid grid-cols-2 gap-8 mb-8">
                            {/* Company Info */}
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-2">
                                    {invoiceResponse?.data?.business?.businessName || 'Your Company Name'}
                                </h2>
                                <div className="text-sm text-gray-700 space-y-1">
                                    <p>{invoiceResponse?.data?.business?.address || '89 Your Company Street, City, State, Country'}</p>
                                    <p>{invoiceResponse?.data?.business?.contactNo || '123-456-7890'}</p>
                                    <p>{invoiceResponse?.data?.customerMail || 'your@companyemail.com'}</p>
                                    <p>{invoiceResponse?.data?.business?.website || 'yourwebsite.com'}</p>
                                </div>
                            </div>

                            {/* Invoice Info */}
                            <div className="text-right">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="font-medium">Invoice No</span>
                                        <span>: {invoiceResponse?.data?.invoiceNumber?.split('-').pop()?.slice(-6) || '000001'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Account No</span>
                                        <span>: {invoiceResponse?.data?.customerId?.slice(-8) || '00002234'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Issue Date</span>
                                        <span>: {new Date(invoiceResponse?.data?.createdAt || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Due Date</span>
                                        <span>: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Billed To */}
                        <div className="mb-8">
                            <h3 className="font-bold text-gray-900 mb-2">Billed To</h3>
                            <div className="text-sm text-gray-700 space-y-1">
                                <p className="font-medium">{invoiceResponse?.data?.customerName || customerDetails.name}</p>
                                <p>{invoiceResponse?.data?.customerAddress || customerDetails.address}</p>
                                <p>{invoiceResponse?.data?.customerPhone || customerDetails.phone}</p>
                                <p>{invoiceResponse?.data?.customerMail || customerDetails.email}</p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <table className="w-full border-collapse mb-8">
                            <thead>
                                <tr className="bg-blue-600 text-white">
                                    <th className="border border-blue-600 px-4 py-3 text-left font-bold">Item Details</th>
                                    <th className="border border-blue-600 px-4 py-3 text-center font-bold w-20">Qty</th>
                                    <th className="border border-blue-600 px-4 py-3 text-center font-bold w-24">Unit Price</th>
                                    <th className="border border-blue-600 px-4 py-3 text-center font-bold w-24">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(invoiceResponse?.data?.sale?.saleItems || invoiceData.products).map((item: any, index: number) => (
                                    <tr key={item.id || index} className="border-b">
                                        <td className="border border-gray-300 px-4 py-3">
                                            <div className="font-medium text-gray-900">{item.productName || item.name}</div>
                                            <div className="text-sm text-gray-600">Your Product Detailed Description</div>
                                        </td>
                                        <td className="border border-gray-300 px-4 py-3 text-center">{item.quantity}</td>
                                        <td className="border border-gray-300 px-4 py-3 text-center">$ {(item.sellingPrice || item.price)?.toFixed(2)}</td>
                                        <td className="border border-gray-300 px-4 py-3 text-center">$ {(item.totalPrice || item.total)?.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Custom Fields */}
                        {invoiceResponse?.data?.customFields && invoiceResponse.data.customFields.length > 0 && (
                            <div className="mb-6">
                                <h4 className="font-medium text-gray-900 mb-2">Additional Information</h4>
                                <div className="text-sm space-y-1">
                                    {invoiceResponse.data.customFields.map((field: any) => (
                                        <div key={field.id} className="flex">
                                            <span className="font-medium w-32">{field.fieldName}:</span>
                                            <span>{field.fieldValue}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-80">
                                <div className="border border-gray-300">
                                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                                        <div className="flex justify-between font-bold">
                                            <span>Subtotal:</span>
                                            <span>$ {((invoiceResponse?.data?.totalAmount || invoiceData.finalTotal) - (invoiceResponse?.data?.tax || invoiceData.taxAmount)).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="px-4 py-2 border-b border-gray-300">
                                        <div className="flex justify-between">
                                            <span>Tax:</span>
                                            <span>$ {(invoiceResponse?.data?.tax || invoiceData.taxAmount).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="bg-blue-600 text-white px-4 py-3">
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Total:</span>
                                            <span>$ {(invoiceResponse?.data?.totalAmount || invoiceData.finalTotal).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Copy Label */}
                        <div className="text-center mt-8 font-bold text-sm border-t pt-4">COMPANY COPY</div>
                    </div>
                </div>
            </div>
        </>
    )

}

export default InvoicePreview;