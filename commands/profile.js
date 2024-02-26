const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const utilitary = require('../utilitary/fn_global');
const ranks = require('../utilitary/fn_ranks');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription("Customise ton profil de rêveur")
        .addSubcommand((subcommand) =>
            subcommand.setName('color')
                      .setDescription('Définis ta couleur favorite en format hexagonal')
                      .addStringOption((option) =>
                                option
                                    .setName('couleur')
                                    .setDescription('La couleur à définir pour ton profil')
                                    .setRequired(true)
                      )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('nickname')
                      .setDescription('Définis ton surnom défini par le bot, par défaut ce sera ton nom d\'utilisateur')
                      .addStringOption((option) =>
                                option
                                    .setName('surnom')
                                    .setDescription('Le surnom que tu aimerais choisir')
                                    .setRequired(true)
                            
                        )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('bio')
                        .setDescription('Définis ta description')
                        .addStringOption((option) =>
                            option
                                .setName('description')
                                .setDescription('Ta description')
                                .setRequired(true)
                        )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('show')
                      .setDescription('Affiche ton profil')
        )


        ,
	async execute(interaction, client, udata) {
        var user_data = ranks.getRanks(interaction.user, udata);
        switch (interaction.options.getSubcommand())
        {
            case "color" :
                var color_input = interaction.options.getString('couleur');
                if (!color_input.startsWith('#') && color_input.length != 7) return interaction.user.reply({content:'Format de couleur invalide!', ephemeral:true});

                user_data.color = color_input;
                udata.set(interaction.user.id, user_data);
                interaction.reply({content: `Ta nouvelle couleur a été définie en \`\`${color_input}\`\``, ephemeral: true});
                break;
            
            case "nickname" : 
                var nick_input = interaction.options.getString('surnom');

                user_data.nickname = nick_input;
                udata.set(interaction.user.id, user_data);
                interaction.reply({content: `Désormais je t'appelerais ${nick_input} ! `, ephemeral:true});
                break;

            case "show": 
                
                var embed = new EmbedBuilder()
                    .setColor(user_data.color)
                    .setAuthor({name: user_data.nickname, iconURL: interaction.user.displayAvatarURL({dynamic: true})})
                    .setDescription(user_data.bio || "J'ai pas de données sur toi, tu devrais te décrire avec la commande /profile bio")

                interaction.reply({embeds: [embed], ephemeral: true});
            break;

            case "bio":
                var bio_input = interaction.options.getString('description');
                user_data.bio = bio_input;
                udata.set(interaction.user.id, user_data);
                interaction.reply({content: `Ta nouvelle description a été définie en \`\`${bio_input}\`\``, ephemeral: true});
                break;
        }
	},
};