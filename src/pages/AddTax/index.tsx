import Navbar from "../../components/Header";
import { useState } from 'react';
import { ChevronDown, X, Search, Info, Check, Plus } from 'lucide-react';
import { Link } from "react-router-dom";

// Type for formData state
interface FormDataType {
    taxName: string;
    taxRate: string;
    taxCode: string;
    type: string;
    status: string;
    effective_From: string;
    description: string;
    selectedProducts: string[];
    selectedCategories: string[];
    customers: string;
    stores: string;
    suppliers: string;
}

const Page = () => {
    const [formData, setFormData] = useState<FormDataType>({
        taxName: 'VAT',
        taxRate: '7.5',
        taxCode: 'Luxyury_goods',
        type: 'Percentage (%)',
        status: 'Active',
        effective_From: '',
        description: '',
        selectedProducts: ['iPhone 15', 'MacBook Pro'],
        selectedCategories: ['Electronics'],
        customers: 'All Customers',
        stores: 'All Stores',
        suppliers: 'All Suppliers'
    });
    const [previewProduct, setPreviewProduct] = useState<string>('iPhone 15');
    const [showModal, setShowModal] = useState<string | null>(null);
    const closeModal = () => setShowModal(null);

    const renderModal = () => {
        switch (showModal) {
            case 'code':
                return (
                    <Modal title="Create Tax Code" onClose={closeModal}>
                        <div className="space-y-4">
                            <Input label="Code" placeholder="luxury_goods" />
                            <Input label="Description" placeholder="Luxury goods over $1000" />
                            <Select label="Tax Type" options={['Percentage (%)', 'Fixed Amount']} />
                            <ModalActions onClose={closeModal} />
                        </div>
                    </Modal>
                );
            case 'name':
                return (
                    <Modal title="Create Tax Name" onClose={closeModal}>
                        <div className="space-y-4">
                            <Input label="Name" placeholder="VAT" />
                            <Input label="Description" placeholder="Value Added Tax" />
                            <ModalActions onClose={closeModal} />
                        </div>
                    </Modal>
                );
            case 'region':
                return (
                    <Modal title="Create Region" onClose={closeModal}>
                        <div className="space-y-4">
                            <Input label="Name" placeholder="India" />
                            <Input label="Code" placeholder="IN" />
                            <Input label="Description" placeholder="Description (Applicable for GST)" />
                            <ModalActions onClose={closeModal} />
                        </div>
                    </Modal>
                );
            default:
                return null;
        }
    };


    const handleInputChange = (field: keyof FormDataType, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const removeSelectedItem = (item: string, field: keyof FormDataType) => {
        setFormData(prev => ({
            ...prev,
            [field]: Array.isArray(prev[field]) ? (prev[field] as string[]).filter(i => i !== item) : prev[field]
        }));
    };

    const calculateTaxAmount = (basePrice: number, rate: number) => {
        return (basePrice * rate / 100).toFixed(2);
    };

    const basePrice = 1200.00;
    const vatRate = parseFloat(formData.taxRate) || 7.5;
    const luxuryDuty = 50.00;
    const vatAmount = calculateTaxAmount(basePrice, vatRate);
    const total = basePrice + parseFloat(vatAmount) + luxuryDuty;
    return (
        <>
            <Navbar />
            {renderModal()}
            <div className="bg-[#043E490D]">
                <div className="mx-15 py-15  rounded-xl ">
                    <div className="p-4 flex items-center justify-between bg-white mb-8 rounded-2xl">
                        <h2 className="text-xl font-semibold ">Add New Tax</h2>
                        <div className="flex gap-x-6">
                            <button className=" bg-white py-2 px-3 text-black rounded-xl pr-4" >
                                Cancel
                            </button>
                            <button className=" bg-[#043E49] py-2 px-3 text-white rounded-xl pr-4 flex items-center gap-x-3 cursor-pointer" >
                               

                                    Save Tax
                                

                            </button>
                        </div>
                    </div>
                    <div className="min-h-screen">
                        <div className="gap-6 flex ">
                            {/* Left Column - Form */}
                            <div className="w-3/5">
                                {/* Basic Tax Information */}
                                <div className="bg-white rounded-xl  mb-6 py-6">
                                    <h2 className="text-lg font-semibold mb-6 pl-6">Basic Tax Information</h2>

                                    <div className="flex gap-y-6 flex-wrap">
                                        <div className="w-1/2 px-5">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tax Name <span className="text-red-500">*</span>
                                                <Info className="inline w-4 h-4 ml-1 text-gray-400" />
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={formData.taxName}
                                                    onChange={(e) => handleInputChange('taxName', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="VAT">VAT</option>
                                                    <option value="GST">GST</option>
                                                    <option value="Sales Tax">Sales Tax</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                            <button className="flex items-center gap-x-3 bg-[#043E49] py-2 px-3 text-white rounded-xl pr-3 mt-5" onClick={() => setShowModal('name')} >
                                                <Plus />
                                                Add Tax Name
                                            </button>
                                        </div>
                                        <div className="w-1/2 px-5">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tax Code
                                                <Info className="inline w-4 h-4 ml-1 text-gray-400" />
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={formData.taxCode}
                                                    onChange={(e) => handleInputChange('taxCode', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="Luxyury_goods">Luxyury_goods</option>
                                                    <option value="Cars">cars</option>
                                                    <option value="mobile">mobile</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                            <button className="flex items-center gap-x-3 bg-[#043E49] py-2 px-3 text-white rounded-xl pr-3 mt-5" onClick={() => setShowModal('code')}>
                                                <Plus />
                                                Add Tax Code
                                            </button>
                                        </div>



                                        <div className="w-1/2 px-5">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Type <span className="text-red-500">*</span>
                                                <Info className="inline w-4 h-4 ml-1 text-gray-400" />
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={formData.type}
                                                    onChange={(e) => handleInputChange('type', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >

                                                    <option value="Percentage (%)">Percentage (%)</option>
                                                    <option value="Fixed Amount">Fixed Amount</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                            {/* <button className="flex items-center gap-x-3 bg-[#043E49] py-2 px-3 text-white rounded-xl pr-3 mt-5" onClick={() => setShowModal('type')}>
                                                <Plus />
                                                Add Tax Type
                                            </button> */}
                                        </div>

                                        <div className="w-1/2 px-5">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tax Rate <span className="text-red-500">*</span>
                                                <Info className="inline w-4 h-4 ml-1 text-gray-400" />
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.taxRate}
                                                onChange={(e) => handleInputChange('taxRate', e.target.value)}
                                                placeholder="e.g. 7.5"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="w-1/2 px-5">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Region <span className="text-red-500">*</span>
                                                <Info className="inline w-4 h-4 ml-1 text-gray-400" />
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={formData.type}
                                                    onChange={(e) => handleInputChange('type', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >

                                                    <option value="India">India</option>
                                                    <option value="UK">UK</option>
                                                    <option value="Australia">Australia</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                            <button className="flex items-center gap-x-3 bg-[#043E49] py-2 px-3 text-white rounded-xl pr-3 mt-5" onClick={() => setShowModal('region')}>
                                                <Plus />
                                                Add Region
                                            </button>
                                        </div>

                                        <div className="w-1/2 px-5">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Effective from  
                                                <Info className="inline w-4 h-4 ml-1 text-gray-400" />
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.effective_From}
                                                onChange={(e) => handleInputChange('effective_From', e.target.value)}
                                                placeholder="e.g. 7.5"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div className="w-1/2 px-5">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Status <span className="text-red-500">*</span>
                                                <Info className="inline w-4 h-4 ml-1 text-gray-400" />
                                            </label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="status"
                                                        value="Active"
                                                        checked={formData.status === 'Active'}
                                                        onChange={(e) => handleInputChange('status', e.target.value)}
                                                        className="mr-2 text-blue-600"
                                                    />
                                                    Active
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="status"
                                                        value="Inactive"
                                                        checked={formData.status === 'Inactive'}
                                                        onChange={(e) => handleInputChange('status', e.target.value)}
                                                        className="mr-2 text-blue-600"
                                                    />
                                                    Inactive
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* <div className="mt-6 px-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                            <Info className="inline w-4 h-4 ml-1 text-gray-400" />
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            placeholder="Optional description for internal reference"
                                            rows={3}
                                            className="w-full border resize-none border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div> */}
                                </div>

                                {/* Assignment Scope */}
                                <div className="bg-white rounded-xl p-6">
                                    <h2 className="text-lg font-semibold mb-2">Assignment Scope</h2>
                                    <p className="text-gray-600 text-sm mb-6">Assign this tax to one or more entities</p>

                                    {/* Products */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Products
                                            <Info className="inline w-4 h-4 ml-1 text-gray-400" />
                                        </label>
                                        <div className="relative mb-3">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search and select products..."
                                                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.selectedProducts.map((product, index) => (
                                                <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center">
                                                    {product}
                                                    <button
                                                        onClick={() => removeSelectedItem(product, 'selectedProducts')}
                                                        className="ml-2 text-gray-500 hover:text-gray-700"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Categories */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Categories
                                            <Info className="inline w-4 h-4 ml-1 text-gray-400" />
                                        </label>
                                        <div className="relative mb-3">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search and select categories..."
                                                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.selectedCategories.map((category, index) => (
                                                <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center">
                                                    {category}
                                                    <button
                                                        onClick={() => removeSelectedItem(category, 'selectedCategories')}
                                                        className="ml-2 text-gray-500 hover:text-gray-700"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Customers, Stores, Suppliers */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Customers
                                                <Info className="inline w-4 h-4 ml-1 text-gray-400" />
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={formData.customers}
                                                    onChange={(e) => handleInputChange('customers', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="All Customers">All Customers</option>
                                                    <option value="Specific Customers">Specific Customers</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Stores
                                                <Info className="inline w-4 h-4 ml-1 text-gray-400" />
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={formData.stores}
                                                    onChange={(e) => handleInputChange('stores', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="All Stores">All Stores</option>
                                                    <option value="Specific Stores">Specific Stores</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Suppliers
                                                <Info className="inline w-4 h-4 ml-1 text-gray-400" />
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={formData.suppliers}
                                                    onChange={(e) => handleInputChange('suppliers', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="All Suppliers">All Suppliers</option>
                                                    <option value="Specific Suppliers">Specific Suppliers</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Tax Preview */}
                            <div className="w-2/5">
                                <div className="bg-white rounded-xl p-6 sticky top-6">
                                    <h3 className="text-lg font-semibold mb-4">Tax Preview</h3>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Test Product</label>
                                        <div className="relative">
                                            <select
                                                value={previewProduct}
                                                onChange={(e) => setPreviewProduct(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="iPhone 15">iPhone 15</option>
                                                <option value="MacBook Pro">MacBook Pro</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Product:</span>
                                            <span className="font-medium">{previewProduct}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Base Price:</span>
                                            <span className="font-medium">${basePrice.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className=" flex items-center gap-x-2">
                                                <Check color='#22C55E' size={18} />
                                                {formData.taxName} ({formData.taxRate}%)
                                            </span>
                                            <span className="font-medium">${vatAmount}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className=" flex items-center  gap-x-2">
                                                <Check color='#22C55E' size={18} />
                                                Luxury Duty (Fixed)
                                            </span>
                                            <span className="font-medium">${luxuryDuty.toFixed(2)}</span>
                                        </div>
                                        <hr className="my-3" />
                                        <div className="flex justify-between font-semibold text-lg">
                                            <span>Total:</span>
                                            <span>${total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-medium mb-3">Tax Summary</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-start">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                                                <span className="text-gray-600">This tax will apply to selected products in the Electronics category</span>
                                            </div>
                                            <div className="flex items-start">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                                                <span className="text-gray-600">Conditions: Region is 'PK' AND Total Amount is = $1,000</span>
                                            </div>
                                            <div className="flex items-start">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                                                <span className="text-gray-600">Product type: Luxury items will have additional fixed duty</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* <div className="mt-6 flex gap-3">
                                        <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                                            Cancel
                                        </button>
                                        <button className="flex-1 bg-[#043E49] text-white py-2 px-4 rounded-lg hover:bg-[#032e37] transition-colors">
                                            Save Tax
                                        </button>
                                    </div> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>

    );
};

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold mb-4">{title}</h2>
                {children}
            </div>
        </div>
    );
}

function Input({ label, placeholder }: { label: string; placeholder: string }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                type="text"
                placeholder={placeholder}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
}

function Select({ label, options }: { label: string; options: string[] }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        </div>
    );
}

function ModalActions({ onClose }: { onClose: () => void }) {
    return (
        <div className="flex gap-x-4 justify-end">
            <button className=" bg-white py-2 px-3 text-black rounded-xl pr-4" onClick={onClose} >
                Cancel
            </button>
            <button className=" bg-[#043E49] py-2 px-3 text-white rounded-xl" >
                <Link to='/add-tax' className="flex items-center gap-x-3">
                    Save 
                </Link>
            </button>
        </div>
    );
}



export default Page;