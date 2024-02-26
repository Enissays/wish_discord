const { SlashCommandBuilder } = require('discord.js');
const ranks = require("../utilitary/fn_ranks.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('auto_present')
        .setDescription('Set the "present" property in server data.')
        .addBooleanOption(option => option.setName('is_present').setDescription('Set the "present" property to an empty array.')),
    async execute(interaction, client, udata) {
        if (interaction.user.id != '849936690915442698') return interaction.reply('You are not allowed to use this command.');
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