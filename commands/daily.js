const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const utilitary = require('../utilitary/fn_global');
const ranks = require('../utilitary/fn_ranks');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('daily')
		.setDescription("Récupère ta récompense quotidienne"),
	async execute(interaction, client, udata) {
        var date = Date.now();
        var user_data = ranks.getRanks(interaction.user, udata);

        if (date - user_data.daily < 86400000) return interaction.reply({content : 'Oups ! Tu n\'as pas encore ta récompense quotidienne de prête ! '});
        
        const nb_points = utilitary.getRandom(50, 200);
        user_data = ranks.addXp(nb_points, user_data, interaction.channel);
        user_data.daily = Date.now();
        udata.set(interaction.user.id, user_data);
        interaction.reply({content:`${user_data.nickname} vient de récupérer ${nb_points} xp oniriques!`})
	},
};