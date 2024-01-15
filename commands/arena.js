const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const utilitary = require('../utilitary/fn_global');
const ranks = require('../utilitary/fn_ranks');
const Enmap = require("enmap");

const arena_data = new Enmap({name: "arena"});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('arena')
		.setDescription("Crée une arène de combat que n'importe qui peut rejoindre")
            .addSubcommand((subcommand) => subcommand.setName('create').setDescription("Crée une arène")
                                                     .addStringOption(option => option.setName('nom').setDescription("Le nom de l'arène"))),
    async execute(interaction, client, udata) {
        switch (interaction.options.getSubcommand)
        {
            case "create":
                var id = utilitary.makeid(10);
                var embed_arena = new EmbedBuilder()
                    .setTitle(interaction.options.getString("nom"))
                    .setDescription(`-> L'arène ${interaction.options.getString("nom")} vient d'être créé !`)
                    .setFooter({text:`${id} - Créateur de l'arène ${ranks.getRanks(interaction.user, udata).nickname}`, iconURL:interaction.user.avatarURL()});
                    arena_data.set(id, {name:interaction.options.getString("nom"), players:[]});
                break;
        }
	},
};