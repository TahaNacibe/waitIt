import React, { useState, useEffect } from "react";
import NumberFlow from "@number-flow/react";
import { TabletSmartphone, User2, Timer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GetMobileAppButton } from "../dialog/mobile_app_dialog";

// global const 
const ICON_SIZE = 30;

export default function CountdownTitlePage() {
  const titleWordsList = ["Matters", "You Love", "Is Important", "Is Special"];
  return (
    <div className="flex text-center items-center flex-col p-8 justify-center w-full pt-12">
      {/* Big title widget */}
      <BigTitleWidget words={titleWordsList} />
      {/* Subtitle widget */}
      <h3 className="text-lg md:text-2xl text-center w-full md:w-1/2 mt-4 text-gray-600 pt-16">
        Create, share, and track countdowns for any event. See what others are waiting for and join the excitement!
      </h3>
      {/* Buttons */}
      <ButtonsBar />
      {/* Details section */}
      <DetailsSection />
    </div>
  );
}

//* Box of details
const DetailsBox = ({ title, count, iconWidget: IconWidget }) => {
  // const 
  const NUMBER_ANIMATION_DURATION_DELAYED = 500
//* manage the number animation
  const [value, setValue] = useState(0);
  useEffect(() => {
    setValue(count);
  }, [count]);
    
    //* rerender the number
    const rerenderTheNumbers = () => {
        setValue(0)
        const interval = setInterval(() => {
            setValue(count)
          }, NUMBER_ANIMATION_DURATION_DELAYED);
        return () => clearInterval(interval);
    }

  return (
      <div
          onClick={() => rerenderTheNumbers()}
          className="border border-gray-800 rounded-xl p-4 flex flex-col gap-4 items-center text-center flex-grow hover:bg-white/5 transition-all duration-300">
      {/* Icon */}
      <div className="rounded-full bg-white/5 p-4">
        <IconWidget size={ICON_SIZE} />
      </div>
      {/* description */}
      <h1 className="text-base font-medium text-gray-300">{title}</h1>
      {/* Number with animation */}
      <h1 className="text-2xl font-bold font-mono">
        <NumberFlow value={value} />
      </h1>
    </div>
  );
};

//* Details section
const DetailsSection = () => {
  return (
    <div className="w-full text-white flex gap-12 pt-12 pb-8 flex-wrap justify-center">
      <DetailsBox title={"Currently Active Users"} count={552} iconWidget={User2} />
      <DetailsBox title={"Wait cards Created by community"} count={1552} iconWidget={Timer} />
      <DetailsBox title={"Active Mobile Users"} count={480} iconWidget={TabletSmartphone} />
    </div>
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
        <h1 className="text-sm md:text-lg">Check what's popular</h1>
      </a>
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
    <h1 className="flex flex-col text-3xl md:text-6xl text-center items-center w-full md:w-1/2 font-bold">
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
