const { SlashCommandBuilder } = require('discord.js');
const Enmap = require("enmap");
const pari_data = new Enmap({name: "pari"});


module.exports = {
	data: new SlashCommandBuilder()
		.setName('pari')
		.setDescription('Crée un pari!')
        .addSubcommand(subcommand => subcommand.setName('create').setDescription("Crée un pari")
                                                    .addStringOption(option => option.setName('nom').setDescription("Le nom du pari"))),
	async execute(interaction, client, udata) {

        switch (interaction.options.getSubcommand())
        {
            case "create":
                var id = utilitary.makeid(10);
                pari_data.set(id, {creator:interaction.user.id, players:[], data:{}});
                interaction.reply({content:`Le pari ${id} a été créé !`});
                break;

            case "join":
                var id = interaction.options.getString("id");
                var pari = pari_data.get(id);
                if (pari == undefined) return interaction.reply({content:"Ce pari n'existe pas !", ephemeral:true});
                if (pari.players.includes(interaction.user.id)) return interaction.reply({content:"Tu as déjà rejoint ce pari !", ephemeral:true});

                pari.players.push(interaction.user.id);
                pari_data.set(id, pari);
                interaction.reply({content:`Tu as rejoint le pari ${id} !`, ephemeral:true});
                break;

            case "delete":
                var id = interaction.options.getString("id");
                var pari = pari_data.get(id);
                if (pari == undefined) return interaction.reply({content:"Ce pari n'existe pas !", ephemeral:true});
                if (pari.creator != interaction.user.id) return interaction.reply({content:"Tu n'es pas le créateur de ce pari !", ephemeral:true});

                pari_data.delete(id);
                interaction.reply({content:`Le pari ${id} a été supprimé !`, ephemeral:true});
                break;

            case "mdj":
                var mdj_user = interaction.options.getUser("user");
                var id = interaction.options.getString("id");
                var pari = pari_data.get(id);
                if (pari == undefined) return interaction.reply({content:"Ce pari n'existe pas !", ephemeral:true});
                if (pari.creator != interaction.user.id) return interaction.reply({content:"Tu n'es pas le créateur de ce pari !", ephemeral:true});
                if (pari.players.includes(mdj_user.id)) return interaction.reply({content:"Ce joueur a déjà rejoint ce pari !", ephemeral:true});

                pari.suggested_mdj = mdj_user.id;
                pari.consent_players = [];
                pari_data.set(id, pari);
                interaction.reply({content:`Le joueur ${mdj_user.username} a été proposé comme mdj pour le pari ${id} !`});
                break;

            case "accept_mdj":
                var id = interaction.options.getString("id");
                var pari = pari_data.get(id);
                if (pari == undefined) return interaction.reply({content:"Ce pari n'existe pas !", ephemeral:true});
                if (pari.suggested_mdj != interaction.user.id) return interaction.reply({content:"Tu n'as pas été proposé comme mdj pour ce pari !", ephemeral:true});

                pari.mdj = interaction.user.id;
                pari_data.set(id, pari);
                interaction.reply({content:`Tu es désormais le mdj du pari ${id} !`});
                break;

            case "refuse_mdj":
                var id = interaction.options.getString("id");
                var pari = pari_data.get(id);
                if (pari == undefined) return interaction.reply({content:"Ce pari n'existe pas !", ephemeral:true});
                if (pari.suggested_mdj != interaction.user.id) return interaction.reply({content:"Tu n'as pas été proposé comme mdj pour ce pari !", ephemeral:true});

                pari.suggested_mdj = null;
                pari_data.set(id, pari);
                interaction.reply({content:`Tu as refusé d'être mdj pour le pari ${id} !`});
                break;

                case "win":
                    var id = interaction.options.getString("id");
                    var pari = pari_data.get(id);
                    if (pari == undefined) return interaction.reply({content:"Ce pari n'existe pas !", ephemeral:true});
                    if (pari.creator != interaction.user.id) return interaction.reply({content:"Tu n'es pas le créateur de ce pari !", ephemeral:true});
                    if (pari.mdj == undefined) return interaction.reply({content:"Le mdj n'a pas encore été désigné !", ephemeral:true});

                    var winner = interaction.options.getUser("winner");
                    pari.winner = winner.id;
                    pari_data.set(id, pari);
                    interaction.reply({content:`Le gagnant du pari ${id} est ${winner.username} !`});
                    break;
        }

	},
};