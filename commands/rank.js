const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const utilitary = require('../utilitary/fn_global');
const ranks = require('../utilitary/fn_ranks');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rank')
		.setDescription("Donne ton rang Onirique"),
	async execute(interaction, client, udata) {
        user_data = ranks.getRanks(interaction.user, udata);
        var facts = [
            "Le saviez-vous ? Vous pouvez changer différents aspects avec /profile",
            "Comment gagner de l'expérience.. ? Parler.. textuellement ou vocalement (dans les channels vérifiés) et d'autres manières..",
            "N'oublie pas!! Chaque jour, tu peux passer récupérer une grosse dose d'expérience onirique, et /daily est la commande parfaite pour ça !",
            "Pourquoi il n'y a pas de /weekly ? Euhh, c'est à sujet de débat...",
            "Tu peux changer le surnom qui s'affiche avec /nickname "
        ]
        console.log(user_data);
        var embed = new EmbedBuilder()
            .setAuthor({name:`Le rang de ${user_data.nickname}`, iconURL:interaction.user.avatarURL()})
            .setDescription(`🌟 Niveau ${user_data.rank.level}\n✨ Exp ${user_data.rank.xp}/${user_data.rank.nextRank}`)
            .setColor(user_data.color)
            .setFooter({text: utilitary.getRandomList(facts)})
        
        interaction.reply({embeds:[embed]})
	},
};