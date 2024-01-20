const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const utilitary = require('../utilitary/fn_global');
const ranks = require('../utilitary/fn_ranks');
const Enmap = require("enmap");
const cards = require('../utilitary/cards.json');
const arena_data = new Enmap({name: "arena"});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('arena')
		.setDescription("Crée une arène de combat que n'importe qui peut rejoindre")
            .addSubcommand(subcommand => subcommand.setName('create').setDescription("Crée une arène")
                                                     .addStringOption(option => option.setName('nom').setDescription("Le nom de l'arène")))
            .addSubcommand(subcommand => subcommand.setName('join').setDescription("Rejoins une arène")
                                                    .addStringOption(option => option.setName('id').setDescription("Identifiant de l'arène à rejoindre"))),
    async execute(interaction, client, udata) {
        switch (interaction.options.getSubcommand())
        {
            case "create":
                console.log(interaction.options.getString("nom"));
                var id = utilitary.makeid(10);
                var embed_arena = new EmbedBuilder()
                    .setTitle(interaction.options.getString("nom"))
                    .setDescription(`-> L'arène ${interaction.options.getString("nom")} vient d'être créé !`)
                    .setFooter({text:`${id} - Créateur de l'arène ${ranks.getRanks(interaction.user, udata).nickname}`, iconURL:interaction.user.avatarURL()});
                    arena_data.set(id, {name:interaction.options.getString("nom"), players:[], creator:interaction.user.id, data : {}});
                
                interaction.reply({embeds:[embed_arena]});
                break;

            case "join":
                var arena_id = interaction.options.getString("id");
                var arena = arena_data.get(arena_id);
                if (arena == undefined) return interaction.reply({content:"Cette arène n'existe pas !", ephemeral:true});
                if (arena.players.includes(interaction.user.id)) return interaction.reply({content:"Tu es déjà dans cette arène !", ephemeral:true});
                if (arena.players.length == 2) return interaction.reply({content:"Cette arène est déjà pleine !", ephemeral:true});

                arena.players.push(interaction.user.id);
                arena_data.set(arena_id, arena);
                interaction.reply({content:`Tu as rejoint l'arène ${arena.name} !`, ephemeral:true});
                break;

            case "delete":
                var arena_id = interaction.options.getString("id");
                var arena = arena_data.get(arena_id);
                if (arena == undefined) return interaction.reply({content:"Cette arène n'existe pas !", ephemeral:true});
                if (arena.creator != interaction.user.id) return interaction.reply({content:"Tu n'es pas le créateur de cette arène !", ephemeral:true});

                arena_data.delete(arena_id);
                interaction.reply({content:`L'arène ${arena.name} a été supprimée !`, ephemeral:true});
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
                        mana : 100,
                        cards : []
                    }
                });

                game_data.log.push(`${ranks.getRanks(interaction.user, udata).nickname} a lancé la partie !`);
                var embed_arena = new EmbedBuilder()
                    .setTitle(arena.name)
                    .setDescription('->' + game_data.log.join("\n ->"))

                interaction.reply({embeds:[embed_arena]}).then(msg =>
                {
                    game_data.msg = msg;
                });

                arena.data = game_data;
                arena_data.set(arena_id, arena);


                break;

            case "play":
                

        }
	},
};