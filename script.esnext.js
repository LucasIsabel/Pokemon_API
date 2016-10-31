'use strict'

$('form').on('submit', (e) =>{
   e.preventDefault();

    const fetchOptions = {
        headers:{
            'Content-Type' : 'application/json'
        },
        mode:'cors'
    };

    let type = $('input[type=text]').val().replace(/\s/g,'');
    type = type.split(',');

    let trainerTypeCalls = type.map( elem => {
        return fetch('http://pokeapi.co/api/v2/type/' + elem + '/', fetchOptions)
    });


    getPromiseData(trainerTypeCalls)
        .then(result => {
            getDoubleDamagePokemon(result)
    });


    const flatten = (a,b) => [...a,...b];

    let getDoubleDamagePokemon = (pokemonTypes) =>{
        pokemonTypes = pokemonTypes.map( types => {
            return types.damage_relations.double_damage_from
        })
            .reduce(flatten, [])
            .map(type => {
                return fetch(type.url, fetchOptions)
            })

            getPromiseData(pokemonTypes)
                .then(result => {
                    buildTeam(result)
                });
    }

    let buildTeam = (pokemons) => {

        let team = [];

        pokemons = pokemons.map( poke => {
            return poke.pokemon;
        }).reduce(flatten, [])
        .map(poke => poke.pokemon);

        for(let i = 0; i < 6; i++){
            team.push(getRandomPokemon(pokemons));
        }

        team = team.map( pokemon => fetch(pokemon.url,fetchOptions));

        getPromiseData(team)
            .then(pokemonData => {

                console.log(pokemonData)

                displayPokemon(pokemonData)
            })

    }

    let getRandomPokemon = (pokemonArray) => {
        return pokemonArray[ Math.floor(Math.random() * pokemonArray.length)];
    }

});

let getPromiseData = (promiseData) => {
    return new Promise((resolve,reject) => {
       Promise.all(promiseData)
           .then(res => {
               return res.map(type => type.json());
           })
           .then(res => {
              Promise.all(res)
                  .then(resolve)
           })
           .catch(reject);
    });
};

let displayPokemon = (pokemon) => {
    pokemon.forEach((poke) => {
        let container = $('<div>').addClass('pokemon');
        let image = $('<img>').attr('src','http://pokeapi.co/media/img/' + poke.id + '.png');
        let title = $('<h2>').text(poke.name);
        container.append(image,title);
        $('.poke-container').append(container);
    })
}