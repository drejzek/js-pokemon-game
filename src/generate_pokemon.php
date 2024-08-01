<?php
// Čtení obsahu JSON souboru
$pokemonData = file_get_contents('pokemons.json');
$pokemonArray = json_decode($pokemonData, true)['results'];

// Nastavení rozsahu ID Pokémonů
$minId = isset($_POST['minId']) ? intval($_POST['minId']) : 1;
$maxId = isset($_POST['maxId']) ? intval($_POST['maxId']) : 151;

// Filtrování Pokémonů podle ID
$filteredPokemons = array_filter($pokemonArray, function ($pokemon) use ($minId, $maxId) {
    $id = intval(basename(rtrim($pokemon['url'], '/')));
    return $id >= $minId && $id <= $maxId;
});

// Náhodný výběr 36 Pokémonů
$randomPokemons = array_rand($filteredPokemons, 36);
$selectedPokemons = array_intersect_key($filteredPokemons, array_flip($randomPokemons));

echo json_encode(array_values($selectedPokemons));
?>
