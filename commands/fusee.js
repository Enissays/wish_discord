const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const ranks = require("../utilitary/fn_ranks.js");
const Enmap = require('enmap');
var utilitary = require("../utilitary/fn_global.js");

const sessions = new Enmap({ name: "rocket_sessions" });

function createRocketSession(interaction, udata, client) {
    const data = ranks.getRanks(interaction.user, udata);
    if (data.rocket_session) return interaction.reply("Tu ne peux pas créer une session de fusée si tu en as déjà une!");

    const sessionId = utilitary.makeid(10);
    const sessionData = {
        participants: {},
        startTime: Date.now(),
        explosionTime: Date.now() + 60000, // 60 secondes de délai avant l'explosion
        multiplier: 1
    };

    sessions.set(sessionId, sessionData);
    data.rocket_session = sessionId;
    udata.set(interaction.user.id, data);

    const joinButton = new ButtonBuilder()
        .setCustomId('join_rocket')
        .setLabel('Rejoindre')
        .setStyle(1);

    const betButton = new ButtonBuilder()
        .setCustomId('bet_rocket')
        .setLabel('Miser')
        .setStyle(1);

    const withdrawButton = new ButtonBuilder()
        .setCustomId('withdraw_rocket')
        .setLabel('Retirer')
        .setStyle(1);

    const row = new ActionRowBuilder()
        .addComponents(joinButton, betButton, withdrawButton);

    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Session de fusée')
        .setDescription(`Rejoignez la session de fusée !\n\nSession ID : ${sessionId}\n\nTemps restant avant l'explosion : 60 secondes\n\nMultiplicateur actuel : 1x`);

    interaction.reply({ embeds: [embed], components: [row] });
}

function joinRocketSession(interaction, udata, sessionId) {
    const data = ranks.getRanks(interaction.user, udata);
    if (!sessions.has(sessionId)) return interaction.reply("Cette session de fusée n'existe pas!");
    if (data.rocket_session) return interaction.reply("Tu as déjà rejoint une session de fusée!");

    const sessionData = sessions.get(sessionId);
    sessionData.participants[interaction.user.id] = {
        bet: 0,
        withdraw: false
    };
    sessions.set(sessionId, sessionData);

    interaction.reply({ content: "Tu as rejoint la session de fusée avec succès!", ephemeral: true });
}

function betRocketSession(interaction, udata, sessionId, amount) {
    const data = ranks.getRanks(interaction.user, udata);
    if (!sessions.has(sessionId)) return interaction.reply("Cette session de fusée n'existe pas!");
    if (!sessions.get(sessionId).participants[interaction.user.id]) return interaction.reply("Tu n'as pas rejoint cette session de fusée!");

    const sessionData = sessions.get(sessionId);
    const participantData = sessionData.participants[interaction.user.id];

    if (participantData.bet > 0) return interaction.reply("Tu as déjà misé dans cette session de fusée!");
    if (data.coins < amount) return interaction.reply("Tu n'as pas assez de pièces pour miser ce montant!");

    data.coins -= amount;
    participantData.bet = amount;
    sessions.set(sessionId, sessionData);
    udata.set(interaction.user.id, data);

    interaction.reply({ content: `Tu as misé ${amount} pièces dans la session de fusée!`, ephemeral: true });
}

function withdrawRocketSession(interaction, udata, sessionId) {
    const data = ranks.getRanks(interaction.user, udata);
    if (!sessions.has(sessionId)) return interaction.reply("Cette session de fusée n'existe pas!");
    if (!sessions.get(sessionId).participants[interaction.user.id]) return interaction.reply("Tu n'as pas rejoint cette session de fusée!");

    const sessionData = sessions.get(sessionId);
    const participantData = sessionData.participants[interaction.user.id];

    if (participantData.withdraw) return interaction.reply("Tu as déjà retiré ton pari de cette session de fusée!");

    const multiplier = sessionData.multiplier;
    const winnings = participantData.bet * multiplier;

    data.coins += winnings;
    participantData.withdraw = true;
    sessions.set(sessionId, sessionData);
    udata.set(interaction.user.id, data);

    interaction.reply({ content: `Tu as retiré ton pari de ${participantData.bet} pièces avec un multiplicateur de ${multiplier}x! Tu as gagné ${winnings} pièces!`, ephemeral: true });
}

function checkRocketSession(interaction, udata, sessionId) {
    if (!sessions.has(sessionId)) return interaction.reply("Cette session de fusée n'existe pas!");

    const sessionData = sessions.get(sessionId);
    const currentTime = Date.now();

    if (currentTime >= sessionData.explosionTime) {
        // La fusée a explosé
        const participants = sessionData.participants;
        const multiplier = sessionData.multiplier;

        for (const userId in participants) {
            const participantData = participants[userId];
            if (!participantData.withdraw) {
                const data = ranks.getRanks(userId, udata);
                const lostAmount = participantData.bet * multiplier;
                data.coins -= lostAmount;
                udata.set(userId, data);
            }
        }

        sessions.delete(sessionId);
        return interaction.reply("La fusée a explosé! Tous les paris non retirés ont été perdus.");
    }

    const timeRemaining = Math.ceil((sessionData.explosionTime - currentTime) / 1000);
    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Session de fusée')
        .setDescription(`Rejoignez la session de fusée !\n\nSession ID : ${sessionId}\n\nTemps restant avant l'explosion : ${timeRemaining} secondes\n\nMultiplicateur actuel : ${sessionData.multiplier}x`);

    interaction.reply({ embeds: [embed] });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rocket_session')
        .setDescription('Crée ou rejoint une session de fusée')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Crée une session de fusée')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('join')
                .setDescription('Rejoins une session de fusée')
                .addStringOption(option => option.setName('session_id').setDescription('L\'ID de la session de fusée').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('bet')
                .setDescription('Mise dans une session de fusée')
                .addStringOption(option => option.setName('session_id').setDescription('L\'ID de la session de fusée').setRequired(true))
                .addIntegerOption(option => option.setName('amount').setDescription('Le montant à miser').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('withdraw')
                .setDescription('Retire le pari d\'une session de fusée')
                .addStringOption(option => option.setName('session_id').setDescription('L\'ID de la session de fusée').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('check')
                .setDescription('Vérifie l\'état d\'une session de fusée')
                .addStringOption(option => option.setName('session_id').setDescription('L\'ID de la session de fusée').setRequired(true))
        ),
    async execute(interaction, client, udata) {
        switch (interaction.options.getSubcommand()) {
            case 'create':
                createRocketSession(interaction, udata, client);
                break;
            case 'join':
                joinRocketSession(interaction, udata, interaction.options.getString('session_id'));
                break;
            case 'bet':
                betRocketSession(interaction, udata, interaction.options.getString('session_id'), interaction.options.getInteger('amount'));
                break;
            case 'withdraw':
                withdrawRocketSession(interaction, udata, interaction.options.getString('session_id'));
                break;
            case 'check':
                checkRocketSession(interaction, udata, interaction.options.getString('session_id'));
                break;
        }
    }
};