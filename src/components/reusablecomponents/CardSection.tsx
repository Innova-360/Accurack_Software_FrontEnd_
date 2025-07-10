import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import * as FeatherIcons from "react-icons/fi";

interface CardItem {
  title: string;
  icon?: string;
  iconComponent?: string;
}

interface CardSectionProps {
  sectionTitle: string;
  cards: CardItem[];
}

const CardSection: React.FC<CardSectionProps> = ({ sectionTitle, cards }) => {
  const navigate = useNavigate();
  const { id: storeId } = useParams<{ id: string }>();
  const { currentStore } = useAppSelector((state) => state.stores);

  // Use store ID from URL params or current store
  const activeStoreId = storeId || currentStore?.id;

  // Function to render the appropriate icon
  const renderIcon = (card: CardItem) => {
    if (card.iconComponent && (FeatherIcons as any)[card.iconComponent]) {
      const IconComponent = (FeatherIcons as any)[card.iconComponent];
      return (
        <IconComponent
          size={24}
          className="text-[#03414C] group-hover:text-[#0f4d57] transition-colors duration-200"
        />
      );
    }
    // Fallback to default icon
    return (
      <img
        src={card.icon || "/icon.png"}
        alt={card.title}
        className="w-6 h-6 object-contain"
      />
    );
  };
  return (
    <div className="my-2 w-full lg:ml-[15px]">
      <h2 className="text-2xl text-[#03414C] font-bold mb-3">{sectionTitle}</h2>
      <hr className="mb-4 border-[#e6e0e0]" />
      <br />
      <div className="flex flex-wrap gap-4">
        {cards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => {
              // Inventory routes
              if (card.title === "Create Inventory") {
                navigate(`/store/${activeStoreId}/inventory/create`);
              } else if (card.title === "Inventory Dashboard") {
                navigate(`/store/${activeStoreId}/inventory`);
              } else if (card.title === "View Inventory*") {
                navigate(`/store/${activeStoreId}/inventory`);
              } else if (card.title === "Update Inventory*") {
                navigate(`/store/${activeStoreId}/inventory`);
              } else if (card.title === "Upload Inventory*") {
                navigate(`/store/${activeStoreId}/inventory/upload`);
              }
              // Supplier routes
              else if (card.title === "Add Supplier") {
                navigate(`/store/${activeStoreId}/supplier/add`);
              } else if (card.title === "View Supplier*") {
                navigate(`/store/${activeStoreId}/supplier`);
              } else if (card.title === "Update Supplier") {
                navigate(`/store/${activeStoreId}/supplier/update`);
              } else if (card.title === "Supplier Dashboard") {
                navigate(`/store/${activeStoreId}/supplier`);
              } else if (card.title === "Suppliers*") {
                navigate(`/store/${activeStoreId}/supplier`);
              } else if (card.title === "Customers") {
                navigate(`/store/${activeStoreId}/customer`);
              }
              // Sales routes
              else if (card.title === "Upload Sales*") {
                navigate(`/store/${activeStoreId}/sales`);
              } else if (card.title === "Sales Orders*") {
                navigate(`/store/${activeStoreId}/sales`);
              } else if (card.title === "View Sales*") {
                navigate(`/store/${activeStoreId}/sales`);
              } else if (card.title === "Update Sales*") {
                navigate(`/store/${activeStoreId}/sales`);
              } else if (card.title === "Sales Dashboard") {
                navigate(`/store/${activeStoreId}/sales`);
              }
              // Invoice routes
              else if (card.title === "Upload Invoice*") {
                navigate(`/store/${activeStoreId}/sales/create-invoice`);
              } else if (card.title === "Create Invoice") {
                navigate(`/store/${activeStoreId}/sales/new`);
              } else if (card.title === "View Invoices") {
                navigate(`/store/${activeStoreId}/invoices`);
              } else if (card.title === "Update Invoice*") {
                navigate(`/store/${activeStoreId}/sales`);
              } else if (card.title === "Invoice Dashboard") {
                navigate(`/store/${activeStoreId}/invoices`);
              }
              // Customer routes
              else if (card.title === "Add Customer") {
                navigate(`/store/${activeStoreId}/customer/create`);
              } else if (card.title === "View Customers*") {
                navigate(`/store/${activeStoreId}/customer`);
              } else if (card.title === "Update Customer*") {
                navigate(`/store/${activeStoreId}/customer`);
              } else if (card.title === "Customer Reports*") {
                navigate(`/store/${activeStoreId}/customer`);
              } else if (card.title === "Customer Dashboard") {
                navigate(`/store/${activeStoreId}/customer`);
              }
              // Employee routes
              else if (card.title === "Add Employee*") {
                navigate(`/store/${activeStoreId}/employee`);
              } else if (card.title === "Assign Role") {
                navigate(`/store/${activeStoreId}/permissions`);
              } else if (card.title === "View Employee*") {
                navigate(`/store/${activeStoreId}/employee`);
              } else if (card.title === "Update Employee*") {
                navigate(`/store/${activeStoreId}/employee`);
              } else if (card.title === "Employee Dashboard") {
                navigate(`/store/${activeStoreId}/employee`);
              }
              // Tax Management routes
              else if (card.title === "Add Tax") {
                navigate(`/store/${activeStoreId}/tax/add`);
              } else if (card.title === "View Tax*") {
                navigate(`/store/${activeStoreId}/tax`);
              } else if (card.title === "Update Tax*") {
                navigate(`/store/${activeStoreId}/tax`);
              } else if (card.title === "Tax Dashboard") {
                navigate(`/store/${activeStoreId}/tax`);
              }
              // Legacy routes (keeping for backward compatibility)
              else if (card.title === "View\nExpenses") {
                navigate(
                  activeStoreId
                    ? `/store/${activeStoreId}/expenses`
                    : "/expenses"
                );
              } else if (card.title === "Sales\nDashboard") {
                navigate(
                  activeStoreId ? `/store/${activeStoreId}/sales` : "/sales"
                );
              } else if (card.title === "Total Inventory\nCount") {
                navigate(
                  activeStoreId
                    ? `/store/${activeStoreId}/inventory`
                    : "/inventory"
                );
              } else if (card.title === "Employee") {
                navigate(
                  activeStoreId
                    ? `/store/${activeStoreId}/employee`
                    : "/employee"
                );
              } else if (card.title === "EmployeeRoles") {
                navigate(
                  activeStoreId
                    ? `/store/${activeStoreId}/permissions`
                    : "/permissions"
                );
              } else if (card.title === "Order\nProcessing") {
                navigate(
                  activeStoreId
                    ? `/store/${activeStoreId}/order-processing`
                    : "/order-processing"
                );
              } else if (card.title === "Create Order") {
                navigate(
                  activeStoreId
                    ? `/store/${activeStoreId}/order-processing/create`
                    : "/order-processing/create"
                );
              } else if (card.title === "View Orders") {
                navigate(
                  activeStoreId
                    ? `/store/${activeStoreId}/order-processing/view-orders`
                    : "/order-processing/view-orders"
                );
              } else if (card.title === "Update Order") {
                navigate(
                  activeStoreId
                    ? `/store/${activeStoreId}/order-processing/update`
                    : "/order-processing/update"
                );
              } else if (card.title === "Driver Management") {
                navigate(
                  activeStoreId
                    ? `/store/${activeStoreId}/order-processing/driver-management`
                    : "/order-processing/driver-management"
                );
              } else if (card.title === "Order Tracking\nVerification") {
                navigate(
                  activeStoreId
                    ? `/store/${activeStoreId}/order-tracking-verification`
                    : "/order-tracking-verification"
                );
              }
              // Return & Refund routes
              else if (card.title === "View Returns") {
                navigate(`/store/${activeStoreId}/return`);
              } else if (card.title === "Create Return") {
                navigate(`/store/${activeStoreId}/return/create`);
              } else if (card.title === "Return Dashboard") {
                navigate(`/store/${activeStoreId}/return`);
              }

             


            }}
            className="group bg-white rounded-xl shadow-lg border-2 border-[#f5f4f4] shadow-[#D1D1D1] hover:shadow-xl hover:border-[#03414C]/20 transition-all duration-300 cursor-pointer
                       flex flex-row lg:flex-col items-center lg:items-center
                       text-left lg:text-center px-4 py-4 lg:py-6 w-full sm:w-[300px] lg:w-[185px] h-auto lg:h-[175px] lg:flex lg:justify-center lg:align-center"
          >
            {/* Icon */}
            <div className="border border-dashed border-[#C0C0C0] rounded-lg p-3 w-14 h-14 flex items-center justify-center mb-0 lg:mb-3 mr-4 lg:mr-0 group-hover:border-[#03414C]/30 group-hover:bg-[#03414C]/5 transition-all duration-200">
              {renderIcon(card)}
            </div>

            {/* Title */}
            <span className="text-sm font-medium text-[#03414C] whitespace-pre group-hover:text-[#0f4d57] transition-colors duration-200">
              {card.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(CardSection);
