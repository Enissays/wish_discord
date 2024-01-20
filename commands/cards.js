const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const utilitary = require('../utilitary/fn_global');
const ranks = require('../utilitary/fn_ranks');
const Enmap = require("enmap");
const cards = require('../utilitary/cards.json');
const arena_data = new Enmap({name: "arena"});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cards')
        .setDescription("Affiche les cartes que tu possèdes")
            .addSubcommand(subcommand => subcommand.setName('list').setDescription("Affiche toutes tes cartes"))
            .addSubcommand(subcommand => subcommand.setName('info').setDescription("Affiche les informations d'une carte")
                                                    .addStringOption(option => option.setName('nom').setDescription("Le nom de la carte"))),
    async execute(interaction, client, udata) {
        var user_data = ranks.getRanks(interaction.user, udata);
        if (user_data.cards == undefined) return interaction.reply({content:"Tu ne possèdes aucune carte !", ephemeral:true});
        switch (interaction.options.getSubcommand())
        {
            case "list":
                var actual_card_index = 0;
                var actual_display = new EmbedBuilder()
                    .setTitle(`${cards[user_data.cards[0]].name}`)
                    .setDescription(cards[user_data.cards[0]].description)
                    .setFooter({text:`Carte de ${user_data.nickname}`, iconURL:interaction.user.avatarURL()});

                var right_button = new ButtonBuilder()
                    .setCustomId("right")
                    .setLabel("→")
                    .setStyle("PRIMARY");
                var left_button = new ButtonBuilder()
                    .setCustomId("left")
                    .setLabel("←")
                    .setStyle("PRIMARY");
                var row = new ActionRowBuilder()
                    .addComponents(left_button, right_button);

                var message = await interaction.reply({embeds:[actual_display], components:[row]});
                const collectorFilter = i => i.user.id === interaction.user.id;
                const collector = message.createMessageComponentCollector({ filter: collectorFilter, time: 60000 });
                collector.on('collect', async i => {
                    if (i.customId === 'right') {
                        if (actual_card_index == user_data.cards.length - 1) actual_card_index = 0;
                        else actual_card_index++;
                    } else if (i.customId === 'left') {
                        if (actual_card_index == 0) actual_card_index = user_data.cards.length - 1;
                        else actual_card_index--;
                    }
                    actual_display.setTitle(`${cards[user_data.cards[actual_card_index]].name}`)
                        .setDescription(cards[user_data.cards[actual_card_index]].description);
                    await i.update({embeds:[actual_display]});
                });
                collector.on('end', collected => {
                    message.edit({components:[]});
                });

                break;

            case "info":
                var card_name = interaction.options.getString("nom");
                if (user_data.cards[card_name] == undefined) return interaction.reply({content:"Tu ne possèdes pas cette carte !", ephemeral:true});

                var embed_info = new EmbedBuilder()
                    .setTitle(card_name)
                    .setDescription(cards[card_name].description)
                    .setFooter({text:`Carte de ${user_data.nickname}`, iconURL:interaction.user.avatarURL()});
                interaction.reply({embeds:[embed_info]});
                break;
        }
    }
};