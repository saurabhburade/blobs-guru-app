const StatsOverviewCard = ({
  title,
  value,
  isLoading,
}: {
  title: string;
  value: string | number | null;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="h-full w-full bg-base-100 border p-4 space-y-2 border-base-200 animate-pulse">
        <p className=" text-sm opacity-50 h-5 w-20 rounded-full bg-base-200 animate-pulse"></p>
        <p className=" text-sm opacity-50 h-8 w-32 rounded-full bg-base-200 animate-pulse"></p>
      </div>
    );
  }
  return (
    <div className="h-full w-full bg-base-100 border p-4 space-y-2 border-base-200">
      <p className=" text-sm opacity-50">{title || "Block Height"}</p>
      <p className=" text-2xl font-semibold">{value || "20,897,924"}</p>
    </div>
  );
};
export default StatsOverviewCard;
