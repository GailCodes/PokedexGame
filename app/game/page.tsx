"use client";
export const dynamic = "force-dynamic";

import StatCard from "@components/StatCard";
import StatCardInput from "@components/StatCardInput";
import { getPokemon } from "@lib/pokeapi";
import { useEffect, useState } from "react";
import { BounceLoader } from "react-spinners";
import { DIFFICULTIES, GENERATIONS, MAX_ROUNDS } from "@utils/constants";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center w-full h-full">
          <BounceLoader color="#36d7b7" />
        </div>
      }
    >
      <GamePage />
    </Suspense>
  );
}

function GamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const difficulty = searchParams.get("difficulty") || undefined;
  const gensParams = searchParams.get("gens") || [];
  const gens =
    typeof gensParams == "string"
      ? gensParams.split(",").map((gen) => parseInt(gen))
      : [];
  const [isCheckingParams, setIsCheckingParams] = useState<boolean>(true);

  const [currentPokemon, setCurrentPokemon] = useState<any>(null);

  const [idGuess, setIdGuess] = useState<string>("");
  const [nameGuess, setNameGuess] = useState<string>("");
  const [typeGuess, setTypeGuess] = useState<string>("");

  const [isIdCorrect, setIsIdCorrect] = useState<boolean>();
  const [isNameCorrect, setIsNameCorrect] = useState<boolean>();
  const [amountOfTypesCorrect, setAmountOfTypesCorrect] = useState<number>();

  const [score, setScore] = useState<number>(0);
  const [roundsPlayed, setRoundsPlayed] = useState<number>(0);
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
    // remove whitespace in middle of name
    const formattedNameGuess = nameGuess
      .toLowerCase()
      .replace(/[^\w\s]|_/g, "")
      .replace(/\s+/g, "");

    const formattedPokemonName = currentPokemon.name
      .toLowerCase()
      .replace(/[^\w\s]|_/g, "")
      .replace(/\s+/g, "");

    const isNameCorrect: boolean = formattedNameGuess === formattedPokemonName;

    // Check how many types are correct (seperate by comma and trim whitespace)
    let amountOfTypesCorrect: number = 0;
    let typesGuessArray = typeGuess
      .split(/[,\s]+/)
      .map((type) => type.trim().toLowerCase());

    // Prevent guessing more types than the Pokemon has
    if (typesGuessArray.length > currentPokemon.types.length) {
      typesGuessArray = typesGuessArray.slice(0, currentPokemon.types.length);
      console.log(typesGuessArray);
      console.log(currentPokemon.types);
    }

    console.log(typesGuessArray);

    // Check each guessed type against the actual types of the Pokemon
    currentPokemon.types.forEach((type) => {
      const typeName = type.type.name.toLowerCase();

      if (typesGuessArray.includes(typeName)) {
        amountOfTypesCorrect++;
      }
    });

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

  function getRandomPokemonId() {
    const selectedGenerations = GENERATIONS.filter((generation) =>
      gens.includes(generation.number),
    );

    const randomGenIndex = Math.floor(
      Math.random() * selectedGenerations.length,
    );

    const min = selectedGenerations[randomGenIndex].min;
    const max = selectedGenerations[randomGenIndex].max;

    const id = Math.floor(Math.random() * (max - min + 1)) + min;

    return id;
  }

  // Check if paramaters are valid
  useEffect(() => {
    if (!difficulty || !gens || gens.length === 0) {
      router.replace("/");
    } else {
      setIsCheckingParams(false);
    }
  }, [difficulty, gens, router]);

  // Fetch a random Pokemon
  useEffect(() => {
    if (isCheckingParams) return;

    setIsLoading(true);
    async function fetchPokemon() {
      try {
        const id = getRandomPokemonId();
        const pokemon = await getPokemon(id);

        if (blacklist.includes(pokemon.id)) {
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
  }, [roundsPlayed, isCheckingParams]);

  // Disable button until all guesses have been made
  useEffect(() => {
    if (roundFinished) return;

    if (
      (difficulty == DIFFICULTIES.hard && !idGuess) ||
      !nameGuess ||
      !typeGuess
    ) {
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
    <div className="flex flex-col items-center gap-2">
      {currentPokemon && roundsPlayed < MAX_ROUNDS && (
        <>
          <h3 className="text-xl mt-10">Score: {score}</h3>
          <h4 className="text-lg">
            Round: {roundsPlayed + 1} / {MAX_ROUNDS}
          </h4>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              checkGuesses();
            }}
          >
            <div className="flex gap-4 mt-10 bg-gray-700 p-4 rounded-lg">
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
                  {difficulty === DIFFICULTIES.hard ? (
                    <>
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
                    </>
                  ) : (
                    <StatCard
                      statType="National Number"
                      statInfo={currentPokemon.id}
                    />
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
                className={`text-lg text-white font-bold py-3 px-4 rounded ${submitButtonDisabled ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700 cursor-pointer"}`}
                type="submit"
                disabled={submitButtonDisabled}
              >
                Submit Guess
              </button>

              {roundFinished && (
                <button className="cursor-pointer" onClick={nextRound}>
                  {roundsPlayed === 9 ? "See final score" : "Next round"}
                </button>
              )}
            </div>
          </form>
        </>
      )}

      {roundsPlayed >= MAX_ROUNDS && (
        <div className="flex flex-col items-center mt-20 gap-4">
          <h2 className="text-3xl font-bold">Game Over!</h2>
          <p className="text-xl">Your final score is: {score}</p>
          <button
            className="text-lg text-white font-bold py-3 px-4 rounded bg-green-500 hover:bg-green-700 cursor-pointer"
            onClick={() => {
              setScore(0);
              setRoundsPlayed(0);
              setBlacklist([]);
            }}
          >
            Play Again
          </button>

          <Link href="/">
            <button className="text-lg text-white font-bold py-3 px-4 rounded bg-green-500 hover:bg-green-700 cursor-pointer">
              Change Settings
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
