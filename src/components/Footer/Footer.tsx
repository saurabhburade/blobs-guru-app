import React from "react";
import MenuDrawer from "../Header/MenuDrawer";
import Link from "next/link";
import { Twitter } from "lucide-react";
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
      <div className="flex p-4 lg:px-20 items-center">
        <div className="bg-base-100  mx-auto  flex justify-start items-start  w-full gap-2 lg:text-base text-sm">
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
        <div>
          <Link
            href={`https://x.com/blobsguru`}
            target="_blank"
            referrerPolicy="no-referrer"
            className="btn btn-circle btn-sm transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
            </svg>
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
