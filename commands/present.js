const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ranks = require("../utilitary/fn_ranks.js");
const intros = require("../utilitary/default_intros.json");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('presente')
        .setDescription('T\'as raté une présentation ? Pas grave, utilise cette commande pour re-afficher une présentation.')
        .addUserOption(option => option.setName('user').setDescription('La personne à présenter')),
    async execute(interaction, client, udata) {
        var user = interaction.options.getUser('user');
        var embed = new EmbedBuilder()
        .setTitle("Présentation")
        .setAuthor({iconURL: user.avatarURL({ dynamic:true }), name: intros[user.id] ? intros[user.id].name : user.username})
        .setDescription(intros[user.id] ? intros[user.id].description : "J'ai pas vraiment de données sur lui honnêtement, désolé.."  + "\n**Origine :** " + (intros[message.author.id] ? intros[message.author.id].origin : "Inconnue") )
        .setFooter({text: "Âge : " + (intros[message.author.id] ? intros[message.author.id].age : "Inconnu")})

        .setColor("#FF0000")

    interaction.reply({embeds: [embed], ephemeral: true});
    },
};