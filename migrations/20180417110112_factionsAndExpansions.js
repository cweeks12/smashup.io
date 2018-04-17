let expansions = [
    'Base Set', 
    'Awesome Level 9000', 
    'The Obligatory Cthulu Set', 
    'Science Fiction Double Feature', 
    'Monster Smash', 
    'Pretty Pretty Smash Up', 
    "It's Your Fault!", 
    'Cease and Desist', 
    'What Were We Thinking?', 
    'Big in Japan', 
    "That '70s Expansion", 
    'Big Geeky Box', 
    'All Star Event Kit', 
    'Sheep Promo', ];

let factions = {
    'Base Set': {
        factions: [
        {name: "Zombies"},
        {name: "Wizards"},
        {name: "Tricksters"},
        {name: "Robots"},
        {name: "Ninjas"},
        {name: "Pirates"},
        {name: "Aliens"},
        {name: "Dinosaurs"},
        ]
    },
    'Awesome Level 9000': {
        factions: [
        {name:     "Bear_Cavalry"},
        {name: "Ghosts"},
        {name: "Killer_Plants"},
        {name: "Steampunks"},
        ]
    },
    'The Obligatory Cthulu Set': {
        factions: [
        {name:     "Elder_Things"},
        {name: "Innsmouth"},
        {name: "Cthulu_Cultists"},
        {name: "Miskatonic_University"},
        ]
    },
    'Science Fiction Double Feature': {
        factions: [
        {name:     "Cyborg_Apes"},
        {name: "Shapeshifters"},
        {name: "Super_Spies"},
        {name: "Time_Travelers"},
        ]
    },
    'Monster Smash': {
        factions: [
        {name:     "Giant_Ants"},
        {name: "Mad_Scientists"},
        {name: "Vampires"},
        {name: "Werewolves"},
        ]
    },
    'Pretty Pretty Smash Up': {
        factions: [
        {name:     "Fairies"},
        {name: "Kitty_Cats"},
        {name: "Mythic_Horses"},
        {name: "Princesses"},
        ]
    },
    "It's Your Fault!": {
        factions: [
        {name:     "Dragons"},
        {name: "Mythic_Greeks"},
        {name: "Sharks"},
        {name: "Tornadoes"},
        {name: "Superheroes"},
        ]
    },
    'Cease and Desist': {
        factions: [
        {name:     "Star_Roamers"},
        {name: "Astro_Knights"},
        {name: "Changerbots"},
        {name: "Ignobles"},
        ]
    },
    'What Were We Thinking?': {
        factions: [
        {name: "Teddy_Bears"},
        {name: "Grandmas"},
        {name: "Rockstars"},
        {name: "Explorers"},
        ]
    },
    'Big in Japan': {
        factions: [
        {name:     "Kaiju"},
        {name: "Mystical_Girls"},
        {name: "Mega_Troopers"},
        {name: "Itty_Critters"},
        ]
    },
    "That '70s Expansion": {
        factions: [
        {name:     "Truckers"},
        {name: "Disco_Dancers"},
        {name: "Vigilantes"},
        {name: "Kung_Fu_Fighters"},
        ]
    },
    'Big Geeky Box': {
        factions: [
        {name: "Geeks"},
        ]
    },
    'All Star Event Kit': {
        factions: [
        {name:  "All_Stars"},
        ]
    },
    'Sheep Promo': {
        factions: [
        {name:  "Sheep"},
        ]
    },
};



exports.up = function(knex, Promise) {
    let factionArray = [];
    for (let key in factions){
        factions[key].factions.forEach(faction => {
            factionArray.push({name: faction.name, expansion: key});
        });
    }
    console.log(factionArray);

    return Promise.all(
            expansions.map(expansion => {
                return knex('expansions').insert({name: expansion})
            }))
            .then( unused => {
                return Promise.all(factionArray.map(faction => {
                    knex('expansions').select('id').where({name: faction.expansion}).first().then(id => {
                        return knex('factions').insert({name: faction.name, expansion_id: id.id});
                    })
                })
                )
            });
};

exports.down = function(knex, Promise) {
    return Promise.all([
            knex('factions').del(),
            knex('expansions').del(),
    ]);
};
