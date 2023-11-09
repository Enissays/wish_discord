const { EmbedBuilder } = require("discord.js");
const cheevos = require("./cheevos.json");

module.exports = 
{
    getRanks(user, udata)
    {
        return udata.ensure(user.id,
            {
                rank :
                {
                    level : 0,
                    xp : 0,
                    nextRank : 100
                },
                nickname : user.username,
                color : "#FFFFFF",
                daily : 0
            });
    },

    addXp(num, user_data, channel, onMessage=false)
    {
        if (onMessage) 
        {
            if (user_data.cooldown)
            {
                if (user_data.cooldown - Date.now() < 60000) return;
            }
            else user_data.cooldown = Date.now();
        }
        user_data.rank.xp += num; 
        if (user_data.rank.xp >= user_data.rank.nextRank)
        {
            user_data.rank =
            {
                level : user_data.rank.level+1,
                xp : user_data.rank.xp - user_data.rank.nextRank,
                nextRank : Math.round(user_data.rank.nextRank += (user_data.rank.nextRank*0.5))
            }
            if (!onMessage) channel.send(`${user_data.nickname} vient de passer au rang **${user_data.rank}** !!`)
            else channel.send(`${user_data.nickname} vient de passer au rang **${user_data.rank}** !!`)
        }

        return user_data;
    },

    addCheevo(cheevo, user_data, channel, avatar)
    {
        if (!user_data.cheevos) user_data.cheevos = [];
        if (user_data.cheevos.includes(cheevo)) return;
        var cheevo_data = cheevos[cheevo];
        var embed = new EmbedBuilder()
            .setAuthor({name:user_data.nickname + " vient de débloquer un nouveau succès !!", iconURL:avatar})
            .setTitle(cheevo_data.title)
            .setDescription(cheevo_data.emoji + " " + cheevo_data.description);
        channel.send({embeds:[embed]});
        user_data.cheevos += cheevo;
        return this.addXp(50, user_data, channel);
        
    }
}