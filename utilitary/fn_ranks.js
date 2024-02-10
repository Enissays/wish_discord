const { EmbedBuilder } = require("discord.js");
const cheevos = require("./cheevos.json");
const cards = require("./cards.json");

module.exports = 
{

    play_change(game_data, card_id, user_id, opponent_id)
    {
        var card = cards[card_id];
        game_data[user_id].mana -= card.mana;
        if (card.counters && !card.counters.includes(game_data.last_card)) return game_data.log.push(`**${game_data[user_id].name}** a joué **${card.name}** mais il n'a pas de carte à contrer !`);
        if (game_data.effects.includes("cancel") && game_data.cancel == user_id) {
            game_data.cancel = null;
            return game_data.log.push(`**${game_data[user_id].name}** a joué **${card.name}** mais son effet a été annulé !`);
        }
        if (card.effect == "backup")
        {
            if (!game_data.backup) return game_data.log.push(`**${game_data[user_id].name}** a joué **${card.name}** mais il n'y a pas de sauvegarde à restaurer !`);
            game_data = game_data.backup;
            return game_data.log.push(`**${game_data[user_id].name}** a joué **${card.name}** et a annulé les effets de la dernière carte jouée !`);
        }
        if (card.effect == "eni") {
            // Retire une carte aléatoirement du deck ennemi
            var opponent_cards = game_data[opponent_id].cards;
            var card_index = Math.floor(Math.random() * opponent_cards.length);
            game_data[opponent_id].cards.splice(card_index, 1);
            return game_data.log.push(`**${game_data[user_id].name}** a joué **${card.name}** et a retiré une carte aléatoire du deck de **${game_data[opponent_id].name}** !`);
        }
        if (card.condition) {
            if (card.condition == "mana") {
                // vérifie si le mana de l'adversaire est inférieur au sien, si oui, annule la carte
                if (game_data[user_id].mana > game_data[opponent_id].mana) return game_data.log.push(`**${game_data[user_id].name}** a joué **${card.name}** mais son adversaire a plus de mana !`);
                
            }
        }
        game_data.last_card = card_id;
        
        if (card.heal_steal)
        {
            var steal_calc = Math.round(card.heal_steal * game_data[opponent_id].buff.atk);
            game_data[user_id].hp += steal_calc/2;
            game_data[opponent_id].hp -= steal_calc;
            game_data.log.push(`**${game_data[user_id].name}** a volé **${steal_calc/2}** points de vie et en à infligé **${steal_calc}** à **${game_data[opponent_id].name}** !`);
        }
        if (card.self_pv)
        {
            game_data[user_id].hp -= card.self_pv;
            game_data.log.push(`**${game_data[user_id].name}** s'est infligé **${card.self_pv}** points de vie !`);
        }
        if (card.self_stun) 
        {
            game_data[user_id].effects.stun = card.self_stun;
        }
        if (card.effect)
        {
            if (card.effect == "cancel") game_data.cancel = user_id;
            if (card.effect == "mute") game_data.mute = user_id;
            game_data.effects.push(card.effect);
        }
        if (card.atk_buff)
        {
            game_data[user_id].buff.atk *= card.atk_buff;
            game_data.log.push(`**${game_data[user_id].name}** a augmenté son attaque de **${card.atk_buff}** fois !`);
        }

        if (card.def_buff)
        {
            game_data[user_id].buff.def *= card.def_buff;
            game_data.log.push(`**${game_data[user_id].name}** a augmenté sa défense de **${card.def_buff}** fois !`);
        }
        if (card.stun) 
        {
            if (game_data[opponent_id].effects.includes("ader")) return game_data.log.push(`**${game_data[opponent_id].name}** est immunisé contre l'étourdissement !`);
            game_data[opponent_id].effects.stun = card.stun;
            game_data.log.push(`**${game_data[opponent_id].name}** est étourdi pendant **${card.stun}** tours !`);
        }
        if (card.heal_buff)
        {
            game_data[user_id].buff.heal *= card.heal_buff;
            game_data.log.push(`**${game_data[user_id].name}** a augmenté ses soins de **${card.heal_buff}** fois !`);
        }
        if (card.heal) 
        {
            var heal_calc = Math.round(card.heal * game_data[user_id].buff.heal);
            game_data[user_id].hp += heal_calc;
            if (game_data[user_id].hp > 100) game_data[user_id].hp = 100;
            game_data.log.push(`**${game_data[user_id].name}** a gagné **${heal_calc}** points de vie !`);
        }

        if (card.dmg)
        {
            if (game_data[opponent_id].shield > 0)
            {
                game_data[opponent_id].shield -= card.dmg;
                if (game_data[opponent_id].shield < 0) game_data[opponent_id].shield = 0;
                game_data.log.push(`**${game_data[opponent_id].name}** a perdu **${card.dmg}** points de bouclier !`);
                return;
            }
            var atk_calc = Math.round((card.dmg * game_data[user_id].buff.atk) / game_data[opponent_id].buff.def);
            game_data[opponent_id].hp -= atk_calc;
            game_data.log.push(`**${game_data[opponent_id].name}** a perdu **${atk_calc}** points de vie !`);
        }

        if (card.shield)
        {
            game_data[user_id].shield += card.shield;
            game_data.log.push(`**${game_data[user_id].name}** a gagné **${card.shield}** points de bouclier !`);
        }

        if (card.mana_reload)
        {
            game_data[user_id].mana += card.mana_reload;
            game_data.log.push(`**${game_data[user_id].name}** a gagné **${card.mana_reload}** points de mana !`);
        }

        
        game_data.backup = game_data;
        game_data.backup.backup = null;

    },
    getRanks(user, udata)
    {
        console.log("Accessing : " + user.id);
        var user_data = udata.ensure(user.id,
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
        return user_data;
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
            user_data.rank.level++;
            user_data.rank.xp = 0;
            user_data.rank.nextRank *= 1.5;

            if (!onMessage) channel.send(`${user_data.nickname} vient de passer au rang **${user_data.rank.level}** !!`)
            else channel.send(`${user_data.nickname} vient de passer au rang **${user_data.rank.level}** !!`)

        }

        return user_data;
    },

    addCoins(num, user_data)
    {
        user_data.coins += num;
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