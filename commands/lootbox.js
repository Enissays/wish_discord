const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const utilitary = require('../utilitary/fn_global');
const ranks = require('../utilitary/fn_ranks');
const Enmap = require("enmap");
var true_cards = require('../utilitary/cards.json');
var cards = Object.keys(true_cards).reduce((obj, key) => { if (!true_cards[key].unrollable) obj[key] = true_cards[key]; return obj; }, {});
const arena_data = new Enmap({name: "arena"});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lootbox')
        .setDescription("Ouvre une lootbox")
            .addSubcommand(subcommand => subcommand.setName('open').setDescription("Ouvre une lootbox"))
            .addSubcommand(subcommand => subcommand.setName('buy').setDescription("Achète une lootbox")),
    async execute(interaction, client, udata) {
        var user_data = ranks.getRanks(interaction.user, udata);
        if (user_data.cards == undefined) user_data.cards = [];

        switch (interaction.options.getSubcommand())
        {
            case "open":
                if (user_data.cards.length >= Object.keys(true_cards).length) {
                    user_data = ranks.addCheevo("how_did_we_get_here", user_data, interaction.channel, interaction.user.avatarURL()); 
                    udata.set(interaction.user.id, user_data); 
                    return interaction.reply({content:"Tu possèdes déjà toutes les cartes !", fetchReply:true});
                }
                if (user_data.lootbox == undefined || user_data.lootbox <= 0) return interaction.reply({content:"Tu n'as pas de lootbox !", fetchReply:true});
                user_data.lootbox--;
                
                var drop_embed = new EmbedBuilder()
                    .setAuthor({ name:user_data.nickname + " vient d'obtenir :", iconURL:interaction.user.avatarURL() });
                await interaction.reply({content:"**Ouverture de la lootbox..**"});
                for (var i = 0; i < 4; i++)
                {
                    await utilitary.sleep(2000);
                    
                    var card;
                    if (i == 3) card = utilitary.randomChoice(Object.keys(cards).reduce((obj, key) => { if (!user_data.cards.includes(key)) obj[key] = cards[key]; return obj; }, {}));
                    else card = utilitary.randomChoice(cards);
                    if (user_data.cards.includes(card)) 
                    {
                        drop_embed.setDescription(`**${cards[card].name}** (déjà possédée) (tu gagnes 20 pièces)`)
                        .setImage(null);
                        user_data.coins += 20;
                    } else {
                        user_data.cards.push(card);
                        if (cards[card].rarity == 1) drop_embed.setColor("#FFFFFF");
                        else if (cards[card].rarity == 2) drop_embed.setColor("#00FF00");
                        else if (cards[card].rarity == 3) drop_embed.setColor("#0000FF");
                        else if (cards[card].rarity == 4) drop_embed.setColor("#FF00FF");
                        else if (cards[card].rarity == 5) drop_embed.setColor("#FFFF00");
                        else if (cards[card].rarity == 6) drop_embed.setColor("#FF0000");
                        else drop_embed.setColor("#FF0000");
                        drop_embed.setDescription(`**${cards[card].name}**\n${cards[card].description}`)
                                    .setImage(cards[card].img);
                    }

                    interaction.channel.send({embeds:[drop_embed]});

                }
                udata.set(interaction.user.id, user_data);
                break;

            case "buy":
                if (user_data.coins < 100) return interaction.reply({content:"Tu n'as pas assez de pièces !", fetchReply:true});
                user_data.coins -= 100;
                if (user_data.lootbox == undefined) user_data.lootbox = 0;
                user_data.lootbox++;
                udata.set(interaction.user.id, user_data);
                interaction.reply({content:"Tu viens d'acheter une lootbox !", fetchReply:true});
                break;


        }
    }
};