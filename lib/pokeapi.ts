const POKE_API_BASE_URL = "https://pokeapi.co/api/v2";
const POKEMON_COUNT = 151;
const ID_BLACKLIST = [];

function randomID(): number {
  const id = Math.floor(Math.random() * POKEMON_COUNT) + 1;

  if (ID_BLACKLIST.includes(id)) {
    return randomID();
  }

  ID_BLACKLIST.push(id);

  return id;
}

async function getPokemon() {
  const id = randomID();
  const response = await fetch(`${POKE_API_BASE_URL}/pokemon/${id}`);

  if (response.status === 200) {
    const data = await response.json();
    return data;
  } else {
    throw new Error(`Failed to fetch Pokemon with id ${id}`);
  }
}

export { getPokemon };
