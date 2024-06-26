const Enmap = require("enmap");

const u_data = new Enmap({name: "new_chocolates"});
//u_data.deleteAll();
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Events } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('chocolate')
		.setDescription('Chocolat valentin')
        .addSubcommand(subcommand =>
            subcommand
                .setName('give')
                .setDescription('Donne un chocolat')
                .addUserOption(option => option.setName('target').setDescription('L\'utilisateur a qui donner le chocolat').setRequired(true))
                )
        .addSubcommand(subcommand =>
            subcommand
                .setName('show')
                .setDescription('Montre tout tes chocolats')
            )
        .addSubcommand(subcommand =>
            subcommand
                .setName('leaderboard')
                .setDescription('Affiche le classement de ceux qui ont reçu le plus de chocolats')),
        async execute(interaction, client) {
        var actual = u_data.ensure(interaction.user.id, {get:0,left:3,user:interaction.user.id});
        if (!actual) actual = model;
        switch (interaction.options.getSubcommand())
        {
            case 'give' : 
                if (actual.left <= 0) return interaction.reply({content:"Tu n'as plus de chocolats!", ephemeral:true});
                const give_user = interaction.options.getUser('target');
                if (give_user.id == interaction.user.id) return interaction.reply({content:'Tu ne peux pas te donner du chocolat a toi-même!', ephemeral:true});
                var data_user = u_data.ensure(give_user.id, {get:0,left:3,user:give_user.id});
                data_user.get++;
                actual.left--;
                var warning = "";

                await interaction.deferReply({ephemeral:true});

                await give_user.send(`Tu viens de recevoir un chocolat ! Tu en possède **${data_user.get}** maintenant ! ${data_user.get == 1 ? "\nC'est la première fois que tu reçois ce message ! Si tu comprends pas trop ce que ça veut dire, dirige-toi ici https://discord.com/channels/875839479590567946/902632945544753253/1207050145938669630" : ""}`).catch(() => {
                    warning = `Précision : Cette personne a désactivé ces messages privés, elle ne sera donc pas mise au courant, ou prévenue quand elle utilisera la commande elle-même`;
                    data_user.warning = true;
                });

                interaction.followUp({content:`(${actual.get} reçu) Chocolat envoyé ! Il t'en reste ${actual.left} a donner! ${warning}`,ephemeral:true})

                u_data.set(give_user.id, data_user);
                u_data.set(interaction.user.id, actual);
            break;


            case 'show' : 
                const showEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setDescription(`Tu possèdes **${actual.get}** :chocolate_bar:\nTu peux encore donner **${actual.left}** :chocolate_bar:`);
                interaction.reply({embeds:[showEmbed], ephemeral:true});
            break;

            case 'leaderboard' : 
                const sorted = u_data.array().sort((a, b) => b.get - a.get);

                const top10 = sorted.splice(0, 10);
                const embed = new EmbedBuilder()
                    .setTitle("TOP 10")
                    .setDescription("Ceux qui ont reçu le plus de chocolats (qui sont le plus aimés, entre autres..)")
                    .setColor(0x00AE86);
                for(const data of top10) {
                    await client.users.fetch(data.user);
                    try {
                        embed.addFields({name:client.users.cache.get(data.user).tag, value:`${data.get} chocolats`});
                    } catch {
                        embed.addFields({name:`<@${data.user}>`, value:`${data.get} chocolats`});
                    }
                }

                interaction.reply({embeds:[embed]});
            break;
        }

        if (actual.warning) {
             interaction.reply({content:'Tes messages privés sont inaccessibles! Tu as des chocolats en attente!', ephemeral:true});
             actual.warning = false;
        }
        
	},
};