const { SlashCommandBuilder } = require('discord.js');
const ranks = require("../utilitary/fn_ranks.js");
module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Pong!'),
	async execute(interaction, client, udata) {
		var data = ranks.getRanks(interaction.user, udata);
		if (data.given) return interaction.reply("Abuse pas par contre");
		data.coins += 20;
		data.given = true;
		interaction.reply(`Tiens 20 pièces j'ai la flemme de faire une commande give`);
		udata.set(interaction.user.id, data);
	},
};