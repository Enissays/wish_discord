const { SlashCommandBuilder } = require('discord.js');
const ranks = require('../utilitary/fn_ranks');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dm_tom')
        .setDescription('Envoie un message privé à TOM !!!')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Message à envoyer')
                .setRequired(true)
        ),
    async execute(interaction, client, udata) {
        await client.users.fetch('679076920096325643');
        const user = client.users.cache.get('679076920096325643');
        const channel = interaction.guild.channels.cache.get('1195492736674037780');
        const message = interaction.options.getString('message');

        try {
            await user.send(message);
            await channel.send("Quelqu'un d'autre a dit : " + message);
            new_data = ranks.addCheevo("tom", ranks.getRanks(interaction.user, udata), interaction.channel, interaction.user.avatarURL());
            if (new_data) udata.set(interaction.user.id, new_data);
            return interaction.reply({content:`Message envoyé à ${user.username}`, ephemeral: true});
            
        } catch (error) {
            console.error(`Impossible d'envoyer le message à ${user.username}: ${error}`);
            return interaction.reply(`Une erreur s'est produite lors de l'envoi du message à ${user.username}`);
        }
    },
};
