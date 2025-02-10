import React, { useState, useEffect } from 'react';
import ScrollCard from '../scroll_card';
import WaitCardWidget from "../wait_card";
import { TabletSmartphone, User2, Timer } from "lucide-react";
import { GetMobileAppButton } from '../dialog/mobile_app_dialog';
import {motion, AnimatePresence} from "framer-motion"
const LandingPage = ({ popularWaitCardsList }) => {
  const [scrollPosition1, setScrollPosition1] = useState(0);
  const [scrollPosition2, setScrollPosition2] = useState(0);
  const titleWordsList = ["Matters", "You Love", "Is Important", "Is Special"];

  useEffect(() => {
    const animate = () => {
      setScrollPosition1(prev => (prev + 1) % (popularWaitCardsList.length * 5000));
      setScrollPosition2(prev => (prev + 0.8) % (popularWaitCardsList.length * 5000));
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [popularWaitCardsList.length]);

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Background scrolling cards */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-40">
        <div className="flex flex-col gap-8">
          <div className="flex gap-8" style={{ transform: `translateX(-${scrollPosition1}px)` }}>
            {[...popularWaitCardsList, ...popularWaitCardsList, ...popularWaitCardsList].map((card, index) => (
              <div key={`row1-${index}`} className="flex-none">
                <ScrollCard waitCard={card} />
              </div>
            ))}
          </div>
          <div className="flex gap-8" style={{ transform: `translateX(-${scrollPosition2}px)` }}>
            {[...popularWaitCardsList, ...popularWaitCardsList, ...popularWaitCardsList].reverse().map((card, index) => (
              <div key={`row2-${index}`} className="flex-none">
                <ScrollCard waitCard={card} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex text-center items-center flex-col p-8 justify-evenly h-screen w-full pt-12">
        <BigTitleWidget words={titleWordsList} />
        <h3 className="text-lg md:text-2xl text-center w-full md:w-1/2 mt-4 text-white pt-16">
          Create, share, and track countdowns for any event. See what others are waiting for and join the excitement!
        </h3>
        <ButtonsBar />
      </div>
    </div>
  );
};


//* Big title widget body
const BigTitleWidget = ({ words }) => {
    //* consts 
    const WORDS_CHANGE_ANIMATION_DURATION = 4000
    
    //* state vars
    const [activeIndex, setActiveIndex] = useState(0);
  
    useEffect(() => {
      const interval = setInterval(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % words.length);
      }, WORDS_CHANGE_ANIMATION_DURATION);
      return () => clearInterval(interval);
    }, [words.length]);
  
    return (
      <h1 className="flex flex-col text-3xl md:text-7xl text-center items-center w-full  font-bold">
        Countdown to What{" "}
        <strong className="pl-2 font-semibold text-4xl md:text-7xl">
          <AnimatePresence mode="wait">
            <motion.span
              key={words[activeIndex]}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute"
            >
              {words[activeIndex]}!
            </motion.span>
          </AnimatePresence>
        </strong>
      </h1>
    );
  };

  
  //* Buttons bar
  const ButtonsBar = () => {
    return (
      <div className="flex flex-col md:flex-row gap-4 pt-4 md:pt-8 items-center justify-center">
        {/* Phone link button */}
        <GetMobileAppButton />
        {/* Check new button */}
        <a
          href="#itemsSection"
          className="rounded-full border-gray-600 border px-6 py-3 flex items-center gap-3 cursor-pointer hover:bg-white hover:text-black hover:border-transparent transition-all duration-300">
          <h1 className="text-sm md:text-lg">Check what&apos;s popular</h1>
        </a>
      </div>
    );
  };

export default LandingPage;