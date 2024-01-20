const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const utilitary = require('../utilitary/fn_global');
const ranks = require('../utilitary/fn_ranks');
const Enmap = require("enmap");
const cards = require('../utilitary/cards.json');
const arena_data = new Enmap({name: "arena"});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lootbox')
        .setDescription("Ouvre une lootbox")
            .addSubcommand(subcommand => subcommand.setName('open').setDescription("Ouvre une lootbox")),
    async execute(interaction, client, udata) {
        var user_data = ranks.getRanks(interaction.user, udata);
        if (user_data.cards == undefined) user_data.cards = [];
        switch (interaction.options.getSubcommand())
        {
            
        }
    }
};