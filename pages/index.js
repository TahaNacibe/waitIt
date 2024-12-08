import CountdownTitlePage from "@/components/animated/landing_page";
import WaitCardsSection from "@/components/sections/wait_card_section";
import FirebaseServices from "@/services/firebase/firebase_services";
import { useState } from "react";

export default function Home({  jsonStringEndingSoonWaitCardsList,jsonStringPopularCardsList }) {
  // state management
  const [endingSoonCardsList, setEndingSoonCardsList] = useState(JSON.parse(jsonStringEndingSoonWaitCardsList))
  const [popularWaitCardsList, setPopularWaitCardsList] = useState(JSON.parse(jsonStringPopularCardsList))

  // ui tree
  return (
    <section className="w-full flex flex-col items-center justify-center pt-8 md:pt-16">
      <CountdownTitlePage />
      <div
        id="itemsSection"
        className="p-4 w-full gap-12 flex flex-col">
      <WaitCardsSection waitCardsList={popularWaitCardsList} sectionTitle={"What Trendy lately"} />
      <WaitCardsSection waitCardsList={endingSoonCardsList} sectionTitle={"Ending soon"} />
      </div>
   </section>
  );
}


//* get the popular wait cards right now also the end today cards
export async function getServerSideProps() {
  const firebase_services = new FirebaseServices()

  // get popular wait cards from the server side
  const popularWaitCardsList = await firebase_services.getPopularWaitCardsList()
  const endingSoonWaitCardsList = await firebase_services.getNearEndingWaitCardListOrderedBySooner()

  // stringify the response 
  const jsonStringPopularCardsList = JSON.stringify(popularWaitCardsList)
  const jsonStringEndingSoonWaitCardsList = JSON.stringify(endingSoonWaitCardsList)
  
  // send the response
  return {
    props: {
      jsonStringEndingSoonWaitCardsList,
      jsonStringPopularCardsList
    }
  }
}