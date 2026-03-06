export default function StatCard({ statType, statInfo }) {
  return (
    <div className="text-xl font-medium flex items-center">
      <p className="bg-gray-600 px-4 py-2 w-1/3">{statType}</p>
      <p className="bg-gray-500 px-4 py-2 text-lg w-lg">{statInfo}</p>
    </div>
  );
}
