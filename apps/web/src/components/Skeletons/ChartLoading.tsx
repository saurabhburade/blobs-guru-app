"use client";
import { getRandomNumber } from "@/lib/utils";
import React, { useState, useEffect } from "react";

type Props = {};

function ChartLoading({}: Props) {
  const [heights, setHeights] = useState<number[]>([]);

  useEffect(() => {
    const randomHeights = new Array(12)
      .fill(1)
      .map(() => getRandomNumber(40, 100));
    setHeights(randomHeights);
  }, []);

  return (
    <div className="h-full w-full">
      <div className="justify-end flex">
        <div className="w-[10em] h-[1.5em] bg-base-200 animate-pulse rounded-lg"></div>
      </div>
      <div className="grid grid-cols-12 h-full items-end py-5 gap-2">
        {heights.length === 0
          ? new Array(12).fill(1).map((v, idx) => (
              <div
                key={`chart_skeleton_${idx}`}
                className="w-full bg-gradient-to-b from-base-200 to-transparent animate-pulse rounded-lg transition transition-all"
                style={{ height: "50%"  }} // Placeholder height until client renders
              ></div>
            ))
          : heights.map((h, idx) => (
              <div
                key={`chart_skeleton_${idx}`}
                className="w-full bg-gradient-to-b from-base-200 to-transparent animate-pulse rounded-lg transition transition-all"
                style={{ height: `${h}%` }}
              ></div>
            ))}
      </div>
    </div>
  );
}

export default ChartLoading;
