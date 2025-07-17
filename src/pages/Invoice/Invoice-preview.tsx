import { FaPlus, FaPrint, FaTrash } from "react-icons/fa";
import { SpecialButton } from "../../components/buttons";
import Header from "../../components/Header";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import apiClient from "../../services/api";
import toast from "react-hot-toast";
import { QRCodeSVG } from "qrcode.react";

// QR Code wrapper component to handle errors gracefully
const SafeQRCode = ({ value, ...props }: any) => {
    try {
        if (!value || value.trim() === '') return null;
        return <QRCodeSVG value={value} {...props} />;
    } catch (error) {
        console.warn('QR Code generation failed for value:', value);
        return <span className="text-xs text-gray-500">Invalid QR code</span>;
    }
};

const InvoicePreview = () => {
    const [customFields, setCustomFields] = useState([{ name: "", value: "" }]);
    const [businessDetails, setBusinessDetails] = useState<any>(null);
    const [loadingBusinessDetails, setLoadingBusinessDetails] = useState(true);
    const location = useLocation();
    const { saleData } = location.state || {};

    console.log('Sale Data:', saleData);

    // Fetch business details
    useEffect(() => {
        const fetchBusinessDetails = async () => {
            try {
                setLoadingBusinessDetails(true);
                const response = await apiClient.get("/invoice/get-business/details");
                if (response.data && !response.data.showBusinessForm) {
                    setBusinessDetails(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching business details:", error);
                toast.error("Failed to load business details");
            } finally {
                setLoadingBusinessDetails(false);
            }
        };

        fetchBusinessDetails();
    }, []);

    if (!saleData) {
        return (
            <>
                <Header />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-gray-900">No sale data found</h2>
                        <p className="text-gray-600 mt-2">Please navigate from the sales page to view invoice.</p>
                    </div>
                </div>
            </>
        );
    }

    if (loadingBusinessDetails) {
        return (
            <>
                <Header />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-gray-900">Loading invoice...</h2>
                        <div className="mt-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#03414C] mx-auto"></div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 print:px-0 print:py-0">
                <div className=" p-6">
                    <div className="flex justify-end items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200 print:hidden">
                        <div className="flex gap-3">
                            <SpecialButton
                                variant="secondary"
                                // onClick={handleCreateSaleAndInvoice}
                                className="flex items-center gap-2  py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                <FaPrint size={16} />
                                Generate Invoice
                            </SpecialButton>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 print:hidden">
                        <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                        <div className="space-y-3">
                            {customFields.map((field, index) => (
                                <div key={index} className="flex gap-3 items-center">
                                    <input
                                        type="text"
                                        placeholder="Field Name"
                                        value={field.name}
                                        onChange={(e) => {
                                            const newFields = [...customFields];
                                            newFields[index].name = e.target.value;
                                            setCustomFields(newFields);
                                        }}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03414C] focus:border-[#03414C]"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Field Value"
                                        value={field.value}
                                        onChange={(e) => {
                                            const newFields = [...customFields];
                                            newFields[index].value = e.target.value;
                                            setCustomFields(newFields);
                                        }}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03414C] focus:border-[#03414C]"
                                    />
                                    {customFields.length > 1 && (
                                        <button
                                            onClick={() => {
                                                const newFields = customFields.filter(
                                                    (_, i) => i !== index
                                                );
                                                setCustomFields(newFields);
                                            }}
                                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <FaTrash size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() =>
                                setCustomFields([...customFields, { name: "", value: "" }])
                            }
                            className="mt-3 flex items-center gap-2 px-4 py-2 text-[#03414C] hover:bg-[#03414C]/10 border border-[#03414C] rounded-lg transition-colors"
                        >
                            <FaPlus size={14} />
                            Add Custom Field
                        </button>
                    </div>

                    <h3 className="text-2xl my-6">Customer Copy</h3>
                    <div
                        className="invoice-print bg-white px-6 py-7 shadow-lg border border-gray-200"
                        style={{
                            fontFamily: "'Courier New', Courier, monospace",
                            backgroundColor: "#ffffff",
                            color: "#000000",
                            borderColor: "#e5e7eb",
                        }}
                    >
                        <div
                            className="border-t-4 border-black pb-4"
                            style={{
                                borderTopColor: "#03414C",
                                borderTopWidth: "4px",
                                borderTopStyle: "solid",
                            }}
                        >
                            {businessDetails?.logoUrl && (
                                <img
                                    src={businessDetails.logoUrl}
                                    alt="Business Logo"
                                    className="invoice-logo h-28 w-auto pt-5"
                                />
                            )}
                        </div>

                        <div className="flex justify-between mb-6">
                            <div>
                                <h2 className="font-semibold">
                                    {businessDetails?.businessName || businessDetails?.companyName || "Business Name"}
                                </h2>
                                <p>{businessDetails?.address || businessDetails?.companyAddress || ""}</p>
                                <p>{businessDetails?.contactNo || businessDetails?.companyPhone || ""}</p>
                                <p>{businessDetails?.website || businessDetails?.companyWebsite || ""}</p>
                            </div>

                            <div className="text-right text-sm space-y-1">
                                <p>
                                    <strong>Invoice No:</strong>{" "}
                                    {saleData.id?.slice(-6) || "000001"}
                                </p>
                                <p>
                                    <strong>Account No:</strong>{" "}
                                    {saleData.customerId?.slice(-8) || "00002234"}
                                </p>
                                <p>
                                    <strong>Issue Date:</strong>{" "}
                                    {new Date(saleData.createdAt).toLocaleDateString()}
                                </p>
                                <p>
                                    <strong>Due Date:</strong>{" "}
                                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-between mb-6">
                            <div className="mb-6 w-1/2">
                                <h3 className="font-semibold">Billed To</h3>
                                <p>{saleData.customer?.customerName || "Customer Name"}</p>
                                <p>{saleData.customer?.phoneNumber || "Phone Number"}</p>
                                {saleData.customer?.customerAddress && (
                                    <p>{saleData.customer.customerAddress}</p>
                                )}
                                {saleData.customer?.customerMail && (
                                    <p>{saleData.customer.customerMail}</p>
                                )}
                            </div>
                            {customFields.filter((f) => f.name && f.value).length > 0 && (
                                <div className="mb-6 w-1/2">
                                    <div className="space-y-2">
                                        {customFields
                                            .filter((f) => f.name && f.value)
                                            .map((field, idx) => (
                                                <div key={idx} className="flex justify-end gap-x-4 text-sm">
                                                    <span className="font-medium">
                                                        <strong>{field.name}:</strong>
                                                    </span>
                                                    <span>{field.value}</span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t-2 border-b-2 border-black py-2 font-semibold flex text-sm">
                            <div className="w-2/5">Item Details</div>
                            <div className="w-1/5 text-center">QR Code</div>
                            <div className="w-1/6 text-center">Qty</div>
                            <div className="w-1/6 text-center">Unit </div>
                            {saleData.saleItems?.[0]?.packType === 'BOX' && (
                                <div className="w-1/6 text-center">Box Size</div>
                            )}
                            <div className="w-1/6 text-center">MSRP Price</div>
                            <div className="w-1/6 text-center">Unit Price</div>
                            <div className="w-1/6 text-right">Extended Price</div>
                        </div>

                        {saleData.saleItems?.map((item: any, idx: number) => (
                            <div
                                key={item.id || idx}
                                className="flex py-4 border-b border-gray-200 text-sm items-center"
                            >
                                <div className="w-2/5">
                                    <p className="font-semibold">{item.productName}</p>
                                    {item.pluUpc && (
                                        <p className="text-xs text-gray-600">PLU/UPC: {item.pluUpc}</p>
                                    )}
                                </div>
                                <div className="w-1/5 text-center">
                                    {item.pluUpc && (
                                        <div className="flex justify-center">
                                            <SafeQRCode
                                                value={`Name:${item.productName}|PLU:${item.pluUpc}`}
                                                size={60}
                                                bgColor="transparent"
                                                fgColor="#000000"
                                                level="M"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="w-1/6 text-center">{item.quantity}</div>
                                <div className="w-1/6 text-center">{item.packType === 'ITEM' ? 'Item' : 'Box'}</div>
                                {item.packType === 'BOX' && <div className="w-1/6 text-center">{item.packQuantity}</div>}
                                <div className="w-1/6 text-center">{item.product.msrpPrice || '-'}</div>
                                <div className="w-1/6 text-center">
                                    ${item.sellingPrice?.toFixed(2)}
                                </div>
                                <div className="w-1/6 text-right font-bold">
                                    ${item.totalPrice?.toFixed(2)}
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-end mt-6 text-sm">
                            <div className="w-64 space-y-2">
                                <div className="flex justify-between">
                                    <span className="font-medium">Subtotal:</span>
                                    <span>
                                        ${(saleData.totalAmount - saleData.tax).toFixed(2)}
                                    </span>
                                </div>
                                {saleData.allowance > 0 && (
                                    <div className="flex justify-between">
                                        <span className="font-medium">Allowance:</span>
                                        <span>
                                            ${saleData.allowance.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="font-medium">Tax:</span>
                                    <span>
                                        ${saleData.tax.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t pt-2 border-gray-300">
                                    <span>Total:</span>
                                    <span>
                                        ${saleData.totalAmount.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-2xl my-6">Company Copy</h3>
                    <div
                        className="invoice-print bg-white px-6 py-7 shadow-lg border border-gray-200"
                        style={{
                            fontFamily: "'Courier New', Courier, monospace",
                            backgroundColor: "#ffffff",
                            color: "#000000",
                            borderColor: "#e5e7eb",
                        }}
                    >
                        <div
                            className="border-t-4 border-black pb-4"
                            style={{
                                borderTopColor: "#03414C",
                                borderTopWidth: "4px",
                                borderTopStyle: "solid",
                            }}
                        >
                            {businessDetails?.logoUrl && (
                                <img
                                    src={businessDetails.logoUrl}
                                    alt="Business Logo"
                                    className="invoice-logo h-28 w-auto pt-5"
                                />
                            )}
                        </div>

                        <div className="flex justify-between mb-6">
                            <div>
                                <h2 className="font-semibold">
                                    {businessDetails?.businessName || businessDetails?.companyName || "Business Name"}
                                </h2>
                                <p>{businessDetails?.address || businessDetails?.companyAddress || ""}</p>
                                <p>{businessDetails?.contactNo || businessDetails?.companyPhone || ""}</p>
                                <p>{businessDetails?.website || businessDetails?.companyWebsite || ""}</p>
                            </div>

                            <div className="text-right text-sm space-y-1">
                                <p>
                                    <strong>Invoice No:</strong>{" "}
                                    {saleData.id?.slice(-6) || "000001"}
                                </p>
                                <p>
                                    <strong>Account No:</strong>{" "}
                                    {saleData.customerId?.slice(-8) || "00002234"}
                                </p>
                                <p>
                                    <strong>Issue Date:</strong>{" "}
                                    {new Date(saleData.createdAt).toLocaleDateString()}
                                </p>
                                <p>
                                    <strong>Due Date:</strong>{" "}
                                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-between mb-6">
                            <div className="mb-6 w-1/2">
                                <h3 className="font-semibold">Billed To</h3>
                                <p>{saleData.customer?.customerName || "Customer Name"}</p>
                                <p>{saleData.customer?.phoneNumber || "Phone Number"}</p>
                                {saleData.customer?.customerAddress && (
                                    <p>{saleData.customer.customerAddress}</p>
                                )}
                                {saleData.customer?.customerMail && (
                                    <p>{saleData.customer.customerMail}</p>
                                )}
                            </div>
                            {customFields.filter((f) => f.name && f.value).length > 0 && (
                                <div className="mb-6 w-1/2">
                                    <div className="space-y-2">
                                        {customFields
                                            .filter((f) => f.name && f.value)
                                            .map((field, idx) => (
                                                <div key={idx} className="flex justify-end gap-x-4 text-sm">
                                                    <span className="font-medium">
                                                        <strong>{field.name}:</strong>
                                                    </span>
                                                    <span>{field.value}</span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t-2 border-b-2 border-black py-2 font-semibold flex text-sm">
                            <div className="w-2/5">Item Details</div>
                            <div className="w-1/5 text-center">QR Code</div>
                            <div className="w-1/6 text-center">Qty</div>
                            <div className="w-1/6 text-center">Unit </div>
                            {saleData.saleItems?.[0]?.packType === 'BOX' && (
                                <div className="w-1/6 text-center">Box Size</div>
                            )}
                            <div className="w-1/6 text-center">MSRP Price</div>
                            <div className="w-1/6 text-center">Unit Price</div>
                            <div className="w-1/6 text-right">Extended Price</div>
                        </div>

                        {saleData.saleItems?.map((item: any, idx: number) => (
                            <div
                                key={item.id || idx}
                                className="flex py-4 border-b border-gray-200 text-sm items-center"
                            >
                                <div className="w-2/5">
                                    <p className="font-semibold">{item.productName}</p>
                                    {item.pluUpc && (
                                        <p className="text-xs text-gray-600">PLU/UPC: {item.pluUpc}</p>
                                    )}
                                </div>
                                <div className="w-1/5 text-center">
                                    {item.pluUpc && (
                                        <div className="flex justify-center">
                                            <SafeQRCode
                                                value={`Name:${item.productName}|PLU:${item.pluUpc}`}
                                                size={60}
                                                bgColor="transparent"
                                                fgColor="#000000"
                                                level="M"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="w-1/6 text-center">{item.quantity}</div>
                                <div className="w-1/6 text-center">{item.packType === 'ITEM' ? 'Item' : 'Box'}</div>
                                {item.packType === 'BOX' && <div className="w-1/6 text-center">{item.packQuantity}</div>}
                                <div className="w-1/6 text-center">{item.product.msrpPrice || '-'}</div>
                                <div className="w-1/6 text-center">
                                    ${item.sellingPrice?.toFixed(2)}
                                </div>
                                <div className="w-1/6 text-right font-bold">
                                    ${item.totalPrice?.toFixed(2)}
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-end mt-6 text-sm">
                            <div className="w-64 space-y-2">
                                <div className="flex justify-between">
                                    <span className="font-medium">Subtotal:</span>
                                    <span>
                                        ${(saleData.totalAmount - saleData.tax).toFixed(2)}
                                    </span>
                                </div>
                                {saleData.allowance > 0 && (
                                    <div className="flex justify-between">
                                        <span className="font-medium">Allowance:</span>
                                        <span>
                                            ${saleData.allowance.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="font-medium">Tax:</span>
                                    <span>
                                        ${saleData.tax.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t pt-2 border-gray-300">
                                    <span>Total:</span>
                                    <span>
                                        ${saleData.totalAmount.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
};

export default InvoicePreview;