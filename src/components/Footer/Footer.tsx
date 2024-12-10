import React from "react";
import MenuDrawer from "../Header/MenuDrawer";
import Link from "next/link";
import { Twitter } from "lucide-react";
type Props = {};

function Footer({}: Props) {
  return (
    <footer className="p-4 block lg:hidden border-t border-base-200 relative">
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
