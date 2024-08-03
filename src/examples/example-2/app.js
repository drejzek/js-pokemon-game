function loadControls() {
    // Vytvoření hlavního kontejneru
    const mainContainer = document.createElement('div');
    mainContainer.classList.add('col-sm-10', 'mx-auto', 'bg-half', 'rounded', 'mb-5');

    // Vytvoření prvního řádku s nadpisem a logem
    const row1 = document.createElement('div');
    row1.classList.add('row', 'mt-4');

    const col1 = document.createElement('div');
    col1.classList.add('col', 'text-center', 'sticky-top', 'fixed-top');

    const logo = document.createElement('img');
    logo.src = 'pokemon-logo.svg';
    logo.alt = '';
    logo.classList.add('mb-3');

    const pokemonName = document.createElement('p');
    pokemonName.id = 'pokemon-name';
    pokemonName.classList.add('h4');

    const timer = document.createElement('p');
    timer.id = 'timer';
    timer.classList.add('h5', 'hide-after-done');

    const results = document.createElement('div');
    results.id = 'results';
    results.classList.add('mt-3');

    col1.append(logo, pokemonName, timer, results);
    row1.appendChild(col1);
    mainContainer.appendChild(row1);

    // Vytvoření řádku s ovládacími prvky
    const row2 = document.createElement('div');
    row2.classList.add('mt-4', 'row');
    row2.id = 'controls';

    const col2 = document.createElement('div');
    col2.classList.add('col-sm-5', 'mx-auto');

    // Výběr generace
    const generationLabel = document.createElement('label');
    generationLabel.textContent = 'Select Generation';
    generationLabel.classList.add('form-label');

    const generationSelect = document.createElement('select');
    generationSelect.id = 'generation';
    generationSelect.classList.add('form-control', 'mb-2');

    // Checkbox pro zahrnutí předchozích generací
    const formCheck = document.createElement('div');
    formCheck.classList.add('form-check', 'mb-3');

    const includePreviousCheckbox = document.createElement('input');
    includePreviousCheckbox.classList.add('form-check-input');
    includePreviousCheckbox.type = 'checkbox';
    includePreviousCheckbox.id = 'include-previous';

    const includePreviousLabel = document.createElement('label');
    includePreviousLabel.classList.add('form-check-label');
    includePreviousLabel.setAttribute('for', 'include-previous');
    includePreviousLabel.textContent = 'Include Previous Generations';

    formCheck.append(includePreviousCheckbox, includePreviousLabel);

    // Časový limit
    const timeLimitFormGroup = document.createElement('div');
    timeLimitFormGroup.classList.add('form-group');

    const timeLimitLabel = document.createElement('label');
    timeLimitLabel.setAttribute('for', 'time-limit');
    timeLimitLabel.textContent = 'Time Limit (seconds):';

    const timeLimitInput = document.createElement('input');
    timeLimitInput.type = 'number';
    timeLimitInput.id = 'time-limit';
    timeLimitInput.classList.add('form-control');
    timeLimitInput.placeholder = '240';
    timeLimitInput.min = '1';

    timeLimitFormGroup.append(timeLimitLabel, timeLimitInput);

    // Tlačítko pro spuštění hry
    const startButton = document.createElement('button');
    startButton.id = 'start-game';
    startButton.classList.add('btn', 'btn-primary', 'mt-3');
    startButton.textContent = 'Start Game';

    col2.append(generationLabel, generationSelect, formCheck, timeLimitFormGroup, startButton);
    row2.appendChild(col2);
    mainContainer.appendChild(row2);

    // Vytvoření řádku pro grid
    const row3 = document.createElement('div');
    row3.classList.add('row', 'mt-4');

    const col3 = document.createElement('div');
    col3.classList.add('col');

    const gridContainer = document.createElement('div');
    gridContainer.id = 'grid-container';
    gridContainer.classList.add('row');

    col3.appendChild(gridContainer);
    row3.appendChild(col3);
    mainContainer.appendChild(row3);

    // Přidání hlavního kontejneru do těla stránky
    document.body.appendChild(mainContainer);
}

