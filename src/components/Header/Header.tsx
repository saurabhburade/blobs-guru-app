import React from "react";
import ThemeController from "../ThemeController/ThemeController";
import Link from "next/link";
import MenuDrawer from "./MenuDrawer";

type Props = {};

function Header({}: Props) {
  return (
    <div className="bg-base-100 p-4 mx-auto lg:px-20 flex justify-between items-center w-full">
      <Link href="/">
        <div className="font-bold flex items-center gap-2">
          <img src="/images/logo.svg" width={34} height={34} alt="" />
          blobsguru
        </div>
      </Link>
      <div className="lg:hidden block">
        <MenuDrawer />
      </div>
      <div className="w-fit  gap-5 items-center hidden lg:flex">
        {/* <div className="dropdown ">
          <div tabIndex={0} role="button" className=" m-1">
            Blobs
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
          >
            <li>
              <a>Item 1</a>
            </li>
            <li>
              <a>Item 2</a>
            </li>
          </ul>
        </div> */}
        <Link href="/blocks">Blob Blocks</Link>
        <Link href="/transactions"> Blob Transactions</Link>
        <Link href="/accounts"> Rollups</Link>
        <Link href="/da"> Compare DA</Link>
        <Link href="/stats">Stats</Link>
        <Link
          target="_blank"
          referrerPolicy="no-referrer"
          href="https://www.eip4844.com/"
        >
          EIP 4844
        </Link>

        <ThemeController />
      </div>
    </div>
  );
}

export default Header;
