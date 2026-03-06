"use client";

import React, { useEffect, useState } from "react";
import { getPokemon } from "@lib/pokeapi";
import StatCard from "@components/StatCard";
import StatCardInput from "@components/StatCardInput";

export default function Page() {
  const [currentPokemon, setCurrentPokemon] = useState<any>(null);

  const [idGuess, setIdGuess] = useState<string>("");
  const [nameGuess, setNameGuess] = useState<string>("");
  const [typeGuess, setTypeGuess] = useState<string>("");

  const [isIdCorrect, setIsIdCorrect] = useState<boolean>(false);
  const [isNameCorrect, setIsNameCorrect] = useState<boolean>(false);
  const [amountOfTypesCorrect, setAmountOfTypesCorrect] = useState<number>(0);

  // Check if guesses are correct
  function checkGuesses() {
    if (!currentPokemon) return;

    const isIdCorrect: boolean = idGuess === currentPokemon.id.toString();
    const isNameCorrect: boolean =
      nameGuess.toLowerCase() === currentPokemon.name.toLowerCase();

    // Check how many types are correct (seperate by comma and trim whitespace
    let amountOfTypesCorrect: number = 0;
    let typesGuessArray = typeGuess
      .split(",")
      .map((type) => type.trim().toLowerCase());

    if (typesGuessArray.length > currentPokemon.types.length) {
      typesGuessArray.slice(0, currentPokemon.types.length);
    }

    currentPokemon.types.forEach((type) => {
      const typeName = type.type.name.toLowerCase();

      if (typesGuessArray.includes(typeName)) {
        amountOfTypesCorrect++;
      }
    });

    console.log("ID Guess:", isIdCorrect, "Actual ID:", currentPokemon.id);
    console.log(
      "Name Guess:",
      isNameCorrect,
      "Actual Name:",
      currentPokemon.name,
    );
    console.log(
      "Type Guess:",
      amountOfTypesCorrect,
      "out of",
      currentPokemon.types.length,
      "Actual Types:",
      currentPokemon.types.map((type) => type.type.name).join(", "),
    );

    setIsIdCorrect(isIdCorrect);
    setIsNameCorrect(isNameCorrect);
    setAmountOfTypesCorrect(amountOfTypesCorrect);
  }

  // Fetch a random Pokemon
  useEffect(() => {
    async function fetchPokemon() {
      try {
        const pokemon = await getPokemon();
        setCurrentPokemon(pokemon);
      } catch (error) {
        console.error("Error fetching Pokemon:", error);
      }
    }
    fetchPokemon();
  }, []);

  return (
    <div className="flex flex-col items-center mt-4 gap-2">
      <h1 className="text-4xl font-bold">The Pokédex Game</h1>

      {currentPokemon && (
        <div className="flex gap-4 mt-20 bg-gray-700 p-4 rounded-lg">
          <img
            src={currentPokemon.sprites.front_default}
            alt={"Pokemon Sprite"}
            className="w-48 h-48 object-contain"
          />

          <div className="w-full">
            <StatCardInput statType="National Number" setGuess={setIdGuess} />
            <StatCardInput statType="Name" setGuess={setNameGuess} />
            <StatCard statType="Height" statInfo={currentPokemon.height} />
            <StatCard statType="Weight" statInfo={currentPokemon.weight} />
            <StatCardInput
              statType="Type"
              setGuess={setTypeGuess}
              placeholder="Enter type(s) seperated by a comma"
            />
          </div>
        </div>
      )}

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
        onClick={() => checkGuesses()}
      >
        Submit Guess
      </button>
    </div>
  );
}
