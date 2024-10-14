import { useTheme } from "next-themes";
import React from "react";

type Props = {};

function PoweredBy({}: Props) {
  return (
    <div className="py-5 flex gap-10  lg:h-[10em] justify-center flex-wrap ">
      <div className="flex items-center gap-2  border-x lg:border-r lg:border-l-0 px-10 text-lg text-base-300">
        <p className="font-bold"> 💪 Powered by</p>
      </div>
      <div className="flex items-center gap-2 ">
        <img src="/images/grt.png" width={40} height={40} alt="" />
        <p className="font-bold">Thegraph</p>
      </div>
      <div className="flex items-center gap-1 ">
        <img
          src={"/images/streamingfast.png"}
          className=""
          width={50}
          height={50}
          alt=""
        />
        <p className="font-bold">Streamingfast</p>
      </div>
      <div className="flex items-center gap-2  ">
        <img src="/images/l2beat.png" width={50} height={50} alt="" />
        <p className="font-bold">L2beat</p>
      </div>
    </div>
  );
}

export default PoweredBy;
