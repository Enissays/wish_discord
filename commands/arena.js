const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const utilitary = require('../utilitary/fn_global');
const ranks = require('../utilitary/fn_ranks');
const Enmap = require("enmap");
const cards = require('../utilitary/cards.json');
const arena_data = new Enmap({name: "arena"});
const { translate } = require('bing-translate-api');
const mobs = require('../utilitary/mobs.json');


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function switch_turn(game_data, arena)
{
    game_data.turn++;

    if (game_data.turn >= arena.players.length) game_data.turn = 0;
    if (game_data[arena.players[game_data.turn]].effects.stun)
    {
        game_data[arena.players[game_data.turn]].effects.stun--;
        game_data.turn++;
        if (game_data.turn >= arena.players.length) game_data.turn = 0;
    }
}

async function update_game(game_data, arena, client, udata)
{
    if (game_data.effects.includes('loud'))
    {
        var line = game_data.log[game_data.log.length - 1];
        game_data.log[game_data.log.length - 1] = line.toUpperCase();
    }
    if (game_data.effects.includes('spanish'))
    {
        var line = game_data.log[game_data.log.length - 1];
        await translate(line, null, 'es').then( res => {
            game_data.log[game_data.log.length - 1] = res.translation;
        }).catch(err => {
            console.error(err);
        });  
    }
    if (game_data.log.length > 10) game_data.log = game_data.log.slice(game_data.log.length - 10);
    var embed_arena = new EmbedBuilder()
        .setAuthor({name:arena.name, iconURL:client.user.avatarURL()})
        .setDescription('-> ' + game_data.log.join("\n -> "))
        .setFooter({text:`Tour ${game_data.turn + 1}`, iconURL:client.user.avatarURL()});

    var channel = client.channels.cache.get(game_data.channel);
    channel.messages.fetch(game_data.msg).then(msg => msg.edit({embeds:[embed_arena]}));
    var stats_msg_content = ""

    arena.players.forEach(player =>
    {
        stats_msg_content += `**${game_data[player].name}** : ${game_data[player].hp} 💖 - ${game_data[player].mana} 🪄\n`;
    }
    );
    channel.messages.fetch(game_data.player_stats_msg).then(msg => msg.edit({content:stats_msg_content}));
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('arena')
		.setDescription("Crée une arène de combat que n'importe qui peut rejoindre")
            .addSubcommand(subcommand => subcommand.setName('create').setDescription("Crée une arène")
                                                     .addStringOption(option => option.setName('nom').setDescription("Le nom de l'arène").setRequired(true))
                                                     .addBooleanOption(option => option.setName('mobs').setDescription("Ajoute un monstre à l'arène (Fais gagner de l'argent)"))
                                                     )
            .addSubcommand(subcommand => subcommand.setName('join').setDescription("Rejoins une arène")
                                                    .addStringOption(option => option.setName('id').setDescription("Identifiant de l'arène à rejoindre"))

            )
            .addSubcommand(subcommand => subcommand.setName('delete').setDescription("Supprime une arène")
                                                   

            )
            .addSubcommand(subcommand => subcommand.setName('start').setDescription("Lance une partie dans une arène")
            )
            .addSubcommand(subcommand => subcommand.setName('play').setDescription("Joue une carte")


            )
            .addSubcommand(subcommand => subcommand.setName('update').setDescription("Met à jour le jeu")
            )
            ,
    async execute(interaction, client, udata) {
        var user_data = ranks.getRanks(interaction.user, udata);
        switch (interaction.options.getSubcommand())
        {
            case "create":
                if (!user_data.deck) return interaction.reply({content:"Tu n'as pas de deck !", ephemeral:true});
                if (user_data.arena != undefined) return interaction.reply({content:"Tu es déjà dans une arène !", ephemeral:true});
                var id = utilitary.makeid(10);
                var embed_arena = new EmbedBuilder()
                    .setTitle(interaction.options.getString("nom"))
                    .setDescription(`-> L'arène ${interaction.options.getString("nom")} vient d'être créé !`)
                    .setFooter({text:`${id} - Créateur de l'arène ${ranks.getRanks(interaction.user, udata).nickname}`, iconURL:interaction.user.avatarURL()});
                    arena_data.set(id, {
                        name:interaction.options.getString("nom"), 
                        players:[interaction.user.id], 
                        creator:interaction.user.id, 
                        data : {},
                        mobs : interaction.options.getBoolean("mobs") ? utilitary.randomChoice(Object.keys(mobs).reduce((obj, key) => { if (mobs[key].level <= user_data.rank.level) obj[key] = mobs[key]; return obj; }, {})) : null
                    });

                    user_data.arena = id;
                    udata.set(interaction.user.id, user_data);
                
                interaction.reply({embeds:[embed_arena]});
                break;

            case "join":
                if (user_data.arena != undefined) return interaction.reply({content:"Tu es déjà dans une arène !", ephemeral:true});
                var arena_id = interaction.options.getString("id");
                var arena = arena_data.get(arena_id);
                if (arena == undefined) return interaction.reply({content:"Cette arène n'existe pas !", ephemeral:true});
                if (arena.players.includes(interaction.user.id)) return interaction.reply({content:"Tu es déjà dans cette arène !", ephemeral:true});
                if (arena.players.length == 5) return interaction.reply({content:"Cette arène est déjà pleine !", ephemeral:true});

                arena.players.push(interaction.user.id);
                arena_data.set(arena_id, arena);
                interaction.reply({content:`Tu as rejoint l'arène **${arena.name}** !`});
                

                user_data.arena = arena_id;
                udata.set(interaction.user.id, user_data);
                break;

            case "delete":
                var arena_id = user_data.arena;
                var arena = arena_data.get(arena_id);
                if (arena == undefined) return interaction.reply({content:"Cette arène n'existe pas !", ephemeral:true});
                if (arena.creator != interaction.user.id) return interaction.reply({content:"Tu n'es pas le créateur de cette arène !", ephemeral:true});
    
                var players = arena.players.filter(player => player != arena.mobs);
                players.forEach(player =>
                {
                    var player_data = ranks.getRanks(client.users.cache.get(player), udata);
                    player_data.arena = undefined;
                    udata.set(player, player_data);
                });

                arena_data.delete(arena_id);
                interaction.reply({content:`L'arène ${arena.name} a été supprimée !`, ephemeral:true});
                break;

            case "update":
                var arena = arena_data.get(user_data.arena);
                var arena_id = user_data.arena;
                if (arena == undefined) return interaction.reply({content:"Tu n'es pas dans une arène !", ephemeral:true});
                var game_data = arena.data;

                // Get the previous message and delete it 
                var channel = client.channels.cache.get(game_data.channel);
                channel.messages.fetch(game_data.msg).then(msg => msg.delete());
                channel.messages.fetch(game_data.player_stats_msg).then(msg => msg.delete());
                var embed_arena = new EmbedBuilder()
                    .setTitle(arena.name)
                    .setDescription('-> ' + game_data.log.join("\n -> "))

                var msg = await interaction.channel.send({embeds:[embed_arena]})
                var stats_msg_content = ""
                var players = arena.players.filter(player => player != arena.mobs);
                players.forEach(player =>
                {
                    stats_msg_content += `**${ranks.getRanks(client.users.cache.get(player), udata).nickname}** : ${game_data[player].hp} 💖 - ${game_data[player].mana} 🪄\n`;
                }
                );
                var player_stats_msg = await interaction.channel.send({content:stats_msg_content});
                
                game_data.msg = msg.id;
                game_data.player_stats_msg = player_stats_msg.id;
                game_data.channel = interaction.channel.id;
                


                arena.data = game_data;
                arena_data.set(arena_id, arena);

                break;
            
            case "start":
                var game_data = 
                {
                    turn : 0,
                    phase : "start",
                    log : []
                }

                var arena_id = user_data.arena;
                var arena = arena_data.get(arena_id);
                if (arena == undefined) return interaction.reply({content:"Cette arène n'existe pas !", ephemeral:true});
                if (arena.creator != interaction.user.id) return interaction.reply({content:"Tu n'es pas le créateur de cette arène !", ephemeral:true});
                if (arena.mobs) arena.players.push(arena.mobs);
                if (arena.players.length < 2) return interaction.reply({content:"Cette arène n'est pas pleine !", ephemeral:true});

                var players_except_mob = arena.players.filter(player => player != arena.mobs);
                players_except_mob.forEach(player =>
                {
                    var user_data = ranks.getRanks(client.users.cache.get(player), udata);
                    game_data[player] = 
                    {
                        hp : 100,
                        mana : 200,
                        shield : 0,
                        cards : user_data.deck,
                        buff : {
                            atk : 1,
                            def : 1,
                            heal : 1
                        },
                        name : ranks.getRanks(client.users.cache.get(player), udata).nickname,
                        effects : []
                    }
                });
                if (arena.mobs)
                {
                    game_data[arena.mobs] = 
                    {
                        hp : mobs[arena.mobs].stats.hp,
                        mana : 200,
                        shield : 0,
                        cards : mobs[arena.mobs].cards,
                        buff : {
                            atk : 1,
                            def : 1,
                            heal : 1
                        },
                        name : mobs[arena.mobs].name,
                        effects : []
                    }
                }

                


                game_data.effects = [];

                game_data.log.push(`${game_data[arena.players[0]].name} **vient de démarrer la partie, préparez-vous** !`);
                if (arena.mobs) game_data.log.push(`🤖 **${mobs[arena.mobs].name}** est apparu !`);
                game_data.log.push("C'est au tour de " + ranks.getRanks(client.users.cache.get(arena.players[game_data.turn]), udata).nickname + " de jouer !");
                var embed_arena = new EmbedBuilder()
                    .setTitle(arena.name)
                    .setDescription('-> ' + game_data.log.join("\n -> "))

                var msg = await interaction.channel.send({embeds:[embed_arena]})
                var stats_msg_content = ""
                arena.players.forEach(player =>
                {
                    stats_msg_content += `**${game_data[player].name}** : ${game_data[player].hp} 💖 - ${game_data[player].mana} 🪄\n`;
                });
                var player_stats_msg = await interaction.channel.send({content:stats_msg_content});
                
                game_data.msg = msg.id;
                game_data.player_stats_msg = player_stats_msg.id;
                game_data.channel = interaction.channel.id;
                


                arena.data = game_data;
                arena_data.set(arena_id, arena);

                interaction.reply({content:"La partie a commencé !", ephemeral:true});
                break;
                
                case "play" : 
                // Affiche les cartes de son deck et lui ajoute un bouton pour jouer
                if (user_data.deck == undefined) return interaction.reply({content:"Tu n'as pas de deck !", ephemeral:true});
                var arena = arena_data.get(user_data.arena);
                if (arena == undefined) return interaction.reply({content:"Tu n'es pas dans une arène !", ephemeral:true});
                var game_data = arena.data;
                var player_index = arena.players.indexOf(interaction.user.id);
                if (player_index != game_data.turn) return interaction.reply({content:"Ce n'est pas ton tour !", ephemeral:true});

                var actual_card_index = 0;

                var right_button = new ButtonBuilder()
                    .setCustomId("right")
                    .setLabel("→")
                    .setStyle(1);
                var left_button = new ButtonBuilder()
                    .setCustomId("left")
                    .setLabel("←")
                    .setStyle(1);

                var play_button = new ButtonBuilder()
                    .setCustomId("play")
                    .setLabel("Jouer")
                    .setStyle(3);

                var skip_button = new ButtonBuilder()
                    .setCustomId("skip")
                    .setLabel("Passer")
                    .setStyle(2);

                var select_player = new StringSelectMenuBuilder()
                    .setCustomId("select_player")
                    .setPlaceholder("Sélectionner un joueur")
                    .addOptions(arena.players.filter(player => player != interaction.user.id).map(player => {return {label:game_data[player].name, value:player}}));

                var default_target = arena.players.filter(player => player != interaction.user.id)[0];

                var actual_display = new EmbedBuilder()
                    .setTitle(`${cards[game_data[interaction.user.id].cards[0]].name}`)
                    .setDescription(cards[game_data[interaction.user.id].cards[0]].description)
                    .setFooter({text:`Cible : ${game_data[default_target].name}`, iconURL: (arena.mobs && game_data[default_target].name == mobs[arena.mobs].name) ? client.user.avatarURL() : client.users.cache.get(default_target).avatarURL()});
                var row = new ActionRowBuilder()
                    .addComponents(left_button, right_button, play_button, skip_button);
                
                var row2 = new ActionRowBuilder()
                    .addComponents(select_player);

                var message = await interaction.reply({embeds:[actual_display], components:[row, row2], ephemeral:true});
                const collectorFilter = i => i.user.id === interaction.user.id;
                const collector = message.createMessageComponentCollector({ filter: collectorFilter, time: 60000 });
                collector.on('collect', async i => {
                    if (i.customId === 'select_player')
                    {
                        var player = i.values[0];
                        default_target = player;
                        actual_display.setFooter({text:`Cible : ${game_data[default_target].name}`, iconURL: arena.mobs && game_data[default_target].name == mobs[arena.mobs].name ? client.user.avatarURL() : client.users.cache.get(default_target).avatarURL()});

                    }
                    if (i.customId === 'right') {
                        if (actual_card_index == game_data[interaction.user.id].cards.length - 1) actual_card_index = 0;
                        else actual_card_index++;


                    } else if (i.customId === 'left') {
                        if (actual_card_index == 0) actual_card_index = game_data[interaction.user.id].cards.length - 1;
                        else actual_card_index--;
                    }
                    else if (i.customId === 'play') {
                        var card_id = game_data[interaction.user.id].cards[actual_card_index];
                        var card = cards[card_id];
                        console.log(card);
                        console.log(card_id);
                        if (game_data[arena.players[player_index]].mana < card.cost) return i.reply({content:"Tu n'as pas assez de mana pour jouer cette carte !", ephemeral:true});
                        if (game_data.turn != player_index) return i.reply({content:"Ce n'est pas ton tour !", ephemeral:true});
                        var embed = new EmbedBuilder()
                            .setAuthor({name:card.name, iconURL:interaction.user.avatarURL()})
                            .setDescription(card.description)
                            .setImage(card.img)
                            .setFooter({text:`Carte de ${user_data.nickname}`, iconURL:interaction.user.avatarURL()});
                        if (!game_data.effects.includes("mute") || game_data.mute != interaction.user.id) i.reply({content:`La carte ${card.name} a été jouée !`, embeds:[embed]});
                        else i.reply({content:`Une carte a été jouée !`});
                        setTimeout(() => {i.deleteReply()}, 5000);


                        if (card.line)
                        {
                            game_data.log.push(card.line);
                            await update_game(game_data, arena, client, udata);
                            await sleep(2000);
                        }
                        if (game_data.effects.includes("mute") && game_data.mute == interaction.user.id) game_data.log.push(`${game_data[arena.players[player_index]].name} a joué **[Carte muette]** !`);
                        else game_data.log.push(`${game_data[arena.players[player_index]].name} a joué **${card.name}** !`);
                        
                        // Get a list of all the players in the game except the one who played the card
                        var player = default_target;
                        ranks.play_change(game_data, user_data.deck[actual_card_index], interaction.user.id, default_target);
                        update_game(game_data, arena, client, udata);
                        await sleep(2000);

                        if (game_data[player].hp <= 0) 
                            {
                                if (player == arena.mobs) {
                                    game_data.log.push(`🤖 **${mobs[arena.mobs].name}** a perdu !`);
                                    game_data.mob = undefined;
                                    arena_data.data = game_data;

                                    var players_except_mob = arena.players.filter(player => player != arena.mobs);
                                    players_except_mob.forEach(async player =>
                                    {
                                        var player_data = ranks.getRanks(client.users.cache.get(player), udata);
                                        player_data.coins += 10 * mobs[arena.mobs].level;
                                        console.log(player_data.coins);
                                        await udata.set(player, player_data);
                                        console.log(udata.get(player))
                                    });
                                    game_data.log.push(`🤖 **${mobs[arena.mobs].name}** a donné **${10 * mobs[arena.mobs].level}** pièces à chaque joueur !`);
                                }
                                else {
                                    game_data.log.push(`${game_data[player].name} a perdu !`);
                                    var player_data = ranks.getRanks(client.users.cache.get(player), udata);
                                    player_data.arena = undefined;
                                    udata.set(player, player_data);

                                }
                                // Remove this player from the game
                                var index = arena.players.indexOf(player);
                                arena.players.splice(index, 1);
                                arena_data.set(user_data.arena, arena);
                            }
                        

                        if (arena.players.length == 1 && !game_data.mob)
                        {
                            game_data.log.push(`${game_data[arena.players[0]].name} a gagné ! Il gagne 50xp!`);
                            arena_data.delete(user_data.arena);
                            var players_except_mob = arena.players.filter(player => player != arena.mobs);
                            players_except_mob.forEach(async player =>
                            {
                                var player_data = ranks.getRanks(client.users.cache.get(player), udata);
                                player_data.arena = undefined;
                                player_data = ranks.addXp(50, player_data, client.channels.cache.get(game_data.channel));
                                player_data = ranks.addCheevo("win_first_battle", player_data, interaction.channel, client.users.cache.get(player).avatarURL());
                                await udata.set(player, player_data);
                            });
                            
                            await update_game(game_data, arena, client, udata);
                            return ;
                        }

                        switch_turn(game_data, arena);


                        if (arena.mobs && arena.mobs == arena.players[game_data.turn])
                        {
                                // Le mob joue
                                var mob = mobs[arena.mobs];
                                var mob_card_id = utilitary.getRandomList(game_data[arena.mobs].cards);
                                var mob_card = cards[mob_card_id];

                                game_data.log.push(`🤖 **${mob.playing_line}**`);
                                await update_game(game_data, arena, client, udata);
                                await sleep(2000);

                                game_data.log.push(`🤖 **${mob.name}** a joué **${mob_card.name}** !`);
                                var non_mob_players = arena.players.filter(player => player != arena.mobs);
                                non_mob_players.forEach(async player =>
                                {
                                    ranks.play_change(game_data, mob_card_id, arena.mobs, player, true);
                                    await update_game(game_data, arena, client, udata);
                                    await sleep(2000);

                                    if (game_data[player].hp <= 0) 
                                    {
                                        game_data.log.push(`${game_data[player].name} a perdu !`);
                                        // Remove this player from the game
                                        var index = arena.players.indexOf(player);
                                        arena.players.splice(index, 1);
                                        var player_data = ranks.getRanks(client.users.cache.get(player), udata);
                                        player_data.arena = undefined;
                                        udata.set(player, player_data);
                                    }
                                });
                                if (arena.players.length == 0)
                                {
                                    game_data.log.push(`🤖 **${mob.name}** a gagné !`);
                                    user_data.arena = undefined;
                                    udata.set(interaction.user.id, user_data);
                                    arena_data.delete(user_data.arena);
                                    await update_game(game_data, arena, client, udata);
                                    return ;
                                }
                            switch_turn(game_data, arena);
                        }


                        user_data.data = game_data;

                        game_data.log.push("C'est au tour de " + game_data[arena.players[game_data.turn]].name + " de jouer !");
                        await update_game(game_data, arena, client, udata);
                        arena_data.set(user_data.arena, arena);
                        return;

                    }
                    actual_display.setTitle(`${cards[game_data[interaction.user.id].cards[actual_card_index]].name}`)
                        .setDescription(cards[game_data[interaction.user.id].cards[actual_card_index]].description)
                    await i.update({embeds:[actual_display]});
                    
                });
                break;

                    
                

        }
	},
};