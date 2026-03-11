const POKE_API_BASE_URL = "https://pokeapi.co/api/v2";

async function getPokemon(id: number) {
  const response = await fetch(`${POKE_API_BASE_URL}/pokemon/${id}`);

  if (response.status === 200) {
    const data = await response.json();
    return data;
  } else {
    throw new Error(`Failed to fetch Pokemon with id ${id}`);
  }
}

export { getPokemon };
