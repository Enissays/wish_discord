const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const utilitary = require('../utilitary/fn_global');
const ranks = require('../utilitary/fn_ranks');
const Enmap = require("enmap");
const cards = require('../utilitary/cards.json');
const arena_data = new Enmap({name: "arena"});
const { translate } = require('bing-translate-api');


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
    channel.messages.fetch(game_data.player_stats_msg).then(msg => msg.edit({content:`**${ranks.getRanks(client.users.cache.get(arena.players[0]), udata).nickname}** : ${game_data[arena.players[0]].hp} ❤️ - ${game_data[arena.players[0]].mana} 🔵 - ${game_data[arena.players[0]].shield} 🛡️\n**${ranks.getRanks(client.users.cache.get(arena.players[1]), udata).nickname}** : ${game_data[arena.players[1]].hp} ❤️ - ${game_data[arena.players[1]].mana} 🔵 - ${game_data[arena.players[0]].shield} 🛡️`}));
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('arena')
		.setDescription("Crée une arène de combat que n'importe qui peut rejoindre")
            .addSubcommand(subcommand => subcommand.setName('create').setDescription("Crée une arène")
                                                     .addStringOption(option => option.setName('nom').setDescription("Le nom de l'arène").setRequired(true)))
            .addSubcommand(subcommand => subcommand.setName('join').setDescription("Rejoins une arène")
                                                    .addStringOption(option => option.setName('id').setDescription("Identifiant de l'arène à rejoindre"))

            )
            .addSubcommand(subcommand => subcommand.setName('delete').setDescription("Supprime une arène")
                                                    .addStringOption(option => option.setName('id').setDescription("Identifiant de l'arène à supprimer"))

            )
            .addSubcommand(subcommand => subcommand.setName('start').setDescription("Lance une partie dans une arène")
                                                    .addStringOption(option => option.setName('id').setDescription("Identifiant de l'arène à lancer"))
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
                if (user_data.arena != undefined) return interaction.reply({content:"Tu es déjà dans une arène !", ephemeral:true});
                var id = utilitary.makeid(10);
                var embed_arena = new EmbedBuilder()
                    .setTitle(interaction.options.getString("nom"))
                    .setDescription(`-> L'arène ${interaction.options.getString("nom")} vient d'être créé !`)
                    .setFooter({text:`${id} - Créateur de l'arène ${ranks.getRanks(interaction.user, udata).nickname}`, iconURL:interaction.user.avatarURL()});
                    arena_data.set(id, {name:interaction.options.getString("nom"), players:[interaction.user.id], creator:interaction.user.id, data : {}});

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
                if (arena.players.length == 2) return interaction.reply({content:"Cette arène est déjà pleine !", ephemeral:true});

                arena.players.push(interaction.user.id);
                arena_data.set(arena_id, arena);
                interaction.reply({content:`Tu as rejoint l'arène **${arena.name}** !`});
                

                user_data.arena = arena_id;
                udata.set(interaction.user.id, user_data);
                break;

            case "delete":
                var arena_id = interaction.options.getString("id");
                var arena = arena_data.get(arena_id);
                if (arena == undefined) return interaction.reply({content:"Cette arène n'existe pas !", ephemeral:true});
                if (arena.creator != interaction.user.id) return interaction.reply({content:"Tu n'es pas le créateur de cette arène !", ephemeral:true});

                arena.players.forEach(player =>
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
                var player_stats_msg = await interaction.channel.send({content:`**${ranks.getRanks(client.users.cache.get(arena.players[0]), udata).nickname}** : ${game_data[arena.players[0]].hp} 💖 - ${game_data[arena.players[0]].mana} 🪄\n**${ranks.getRanks(client.users.cache.get(arena.players[1]), udata).nickname}** : ${game_data[arena.players[1]].hp} 💖 - ${game_data[arena.players[1]].mana} 🪄`});
                
                game_data.msg = msg.id;
                game_data.player_stats_msg = player_stats_msg.id;
                game_data.channel = interaction.channel.id;
                

                console.log(game_data.msg);

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

                var arena_id = interaction.options.getString("id");
                var arena = arena_data.get(arena_id);
                if (arena == undefined) return interaction.reply({content:"Cette arène n'existe pas !", ephemeral:true});
                if (arena.creator != interaction.user.id) return interaction.reply({content:"Tu n'es pas le créateur de cette arène !", ephemeral:true});
                if (arena.players.length != 2) return interaction.reply({content:"Cette arène n'est pas pleine !", ephemeral:true});

                arena.players.forEach(player =>
                {
                    game_data[player] = 
                    {
                        hp : 100,
                        mana : 200,
                        shield : 0,
                        cards : [],
                        atk_buff : 1,
                        def_buff : 1,
                        heal_buff : 1,
                    }
                });


                game_data.effects = [];

                game_data.log.push(`${ranks.getRanks(interaction.user, udata).nickname} a lancé la partie !`);
                game_data.log.push("C'est au tour de " + ranks.getRanks(client.users.cache.get(arena.players[game_data.turn]), udata).nickname + " de jouer !");
                var embed_arena = new EmbedBuilder()
                    .setTitle(arena.name)
                    .setDescription('-> ' + game_data.log.join("\n -> "))

                var msg = await interaction.channel.send({embeds:[embed_arena]})
                var player_stats_msg = await interaction.channel.send({content:`**${ranks.getRanks(client.users.cache.get(arena.players[0]), udata).nickname}** : ${game_data[arena.players[0]].hp} 💖 - ${game_data[arena.players[0]].mana} 🪄\n**${ranks.getRanks(client.users.cache.get(arena.players[1]), udata).nickname}** : ${game_data[arena.players[1]].hp} 💖 - ${game_data[arena.players[1]].mana} 🪄`});
                
                game_data.msg = msg.id;
                game_data.player_stats_msg = player_stats_msg.id;
                game_data.channel = interaction.channel.id;
                

                console.log(game_data.msg);

                arena.data = game_data;
                arena_data.set(arena_id, arena);
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
                var actual_display = new EmbedBuilder()
                    .setTitle(`${cards[user_data.deck[0]].name}`)
                    .setDescription(cards[user_data.deck[0]].description)
                    .setFooter({text:`Carte de ${user_data.nickname}`, iconURL:interaction.user.avatarURL()});

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
                    .setStyle(2);

                var row = new ActionRowBuilder()
                    .addComponents(left_button, right_button, play_button);

                var message = await interaction.reply({embeds:[actual_display], components:[row], ephemeral:true});
                const collectorFilter = i => i.user.id === interaction.user.id;
                const collector = message.createMessageComponentCollector({ filter: collectorFilter, time: 60000 });
                collector.on('collect', async i => {
                    if (i.customId === 'right') {
                        if (actual_card_index == user_data.deck.length - 1) actual_card_index = 0;
                        else actual_card_index++;


                    } else if (i.customId === 'left') {
                        if (actual_card_index == 0) actual_card_index = user_data.deck.length - 1;
                        else actual_card_index--;
                    }
                    else if (i.customId === 'play') {
                        if (game_data[arena.players[player_index]].mana < cards[user_data.deck[actual_card_index]].cost) return i.reply({content:"Tu n'as pas assez de mana pour jouer cette carte !", ephemeral:true});
                        if (game_data.turn != player_index) return i.reply({content:"Ce n'est pas ton tour !", ephemeral:true});
                        var embed = new EmbedBuilder()
                            .setAuthor({name:cards[user_data.deck[actual_card_index]].name, iconURL:interaction.user.avatarURL()})
                            .setDescription(cards[user_data.deck[actual_card_index]].description)
                            .setImage(cards[user_data.deck[actual_card_index]].img)
                            .setFooter({text:`Carte de ${user_data.nickname}`, iconURL:interaction.user.avatarURL()});
                        i.reply({content:`La carte ${cards[user_data.deck[actual_card_index]].name} a été jouée !`, embeds:[embed]});
                        setTimeout(() => {i.deleteReply()}, 5000);

                        if (cards[user_data.deck[actual_card_index]].line)
                        {
                            game_data.log.push(cards[user_data.deck[actual_card_index]].line);
                            await update_game(game_data, arena, client, udata);
                            await sleep(2000);
                        }
                        game_data.log.push(`${ranks.getRanks(interaction.user, udata).nickname} a joué **${cards[user_data.deck[actual_card_index]].name}** !`);
                        ranks.play_change(game_data, user_data.deck[actual_card_index], interaction.user.id, arena.players[player_index == 0 ? 1 : 0]);
                        await update_game(game_data, arena, client, udata);

                        if (game_data[arena.players[game_data.turn == 0 ? 1 : 0]].hp <= 0)
                        {
                            game_data.log.push(`${ranks.getRanks(client.users.cache.get(arena.players[game_data.turn]), udata).nickname} a gagné !`);

                            arena.players.forEach(player =>
                                    {
                                        var player_data = ranks.getRanks(client.users.cache.get(player), udata);
                                        player_data.arena = undefined;
                                        udata.set(player, player_data);
                                    });

                            arena_data.delete(user_data.arena);
                            await update_game(game_data, arena, client, udata);
                            return ;
                        }

                        if (game_data.stun) game_data.stun--;
                        else game_data.turn = player_index == 0 ? 1 : 0;

                        if (game_data.self_stun) {
                            game_data.self_stun--;
                            game_data.stun++;
                        }

                        game_data.log.push("C'est au tour de " + ranks.getRanks(client.users.cache.get(arena.players[game_data.turn]), udata).nickname + " de jouer !");
                        await update_game(game_data, arena, client, udata);
                        arena_data.set(user_data.arena, arena);
                        return;

                    }
                    if (i.customId === 'play') interaction.deleteReply();
                    else 
                    {
                    actual_display.setTitle(`${cards[user_data.deck[actual_card_index]].name}`)
                        .setDescription(cards[user_data.deck[actual_card_index]].description);
                    await i.update({embeds:[actual_display]});
                    }
                });
                

        }
	},
};