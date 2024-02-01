const { EmbedBuilder } = require("discord.js");
const cheevos = require("./cheevos.json");
const cards = require("./cards.json");

module.exports = 
{

    play_change(game_data, card_id, user_id, opponent_id)
    {
        var card = cards[card_id];
        game_data[user_id].mana -= card.mana;
        if (card.counters && !card.counters.includes(game_data.last_card)) return game_data.log.push(`<@${user_id}> a joué **${card.name}** mais <@${opponent_id}> n'a pas joué de carte qui peut être contrée !`);
        game_data.last_card = card_id;
        if (card.self_pv)
        {
            game_data[user_id].hp -= card.self_pv;
            game_data.log.push(`<@${user_id}> s'est infligé **${card.self_pv}** points de dégâts !`);
        }
        if (card.self_stun) 
        {
            game_data.self_stun = card.self_stun;
            game_data.stun = 0;
        }
        if (card.effect)
        {
            game_data.effects.push(card.effect);
        }
        if (card.atk_buff)
        {
            game_data[user_id].atk_buff *= card.atk_buff;
            game_data.log.push(`<@${user_id}> a augmenté son attaque de **${card.atk_buff}** fois !`);
        }

        if (card.def_buff)
        {
            game_data[user_id].def_buff *= card.def_buff;
            game_data.log.push(`<@${user_id}> a augmenté sa défense de **${card.def_buff}** fois !`);
        }
        if (card.stun) 
        {
            game_data.stun = card.stun;
            game_data.log.push(`<@${opponent_id}> est étourdi pendant **${card.stun}** tour(s) !`);
        }
        if (card.heal) 
        {
            game_data[user_id].hp += card.heal;
            if (game_data[user_id].hp > 100) game_data[user_id].hp = 100;
            game_data.log.push(`<@${user_id}> a récupéré **${card.heal}** points de vie !`);
        }

        if (card.dmg)
        {
            if (game_data[opponent_id].shield > 0)
            {
                game_data[opponent_id].shield -= card.dmg;
                if (game_data[opponent_id].shield < 0) game_data[opponent_id].shield = 0;
                game_data.log.push(`<@${opponent_id}> a perdu **${card.dmg}** points de bouclier !`);
                return;
            }
            var atk_calc = (card.dmg * game_data[user_id].atk_buff) / game_data[opponent_id].def_buff;
            game_data[opponent_id].hp -= atk_calc;
            game_data.log.push(`<@${user_id}> a perdu **${atk_calc}** points de vie !`);
        }

        if (card.shield)
        {
            game_data[user_id].shield += card.shield;
            game_data.log.push(`<@${user_id}> a gagné **${card.shield}** points de bouclier !`);
        }

        if (card.mana_reload)
        {
            game_data[user_id].mana += card.mana_reload;
            game_data.log.push(`<@${user_id}> a récupéré **${card.mana_reload}** points de mana !`);
        }

    },
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
                daily : 0,
                coins : 0
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
            if (!onMessage) channel.send(`${user_data.nickname} vient de passer au rang **${user_data.rank.level}** !!`)
            else channel.send(`${user_data.nickname} vient de passer au rang **${user_data.rank.level}** !!`)
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