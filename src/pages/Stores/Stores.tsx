import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaStore,
  FaPlus,
  FaCog,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaEdit,
  FaTrash,
  FaEye,
} from "react-icons/fa";
import { SpecialButton, IconButton } from "../../components/buttons";
import { CreateStoreModal } from "../../components/StoreComponents";
import ProfileDropdown from "../../components/ProfileDropdown";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchStores,
  deleteStore,
  setCurrentStore,
  createStore,
} from "../../store/slices/storeSlice";
import type { Store, StoreFormData } from "../../types/store";

const StoresPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const storeState = useAppSelector((state) => state.stores);
  const {
    stores = [],
    loading,
    error,
  } = storeState || { stores: [], loading: false, error: null };
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Debug logging
  console.log("Store state:", storeState);
  console.log("Stores array:", stores);

  useEffect(() => {
    dispatch(fetchStores());
  }, [dispatch]);

  const handleCreateStore = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditStore = (store: Store) => {
    navigate(`/store/edit/${store.id}`);
  };

  const handleViewStoreDetails = (store: Store) => {
    navigate(`/store/details/${store.id}`);
  };

  const handleDeleteStore = async (storeId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this store? This action cannot be undone."
      )
    ) {
      await dispatch(deleteStore(storeId));
    }
  };
  const handleSelectStore = (store: Store) => {
    dispatch(setCurrentStore(store));
    // Navigate to store-specific dashboard
    navigate(`/store/${store.id}`);
  };
  const handleCreateStoreSubmit = async (storeData: StoreFormData) => {
    try {
      setIsCreating(true);
      await dispatch(createStore(storeData)).unwrap();
      setIsCreateModalOpen(false);
      // Show success message
      toast.success("Store created successfully!");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Failed to create store:", error);
      // Show error message
      toast.error(`Failed to create store: ${error || "Unknown error"}`);
    } finally {
      setIsCreating(false);
    }
  };

  const formatCurrency = (currencyCode: string) => {
    const currencies: { [key: string]: string } = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      CNY: "¥",
      INR: "₹",
      AUD: "A$",
      CAD: "C$",
      CHF: "CHF",
      SEK: "kr",
    };
    return currencies[currencyCode] || currencyCode;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <FaStore className="text-teal-600 text-2xl mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Your Stores
                </h1>
                <p className="text-sm text-gray-600">
                  Manage your store locations and settings
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <SpecialButton
                variant="inventory-primary"
                onClick={handleCreateStore}
                icon={<FaPlus />}
              >
                Create New Store
              </SpecialButton>
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </div>{" "}
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          /* Loading State */
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your stores...</p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="text-center py-16">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <SpecialButton
              variant="inventory-primary"
              onClick={() => dispatch(fetchStores())}
            >
              Try Again
            </SpecialButton>
          </div>
        ) : !stores || stores.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <FaStore className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No stores yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first store to get started with managing your business
            </p>{" "}
            <SpecialButton
              variant="inventory-primary"
              className="mx-auto"
              onClick={handleCreateStore}
              icon={<FaPlus />}
            >
              Create Your First Store
            </SpecialButton>{" "}
          </div>
        ) : stores && stores.length > 0 ? (
          /* Stores Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div
                key={store.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  {/* Store Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
                        {store.logoUrl ? (
                          <img
                            src={store.logoUrl}
                            alt={`${store.name} logo`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <FaStore className="text-teal-600 text-xl" />
                        )}
                      </div>{" "}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {store.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(store.currency)} • {store.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <IconButton
                        icon={<FaEye />}
                        onClick={() => handleViewStoreDetails(store)}
                        variant="secondary"
                        size="sm"
                        title="View Store details"
                      />
                      <IconButton
                        icon={<FaEdit />}
                        onClick={() => handleEditStore(store)}
                        variant="secondary"
                        size="sm"
                        title="Edit Store"
                      />
                      <IconButton
                        icon={<FaTrash />}
                        onClick={() => handleDeleteStore(store.id)}
                        variant="danger"
                        size="sm"
                        title="Delete Store"
                      />
                    </div>
                  </div>
                  {/* Store Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start text-sm text-gray-600">
                      <FaMapMarkerAlt className="text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                      <span>{store.address}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaPhone className="text-gray-400 mr-2" />
                      <span>{store.phone}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaEnvelope className="text-gray-400 mr-2" />
                      <span>{store.email}</span>
                    </div>
                  </div>
                  {/* Store Settings */}
                  <div className="border-t pt-4 mb-6">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <FaCog className="text-gray-400 mr-2" />
                      <span className="font-medium">Settings</span>
                    </div>{" "}
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Timezone: {store?.settings?.timezone}</div>
                      <div>Currency: {store?.settings?.currency}</div>
                    </div>
                  </div>
                  {/* Action Button */}{" "}
                  <SpecialButton
                    variant="inventory-primary"
                    onClick={() => handleSelectStore(store)}
                    fullWidth
                  >
                    {" "}
                    Enter Store
                  </SpecialButton>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Fallback - should not happen with proper null checks above */
          <div className="text-center py-16">
            <p className="text-gray-600">No stores available</p>
          </div>
        )}
      </div>
      {/* Create Store Modal */}{" "}
      <CreateStoreModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateStoreSubmit}
        loading={isCreating}
      />
    </div>
  );
};

export default StoresPage;
