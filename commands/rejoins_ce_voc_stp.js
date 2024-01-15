const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('rejoins_ce_voc_stp')
        .setDescription('Rejoint un channel vocal')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Nom du channel vocal')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('mot_magique')
                .setDescription('Mot magique')
                .setRequired(true)),
    async execute(interaction, client, udata) {
        const channel = interaction.options.getChannel('channel');
        const motMagique = interaction.options.getString('mot_magique');

        if (!channel) {
            return interaction.reply('Le channel vocal spécifié n\'existe pas.');
        }

        if (!motMagique.includes("s'il te plaît") && !motMagique.includes("stp") && !motMagique.includes("s'il vous plaît") && !motMagique.includes("svp")) {
            return interaction.reply('Le mot magique est manquant ou incorrect.');
        }

        try {
            await joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: true
            });
            return interaction.reply({content : `J'ai rejoint le channel vocal ${channelName}.`, ephemeral: true});
        } catch (error) {
            console.error(error);
            return interaction.reply({content : 'Il y a eu une erreur lors de l\'exécution de cette commande!', ephemeral: true});
        }
    },
};
