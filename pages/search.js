import WaitCardWidget from "@/components/wait_card";
import FirebaseServices from "@/services/firebase/firebase_services";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";


export default function SearchPage({ searchResult, q }) {

    //* manage state
    const [searchResultList, setSearchResultList] = useState([]);
    const [sortOption, setSortOption] = useState("newest");

    //* Sorting and Filtering Logic
    const processSearchResults = (results) => {
        // place holder in case the result are empty 
        let processedResults = [...results ?? []];
        // compare between create date to get the newest and oldest entries
        switch (sortOption) {
            case "newest":
                processedResults.sort((a, b) => new Date(b.createdAt.seconds) - new Date(a.createdAt.seconds));
                break;
            case "oldest":
                processedResults.sort((a, b) => new Date(a.createdAt.seconds) - new Date(b.createdAt.seconds));
                break;
            case "mostPopular":
                // use the wait users list length to get the count
                processedResults.sort((a, b) => 
                    (b.waitingUsers?.length || 0) - (a.waitingUsers?.length || 0)
                );
                break;
        }

        return processedResults;
    };

    //* Initial result loading
    useEffect(() => {
        if (searchResult) {
            const parsedResults = JSON.parse(searchResult);
            setSearchResultList(processSearchResults(parsedResults));
        }
    }, [searchResult, sortOption]);




    //* ui tree
    return (
        <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 pt-20 flex flex-col items-center"
        >
            {/* filter section */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 100 }}
                transition={{delay:0.3}}
                className="flex justify-between w-11/12">
            <h3 className="text-sm font-light text-gray-300 mb-8">
                    {q !== ""
                        ? ` Found ${searchResultList.length} wait card${searchResultList.length !== 1 ? "s" : ""} for "${q}"`
                    : "Try typing something to search "}
                </h3>
                <Select 
                    value={sortOption} 
                    onValueChange={setSortOption}
                >
                    <SelectTrigger className="w-[180px] flex flex-row items-center gap-2 bg-black hover:bg-gray-white/20 transition-colors">
                        <SelectValue placeholder="Sort" className="flex">
                            {sortOption === "newest"}
                            {sortOption === "oldest"}
                            {sortOption === "mostPopular"}
                            Sort: {sortOption.charAt(0).toUpperCase() + sortOption.slice(1)}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-black border-gray-700 text-white">
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="mostPopular">Most Popular</SelectItem>
                    </SelectContent>
                </Select>
            </motion.div>


            {/* Result Section */}
            <div className="w-full max-w-6xl">
                <AnimatePresence>
                    {searchResultList.length > 0
                        ? <SearchResultDisplayWidget
                            searchResultList={searchResultList}
                            setSearchResultList={setSearchResultList} />
                        : <NoItemsInSearchResult /> }
                </AnimatePresence>
            </div>
        </motion.section>
    );
}


//* result widget (display the result of a search)
const SearchResultDisplayWidget = ({searchResultList, setSearchResultList}) => {
    return (
        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6"
                        >
                            {searchResultList.map((card, index) => (
                                <motion.div
                                    key={card.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ 
                                        delay: index * 0.1,
                                        duration: 0.3 
                                    }}
                                >
                                    <WaitCardWidget
                                        waitCard={card}
                                        onToggleWaitList={(updatedCard) => {
                                            console.log(updatedCard)
                                            if (!updatedCard) return;
                                            setSearchResultList(prev => prev.map((oldCard) => 
                                                oldCard.id === updatedCard.id ? updatedCard : oldCard
                                            ));
                                        }}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
    )
}

//* no item widget 
const NoItemsInSearchResult = () => {
    return (
        <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 rounded-lg shadow-sm flex justify-center"
    >
        <img src='ilu/no_items.svg' className="w-1/4 h-1/4" alt=''/>
    </motion.div>
    )
}

// Server-side props remain the same
export async function getServerSideProps(context) {
    //* instances
    const firebase_services = new FirebaseServices()
    const { q } = context.query; 
    
    const sanitizedQuery = q ? q.trim().toLowerCase() : "";
    

    const searchResult = await firebase_services.searchForWaitCardsBasedOnTitleText(sanitizedQuery);
    
    return {
        props: { 
            searchResult: JSON.stringify(searchResult), 
            q: sanitizedQuery 
        },
    };
}