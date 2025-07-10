interface CardItem {
  title: string;
  iconComponent?: string; // For React Icons component names
}

interface CardSection {
  sectionTitle: string;
  cards: CardItem[];
}


export const filterCardsBySearch = (
  cardSections: CardSection[],
  searchTerm: string
): CardSection[] => {
  if (!searchTerm.trim()) {
    return cardSections;
  }

  const lowercaseSearch = searchTerm.toLowerCase().trim();
  const searchWords = lowercaseSearch
    .split(" ")
    .filter((word) => word.length > 0);

  return cardSections
    .map((section) => ({
      ...section,
      cards: section.cards.filter((card) => {
        const cardTitle = card.title.toLowerCase().replace(/\n/g, " ");
        const sectionTitle = section.sectionTitle.toLowerCase();

        // Check if any search word matches card title or section title
        return searchWords.some(
          (word) =>
            cardTitle.includes(word) ||
            sectionTitle.includes(word) ||
            // Also check for partial matches
            cardTitle.split(" ").some((cardWord) => cardWord.startsWith(word))
        );
      }),
    }))
    .filter((section) => section.cards.length > 0); // Only show sections with matching cards
};

export const getAllCards = (): CardSection[] => {
  return [
    {
      sectionTitle: "Inventory",
      cards: [
        { title: "Upload Inventory*", iconComponent: "FiUpload" },
        { title: "Create Inventory", iconComponent: "FiPlus" },
        { title: "View Inventory*", iconComponent: "FiPackage" },
        { title: "Update Inventory*", iconComponent: "FiEdit3" },
        { title: "Inventory Dashboard", iconComponent: "FiBarChart3" },
      ],
    },
    {
      sectionTitle: "Sales",
      cards: [
        { title: "Upload Sales*", iconComponent: "FiUpload" },
        { title: "Sales Orders*", iconComponent: "FiShoppingCart" },
        { title: "View Sales*", iconComponent: "FiEye" },
        { title: "Update Sales*", iconComponent: "FiEdit3" },
        { title: "Sales Dashboard", iconComponent: "FiTrendingUp" },
      ],
    },
     {
      sectionTitle: "Invoice",
      cards: [
        // { title: "Upload Invoice*", iconComponent: "FiUpload" },
        { title: "Create Invoice", iconComponent: "FiFileText" },
        { title: "View Invoices", iconComponent: "FiFile" },
        // { title: "Update Invoice*", iconComponent: "FiEdit3" },
        // { title: "Invoice Dashboard", iconComponent: "FiPieChart" },
      ],
    },
    {
      sectionTitle: "Customers",
      cards: [
        { title: "Add Customer", iconComponent: "FiUserPlus" },
        { title: "View Customers*", iconComponent: "FiUsers" },
        { title: "Update Customer*", iconComponent: "FiEdit3" },
        { title: "Customer Reports*", iconComponent: "FiFileText" },
        { title: "Customer Dashboard", iconComponent: "FiBarChart2" },
      ],
    },
    {
      sectionTitle: "Supplier",
      cards: [
        { title: "Add Supplier", iconComponent: "FiTruck" },
        { title: "View Supplier*", iconComponent: "FiEye" },
        { title: "Update Supplier", iconComponent: "FiEdit3" },
        { title: "Supplier Dashboard", iconComponent: "FiBarChart3" },
      ],
    },
    {
      sectionTitle: "Employee",
      cards: [
        { title: "Add Employee*", iconComponent: "FiUserPlus" },
        { title: "Assign Role", iconComponent: "FiUserCheck" },
        { title: "View Employee*", iconComponent: "FiUsers" },
        { title: "Update Employee*", iconComponent: "FiEdit3" },
        { title: "Employee Dashboard", iconComponent: "FiBarChart2" },
      ],
    },
    {
      sectionTitle: "Tax Management",
      cards: [
        { title: "Add Tax", iconComponent: "FiPercent" },
        { title: "View Tax*", iconComponent: "FiEye" },
        { title: "Update Tax*", iconComponent: "FiEdit3" },
        { title: "Tax Dashboard", iconComponent: "FiPieChart" },
      ],
    },
    {
      sectionTitle: "Order Processing",
      cards: [
        { title: "Order\nProcessing", iconComponent: "FiPackage" },
        { title: "Create Order", iconComponent: "FiPlus" },
        { title: "View Orders", iconComponent: "FiEye" },
        { title: "Update Order", iconComponent: "FiEdit3" },
        { title: "Driver Management", iconComponent: "FiTruck" },
        {
          title: "Order Tracking\nVerification",
          iconComponent: "FiCheckCircle",
        },
      ],
    },
    {
      sectionTitle: "Return & Refund",
      cards: [
        { title: "View Returns", iconComponent: "FiEye" },
        { title: "Create Return", iconComponent: "FiPlus" },
        { title: "Return Dashboard", iconComponent: "FiBarChart3" },
      ],
    },
  ];
};
