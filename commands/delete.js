const { SlashCommandBuilder } = require('discord.js');
const Enmap = require("enmap");
const bottle_data = new Enmap({name: "bottle"});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('delete')
		.setDescription("Resets your users data"),
	async execute(interaction, client, udata) {
        udata.delete(interaction.user.id);
        interaction.reply('Ouais jtai renitialisé la ouais');
	},
};