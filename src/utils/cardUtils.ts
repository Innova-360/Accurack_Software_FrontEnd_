interface CardItem {
  title: string;
  icon?: string;
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
  const searchWords = lowercaseSearch.split(' ').filter(word => word.length > 0);

  return cardSections
    .map(section => ({
      ...section,
      cards: section.cards.filter(card => {
        const cardTitle = card.title.toLowerCase().replace(/\n/g, ' ');
        const sectionTitle = section.sectionTitle.toLowerCase();
        
        // Check if any search word matches card title or section title
        return searchWords.some(word => 
          cardTitle.includes(word) || 
          sectionTitle.includes(word) ||
          // Also check for partial matches
          cardTitle.split(' ').some(cardWord => cardWord.startsWith(word))
        );
      })
    }))
    .filter(section => section.cards.length > 0); // Only show sections with matching cards
};

export const getAllCards = (): CardSection[] => {
  return [    {
      sectionTitle: 'Liabilities',
      cards: [
        { title: 'Add Store' },
        { title: 'Total Inventory\nCount' },
        { title: 'View\nExpenses' },
        { title: 'Sales\nDashboard' },
        { title: 'Report\nBuilder' },
        { title: 'Settings' },
      ]
    },
    {
      sectionTitle: 'Cost',
      cards: [
        { title: 'Store\nStats' },
        { title: 'Tax\nReports' },
        { title: 'Custom\nBuilder' },
        { title: 'Report\nBuilder' },
        { title: 'Settings' },
      ]
    },
    {
      sectionTitle: 'Bank',
      cards: [
        { title: 'User\nLogs' },
        { title: 'Access\nControl' },
        { title: 'Report\nBuilder' },
        { title: 'Settings' },
        { title: 'Tax\nReports' },
      ]
    }
  ];
};
