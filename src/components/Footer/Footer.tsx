import React from "react";
import MenuDrawer from "../Header/MenuDrawer";
import Link from "next/link";
type Props = {};

function Footer({}: Props) {
  return (
    <footer className="p-4 border-t border-base-200">
      <div className="bg-base-100 p-4 mx-auto lg:px-20 flex gap-5 justify-between items-center w-full flex-wrap">
        <Link href="/">
          <div className="font-bold flex items-center gap-2">
            <img src="/images/logo.svg" width={34} height={34} alt="" />
            blobsguru
          </div>
        </Link>

        <div className="w-fit gap-5  lg:gap-5 items-center flex flex-wrap lg:text-base text-sm">
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
          <Link href="/accounts"> Accounts</Link>
          <Link href="/">Stats</Link>
        </div>
      </div>
      <div className="bg-base-100 p-4 mx-auto lg:px-20 flex justify-start items-start  w-full gap-2 lg:text-base text-sm">
        Build with ❤️ by{" "}
        <a
          href="https://bsaurabh.xyz"
          target="_blank"
          referrerPolicy="no-referrer"
          className="text-primary underline"
        >
          saurabh_evm
        </a>
      </div>
    </footer>
  );
}

export default Footer;
