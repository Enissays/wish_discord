const { SlashCommandBuilder } = require('discord.js');
const ranks = require("../utilitary/fn_ranks.js");
var phrases = ["Mais bon, t'as pas envie de t'arrêter là, non?"
              ,"Allez, juste un dernier tour.."
              ,"Tu peux pas t'arrêter maintenant! Recommence!"
              ,"Tu vas pas t'arrêter maintenant, si?"
              ,"Allez, une dernière fois!"
              ,"Recommence allez!"]

var emojis = ["🍒","🍋","🍇","🍉","🍓","🍍","🍑","🍊","🍐","🍎"];

function getGain(a, b, c, d) {
    var max = 0;
    var list = [a,b,c,d];
    var doublesCount = 0;
    for (var i = 0; i < list.length; i++)
    {
        var count = 0;
        for (var j = 0; j < list.length; j++)
        {

            if (list[i] == list[j]) count++;

        }
        if (count == 2) doublesCount++;
        if (count > max) max = count;
    }

    console.log(doublesCount);
    if (max == 4) return 1000;
    if (max == 3) return 100;
    if (doublesCount == 4) return 150;
    if (max == 2) return 30;
    if (max == 1) return 10;
}

function getMessage(gain) 
{
    if (gain == 1000) return "JACKBOT! Tu as gagné **1000 pièces!**";
    if (gain == 150) return "Génial! Tu as gagné 150 pièces!";
    if (gain == 50) return "Félicitations! Tu as gagné 50 pièces!";
    if (gain == 30) return "Bravo! Tu as gagné 30 pièces!";
    if (gain == 10) return "Tu as gagné 10 pièces!";
    return "Dommage, tu n'as rien gagné..";
}
module.exports = {
    data: new SlashCommandBuilder()
        .setName('casino')
        .setDescription('Joue un tour au casino! Coûte 30 pièces!'),
    async execute(interaction, client, udata) {
        var data = await ranks.getRanks(interaction.user, udata);

        var list = [Math.floor(Math.random()*10),Math.floor(Math.random()*10),Math.floor(Math.random()*10),Math.floor(Math.random()*10)];
        var gain = 0;
        var message = "";
        if (data.coins < 30) return interaction.reply("Tu n'as pas assez de pièces pour jouer au casino! (30 nécessaires)");
        data.coins -= 30;
        data.gave = false;
        gain = getGain(list[0],list[1],list[2],list[3]);
        data.coins += gain;
        message = getMessage(gain);

        var messages = [
            `${emojis[list[0]]} 🟩 🟩 🟩`, 
            `${emojis[list[0]]} ${emojis[list[1]]} 🟩 🟩`,
            `${emojis[list[0]]} ${emojis[list[1]]} ${emojis[list[2]]} 🟩`,
            `${emojis[list[0]]} ${emojis[list[1]]} ${emojis[list[2]]} ${emojis[list[3]]}`
        ]

        interaction.reply("C'est parti! 🎰");
        for (var i = 0; i < 4; i++)
        {
            await new Promise(r => setTimeout(r, 3000));
            interaction.editReply(messages[i]);
            if (i == 3) await interaction.editReply(messages[i] + "\n" + message + "\n" + phrases[Math.floor(Math.random()*phrases.length)]);
        }
        


        udata.set(interaction.user.id, data);
    }
};