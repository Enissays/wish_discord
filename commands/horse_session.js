const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const ranks = require("../utilitary/fn_ranks.js");
const Enmap = require('enmap');
var horses_data = new Enmap({name: "horses"});
var utilitary = require("../utilitary/fn_global.js");
const horses = [
    {
        "name" : "Cheval 1",
        "emoji" : "🐎",
    }
    ,{
        "name" : "Cheval 2",
        "emoji" : "🐴",
    }
    ,{
        "name" : "Cheval 3",
        "emoji" : "🦄",
    }
    ,{
        "name" : "Cheval 4",
        "emoji" : "🐲",
    }
];

function create_horse(interaction, udata, client) {
    const data = ranks.getRanks(interaction.user, udata);
    if (data.hosted_horse) return interaction.reply("Tu ne peux pas participer à une course de chevaux si tu en héberges déjà une!");
    var id = utilitary.makeid(10);
    data.hosted_horse = id;

    horses_data.set(id,
        {
            participants : {}
        });

    var button_horse_1 = new ButtonBuilder()
        .setCustomId('horse_1')
        .setLabel('Cheval 1')
        .setStyle(1);

    var button_horse_2 = new ButtonBuilder()
        .setCustomId('horse_2')
        .setLabel('Cheval 2')
        .setStyle(1);

    var button_horse_3 = new ButtonBuilder()
        .setCustomId('horse_3')
        .setLabel('Cheval 3')
        .setStyle(1);

    var button_horse_4 = new ButtonBuilder()
        .setCustomId('horse_4')
        .setLabel('Cheval 4')
        .setStyle(1);

    var start_button = new ButtonBuilder()
        .setCustomId('start_horse')
        .setLabel('Démarrer')
        .setStyle(4);

    var row = new ActionRowBuilder()
        .addComponents(button_horse_1, button_horse_2, button_horse_3, button_horse_4, start_button);

    var embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Course de chevaux')
        .setDescription('Participez à une course de chevaux ! Coût : 20 pièces\nChoisissez votre cheval !\n\nChevaux disponibles :\n\n🐎 Cheval 1\n🐴 Cheval 2\n🦄 Cheval 3\n🐲 Cheval 4')
        .setFooter({text:`Course de chevaux n°${id}`});

    interaction.reply({embeds:[embed], components:[row]});
    udata.set(interaction.user.id, data);

    var collector = interaction.channel.createMessageComponentCollector({time: 60000});
    collector.on('collect', async i => {
        if (i.customId == 'start_horse') {
            start_horse(i, udata, id, client);
            collector.stop();
        } else {
            var horse = i.customId.split('_')[1];
            join_horse(i, udata, horse, id);
        }
    });
};

function join_horse(interaction, udata, horse, id) {
    const data = ranks.getRanks(interaction.user, udata);
    var horse_data = horses_data.get(id);
    if (data.coins < 20) return interaction.reply("Tu n'as pas assez de pièces pour participer à cette course de chevaux! (20 nécessaires)");
    data.coins -= 20;
    udata.set(interaction.user.id, data);
    if (!horse_data) return interaction.reply("Cette course de chevaux n'existe pas!");
    if (horse_data.participants[interaction.user.id]) return interaction.reply("Tu as déjà choisi un cheval!");
    horse_data.participants[interaction.user.id] = horse;
    horses_data.set(id, horse_data);
    interaction.reply({content:`Tu as choisi le ${horses[horse-1].name} !`, ephemeral:true});
}

function get_dashes(position, length, emoji)
{
    var dashes = "";
    for (var i = 0; i < length; i++)
    {
        if (i == position) dashes += emoji;
        else dashes += "-";
    }
    return dashes + "🏁";
}

function start_horse(interaction, udata, id, client) {
    const data = ranks.getRanks(interaction.user, udata);
    var horse_data = horses_data.get(data.hosted_horse);
    console.log(horse_data);
    if (!horse_data) return interaction.reply("Cette course de chevaux n'existe pas!");
    var horse_msg = "";
    var horses_datas = [];
    for (var i = 0; i < horses.length; i++)
    {
        horses_datas.push({position:0, emoji:horses[i].emoji, win:false});
    }

    var horse_msg = "";
    for (var horse of horses_datas)
    {
        horse_msg += `${horse.emoji} ${get_dashes(horse.position, 10, horse.emoji)}\n`;
    }

    interaction.reply({content:horse_msg});

    interval = setInterval(async () => {
        var horse_msg = "";
        for (var horse of horses_datas)
        {
            if (Math.random() > 0.5) horse.position++;
            horse_msg += `🟩 ${get_dashes(horse.position, 30, horse.emoji)}\n`;
            if (horse.position >= 30) {
                horse.win = true;
                console.log(horse);
                clearInterval(interval);
                if (data.hosted_horse) horses_data.delete(data.hosted_horse);
                data.hosted_horse = null;
                udata.set(interaction.user.id, data);
                var all_winners = "";
                console.log(horses_datas.indexOf(horse)+1);
                for (var id in horse_data.participants)
                {
                    var user = await client.users.cache.get(id);
                    var user_data = ranks.getRanks(user, udata);
                    if (horse_data.participants[id] == horses_datas.indexOf(horse)+1) {
                        ranks.addCheevo("win_first_horse_race", user_data, interaction.channel, user.avatarURL());
                        user_data.coins += 60;
                        all_winners += `${user.username} `;
                        udata.set(user.id, user_data);
                    }
                }
                interaction.followUp({content:`Le ${horse.emoji} a gagné !`});
                interaction.followUp({content:`Les gagnants sont : ${all_winners} (+60 pièces)`});



            }
        }
        interaction.editReply({content:horse_msg});
    }
    , 1000);


}



module.exports = {
    data: new SlashCommandBuilder()
        .setName('course_chevaux')
        .setDescription('Participez à une course de chevaux ! Coût : 20 pièces')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Crée une course de chevaux')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('join')
                .setDescription('Rejoins une course de chevaux')
                .addNumberOption(option => option.setName('cheval').setDescription('Le numéro du cheval à rejoindre').setRequired(true))
                .addStringOption(option => option.setName('course').setDescription('Le numéro de la course à rejoindre').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Démarre la course de chevaux')
                .addStringOption(option => option.setName('course').setDescription('Le numéro de la course à démarrer').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('cancel')
                .setDescription('Annule la course de chevaux')
        )

        ,
    async execute(interaction, client, udata) {
        switch (interaction.options.getSubcommand())
        {
            case 'create' : 
                create_horse(interaction, udata, client);
            break;
            case 'join' : 
                join_horse(interaction, udata, interaction.options.getInteger('cheval'), interaction.options.getString('course'));
            break;
            case 'start' : 
                start_horse(interaction, udata, interaction.options.getString('course'), client);
            break;
            case 'cancel' : 
                const data = ranks.getRanks(interaction.user, udata);
                if (!data.hosted_horse) return interaction.reply("Tu n'héberges pas de course de chevaux !");
                horses_data.delete(data.hosted_horse);
                data.hosted_horse = null;
                interaction.reply("Course de chevaux annulée !");
                udata.set(interaction.user.id, data);
            break;
        }


        
        

        

    }
};