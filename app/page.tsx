"use client";

import React, { useEffect, useState } from "react";
import { getPokemon } from "@lib/pokeapi";
import StatCard from "@components/StatCard";
import StatCardInput from "@components/StatCardInput";
import { BounceLoader } from "react-spinners";

export default function Page() {
  const [currentPokemon, setCurrentPokemon] = useState<any>(null);

  const [idGuess, setIdGuess] = useState<string>("");
  const [nameGuess, setNameGuess] = useState<string>("");
  const [typeGuess, setTypeGuess] = useState<string>("");

  const [isIdCorrect, setIsIdCorrect] = useState<boolean>(false);
  const [isNameCorrect, setIsNameCorrect] = useState<boolean>(false);
  const [amountOfTypesCorrect, setAmountOfTypesCorrect] = useState<number>(0);

  const [submitButtonDisabled, setSubmitButtonDisabled] =
    useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if guesses are correct
  function checkGuesses() {
    if (!currentPokemon) return;
    setSubmitButtonDisabled(true);

    const isIdCorrect: boolean = idGuess === currentPokemon.id.toString();
    const isNameCorrect: boolean =
      nameGuess.toLowerCase() === currentPokemon.name.toLowerCase();

    // Check how many types are correct (seperate by comma and trim whitespace)
    let amountOfTypesCorrect: number = 0;
    let typesGuessArray = typeGuess
      .split(",")
      .map((type) => type.trim().toLowerCase());

    // Prevent guessing more types than the Pokemon has
    if (typesGuessArray.length > currentPokemon.types.length) {
      typesGuessArray.slice(0, currentPokemon.types.length);
    }

    // Check each guessed type against the actual types of the Pokemon
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
    setIsLoading(true);
    async function fetchPokemon() {
      try {
        const pokemon = await getPokemon();
        setCurrentPokemon(pokemon);

        setTimeout(() => {
          setSubmitButtonDisabled(false);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching Pokemon:", error);
        setIsLoading(false);
      }
    }
    fetchPokemon();
  }, []);

  return (
    <div className="flex flex-col items-center mt-4 gap-2">
      <h1 className="text-4xl font-bold">The Pokédex Game</h1>

      {currentPokemon && (
        <div className="flex gap-4 mt-20 bg-gray-700 p-4 rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center w-48 h-48">
              <BounceLoader color="#36d7b7" />
            </div>
          ) : (
            <div className="flex items-center justify-center w-48 h-48">
              <img
                src={currentPokemon.sprites.front_default}
                className="w-full h-full object-contain"
              />
            </div>
          )}

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
        className={`text-white font-bold py-2 px-4 rounded ${submitButtonDisabled ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700 cursor-pointer"}`}
        onClick={() => checkGuesses()}
        disabled={submitButtonDisabled}
      >
        Submit Guess
      </button>
    </div>
  );
}
