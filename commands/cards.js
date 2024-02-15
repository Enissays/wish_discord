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
                                                    .addStringOption(option => option.setName('nom').setDescription("Le nom de la carte")))
            .addSubcommand(subcommand => subcommand.setName('default').setDescription("Réinitialise ton deck"))
            .addSubcommand(subcommand => subcommand.setName('search').setDescription("Recherche une carte")
                                                    .addStringOption(option => option.setName('nom').setDescription("Le nom de la carte")),
                                                    ),

    async execute(interaction, client, udata) {
        var user_data = ranks.getRanks(interaction.user, udata);
        if (user_data.cards == undefined) return interaction.reply({content:"Tu ne possèdes aucune carte !", ephemeral:true});
        if (user_data.deck == undefined) user_data.deck = [];
        switch (interaction.options.getSubcommand())
        {
            case "list":
                var actual_card_index = 0;
                var actual_display = new EmbedBuilder()
                    .setTitle(`${cards[user_data.cards[0]].name}`)
                    .setDescription(cards[user_data.cards[0]].description)
                    .setImage(cards[user_data.cards[0]].img)
                    .setFooter({text:`Carte de ${user_data.nickname} / Progression : ${user_data.cards.length}/${Object.keys(cards).length} (${Math.round(user_data.cards.length/Object.keys(cards).length*100)}%)`, iconURL:interaction.user.avatarURL()})

                var right_button = new ButtonBuilder()
                    .setCustomId("right")
                    .setLabel("→")
                    .setStyle(1);
                var left_button = new ButtonBuilder()
                    .setCustomId("left")
                    .setLabel("←")
                    .setStyle(1);

                var add_to_deck_button = new ButtonBuilder()
                    .setCustomId("add_to_deck")
                    .setLabel("Ajouter au deck")
                    .setStyle(2);
                var remove_from_deck_button = new ButtonBuilder()
                    .setCustomId("remove_from_deck")
                    .setLabel("Retirer du deck")
                    .setStyle(2);

                var row = new ActionRowBuilder()
                    .addComponents(left_button, right_button, add_to_deck_button, remove_from_deck_button);

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
                    else if (i.customId === 'add_to_deck') {
                        if (user_data.deck.length >= 10) return i.reply({content:"Ton deck est déjà plein !", ephemeral:true});
                        if (user_data.deck.includes(user_data.cards[actual_card_index])) return i.reply({content:"Cette carte est déjà dans ton deck !", ephemeral:true});
                        user_data.deck.push(user_data.cards[actual_card_index]);
                        udata.set(interaction.user.id, user_data);
                        return i.reply({content:`La carte ${cards[user_data.cards[actual_card_index]].name} a été ajoutée à ton deck !`, ephemeral:true});
                    }
                    else if (i.customId === 'remove_from_deck') {
                        if (!user_data.deck.includes(user_data.cards[actual_card_index])) return i.reply({content:"Cette carte n'est pas dans ton deck !", ephemeral:true});
                        user_data.deck.splice(user_data.deck.indexOf(user_data.cards[actual_card_index]), 1);
                        udata.set(interaction.user.id, user_data);
                        return i.reply({content:`La carte ${cards[user_data.cards[actual_card_index]].name} a été retirée de ton deck !`, ephemeral:true});
                    }
                    actual_display
                        .setAuthor({name:`Carte possédée par ${user_data.nickname}`, iconURL:interaction.user.avatarURL()})
                        .setTitle(`${cards[user_data.cards[actual_card_index]].name}`)
                        .setDescription(cards[user_data.cards[actual_card_index]].description)
                        .setImage(cards[user_data.cards[actual_card_index]].img)
                        .setFooter({text:`Coût : ${cards[user_data.cards[actual_card_index]].mana} mana | Page ${actual_card_index+1}/${Object.keys(cards).length-1} | ${(user_data.deck.includes(user_data.cards[actual_card_index]) ? "Dans le deck" : "Non équipée")}`, iconURL:interaction.user.avatarURL()});
                    await i.update({embeds:[actual_display]});
                });
                collector.on('end', collected => {
                    message.edit({components:[]});
                });

                break;

            case "info":
                var card_name = interaction.options.getString("nom");
                var card = cards.find(c => c.name.includes(card_name));
                if (card == undefined) return interaction.reply({content:"Tu ne possèdes pas cette carte !", ephemeral:true});

                var embed_info = new EmbedBuilder()
                    .setTitle(card.name)
                    .setDescription(card.description)
                    .setFooter({text:`Carte de ${user_data.nickname}`, iconURL:interaction.user.avatarURL()});
                interaction.reply({embeds:[embed_info]});
                break;

            case "default":
                // remove and add to his deck the "shield_default", "heal_default", and "default"
                if (!user_data.cards.includes("shield_default")) user_data.cards.push("shield_default");
                if (!user_data.cards.includes("heal_default")) user_data.cards.push("heal_default");
                if (!user_data.cards.includes("default")) user_data.cards.push("default");
                if (!user_data.cards.includes("mana_reload_default")) user_data.cards.push("mana_reload_default");
                udata.set(interaction.user.id, user_data);
                interaction.reply({content:"Ton deck a été réinitialisé, tu possèdes désormais les quatres cartes par défaut !"});
                break;

            case "search":
                // Affiche la première carte qui contient le nom recherché
                var card_name = interaction.options.getString("nom");
                var card_key = Object.keys(cards).find(c => cards[c].name.includes(card_name));
                if (card_key == undefined) return interaction.reply({content:"Aucune carte ne correspond à ta recherche !", ephemeral:true});
                var card = cards[card_key];
                console.log(card_key, cards, card);
                var embed_info = new EmbedBuilder()
                    .setTitle(card.name)
                    .setDescription(card.description)
                    .setImage(card.img)
                    .setFooter({text:`Coût : ${card.mana} mana `});
                interaction.reply({embeds:[embed_info]});
                break;
        }
    }
};