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

        if (date - user_data.daily < 86400000) return interaction.reply({content:`Tu as déjà récupéré ta récompense quotidienne ! (Temps restant : ${utilitary.msToTime(86400000 - (date - user_data.daily))})`});
        
        const nb_points = utilitary.getRandom(50, 200);
        user_data = ranks.addXp(nb_points, user_data, interaction.channel);
        user_data.daily = Date.now();
        interaction.reply({content:`${user_data.nickname} vient de récupérer ${nb_points} xp oniriques! (Et une lootbox en plus!!)`});

        // Lootbox add
        if (!user_data.lootbox) user_data.lootbox = 0;

        user_data.lootbox++;
        udata.set(interaction.user.id, user_data);
	},
};