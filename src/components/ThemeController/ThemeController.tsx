"use client";
import { cn } from "@/lib/utils";
import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";

type Props = {};

function ThemeController({}: Props) {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (typeof window != "undefined") {
      setMounted(true);
    }
  }, []);
  console.log(
    `🚀 ~ file: ThemeController.tsx:10 ~ theme:`,
    theme,
    theme === "light" ? "btn-active" : ""
  );
  if (!mounted) {
    return (
      <button className="btn btn-circle btn-sm transition-all  animate-pulse"></button>
    );
  }
  return (
    <div>
      <button
        className="btn btn-circle btn-sm transition-all"
        onClick={() => {
          if (theme === "light") {
            setTheme("dark");
          } else {
            setTheme("light");
          }
        }}
      >
        {theme === "light" ? (
          <MoonStar width={20} height={20} />
        ) : (
          <SunMedium width={20} height={20} />
        )}
      </button>
      {/* <button className="btn btn-circle btn-sm"></button> */}
    </div>
  );
  // return (
  //   <div className="dropdown dropdown-bottom ">
  //     <div tabIndex={0} role="button" className="btn m-1 rounded-full">
  //       Theme
  //       <svg
  //         width="12px"
  //         height="12px"
  //         className="inline-block h-2 w-2 fill-current opacity-60"
  //         xmlns="http://www.w3.org/2000/svg"
  //         viewBox="0 0 2048 2048"
  //       >
  //         <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
  //       </svg>
  //     </div>
  //     <ul
  //       tabIndex={0}
  //       className="dropdown-content bg-base-300 rounded-box z-[1] w-fit p-2 shadow-2xl"
  //     >
  //       <li onClick={() => setTheme("light")}>
  //         <input
  //           type="radio"
  //           name="theme-dropdown"
  //           className={cn(
  //             "theme-controller btn btn-sm btn-block btn-ghost justify-start",
  //             theme === "light" ? "btn-active" : ""
  //           )}
  //           aria-label="light"
  //           value="light"
  //         />
  //       </li>
  //       <li onClick={() => setTheme("dark")}>
  //         <input
  //           type="radio"
  //           name="theme-dropdown"
  //           className={cn(
  //             "theme-controller btn btn-sm btn-block btn-ghost justify-start",
  //             theme === "dark" ? "btn-active" : ""
  //           )}
  //           aria-label="Dark"
  //           value="dark"
  //         />
  //       </li>
  //       {/* <li onClick={() => setTheme("black")}>
  //         <input
  //           type="radio"
  //           name="theme-dropdown"
  //           className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
  //           aria-label="black"
  //           value="black"
  //         />
  //       </li>
  //       <li onClick={() => setTheme("retro")}>
  //         <input
  //           type="radio"
  //           name="theme-dropdown"
  //           className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
  //           aria-label="Retro"
  //           value="retro"
  //         />
  //       </li>
  //       <li onClick={() => setTheme("cyberpunk")}>
  //         <input
  //           type="radio"
  //           name="theme-dropdown"
  //           className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
  //           aria-label="Cyberpunk"
  //           value="cyberpunk"
  //         />
  //       </li>
  //       <li onClick={() => setTheme("valentine")}>
  //         <input
  //           type="radio"
  //           name="theme-dropdown"
  //           className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
  //           aria-label="Valentine"
  //           value="valentine"
  //         />
  //       </li>
  //       <li onClick={() => setTheme("aqua")}>
  //         <input
  //           type="radio"
  //           name="theme-dropdown"
  //           className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
  //           aria-label="Aqua"
  //           value="aqua"
  //         />
  //       </li>
  //       <li onClick={() => setTheme("pastel")}>
  //         <input
  //           type="radio"
  //           name="theme-dropdown"
  //           className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
  //           aria-label="pastel"
  //           value="pastel"
  //         />
  //       </li> */}
  //     </ul>
  //   </div>
  // );
}

export default ThemeController;
