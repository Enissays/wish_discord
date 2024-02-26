const { SlashCommandBuilder } = require('discord.js');
const ranks = require("../utilitary/fn_ranks.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('auto_present')
        .setDescription('Commande réservée à Ju\' pour gérer la liste des gens présentés.')
        .addBooleanOption(option => option.setName('is_present').setDescription('Mets sur true pour réinitialiser la liste des gens présentés, sur false pour la supprimer.')),
    async execute(interaction, client, udata) {
        if (interaction.user.id != '554387030423896064' && interaction.user.id != '849936690915442698') return interaction.reply('Désolé, je garde cette commande pour Ju\' pour le moment, je l\'ouvrirai plus tard.');
        const isPresent = interaction.options.getBoolean('is_present');
        if (isPresent) {
            udata.set('present', []);
            interaction.reply("J'ai réinitialisé la liste des gens présentés.");
        } else {
            udata.set('present', null);
            interaction.reply("J'ai supprimé la liste des gens présentés.");
        }
    },
};