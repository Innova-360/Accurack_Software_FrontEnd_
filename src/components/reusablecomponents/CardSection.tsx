import React from 'react';
import { useNavigate } from 'react-router-dom';

interface CardItem {
  title: string;
  icon?: string; 
}

interface CardSectionProps {
  sectionTitle: string;
  cards: CardItem[];
}

const CardSection: React.FC<CardSectionProps> = ({ sectionTitle, cards }) => {
  const navigate = useNavigate();
  return (
    <div className="my-2 w-full lg:ml-[15px]">
      <h2 className="text-2xl text-[#03414C] font-bold mb-3">{sectionTitle}</h2>
      <hr className="mb-4 border-[#e6e0e0]" />
<br />
      <div className="flex flex-wrap gap-4">
        {cards.map((card, idx) => (          <div
            key={idx}
            onClick={() => {
              if (card.title === 'Add Store') navigate('/Form');
              if (card.title === 'View\nExpenses') navigate('/expenses');
            }}
            className="bg-white rounded-xl shadow-lg border-2 border-[#f5f4f4] shadow-[#D1D1D1] hover:shadow-xl transition duration-300 cursor-pointer
                       flex flex-row lg:flex-col items-center lg:items-center
                       text-left lg:text-center px-4 py-4 lg:py-6 w-full sm:w-[300px] lg:w-[185px] h-auto lg:h-[175px] lg:flex lg:justify-center lg:align-center"
          >
            {/* Icon */}
            <div className="border border-dashed border-[#C0C0C0] rounded-lg p-2 w-14 h-14 flex items-center justify-center mb-0 lg:mb-2 mr-4 lg:mr-0">
              <img
                src={card.icon || '/icon.png'}
                alt={card.title}
                className="w-8 h-8 object-contain"
              />
            </div>

            {/* Title */}
            <span className="text-sm font-medium text-[#03414C] whitespace-pre">
              {card.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(CardSection);
