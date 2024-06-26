const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js");
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

        if (card == "BDG") 
        {
            if (cards[game_data.last_card].girl) return game_data.log.push(`**${game_data[user_id].name}** a joué **${card.name}** mais l'effet ne fonctionne pas sur une carte contenant une fille !`);
        }
        if (card.effect == "random")
        {
            var effects = ["atk_buff","def_buff","heal_buff","stun","shield","heal","dmg","mana_reload","self_pv","opp_heal","heal_steal"];
            var effect = effects[Math.floor(Math.random() * effects.length)];
            card.effect = effect;
        }
        if (card.uses) 
        {
            if (game_data[user_id].uses) 
            {
                if (game_data[user_id].uses[card_id] >= card.uses) return game_data.log.push(`**${game_data[user_id].name}** a joué **${card.name}** mais il ne peut plus l'utiliser !`);
                game_data[user_id].uses[card_id]++;
            }
            else game_data[user_id].uses = {[card_id]:1};

        }
        if (card.luck) 
        {
            var luck_calc = Math.random();
            if (luck_calc < card.luck)
            {
                // Donne tous les effets contenus à l'intérieur de card.success
                for (var effect of card.success)
                {
                    card[effect] = card.success[effect];
                }
                game_data.log.push(`**${game_data[user_id].name}** a joué **${card.name}** et a eu de la chance !`);
            }
            else
            {
                // Donne tous les effets contenus à l'intérieur de card.fail
                for (var effect of card.fail)
                {
                    card[effect] = card.fail[effect];
                }
                game_data.log.push(`**${game_data[user_id].name}** a joué **${card.name}** et n'a pas eu de chance !`);
            }
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

        if (card.opp_heal) 
        {
            var heal_calc = Math.round(card.opp_heal * game_data[opponent_id].buff.heal);
            game_data[opponent_id].hp += heal_calc;
            if (game_data[opponent_id].hp > 100) game_data[opponent_id].hp = 100;
            game_data.log.push(`**${game_data[opponent_id].name}** a gagné **${heal_calc}** points de vie !`);
        }

        if (card.self_pv)
        {
            game_data[user_id].hp -= card.self_pv;
            game_data.log.push(`**${game_data[user_id].name}** s'est infligé **${card.self_pv}** points de vie !`);
        }
        if (card.buff_buff) 
        {
            game_data[user_id].buff.buff = card.buff_buff;
            game_data.log.push(`Les renforcements de **${game_data[user_id].name}** sont maintenant multipliés par **${card.buff_buff}** !`);
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
            game_data[user_id].buff.atk *= (card.atk_buff * (game_data[user_id].buff.buff || 1));
            game_data.log.push(`**${game_data[user_id].name}** a augmenté son attaque de **${card.atk_buff}** fois !`);
        }

        if (card.def_buff)
        {
            game_data[user_id].buff.def *= (card.def_buff * (game_data[user_id].buff.buff || 1));
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
            game_data[user_id].buff.heal *= (card.heal_buff * (game_data[user_id].buff.buff || 1));
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
        if (user_data.cheevos.includes(cheevo)) return user_data;
        var cheevo_data = cheevos[cheevo];
        var embed = new EmbedBuilder()
            .setAuthor({name:user_data.nickname + " vient de débloquer un nouveau succès !!", iconURL:avatar})
            .setTitle(cheevo_data.title)
            .setDescription(cheevo_data.emoji + " " + cheevo_data.description);
        channel.send({embeds:[embed]});
        user_data.cheevos += cheevo;
        return this.addXp(50, user_data, channel);
        
    },
    exploreArtbook(interaction, artbook) {
        var pages = artbook.pages;
        var index_pages = 0;
        if (pages.length < 1) {
            return interaction.update("Cet artbook est vide!");
        }
        var embed = new EmbedBuilder()
            .setAuthor({name: artbook.name})
            .setTitle(pages[index_pages].name)
            .setColor("#FF0000")
            .setImage(pages[index_pages].url)
            .setFooter({text: "Page " + (index_pages + 1) + " sur " + pages.length, iconURL: interaction.user.avatarURL()});
    
        var leftButton = new ButtonBuilder()
            .setCustomId('left')
            .setLabel('<<')
            .setStyle(1);
        var rightButton = new ButtonBuilder()
            .setCustomId('right')
            .setLabel('>>')
            .setStyle(1);
    
        var row = new ActionRowBuilder()
            .addComponents(leftButton, rightButton);
        interaction.update({ embeds: [embed], components: [row]});
    
        const filter = i => i.customId === 'left' || i.customId === 'right';
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 });
    
        collector.on('collect', async i => {
            console.log(index_pages);
            if (i.customId === 'left') {
                index_pages--;
                if (index_pages < 0) {
                    index_pages = pages.length - 1;
                }
                embed
                    .setTitle(pages[index_pages].name)
                    .setImage(pages[index_pages].url)
                    .setFooter({text: "Page " + (index_pages + 1) + " sur " + pages.length, iconURL: interaction.user.avatarURL()});
                i.update({ embeds: [embed], components: [row]});
            } else if (i.customId === 'right') {
                index_pages++;
                if (index_pages >= pages.length) {
                    index_pages = 0;
                }
                embed
                    .setTitle(pages[index_pages].name)
                    .setImage(pages[index_pages].url)
                    .setFooter({text: "Page " + (index_pages + 1) + " sur " + pages.length, iconURL: interaction.user.avatarURL()});
                i.update({ embeds: [embed], components: [row]});
            }
        });
    
        collector.on('end', collected => {
            interaction.editReply({ embeds: [embed], components: []});
        });
    },
    
    updateEmbed_artbook(embed, udata, index_artbooks) {
        var artbook = udata.artbooks[index_artbooks];
        console.log(artbook);
        embed
            .setAuthor({name: "Artbook " + (index_artbooks + 1) + " sur " + udata.artbooks.length})
            .setTitle(artbook.name)
            .setColor("#FF0000")
            .setImage(artbook.cover)
            .setDescription("Pages: " + artbook.pages.length)
            .setFooter({text: "Créé le " + artbook.dateofcreation.toLocaleDateString() + " à " + artbook.dateofcreation.toLocaleTimeString()})
    },
    
    uploadImage(imagePath) {
        
        return imagePath;
    },
    
    ensureArtbook(udata) {
        if (!udata.artbooks) {
            udata.artbooks = [];
        }
    },
    
    createArtbook(udata, name, cover) {
        if (!udata.artbooks) {
            udata.artbooks = [];
        }
        udata.artbooks.push({
            name: name,
            cover : cover,
            pages: [],
            dateofcreation: new Date()
        });
    
    },
    
    findArtbook(udata, name) {
        if (!udata.artbooks) return null;
        for (var i = 0; i < udata.artbooks.length; i++) {
            if (udata.artbooks[i].name == name) {
                return udata.artbooks[i];
            }
        }
        return null;
    }
}