"use client";

import { DIFFICULTIES, GENERATIONS } from "@utils/constants";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Page() {
  const [difficulty, setDifficulty] = useState<string>(DIFFICULTIES.normal);
  const [selectedGens, setSelectedGens] = useState<number[]>([1]);
  const [startGameButtonEnabled, setStartGameButtonEnabled] =
    useState<boolean>(false);

  useEffect(() => {
    if (difficulty && selectedGens.length > 0) {
      setStartGameButtonEnabled(true);
    } else {
      setStartGameButtonEnabled(false);
    }
  }, [difficulty, selectedGens]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="pt-8">
        <h4 className="text-3xl font-semibold">Welcome to the Pokédex Game!</h4>

        <div className="py-10">
          <p className="text-2xl pb-2"> &gt; Difficulty &lt;</p>
          <div>
            <input
              type="checkbox"
              value={DIFFICULTIES.normal}
              name={DIFFICULTIES.normal}
              checked={difficulty === DIFFICULTIES.normal}
              onChange={() => setDifficulty(DIFFICULTIES.normal)}
              className="accent-yellow-500 w-4 h-4"
            />

            <label
              className="ml-2 text-xl text-yellow-500"
              htmlFor={DIFFICULTIES.normal}
            >
              Normal
            </label>
          </div>

          <div>
            <input
              type="checkbox"
              value={DIFFICULTIES.hard}
              name={DIFFICULTIES.hard}
              checked={difficulty === DIFFICULTIES.hard}
              onChange={() => setDifficulty(DIFFICULTIES.hard)}
              className="accent-red-500 w-4 h-4"
            />

            <label
              className="ml-2 text-xl text-red-500"
              htmlFor={DIFFICULTIES.hard}
            >
              Hard
            </label>
          </div>

          <p className="text-2xl pb-2 pt-4"> &gt; Generations &lt;</p>
          <div className="grid grid-cols-4 gap-4">
            {GENERATIONS.map((generation, index) => (
              <div key={index}>
                <input
                  type="checkbox"
                  name={`generation-${generation.number}`}
                  className="w-4 h-4"
                  checked={selectedGens.includes(generation.number)}
                  onChange={() => {
                    const newGenerationsArray = [...selectedGens];
                    const indexOfGeneration = selectedGens.indexOf(
                      generation.number,
                    );

                    if (indexOfGeneration === -1) {
                      newGenerationsArray.push(generation.number);
                    } else {
                      newGenerationsArray.splice(
                        newGenerationsArray.indexOf(generation.number),
                        1,
                      );
                    }

                    setSelectedGens(newGenerationsArray);
                  }}
                />
                <label
                  htmlFor={`generation-${generation.number}`}
                  className="ml-2 text-xl"
                >
                  Gen {generation.number}
                </label>
              </div>
            ))}
          </div>
        </div>

        {startGameButtonEnabled ? (
          <Link
            href={{
              pathname: "/game",
              query: { difficulty, gens: selectedGens.join(",") },
            }}
          >
            <button className="text-lg bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded cursor-pointer">
              Start Game
            </button>
          </Link>
        ) : (
          <button
            disabled
            className="text-lg bg-gray-500 text-white font-bold py-3 px-4 rounded"
          >
            Start Game
          </button>
        )}
      </div>
    </div>
  );
}
