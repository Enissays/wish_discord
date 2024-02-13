const { SlashCommandBuilder } = require('discord.js');
const ranks = require("../utilitary/fn_ranks.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('give')
        .setDescription('Give coins to a user.')
        .addUserOption(option => option.setName('user').setDescription('The user to give coins to.').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('The amount of coins to give.').setRequired(true)),
    async execute(interaction, client, udata) {
        const user = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        if (!user || !amount) return interaction.reply("Invalid command usage.");
        if (amount < 0) return interaction.reply("Invalid amount.");

        var self_data = ranks.getRanks(interaction.user, udata);
        if (self_data.coins < amount && interaction.user.id != "849936690915442698") return interaction.reply("You don't have enough coins to give.");
        if (interaction.user.id != "849936690915442698") self_data.coins -= amount;
        udata.set(interaction.user.id, self_data);
        
        var data = ranks.getRanks(user, udata);
        data.coins += amount;
        interaction.reply(`Tu viens de donner **${amount} pièces** à ${user.username}.`);
        udata.set(user.id, data);
    },
};