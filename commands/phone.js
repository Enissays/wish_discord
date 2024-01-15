const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const utilitary = require('../utilitary/fn_global');
const ranks = require('../utilitary/fn_ranks');
const Enmap = require("enmap");
const { todo } = require('node:test');
const phone_data = new Enmap({name: "phone"});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('phone')
		.setDescription("Te met en contact avec quelqu'un qui attend.")
        .addStringOption(option => option.setName("accueil").setDescription("Le message d'accueil")),
	async execute(interaction, client, udata) {
        var message = interaction.options.getString("accueil");
        var filteredPhone = phone_data.filter(data => !data.connected);
        if (filteredPhone.count != 0) 
        {
            var key = filteredPhone.randomKey();
            var pdata = phone_data.get(key);
            var other_channel = client.channels.fetch(key).then( async () => 
            {
                other_channel.send(`Une connexion a été trouvée ! L'accepter ? Voici leur message ${message}`);
                interaction.channel.reply({content:`J'ai trouvé une connexion ! L'accepter ? Voici leur message ${pdata.msg}`});
                const confirm = new ButtonBuilder()
                    .setCustomId('confirm_call')
                    .setLabel('Se connecter')
                    .setStyle(ButtonStyle.Success);
    
                const cancel = new ButtonBuilder()
                    .setCustomId('cancel_call')
                    .setLabel('Refuser')
                    .setStyle(ButtonStyle.Secondary);
                
                const row = new ActionRowBuilder()
                    .addComponents(confirm, cancel);

                // Savoir si en envoyant un message simple dans un channel, on peut y intégrer un row.

                const response = await interaction.channel.send({ content: 'Une connexion a été trouvée ! L\'accepter ?', components: [row] });
                
                const collectorFilter = i => i.channel.id === interaction.channel.id || i.channel.id === key;
                var confirmations = [];
                try {
                    const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
                    if (confirmation.customId === 'confirm') 
                    {
                        if (!confirmations.includes(confirmation.channel.id)) confirmations.push(confirmation.channel.id);
                        if (confirmations.length == 2) 
                        {
                            // TODO : Changer les données de chaque channel
                        }
                    } else if (confirmation.customId === 'cancel') {
                        await confirmation.update({ content: 'Dommage ! Moi j\'aimais bien ton message..', embeds: [], components: [] });
                    }
                } catch (e) {
                    await interaction.editReply({ content: 'Bon, annulons en fait...', components: [] });
                    console.log(e);
                }
            });
            
        }



        var pdata = phone_data.get(interaction.channel.id);
        if (!pdata)
        {
            phone_data.set(interaction.channel.id, {
                msg : message,
                connected : false
            });
            interaction.reply({content: `🦭 Un appel a été lancé, attendez une seconde...`});
        }

	},
};