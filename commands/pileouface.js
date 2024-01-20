const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('pileouface')
        .setDescription('Joue à pile ou face!'),
    async execute(interaction, client, udata) {
        const result = Math.random() < 0.5 ? 'Pile' : 'Face';
        return interaction.reply(result);
    },
};