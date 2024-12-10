import { div } from "framer-motion/client";
import Link from "next/link";
import React from "react";
import ThemeController from "../ThemeController/ThemeController";

type Props = {};

function Sidebar({}: Props) {
  return (
    <div className="border-base-200 lg:border-r  ">
      <div className="flex flex-col justify-between h-screen">
        <div className="h-[90vh] overflow-scroll">
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
                <ul className=" menu space-y-2 bg-base-100  border-base-200  text-base-content min-h-full">
                  {/* Sidebar content here */}
                  <li className="  ">
                    <Link href="/">Summary</Link>
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
            <div className="collapse collapse-arrow ">
              <input type="checkbox" name="my-accordion-2" defaultChecked />
              <div className="collapse-title text-xl font-medium">
                Data Availability
              </div>
              <div className="collapse-content ">
                <ul className=" menu space-y-2 bg-base-100  border-base-200  text-base-content min-h-full">
                  {/* Sidebar content here */}
                  <li className="  ">
                    <Link href="/da/list">DA Providers</Link>
                  </li>
                  <hr className="border-base-200" />
                  {/* <li className="  ">
                <Link href="/accounts">DA Compare </Link>
              </li>
              <hr className="border-base-200" /> */}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className=" p-4  justify-end flex flex-col  border-base-200  border-t">
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
      </div>
    </div>
  );
}

export default Sidebar;
