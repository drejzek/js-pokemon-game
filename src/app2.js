$(document).ready(function () {

    $('.bg-half').fadeIn(1000);

    let correctPokemon;
    let timer;
    let timeLeft;
    let totalPokemons = 36;
    let clickedPokemons = 0;

    function startGame() {
        const minId = $('#min-id').val() || 1;
        const maxId = $('#max-id').val() || 151;
        const timeLimit = $('#time-limit').val() || 60;

        $.post('generate_pokemon.php', { minId, maxId }, function (data) {
            const pokemonArray = JSON.parse(data);
            setupGrid(pokemonArray);
            correctPokemon = pokemonArray[Math.floor(Math.random() * pokemonArray.length)];
            $('#pokemon-name').text(correctPokemon.name);
            timeLeft = timeLimit;
            $('#timer').text(`Time left: ${timeLeft} seconds`);
            timer = setInterval(updateTimer, 1000);
        });

        document.querySelector('#controls').style.display = "none";
    }

    function setupGrid(pokemonArray) {
        const gridContainer = $('#grid-container');
        gridContainer.empty();
        pokemonArray.forEach(pokemon => {
            const id = parseInt(pokemon.url.split('/').slice(-2, -1)[0]);
            const gridItem = $(`<div class="grid-item col-sm-2 text-center border cursor-pointer pt-3" data-id="${id}" data-name="${pokemon.name}"><img class="w-50" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png" alt="${pokemon.name}"><p class="pokemon-label">-</p></div>`);
            gridContainer.append(gridItem);
        });
    }

    function updateTimer() {
        timeLeft--;
        $('#timer').text(`Time left: ${timeLeft} seconds`);
        if (timeLeft <= 0) {
            clearInterval(timer);
            endGame(false);
        }
    }

    function endGame(success) {
        if (success) {
            alert('Congratulations! You found all the Pokémon!');
        } else {
            alert(`Time's up! You found ${clickedPokemons} out of ${totalPokemons} Pokémon.`);
        }
        $('#grid-container').off('click');
    }

    $('#grid-container').on('click', '.grid-item', function () {
        const clickedId = $(this).data('id');
        const clickedName = $(this).data('name');
        if (!$(this).hasClass('clicked')) {
            if (clickedId === correctPokemon.id) {
                $(this).addClass('correct');
                $(this).find('.pokemon-label').text(clickedName);
            } else {
                $(this).addClass('incorrect');
                $(`[data-id="${correctPokemon.id}"]`).addClass('incorrect');
                $(`[data-id="${correctPokemon.id}"]`).find('.pokemon-label').text(correctPokemon.name);
            }
            $(this).addClass('clicked');
            clickedPokemons++;

            if (clickedPokemons === totalPokemons) {
                clearInterval(timer);
                endGame(true);
            } else {
                do {
                    correctPokemon = getNextPokemon();
                } while ($(`[data-id="${correctPokemon.id}"]`).hasClass('clicked'));
                $('#pokemon-name').text(correctPokemon.name);
            }
        }
    });

    function getNextPokemon() {
        const remainingPokemons = $('.grid-item').not('.clicked');
        const nextPokemonIndex = Math.floor(Math.random() * remainingPokemons.length);
        const nextPokemon = remainingPokemons.eq(nextPokemonIndex);
        return {
            id: nextPokemon.data('id'),
            name: nextPokemon.data('name')
        };
    }

    $('#start-game').click(function () {
        clickedPokemons = 0;
        startGame();
    });
});
