import Navbar from "../../components/Header";
import { useState, useEffect } from 'react';
import { ChevronDown, X, Search, Info, Check, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { useGetTaxTypesQuery, useGetTaxCodesQuery, useGetTaxRegionsQuery, useCreateTaxTypeMutation, useCreateTaxCodeMutation, useCreateTaxRegionMutation, createTaxRateThunk, fetchCountriesThunk, useBulkAssignTaxMutation, type TaxAssignment } from '../../store/slices/taxSlice';
import { useSearchCategoriesQuery } from '../../store/slices/categorySlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
// import { useSearchProductsQuery, fetchProductsPaginated } from '../../store/slices/productsSlice';
import { useSearchCustomersQuery } from '../../store/slices/customerSlice';
// import { searchStores } from '../../store/slices/storeSlice';
import { useDebounce } from '../../components/TaxComponents/useDebounce';
import ModalActions from '../../components/TaxComponents/ModalActions';
import Modal from '../../components/TaxComponents/Modal';
import Input from '../../components/TaxComponents/TaxInput';
import Loading from "../../components/Loading";
import { fetchProductsPaginated } from "../../store/slices/productsSlice";

type FormDataType = {
    name: string;
    taxRate: string;
    taxCode: string;
    type: string;
    status: string;
    effective_From: string;
    description: string;
    selectedProducts: Array<{ id: string, name: string }>;
    selectedCategories: string[];
    selectedCustomers: Array<{ id: string, name: string }>;

    region: string;
};

interface CategoryType {
    id: string;
    name: string;
    description?: string;
}

interface ProductType {
    id?: string;
    name: string;
    sku?: string;
    // add other fields as needed
}

// interface StoreType {
//     id: string;
//     name: string;
//     address?: string;
//     // add other fields as needed
// }

interface CustomerType {
    id: string;
    customerName?: string;
    name?: string;
    customerMail?: string;
}


const Page = () => {
    const { id } = useParams();



    const [formData, setFormData] = useState<FormDataType>({
        name: 'VAT',
        taxRate: '7.5',
        taxCode: 'Luxyury_goods',
        type: 'Percentage (%)',
        status: 'Active',
        effective_From: '',
        description: '',
        selectedProducts: [],
        selectedCategories: [],
        selectedCustomers: [],

        region: ''
    });

    const [previewProduct, setPreviewProduct] = useState<string>('iPhone 15');
    const [showModal, setShowModal] = useState<string | null>(null);
    const [modalData, setModalData] = useState({ name: '', description: '', code: '', payer: 'CUSTOMER', taxTypeId: '' });
    const [filteredCountries, setFilteredCountries] = useState<{ country: string; iso2: string }[]>([]);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [categorySearchTerm, setCategorySearchTerm] = useState('');
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [creatingTaxRate, setCreatingTaxRate] = useState<boolean>(false);

    // Debounced search terms using custom hook
    // const debouncedProductSearchTerm = useDebounce(productSearchTerm, 300);
    const debouncedCategorySearchTerm = useDebounce(categorySearchTerm, 300);
    const debouncedCustomerSearchTerm = useDebounce(customerSearchTerm, 300);

    const [showProductDropdown, setShowProductDropdown] = useState(false);



    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);



    // Load all products for dropdown
    const { products: allProducts, loading: productsLoading } = useAppSelector(state => state.products);

    // Search products with debouncing
    // const { data: searchResults, isLoading: isSearching } = useSearchProductsQuery(
    //     { q: debouncedProductSearchTerm, storeId: id || '' },
    //     { skip: !debouncedProductSearchTerm || debouncedProductSearchTerm.length < 2 }
    // );

    // Filter products based on search term
    const filteredProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        (product.sku && product.sku.toLowerCase().includes(productSearchTerm.toLowerCase()))
    );

    // Search categories with debouncing
    const { data: categorySearchResults, isLoading: isCategorySearching } = useSearchCategoriesQuery(
        { q: debouncedCategorySearchTerm },
        { skip: !debouncedCategorySearchTerm || debouncedCategorySearchTerm.length < 2 }
    );

    // Search customers with debouncing
    const { data: customerSearchResults, isLoading: isCustomerSearching } = useSearchCustomersQuery(
        { search: debouncedCustomerSearchTerm, storeId: id || '' },
        { skip: !debouncedCustomerSearchTerm || debouncedCustomerSearchTerm.length < 2 }
    );



    const handleProductSearch = (value: string) => {
        setProductSearchTerm(value);
        setShowProductDropdown(true);
    };

    const handleCustomerSearch = (value: string) => {
        setCustomerSearchTerm(value);
        setShowCustomerDropdown(value.length > 0);
    };

    const handleCategorySearch = (value: string) => {
        setCategorySearchTerm(value);
        setShowCategoryDropdown(value.length > 0);
    };

    useEffect(() => {
        if (customerSearchTerm.length === 0) {
            setShowCustomerDropdown(false);
        }
        if (categorySearchTerm.length === 0) {
            setShowCategoryDropdown(false);
        }

    }, [customerSearchTerm, categorySearchTerm]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.relative')) {
                setShowProductDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    const selectProduct = (product: ProductType) => {
        if (typeof product === 'object' && product !== null && 'name' in product && 'id' in product) {
            const productData = {
                id: product.id!,
                name: product.name
            };
            if (!formData.selectedProducts.find(p => p.id === productData.id)) {
                setFormData(prev => ({
                    ...prev,
                    selectedProducts: [...prev.selectedProducts, productData]
                }));
            }
        }
        setProductSearchTerm('');
        setShowProductDropdown(false);
    };

    const selectCustomer = (customer: CustomerType) => {
        const customerData = {
            id: customer.id,
            name: customer.customerName || customer.name || ''
        };
        if (!formData.selectedCustomers.find(c => c.id === customerData.id)) {
            setFormData(prev => ({
                ...prev,
                selectedCustomers: [...prev.selectedCustomers, customerData]
            }));
        }
        setCustomerSearchTerm('');
        setShowCustomerDropdown(false);
    };

    const selectCategory = (category: CategoryType | string) => {
        const categoryName = typeof category === 'string' ? category : category.name;
        if (!formData.selectedCategories.includes(categoryName)) {
            setFormData(prev => ({
                ...prev,
                selectedCategories: [...prev.selectedCategories, categoryName]
            }));
        }
        setCategorySearchTerm('');
        setShowCategoryDropdown(false);
    };




    const handleCountrySearch = (value: string) => {
        setModalData(prev => ({ ...prev, name: value }));
        if (value.length > 0) {
            const filtered = countries.filter(country =>
                country.country.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredCountries(filtered.slice(0, 10));
            setShowCountryDropdown(true);
        } else {
            setShowCountryDropdown(false);
        }
    };

    const selectCountry = (country: unknown) => {
        setModalData(prev => ({
            ...prev,
            name: (country as { country: string; iso2: string }).country,
            code: (country as { country: string; iso2: string }).iso2
        }));
        setShowCountryDropdown(false);
    };

    const closeModal = () => {
        setShowModal(null);
        setModalData({ name: '', description: '', code: '', payer: 'CUSTOMER', taxTypeId: '' });
    };

    const [createTaxType] = useCreateTaxTypeMutation();
    const [createTaxCode] = useCreateTaxCodeMutation();
    const [createTaxRegion] = useCreateTaxRegionMutation();
    const [bulkAssignTax, { isLoading: isAssigning }] = useBulkAssignTaxMutation();
    const dispatch = useAppDispatch();
    const [createdTaxRateId, setCreatedTaxRateId] = useState<string | null>(null);


    const handleSaveTax = async () => {
        try {
            setCreatingTaxRate(true);
            const selectedTaxType = taxTypes.find((t) => t.description === formData.name);
            const selectedTaxCode = taxCodes.find(
                (c) => c.description === formData.taxCode
            );
            const selectedRegion = taxRegions.find((r: typeof taxRegions[0]) => r.code === formData.region);

            // Prevent API call if any ID is a temp value or not found
            if (!selectedTaxType?.id || !selectedTaxCode?.id || !selectedRegion?.id ||
                selectedTaxType.id === 'temp-type-id' ||
                selectedTaxCode.id === 'temp-code-id' ||
                selectedRegion.id === 'temp-region-id') {
                toast.error('Please select a valid Tax Type, Tax Code, and Region before creating a tax rate.');
                return;
            }

            const response = await dispatch(createTaxRateThunk({
                rate: parseFloat(formData.taxRate) / 100,
                effectiveFrom: new Date(formData.effective_From || Date.now()).toISOString(),
                effectiveTo: new Date(new Date().getFullYear() + 1, 11, 31, 23, 59, 59).toISOString(),
                regionId: selectedRegion.id,
                taxTypeId: selectedTaxType.id,
                taxCodeId: selectedTaxCode.id
            })).unwrap();
            // Save the created tax rate id
            setCreatedTaxRateId(response?.data?.id || null);
            toast.success('Tax rate created successfully!');

        } catch (error) {
            console.error('Failed to create tax rate:', error);
            toast.error('Failed to create tax rate');
        }
        finally {
            setCreatingTaxRate(false);
        }
    };

    const { data: taxTypesResponse, isLoading: typesLoading } = useGetTaxTypesQuery();
    const taxTypes = taxTypesResponse?.data ?? [];
    const { data: taxCodesResponse, isLoading: codesLoading } = useGetTaxCodesQuery();
    const taxCodes = taxCodesResponse?.data ?? [];
    const { data: taxRegionsResponse, isLoading: regionsLoading } = useGetTaxRegionsQuery();
    const taxRegions = taxRegionsResponse?.data ?? [];


    const { countries, countriesLoading } = useAppSelector(state => state.tax);

    useEffect(() => {
        dispatch(fetchCountriesThunk());
        // Load all products on component mount
        dispatch(fetchProductsPaginated({ page: 1, limit: 1000, storeId: id || '' }));
    }, [dispatch, id]);




    if (typesLoading || codesLoading || regionsLoading || countriesLoading) {
        return (
            <>
                <Navbar />
                <Loading />
            </>
        );
    }


    const renderModal = () => {
        switch (showModal) {
            case 'code':
                return (
                    <Modal title="Create Tax Code" onClose={closeModal}>
                        <div className="space-y-4">
                            <Input
                                label="Code"
                                placeholder="luxury_goods"
                                value={modalData.code}
                                onChange={(value) => setModalData(prev => ({ ...prev, code: value }))}
                            />
                            <Input
                                label="Description"
                                placeholder="Luxury goods over $1000"
                                value={modalData.description}
                                onChange={(value) => setModalData(prev => ({ ...prev, description: value }))}
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Type</label>
                                <select
                                    value={modalData.taxTypeId}
                                    onChange={(e) => setModalData(prev => ({ ...prev, taxTypeId: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Tax Type</option>
                                    {taxTypesResponse?.data?.map((taxType) => (
                                        <option key={taxType.id} value={taxType.id}>
                                            {taxType.name ?? 'Unnamed Tax Type'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <ModalActions
                                onClose={closeModal}
                                onSave={async () => {
                                    try {
                                        await createTaxCode({
                                            code: modalData.code,
                                            description: modalData.description,
                                            taxTypeId: modalData.taxTypeId
                                        }).unwrap();
                                        toast.success('Tax code created successfully!');
                                        closeModal();
                                    } catch (error) {
                                        console.error('Failed to create tax code:', error);
                                        toast.error('Failed to create tax code');
                                    }
                                }}
                            />
                        </div>
                    </Modal>
                );
            case 'name':
                return (
                    <Modal title="Create Tax Name" onClose={closeModal}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    placeholder="VAT"
                                    value={modalData.name}
                                    onChange={(e) => setModalData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    placeholder="Value Added Tax"
                                    value={modalData.description}
                                    onChange={(e) => setModalData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <ModalActions
                                onClose={closeModal}
                                onSave={async () => {
                                    try {
                                        await createTaxType({
                                            name: modalData.name,
                                            description: modalData.description,
                                            payer: modalData.payer
                                        }).unwrap();
                                        toast.success('Tax name created successfully!');
                                        closeModal();
                                    } catch (error) {
                                        console.error('Failed to create tax type:', error);
                                        toast.error('Failed to create tax name');
                                    }
                                }}
                            />
                        </div>
                    </Modal>
                );
            case 'region':
                return (
                    <Modal title="Create Region" onClose={closeModal}>
                        <div className="space-y-4">
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Country Name</label>
                                <input
                                    type="text"
                                    placeholder="Type country name..."
                                    value={modalData.name}
                                    onChange={(e) => handleCountrySearch(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {showCountryDropdown && filteredCountries.length > 0 && (
                                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto">
                                        {filteredCountries.map((country) => (
                                            <div
                                                key={country.iso2}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => selectCountry(country)}
                                            >
                                                {country.country} ({country.iso2})
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <Input
                                label="Code"
                                placeholder="Auto-filled from country selection"
                                value={modalData.code}
                                onChange={(value) => setModalData(prev => ({ ...prev, code: value }))}
                            />
                            <Input
                                label="Description"
                                placeholder="Description (Applicable for GST)"
                                value={modalData.description}
                                onChange={(value) => setModalData(prev => ({ ...prev, description: value }))}
                            />
                            <ModalActions
                                onClose={closeModal}
                                onSave={async () => {
                                    try {
                                        await createTaxRegion({
                                            name: modalData.name,
                                            code: modalData.code,
                                            description: modalData.description
                                        }).unwrap();
                                        toast.success('Region created successfully!');
                                        closeModal();
                                    } catch (error) {
                                        console.error('Failed to create region:', error);
                                        toast.error('Failed to create region');
                                    }
                                }}
                            />
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

    const removeSelectedItem = (
        item: string | { id: string; name: string },
        field: keyof FormDataType
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: field === 'selectedCustomers' || field === 'selectedProducts'
                ? (prev[field] as Array<{ id: string, name: string }>).filter(i => i.id !== (item as { id: string }).id)
                : Array.isArray(prev[field]) ? (prev[field] as string[]).filter(i => i !== item) : prev[field]
        }));
    };

    const calculateTaxAmount = (basePrice: number, rate: number) => {
        return (basePrice * rate / 100).toFixed(2);
    };

    const handleAssignTax = async () => {
        if (!createdTaxRateId) {
            toast.error('Please create a tax rate first before assigning it.');
            return;
        }

        const assignments: TaxAssignment[] = [];

        // Add product assignments
        formData.selectedProducts.forEach(product => {
            if (product.id) {
                assignments.push({
                    entityType: 'PRODUCT' as const,
                    entityId: product.id,
                    taxRateId: createdTaxRateId
                });
            }
        });

        // Add category assignments
        formData.selectedCategories.forEach(categoryName => {
            const category = categorySearchResults?.data?.find(c => c.name === categoryName);
            if (category?.id) {
                assignments.push({
                    entityType: 'CATEGORY' as const,
                    entityId: category.id,
                    taxRateId: createdTaxRateId
                });
            }
        });

        // Add customer assignments
        formData.selectedCustomers.forEach(customer => {
            if (customer.id) {
                assignments.push({
                    entityType: 'CUSTOMER' as const,
                    entityId: customer.id,
                    taxRateId: createdTaxRateId
                });
            }
        });

        // Add store assignment (current store from route)
        if (id) {
            assignments.push({
                entityType: 'STORE' as const,
                entityId: id,
                taxRateId: createdTaxRateId
            });
        }

        if (assignments.length === 0) {
            toast.error('No valid entities selected for tax assignment.');
            return;
        }

        try {
            await bulkAssignTax({ assignments }).unwrap();
            toast.success(`Tax assigned successfully to ${assignments.length} entities!`);
        } catch (error) {
            console.error('Failed to assign tax:', error);
            toast.error('Failed to assign tax');
        }
    };

    const basePrice = 1200.00;
    const vatRate = parseFloat(formData.taxRate) || 7.5;
    // const luxuryDuty = 50.00;
    const vatAmount = calculateTaxAmount(basePrice, vatRate);
    // const total = basePrice + parseFloat(vatAmount) + luxuryDuty;


    return (
        <>
            <Navbar />
            {renderModal()}
            <div className="bg-[#043E490D] px-4 lg:px-0">
                <div className="mx-0 lg:mx-15 py-8 lg:py-15 rounded-xl">
                    <div className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white mb-8 rounded-2xl sticky top-0 z-40 transition-shadow duration-200 ${isScrolled ? 'shadow-lg' : ''}`}>
                        <h2 className="text-xl font-semibold mb-4 sm:mb-0">Add New Tax</h2>
                        <div className="flex gap-x-4 w-full sm:w-auto">
                            <button className="flex-1 sm:flex-none bg-white py-2 px-3 text-black rounded-xl border border-gray-300 cursor-pointer" onClick={() => window.history.back()}>
                                Back
                            </button>
                            <button className="flex-1 sm:flex-none bg-[#043E49] py-2 px-3 text-white rounded-xl flex items-center justify-center gap-x-3 cursor-pointer" onClick={handleSaveTax}>
                                {creatingTaxRate && 'creating...'} Create Tax Rate
                            </button>
                        </div>
                    </div>
                    <div className="min-h-screen">
                        <div className="gap-6 flex flex-col lg:flex-row">
                            {/* Left Column - Form */}
                            <div className="w-full lg:w-3/5">
                                {/* Basic Tax Information */}
                                <div className="bg-white rounded-xl  mb-6 p-6">
                                    <h2 className="text-lg font-semibold mb-6">Basic Tax Information</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="w-full">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tax Name <span className="text-red-500">*</span>
                                                <Info className="inline w-4 h-4 ml-1 text-gray-400" />
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={formData.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    {taxTypesResponse?.data?.length === 0 ? (
                                                        <option value="">No Tax names Available</option>
                                                    ) : (
                                                        <>
                                                            <option value="">Select Tax Name</option>
                                                            {taxTypesResponse?.data?.map((taxType) => (
                                                                <option key={taxType.id} value={taxType.description ?? ''}>
                                                                    {taxType.description ?? 'Unnamed Tax Type'}
                                                                </option>
                                                            ))}
                                                        </>
                                                    )}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                            <button className="flex items-center gap-x-3 bg-[#043E49] py-2 px-3 text-white rounded-xl pr-3 mt-5" onClick={() => setShowModal('name')} >
                                                <Plus />
                                                Add Tax Name
                                            </button>
                                        </div>
                                        <div className="w-full">
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
                                                    {taxCodesResponse?.data?.length === 0 ? (
                                                        <option value="">No Tax Codes Available</option>
                                                    ) : (
                                                        <>
                                                            <option value="">Select Tax Code</option>
                                                            {taxCodesResponse?.data?.map((taxCode) => (
                                                                <option key={taxCode.id} value={taxCode.description ?? ''}>
                                                                    {taxCode.description ?? 'Unnamed Tax Code'}
                                                                </option>
                                                            ))}
                                                        </>
                                                    )}

                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                            <button className="flex items-center gap-x-3 bg-[#043E49] py-2 px-3 text-white rounded-xl pr-3 mt-5" onClick={() => setShowModal('code')}>
                                                <Plus />
                                                Add Tax Code
                                            </button>
                                        </div>
                                        <div className="w-full">
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
                                        <div className="w-full">
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
                                        <div className="w-full">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Region <span className="text-red-500">*</span>
                                                <Info className="inline w-4 h-4 ml-1 text-gray-400" />
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={formData.region}
                                                    onChange={(e) => handleInputChange('region', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    {taxRegionsResponse?.data?.length === 0 ? (
                                                        <option value="">No Regions Available</option>
                                                    ) : (
                                                        <>
                                                            <option value="">Select Region</option>
                                                            {taxRegionsResponse?.data?.map((region) => (
                                                                <option key={region.id} value={region.code}>
                                                                    {region.name}
                                                                </option>
                                                            ))}
                                                        </>
                                                    )}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                            <button className="flex items-center gap-x-3 bg-[#043E49] py-2 px-3 text-white rounded-xl pr-3 mt-5" onClick={() => setShowModal('region')}>
                                                <Plus />
                                                Add Region
                                            </button>
                                        </div>
                                        <div className="w-full">
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
                                        <div className="w-1/2">
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
                                            <input
                                                type="text"
                                                placeholder={productsLoading ? 'Loading products...' : 'Type to search products...'}
                                                value={productSearchTerm}
                                                onChange={(e) => handleProductSearch(e.target.value)}
                                                onFocus={() => setShowProductDropdown(true)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            {showProductDropdown && (
                                                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                                                    {productsLoading && (
                                                        <div className="px-3 py-2 text-gray-500">Loading products...</div>
                                                    )}
                                                    {!productsLoading && filteredProducts.length === 0 && (
                                                        <div className="px-3 py-2 text-gray-500">No products found</div>
                                                    )}
                                                    {!productsLoading && filteredProducts.slice(0, 50).map((product) => (
                                                        <div
                                                            key={product.id}
                                                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                            onClick={() => selectProduct(product)}
                                                        >
                                                            <div className="font-medium">{product.name}</div>
                                                            {product.sku && (
                                                                <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.selectedProducts.map((product, index) => (
                                                <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center">
                                                    {product.name}
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
                                                value={categorySearchTerm}
                                                onChange={(e) => handleCategorySearch(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            {showCategoryDropdown && (
                                                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto">
                                                    {isCategorySearching && (
                                                        <div className="px-3 py-2 text-gray-500">Searching...</div>
                                                    )}
                                                    {categorySearchResults?.data?.map((category) => (
                                                        <div
                                                            key={category.id}
                                                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                            onClick={() => selectCategory(category)}
                                                        >
                                                            <div className="font-medium">{category.name}</div>
                                                            {category.description && (
                                                                <div className="text-sm text-gray-500">{category.description}</div>
                                                            )}
                                                        </div>
                                                    )) || (!isCategorySearching && debouncedCategorySearchTerm && (
                                                        <div className="px-3 py-2 text-gray-500">No categories found</div>
                                                    ))}
                                                </div>
                                            )}
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

                                    {/* Customers */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Customers
                                            <Info className="inline w-4 h-4 ml-1 text-gray-400" />
                                        </label>
                                        <div className="relative mb-3">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search and select customers..."
                                                value={customerSearchTerm}
                                                onChange={(e) => handleCustomerSearch(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            {showCustomerDropdown && (
                                                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto">
                                                    {isCustomerSearching && (
                                                        <div className="px-3 py-2 text-gray-500">Searching...</div>
                                                    )}
                                                    {customerSearchResults?.data?.customers?.map((customer) => (
                                                        <div
                                                            key={customer.id}
                                                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                            onClick={() => selectCustomer(customer)}
                                                        >
                                                            <div className="font-medium">{customer.customerName}</div>
                                                            {customer.customerMail && (
                                                                <div className="text-sm text-gray-500">{customer.customerMail}</div>
                                                            )}
                                                        </div>
                                                    )) || (!isCustomerSearching && debouncedCustomerSearchTerm && (
                                                        <div className="px-3 py-2 text-gray-500">No customers found</div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.selectedCustomers.map((customer, index) => (
                                                <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center">
                                                    {customer.name}
                                                    <button
                                                        onClick={() => removeSelectedItem(customer, 'selectedCustomers')}
                                                        className="ml-2 text-gray-500 hover:text-gray-700"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>






                                </div>
                            </div>

                            {/* Right Column - Tax Preview */}
                            <div className="w-full lg:w-2/5 mt-6 lg:mt-0">
                                <div className="bg-white rounded-xl p-6 lg:sticky lg:top-24">
                                    <h3 className="text-lg font-semibold mb-4">Tax Preview</h3>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Test Product</label>
                                        <div className="relative">
                                            {/* <select
                                                value={previewProduct}
                                                onChange={(e) => setPreviewProduct(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                {formData.selectedProducts.map((product, index) => (
                                                <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center">
                                                    {product}
                                                    <button
                                                        onClick={() => removeSelectedItem(product, 'selectedProducts')}
                                                        className="ml-2 text-gray-500 hover:text-gray-700"
                                                    >
                                                    </button>
                                                </span>
                                            ))}

                                            </select> */}
                                            <select
                                                value={previewProduct}
                                                onChange={(e) => setPreviewProduct(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                {formData.selectedProducts.length === 0 ? (
                                                    <option value="" disabled>
                                                        No product selected
                                                    </option>
                                                ) : (
                                                    formData.selectedProducts.map((product, index) => (
                                                        <option key={index} value={product.name}>
                                                            {product.name}
                                                        </option>
                                                    ))
                                                )}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        {/* <div className="flex justify-between">
                                            <span className="text-gray-600">Product:</span>
                                            <span className="font-medium">{previewProduct || 'No product selected'}</span>
                                        </div> 
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Base Price:</span>
                                            <span className="font-medium">${basePrice.toFixed(2)}</span>
                                        </div>
                                        
                                        {formData.name && formData.taxRate && (
                                            <div className="flex justify-between items-center">
                                                <span className="flex items-center gap-x-2">
                                                    <Check color='#22C55E' size={18} />
                                                    {formData.name} ({formData.taxRate}%)
                                                </span>
                                                <span className="font-medium">${vatAmount}</span>
                                            </div>
                                        )}
                                        <hr className="my-3" />
                                        <div className="flex justify-between font-semibold text-lg">
                                            <span>Total:</span>
                                            <span>${total.toFixed(2)}</span>
                                        </div>
                                        */}
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                        <h4 className="font-medium mb-3">Tax Configuration</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Tax Name:</span>
                                                <span className="font-medium">{formData.name || 'Not selected'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Tax Code:</span>
                                                <span className="font-medium">{formData.taxCode || 'Not selected'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Rate:</span>
                                                <span className="font-medium">{formData.taxRate ? `${formData.taxRate}%` : 'Not set'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Type:</span>
                                                <span className="font-medium">{formData.type || 'Not selected'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Region:</span>
                                                <span className="font-medium">{formData.region ? taxRegions.find(r => r.code === formData.region)?.name || formData.region : 'Not selected'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Status:</span>
                                                <span className={`font-medium ${formData.status === 'Active' ? 'text-green-600' : 'text-gray-600'}`}>{formData.status}</span>
                                            </div>
                                            {formData.effective_From && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Effective From:</span>
                                                    <span className="font-medium">{new Date(formData.effective_From).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                                        <h4 className="font-medium mb-3 text-blue-800">Assignment Summary</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">Products:</span>
                                                <span className="font-medium text-blue-800">{formData.selectedProducts.length} selected</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">Categories:</span>
                                                <span className="font-medium text-blue-800">{formData.selectedCategories.length} selected</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">Customers:</span>
                                                <span className="font-medium text-blue-800">{formData.selectedCustomers.length} selected</span>
                                            </div>
                                            {formData.selectedProducts.length > 0 && (
                                                <div className="mt-3 pt-2 border-t border-blue-200">
                                                    <span className="text-blue-700 text-xs">Selected Products:</span>
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                        {formData.selectedProducts.slice(0, 3).map((product, index) => (
                                                            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                                                {product.name}
                                                            </span>
                                                        ))}
                                                        {formData.selectedProducts.length > 3 && (
                                                            <span className="text-blue-600 text-xs">+{formData.selectedProducts.length - 3} more</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-x-4 w-full sm:w-auto justify-end">
                                        <button
                                            className="flex-1 sm:flex-none bg-[#043E49] py-2 px-3 text-white rounded-xl flex items-center justify-center gap-x-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={handleAssignTax}
                                            disabled={isAssigning || !createdTaxRateId}
                                        >
                                            {isAssigning ? 'Assigning...' : 'Assign Tax'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};


export default Page;