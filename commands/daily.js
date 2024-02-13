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
        var phrases = [
                "Tu vas bien au fait ?",
                "Bien dormi ?",
                "Oublie pas le prochain daily !!",
                "On est bien là non ?",
                "Et si t'essayais un nouveau plat aujourd'hui ?",
                "Tu as déjà vu un chat voler ?"
        ]
        const nb_points = utilitary.getRandom(50, 200);
        user_data = ranks.addXp(nb_points, user_data, interaction.channel);
        user_data.coins += 50;
        user_data.daily = Date.now();
        interaction.reply({content:`${user_data.nickname} vient de récupérer ${nb_points} xp oniriques en plus de **50 pièces**! (Et une lootbox en plus!!) \n*${utilitary.getRandomList(phrases)}*`});

        // Lootbox add
        if (!user_data.lootbox) user_data.lootbox = 0;

        user_data.lootbox++;
        udata.set(interaction.user.id, user_data);

        console.log(udata.get(interaction.user.id));
	},
};