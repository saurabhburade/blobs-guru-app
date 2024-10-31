import { Menu, X } from "lucide-react";
import Link from "next/link";
import React from "react";
import ThemeController from "../ThemeController/ThemeController";

type Props = {};

function MenuDrawer({}: Props) {
  return (
    <div>
      <div className="drawer drawer-end z-50">
        <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          {/* Page content here */}
          <label
            htmlFor="my-drawer-4"
            className="drawer-button btn btn-ghost btn-sm btn-square"
          >
            <Menu />{" "}
          </label>
        </div>
        <div className="drawer-side">
          <label
            htmlFor="my-drawer-4"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>

          <ul className="menu space-y-2 bg-base-100  border-base-300/80 border-l text-base-content min-h-full w-[80%]">
            <div className="flex justify-between p-4 border-base-200 border-b">
              {" "}
              <Link href="/">
                <div className="font-bold flex items-center gap-2">
                  <img src="/images/logo.svg" width={34} height={34} alt="" />
                </div>
              </Link>
              <label
                htmlFor="my-drawer-4"
                className="drawer-button btn btn-ghost btn-sm btn-square"
              >
                <X />{" "}
              </label>
            </div>
            {/* Sidebar content here */}
            <li className="  ">
              <Link href="/blocks">Blob Blocks</Link>
            </li>
            <hr className="border-base-200" />
            <li className="  ">
              <Link href="/transactions"> Blob Transactions</Link>
            </li>
            <hr className="border-base-200" />
            <li className="  ">
              <Link href="/accounts"> Accounts</Link>
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
            <li className=" flex justify-between flex-row items-center active:bg-transparent">
              <p>Theme</p>
              <ThemeController />
            </li>
            <hr className="border-base-200" />
          </ul>
        </div>
      </div>
    </div>
  );
}

export default MenuDrawer;
