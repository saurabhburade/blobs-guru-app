import { Menu } from "lucide-react";
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
          <ul className="menu space-y-2 bg-base-200 text-base-content min-h-full w-80 p-4">
            {/* Sidebar content here */}
            <li className="btn bg-base-100/50  items-start">
              <Link href="/blocks">Blob Blocks</Link>
            </li>
            <li className="btn bg-base-100/50 items-start">
              <Link href="/transactions"> Blob Transactions</Link>
            </li>
            <li className="btn bg-base-100/50 items-start">
              <Link href="/accounts"> Accounts</Link>
            </li>
            <li className="btn bg-base-100/50 items-start">
              <Link href="/">Stats</Link>
            </li>

            <ThemeController />
          </ul>
        </div>
      </div>
    </div>
  );
}

export default MenuDrawer;