$(document).ready(function () {

    loadControls();

    $('.bg-half').fadeIn(1000);

    let correctPokemon;
    let timer;
    let timeLeft;
    let totalPokemons = 36;
    let clickedPokemons = 0;
    let correctClicks = 0;

    const generations = {
        "1": { name: "Kanto", start: 1, end: 151 },
        "2": { name: "Johto", start: 152, end: 251 },
        "3": { name: "Hoenn", start: 252, end: 386 },
        "4": { name: "Sinnoh", start: 387, end: 493 },
        "5": { name: "Unova", start: 494, end: 649 },
        "6": { name: "Kalos", start: 650, end: 721 },
        "7": { name: "Alola", start: 722, end: 809 },
        "8": { name: "Galar", start: 810, end: 898 },
        "9": { name: "Paldea", start: 899, end: 1008 }
    };

    function populateGenerations() {
        const generationSelect = $('#generation');
        generationSelect.empty();
        generationSelect.append($('<option></option>').attr('value', 0).text());
        $.each(generations, function (key, value) {
            generationSelect.append($('<option></option>').attr('value', key).text(`${key} - ${value.name}`));
        });
    }

    function Generate() {
        const generation = document.getElementById('generation').value;
        const includePrevious = document.getElementById('include-previous').checked;

        let filteredPokemons = pokemons.filter(pokemon => {
            const id = parseInt(pokemon.url.split('/')[6]);
            const genStart = generations[generation].start;
            const genEnd = generations[generation].end;

            if (includePrevious) {
                return id <= genEnd;
            } else {
                return id >= genStart && id <= genEnd;
            }
        });

        filteredPokemons = filteredPokemons.sort(() => 0.5 - Math.random()).slice(0, 36);
        totalPokemons = filteredPokemons.length;

        const gridContainer = document.getElementById('grid-container');
        gridContainer.innerHTML = '';

        filteredPokemons.forEach(pokemon => {
            const img = document.createElement('img');
            const id = pokemon.url.split('/')[6];
            img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
            img.classList.add('col-2', 'cursor-pointer');
            img.dataset.id = id;
            img.dataset.name = pokemon.name;
            img.addEventListener('click', checkPokemon);
            gridContainer.appendChild(img);
        });

        correctPokemon = filteredPokemons[Math.floor(Math.random() * filteredPokemons.length)];
        document.getElementById('pokemon-name').textContent = correctPokemon.name;
    }

    function startGame() {
        const timeLimit = $('#time-limit').val() || 240;
        clickedPokemons = 0;
        correctClicks = 0;
        $('#results').html('');
        Generate();
        timeLeft = timeLimit;
        $('#timer').text(`Time left: ${timeLeft} seconds`);
        timer = setInterval(updateTimer, 1000);
        document.querySelector('#controls').style.display = "none";
    }

    function checkPokemon(event) {
        const clickedElement = event.target;
        const clickedId = parseInt(clickedElement.dataset.id);
        if (!clickedElement.classList.contains('clicked')) {
            clickedPokemons++;
            if (clickedId === correctPokemon.id) {
                clickedElement.classList.add('correct');
                correctClicks++;
            } else {
                document.querySelector(`[data-id="${correctPokemon.id}"]`).classList.add('incorrect');
            }
            clickedElement.classList.add('clicked');

            if (clickedPokemons === totalPokemons) {
                clearInterval(timer);
                endGame(true);
            } else {
                do {
                    correctPokemon = getNextPokemon();
                } while (document.querySelector(`[data-id="${correctPokemon.id}"]`).classList.contains('clicked'));
                document.getElementById('pokemon-name').textContent = correctPokemon.name;
            }
        }
    }

    function getNextPokemon() {
        const remainingPokemons = Array.from(document.querySelectorAll('.grid-item')).filter(item => !item.classList.contains('clicked'));
        const nextPokemonIndex = Math.floor(Math.random() * remainingPokemons.length);
        const nextPokemon = remainingPokemons[nextPokemonIndex];
        return {
            id: parseInt(nextPokemon.dataset.id),
            name: nextPokemon.dataset.name
        };
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
        let successMessage;
        if (success) {
            successMessage = 'Congratulations! You found all the Pokémon!';
        } else {
            successMessage = `Time's up! You found ${clickedPokemons} out of ${totalPokemons} Pokémon.`;
        }
        $('#grid-container').off('click');

        const correctPercentage = (correctClicks / clickedPokemons) * 100;
        const resultsMessage = `Počet správných odpovědí: ${correctClicks}<br>Procentuální úspěšnost: ${correctPercentage.toFixed(2)}%`;

        $('#results').html(`${successMessage}<br>${resultsMessage}`);

        $('.hide-after-done').hide();
        $('#hide-after-done').hide();
    }

    $('#start-game').click(function () {
        clickedPokemons = 0;
        startGame();
    });

    populateGenerations();
});
