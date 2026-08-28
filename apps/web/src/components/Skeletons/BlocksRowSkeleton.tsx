const BlocksRowSkeleton = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-[1fr_0.5fr_1.5fr] items-center lg:flex-nowrap first:border-t-0 border-t py-3 border-base-200 text-sm">
      <div className="flex items-center gap-2 w-full">
        <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[4em] h-[4em] animate-pulse"></div>
        <div className="space-y-2">
          <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[5em] lg:w-[10em] h-[20px] animate-pulse"></div>
          <div className=" bg-base-200/50 flex justify-center rounded-xl items-center  w-[5em]  lg:w-[8em] h-[20px] animate-pulse"></div>
        </div>
      </div>
      <div className="space-y-2 w-full flex items-end flex-col justify-end ">
        <div className=" bg-base-200/50 flex justify-end rounded-xl items-center w-[5em] h-[20px] animate-pulse"></div>

        <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[5em] h-[20px] animate-pulse"></div>
      </div>
      <div className="flex my-2  gap-2 lg:my-0 justify-between items-start  lg:items-end  w-full lg:flex-col lg:col-span-1 col-span-2">
        <div className=" bg-base-200/50 flex justify-end rounded-xl items-center w-[10em] lg:w-[5em] h-[20px] animate-pulse"></div>

        <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[8em] h-[20px] animate-pulse"></div>
      </div>
    </div>
  );
};
export default BlocksRowSkeleton