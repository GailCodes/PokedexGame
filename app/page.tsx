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

  const [isIdCorrect, setIsIdCorrect] = useState<boolean>();
  const [isNameCorrect, setIsNameCorrect] = useState<boolean>();
  const [amountOfTypesCorrect, setAmountOfTypesCorrect] = useState<number>();

  const [score, setScore] = useState<number>(0);
  const [roundsPlayed, setRoundsPlayed] = useState<number>(0); // 10 rounds total
  const [roundFinished, setRoundFinished] = useState<boolean>(false);

  const [blacklist, setBlacklist] = useState<number[]>([]);

  const [submitButtonDisabled, setSubmitButtonDisabled] =
    useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if guesses are correct
  function checkGuesses() {
    if (!currentPokemon || roundFinished) return;
    setSubmitButtonDisabled(true);

    const isIdCorrect: boolean = idGuess === currentPokemon.id.toString();

    // Remove punctuation, extra whitespace and make lowercase for name guess
    const formattedNameGuess = nameGuess
      .toLowerCase()
      .replace(/[^\w\s]|_/g, "")
      .replace(/\s+/g, " ")
      .trim();
    const isNameCorrect: boolean =
      formattedNameGuess === currentPokemon.name.toLowerCase();

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
    setRoundFinished(true);
  }

  function nextRound() {
    setIdGuess("");
    setNameGuess("");
    setTypeGuess("");

    setIsIdCorrect(undefined);
    setIsNameCorrect(undefined);
    setAmountOfTypesCorrect(undefined);
    setRoundFinished(false);
    setRoundsPlayed(roundsPlayed + 1);
  }

  // Fetch a random Pokemon
  useEffect(() => {
    setIsLoading(true);
    async function fetchPokemon() {
      try {
        const pokemon = await getPokemon();

        if (blacklist.includes(pokemon.id)) {
          console.log(
            `Pokemon with id ${pokemon.id} is already used. Fetching another one...`,
          );
          return fetchPokemon();
        }
        setBlacklist([...blacklist, pokemon.id]);

        setCurrentPokemon(pokemon);

        setTimeout(() => {
          setIsLoading(false);
        }, 250);
      } catch (error) {
        console.error("Error fetching Pokemon:", error);
        setIsLoading(false);
      }
    }
    fetchPokemon();
  }, [roundsPlayed]);

  // Disable button until all guesses have been made
  useEffect(() => {
    if (roundFinished) return;

    if (!idGuess || !nameGuess || !typeGuess) {
      setSubmitButtonDisabled(true);
    } else {
      setSubmitButtonDisabled(false);
    }
  }, [idGuess, nameGuess, typeGuess, roundFinished]);

  // Disabe button until next round
  useEffect(() => {
    if (roundFinished) {
      setSubmitButtonDisabled(true);
    }
  }, [roundFinished]);

  // Update score
  useEffect(() => {
    let newScore = score;
    if (isIdCorrect) newScore += 1;
    if (isNameCorrect) newScore += 1;
    if (amountOfTypesCorrect) newScore += amountOfTypesCorrect;

    setScore(newScore);
  }, [isIdCorrect, isNameCorrect, amountOfTypesCorrect]);

  return (
    <div className="flex flex-col items-center mt-4 gap-2">
      <h1 className="text-4xl font-bold">The Pokédex Game</h1>

      {currentPokemon && roundsPlayed < 10 && (
        <>
          <h3 className="text-xl">Score: {score}</h3>
          <h4 className="text-lg">Round: {roundsPlayed + 1} / 10</h4>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              checkGuesses();
            }}
          >
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

              {/* Pokedex Information */}
              <div className="w-full">
                {/* GUESS: Name */}
                <div>
                  <StatCardInput
                    statType="Name"
                    guess={nameGuess}
                    setGuess={setNameGuess}
                  />
                  {isNameCorrect !== undefined && (
                    <div
                      className={`py-1 ${isNameCorrect ? "text-green-500" : "text-red-500"}`}
                    >
                      {isNameCorrect ? "✅" : "❌"} ({currentPokemon.name})
                    </div>
                  )}
                </div>

                {/* GUESS: National ID */}
                <div>
                  <StatCardInput
                    statType="National Number"
                    guess={idGuess}
                    setGuess={setIdGuess}
                  />
                  {isIdCorrect !== undefined && (
                    <div
                      className={`py-1 ${isIdCorrect ? "text-green-500" : "text-red-500"}`}
                    >
                      {isIdCorrect ? "✅" : "❌"} ({currentPokemon.id})
                    </div>
                  )}
                </div>

                <StatCard statType="Height" statInfo={currentPokemon.height} />
                <StatCard statType="Weight" statInfo={currentPokemon.weight} />

                {/* GUESS: Type(s) */}
                <div>
                  <StatCardInput
                    statType="Type"
                    guess={typeGuess}
                    setGuess={setTypeGuess}
                    placeholder="Enter type(s) seperated by a comma"
                  />
                  {amountOfTypesCorrect !== undefined && (
                    <div
                      className={`py-1 ${amountOfTypesCorrect === currentPokemon.types.length && "text-green-500"} ${
                        amountOfTypesCorrect > 0 &&
                        amountOfTypesCorrect < currentPokemon.types.length &&
                        "text-yellow-500"
                      } ${amountOfTypesCorrect === 0 && "text-red-500"}`}
                    >
                      {amountOfTypesCorrect === currentPokemon.types.length &&
                        "✅"}
                      {amountOfTypesCorrect > 0 &&
                        amountOfTypesCorrect < currentPokemon.types.length &&
                        "🟨"}
                      {amountOfTypesCorrect === 0 && "❌"}{" "}
                      {amountOfTypesCorrect} out of{" "}
                      {currentPokemon.types.length} correct (
                      {currentPokemon.types
                        .map((type) => type.type.name)
                        .join(", ")}
                      )
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 mt-2">
              <button
                className={`text-white font-bold w-48 py-2 px-4 rounded ${submitButtonDisabled ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700 cursor-pointer"}`}
                type="submit"
                disabled={submitButtonDisabled}
              >
                Submit Guess
              </button>

              {roundFinished && (
                <button className="cursor-pointer" onClick={nextRound}>
                  Next round
                </button>
              )}
            </div>
          </form>
        </>
      )}

      {roundsPlayed >= 10 && (
        <div className="flex flex-col items-center mt-20 gap-4">
          <h2 className="text-3xl font-bold">Game Over!</h2>
          <p className="text-xl">Your final score is: {score}</p>
          <button
            className="text-white font-bold py-2 px-4 rounded bg-green-500 hover:bg-green-700 cursor-pointer"
            onClick={() => {
              setScore(0);
              setRoundsPlayed(0);
              setBlacklist([]);
            }}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
