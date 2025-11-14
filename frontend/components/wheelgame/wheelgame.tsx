//component/wheelgame.tsx
"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

const Wheel = dynamic(
  () => import("react-custom-roulette").then((mod) => mod.Wheel),
  { ssr: false }
);

const data = [
  { option: "7-day free trial" },
  { option: "8-day free trial" },
  { option: "9-day free trial" },
  { option: "1 month free" },
  { option: "10-day free trial" },
  { option: "Next time!" },
];

export default function WheelGame() {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);

  const handleSpinClick = () => {
    const newPrizeNumber = Math.floor(Math.random() * data.length);
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-screen bg-cover bg-center bg-no-repeat">
      {/* Header */}
      <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 tracking-wide drop-shadow-lg">
        Lucky Fortune
      </h1>

      {/* Wheel container (responsive size) */}
      <div className="relative flex items-center justify-center w-[380px] h-[380px] sm:w-[450px] sm:h-[450px] md:w-[580px] md:h-[580px] lg:w-[750px] lg:h-[750px]">
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={data}
          outerBorderColor="#fff"
          outerBorderWidth={5}
          innerBorderColor="transparent"
          radiusLineColor="#fff"
          radiusLineWidth={1}
          textColors={["#fff"]}
          textDistance={60}
          fontSize={18}
          fontWeight={500}
          startingOptionIndex={0}
          backgroundColors={[
            "#165FA9",
            "#239b63",
            "#F7A415",
            "#3F297E",
            "#BE1080",
            "#DC0836",
          ]}
          onStopSpinning={() => setMustSpin(false)}
        />

        {/* Center SPIN button */}
        <button onClick={handleSpinClick} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[52%] bg-white text-gray-800 font-semibold rounded-full w-10 h-10 sm:w-12 sm:h-12 shadow-lg active:scale-95 transition z-100 cursor-pointer">
          SPIN
        </button>
      </div>

      {/* Outer Spin Again Button */}
      <button onClick={handleSpinClick} className="mt-8 px-6 py-2 sm:px-8 sm:py-3 bg-red-500 hover:bg-red-700 text-white font-semibold rounded-md shadow-md transition-transform hover:-translate-y-1 text-lg cursor-pointer">
        SPIN
      </button>
    </div>
  );
}
