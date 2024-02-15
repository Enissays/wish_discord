const { SlashCommandBuilder } = require('discord.js');
const ranks = require("../utilitary/fn_ranks.js");
var phrases = ["Mais bon, t'as pas envie de t'arrêter là, non?"
              ,"Allez, juste un dernier tour.."
              ,"Tu peux pas t'arrêter maintenant! Recommence!"
              ,"Tu vas pas t'arrêter maintenant, si?"
              ,"Allez, une dernière fois!"
              ,"Recommence allez!"
              , "Tu vas pas t'arrêter là, si?"
              , "Ouh, je sens le jackpot arriver! Recommence!"
              , "Oh! Tu vas pas t'arrêter maintenant!"
              , "Le gros lot est pour bientôt! Recommence!"
            ]

var emojis = ["🍒","🍋","🍇","🍉","🍓","🍍","💖","🍊","🍐","🍎"];

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
    if (max == 4 && list[0] == 6) return 20;
    if (max == 4) return 10;
    if (max == 3) return 2.5;
    if (doublesCount == 4) return 3;
    if (max == 2) return 1;
    if (max == 1) return 0.5;
}

function getMessage(gain) 
{
    if (gain == 20) return "**ULTRA JACKBOT !**";
    if (gain == 10) return "**JACKBOT !**";
    if (gain == 2.5) return "**TRIPLE !**";
    if (gain == 3) return "**QUADRA !**";
    if (gain == 1) return "**DOUBLE !**";
    if (gain == 0.5) return "**RIEN !**";

}
module.exports = {
    data: new SlashCommandBuilder()
        .setName('casino')
        .setDescription('Joue un tour au casino! Parie la somme que tu veux !')
        .addIntegerOption(option => option.setName('mise').setDescription('La somme que tu veux parier').setRequired(true)),
    async execute(interaction, client, udata) {
        var data = await ranks.getRanks(interaction.user, udata);

        var list = [Math.floor(Math.random()*10),Math.floor(Math.random()*10),Math.floor(Math.random()*10),Math.floor(Math.random()*10)];
        var gain = 0;
        var message = "";
        var mise = interaction.options.getInteger('mise') || 10;
        if (data.coins < mise) return interaction.reply("Tu n'as pas assez de pièces pour jouer au casino!");
        data.coins -= mise;
        data.gave = false;
        gain = getGain(list[0],list[1],list[2],list[3]);
        data.coins += Math.round(mise*gain);
        if (mise < 10) return interaction.reply("La mise minimale est de 10 pièces!");
        message = getMessage(gain) + ` Tu gagnes **${Math.round(mise*gain)}** pièces!`;

        var messages = [
            `${emojis[list[0]]} 🟩 🟩 🟩`, 
            `${emojis[list[0]]} ${emojis[list[1]]} 🟩 🟩`,
            `${emojis[list[0]]} ${emojis[list[1]]} ${emojis[list[2]]} 🟩`,
            `${emojis[list[0]]} ${emojis[list[1]]} ${emojis[list[2]]} ${emojis[list[3]]}`
        ]

        interaction.reply("C'est parti! 🎰");
        for (var i = 0; i < 4; i++)
        {
            await new Promise(r => setTimeout(r, 1000 * (mise/10)));
            interaction.editReply(messages[i]);
            if (i == 3) await interaction.editReply(messages[i] + "\n" + message + "\n" + phrases[Math.floor(Math.random()*phrases.length)]);
        }
        


        udata.set(interaction.user.id, data);
    }
};