interface StatCardInputProps {
  statType: string;
  guess?: string;
  setGuess: (value: string) => void;
  placeholder?: string;
}

export default function StatCardInput({
  statType,
  guess,
  setGuess,
  placeholder,
}: StatCardInputProps) {
  return (
    <div className="text-xl font-medium flex items-center max-md:flex-col">
      <p className="bg-gray-600 px-4 py-2 w-1/3 max-md:w-full">{statType}</p>
      <input
        type="text"
        className="bg-gray-400 text-black px-4 py-2 text-lg w-lg max-md:w-full"
        onChange={(e) => setGuess(e.target.value)}
        placeholder={placeholder || `Enter ${statType.toLowerCase()}`}
        value={guess || ""}
      />
    </div>
  );
}
