import React, { useState, useMemo } from 'react';
import WaitCardWidget from "../wait_card";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from '../ui/select';

export default function WaitCardsSection({ 
  waitCardsList, 
  sectionTitle, 
  onCardUpdate 
}) {
  // State management
  const [sortOption, setSortOption] = useState('default');
  const [waitCardsListForDisplay, setWaitCardsListForDisplay] = useState(waitCardsList);

  // Memoized filtered and sorted cards
  const processedWaitCards = useMemo(() => {
    const filteredCards = waitCardsListForDisplay
    // Sorting logic
    switch(sortOption) {
      case 'titleAsc':
        return filteredCards.sort((a, b) => a.title.localeCompare(b.title));
      case 'titleDesc':
        return filteredCards.sort((a, b) => b.title.localeCompare(a.title));
      case 'dateAsc':
        return filteredCards.sort((a, b) => new Date(a.createdAt.seconds) - new Date(b.createdAt.seconds));
      case 'dateDesc':
        return filteredCards.sort((a, b) => new Date(b.createdAt.seconds) - new Date(a.createdAt.seconds));
      default:
        return filteredCards;
    }
  }, [waitCardsList, sortOption]);

  // Card update handler
  const handleCardUpdate = (updatedCard) => {
    if (!updatedCard) return;

    const updatedList = waitCardsListForDisplay.map((oldCard) => 
      oldCard.id === updatedCard.id ? updatedCard : oldCard
    );
    
    setWaitCardsListForDisplay(updatedList);
    onCardUpdate?.(updatedList);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Header and Controls */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{sectionTitle}</h1>
        
        <div className="flex items-center space-x-4">

          {/* Sort Dropdown */}
          <Select 
            value={sortOption}
            onValueChange={setSortOption}
          >
            <SelectTrigger>
            <SelectValue placeholder="Sort" className="flex">
                            {sortOption === "default"}
                            {sortOption === "titleAsc"}
                            {sortOption === "titleDesc"}
                            {sortOption === "dateAsc"}
                            {sortOption === "dateDesc"}
                            Sort: {sortOption.charAt(0).toUpperCase() + sortOption.slice(1)}
                        </SelectValue>
            </ SelectTrigger>
            <SelectContent className="bg-black border-gray-700 text-white">
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="titleAsc">Title A-Z</SelectItem>
                        <SelectItem value="titleDesc">Title Z-A</SelectItem>
                        <SelectItem value="dateAsc">Date Ascending</SelectItem>
                        <SelectItem value="dateDesc">Date Descending</SelectItem>
                    </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards Grid */}
      <AnimatePresence>
        <div className="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
          {processedWaitCards.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">
              No cards found
            </div>
          ) : (
            processedWaitCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.3 
                }}
              >
                <WaitCardWidget
                  waitCard={card}
                  onToggleWaitList={handleCardUpdate}
                />
              </motion.div>
            ))
          )}
        </div>
      </AnimatePresence>
    </motion.div>
  );
}