import { div } from "framer-motion/client";
import Link from "next/link";
import React from "react";
import ThemeController from "../ThemeController/ThemeController";

type Props = {};

function Sidebar({}: Props) {
  return (
    <div className="border-base-200 lg:border-r h-screen overflow-scroll">
      <div className="p-5 flex items-center justify-between hidden lg:flex">
        <Link href="/">
          <div className="font-bold flex items-center gap-2">
            <img src="/images/logo.svg" width={34} height={34} alt="" />
            blobsguru
          </div>
        </Link>
        <ThemeController />
      </div>
      <hr className="border-base-200 lg:block hidden" />

      <div className="">
        <div className="collapse collapse-arrow ">
          <input type="checkbox" name="my-accordion-2" defaultChecked />
          <div className="collapse-title text-xl font-medium">
            Ethereum Blobs
          </div>
          <div className="collapse-content ">
            <ul className=" menu space-y-2 bg-base-100 lg:border-l border-base-200  text-base-content min-h-full">
              {/* Sidebar content here */}
              <li className="  ">
                <Link href="/blocks">Summary</Link>
              </li>
              <hr className="border-base-200" />
              <li className="  ">
                <Link href="/accounts"> Rollups</Link>
              </li>
              <hr className="border-base-200" />

              <li className="  ">
                <Link href="/size"> Size</Link>
              </li>
              <hr className="border-base-200" />
              <li className="  ">
                <Link href="/cost"> Costs</Link>
              </li>

              <hr className="border-base-200" />

              <li className="  ">
                <Link href="/da"> Compare DA</Link>
              </li>
              <hr className="border-base-200" />
              <li className="  ">
                <Link href="/stats">Stats</Link>
              </li>
              <hr className="border-base-200" />
              <li className="  ">
                <Link
                  target="_blank"
                  referrerPolicy="no-referrer"
                  href="https://www.eip4844.com/"
                >
                  EIP 4844
                </Link>
              </li>

              <hr className="border-base-200" />
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
