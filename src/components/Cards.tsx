import { useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import { selectDebouncedSearchTerm } from '../store/selectors';
import CardSection from '../components/reusablecomponents/CardSection';
import { getAllCards, filterCardsBySearch } from '../utils/cardUtils';

export default function Dashboard() {
  const debouncedSearchTerm = useAppSelector(selectDebouncedSearchTerm);
  
  const allCardSections = useMemo(() => getAllCards(), []);
  
  const filteredCardSections = useMemo(() => 
    filterCardsBySearch(allCardSections, debouncedSearchTerm),
    [allCardSections, debouncedSearchTerm]
  );

  return (
    <div className="p-4">
      {debouncedSearchTerm && (
        <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
          <p className="text-blue-700">
            {filteredCardSections.length === 0 
              ? `No cards found for "${debouncedSearchTerm}"` 
              : `Found ${filteredCardSections.reduce((total, section) => total + section.cards.length, 0)} cards matching "${debouncedSearchTerm}"`
            }
          </p>
        </div>
      )}
      
      {filteredCardSections.length === 0 && debouncedSearchTerm ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No cards match your search.</p>
          <p className="text-gray-400 text-sm mt-2">Try searching for different terms like "Store", "Report", "Settings", etc.</p>
        </div>
      ) : (
        filteredCardSections.map((section, index) => (
          <div key={section.sectionTitle}>
            <CardSection 
              sectionTitle={section.sectionTitle} 
              cards={section.cards} 
            />
            {index < filteredCardSections.length - 1 && <br />}
          </div>
        ))
      )}
    </div>
  );
}
