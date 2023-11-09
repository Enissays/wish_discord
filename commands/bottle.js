const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const utilitary = require('../utilitary/fn_global');
const ranks = require('../utilitary/fn_ranks');
const Enmap = require("enmap");
const bottle_data = new Enmap({name: "bottle"});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bottle')
		.setDescription("Jete une bouteille avec ton message à l'eau, ou en ouvre une au hasard")
        .addSubcommand(subcommand=>
            subcommand
                .setName("add")
                .setDescription("Ajoute ton propre message parmi les bouteilles")
                .addStringOption(option =>
                    option.setName("message")
                          .setDescription("Le message à ajouter"))
                .addBooleanOption(option =>
                    option.setName("anonymous")
                          .setDescription("Décide si tu être défini comme auteur ou être anonyme"))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("random")
                .setDescription("Obtiens une au hasard")),
	async execute(interaction, client, udata) {
        var bottles = bottle_data.get('bottles');
        switch (interaction.options.getSubcommand())
        {
            case "add":
                var message = interaction.options.getString("message");
                var anon = interaction.options.getBoolean("anonymous");

                var embed = new EmbedBuilder()
                    .setTitle('Es-tu sûr de vouloir envoyer ce message parmi toutes les autres bouteilles ? ')
                    .setDescription(message)
                    .setFooter({text: anon ? "Attention ! Le fait que ce soit anonyme n'empêche pas le fait que l'auteur est stocké ! Alors n'en profite pas pour cacher des messages inappropriés" : "Tu peux également rendre anonyme l'auteur en choisissant `true` dans l'option anonym"});

                const confirm = new ButtonBuilder()
                    .setCustomId('confirm')
                    .setLabel('Oui.. j\'envoie !!')
                    .setStyle(ButtonStyle.Success);
        
                const cancel = new ButtonBuilder()
                    .setCustomId('cancel')
                    .setLabel('Attends.. En fait..')
                    .setStyle(ButtonStyle.Secondary);

                const row = new ActionRowBuilder()
                    .addComponents(confirm, cancel);
    
                const response = await interaction.reply({
                    embeds: [embed],
                    components: [row],
                    ephemeral:true
                });

                const collectorFilter = i => i.user.id === interaction.user.id;

                try {
                    const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
                    if (confirmation.customId === 'confirm') {
                        await confirmation.update({ content: `🍾 Adieu, petite bouteille..`, embeds:[], components: [] });
                        console.log(bottles);
                        bottles.data.push( 
                        {
                            message : message,
                            anonymous : anon,
                            author : interaction.user.id,
                            avatar : interaction.user.avatarURL(),
                            username : ranks.getRanks(interaction.user, udata).nickname
                        });
                        console.log(bottles.data);

                        bottle_data.set('bottles', bottles);
                        new_data = ranks.addCheevo("first_bottle", ranks.getRanks(interaction.user, udata), interaction.channel, interaction.user.avatarURL());
                        if (new_data) udata.set(interaction.user.id, new_data);

                    } else if (confirmation.customId === 'cancel') {
                        await confirmation.update({ content: 'Dommage ! Moi j\'aimais bien ton message..', embeds: [], components: [] });
                    }
                } catch (e) {
                    await interaction.editReply({ content: 'Bon, annulons en fait...', components: [] });
                    console.log(e);
                }
                break;

                case "random":
                    console.log(bottles.data[0]);
                    var random_info = utilitary.getRandomList(bottles.data);
                    console.log(random_info);
                    var info_embed = new EmbedBuilder()
                        .setDescription(random_info.message);

                    if (random_info.anonymous) 
                    {
                        info_embed.setAuthor({name:utilitary.getRandomList(["Un brave", "Un stupide", "LE", "Notre cher", "L'autre"])
                                    + " " + utilitary.getRandomList(["chevalier", "codeur..?", "m'as-tu-vu", "euhhh"])
                                + ", " + utilitary.getRandomList(["probablement..", "si on y repense.", "du euhhhh", "légendaire!"]) + " écrit..."})
                    }
                    else
                    {
                        info_embed.setAuthor({name: random_info.username + " écrit..", iconURL: random_info.avatar})
                    }

                    interaction.reply({embeds:[info_embed]});
                    break;
        }
	},
};