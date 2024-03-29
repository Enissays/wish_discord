const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const ranks = require("../utilitary/fn_ranks.js");
var path = require('path');

const { uploadImage, ensureArtbook, findArtbook, createArtbook, updateEmbed_artbook, exploreArtbook } = require('../utilitary/fn_ranks.js');
const { makeid } = require('../utilitary/fn_global.js');

const Enmap = require('enmap');
const public_db = new Enmap({name: "public_artbook"});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('artbook')
		.setDescription('Gère ton artbook!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Crée un nouvel artbook')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Nom de l\'artbook')
                        .setRequired(true)
                )
                .addAttachmentOption(option =>
                    option.setName('cover')
                        .setDescription('Couverture de l\'artbook')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Supprime un artbook')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Nom de l\'artbook')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription('Edite un artbook')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Nom de l\'artbook à modifier')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('new_name')
                        .setDescription('Nouveau nom de l\'artbook')
                        .setRequired(false)
                )
                .addAttachmentOption(option =>
                    option.setName('cover')
                        .setDescription('Nouvelle couverture de l\'artbook')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('publish')
                .setDescription('Publie un artbook')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Nom de l\'artbook')
                        .setRequired(true)
                )
        )

        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Liste tes artbooks')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('cover')
                .setDescription('Change la couverture de l\'artbook')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Nom de l\'artbook')
                        .setRequired(true)
                )
                .addAttachmentOption(option =>
                    option.setName('page')
                        .setDescription('page à ajouter')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Ajoute une page à un artbook')
                .addStringOption(option =>
                    option.setName('nom')
                        .setDescription('Nom de l\'artbook')
                        .setRequired(true)
                )
                .addAttachmentOption(option =>
                    option.setName('page')
                        .setDescription('page à ajouter')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('nom_page')
                        .setDescription('Nom de la page')
                        .setRequired(true)
                )

        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('link')
                .setDescription('Lie un artbook à un salon, chaque dessin posté dans ce salon sera ajouté à l\'artbook')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Nom de l\'artbook')
                        .setRequired(true)
                )
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Salon à lier')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('unlink')
                .setDescription('Détache un artbook d\'un salon')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Nom de l\'artbook')
                        .setRequired(true)
                )
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Salon à délier')
                        .setRequired(true)
                )
        )
        
        ,
	async execute(interaction, client, all_data) {
        var udata = ranks.getRanks(interaction.user, all_data);
        switch (interaction.options.getSubcommand()) {
            case 'create':
                var name = interaction.options.getString('name');
                var cover = interaction.options.getAttachment('cover');
                if (findArtbook(udata, name)) {

                    return interaction.reply("Cet artbook existe déjà!");
                }
                await interaction.deferReply({ephemeral:true});
                var coverUrl = null;
                if (cover) {
                    coverUrl = await uploadImage(cover.url);
                }
                createArtbook(udata, name, coverUrl);
                interaction.editReply("Artbook créé avec succès!");
                all_data.set(interaction.user.id, udata);
                
                break;
            case 'delete':
                var name = interaction.options.getString('name');
                var artbook = findArtbook(udata, name);
                if (artbook) {
                    udata.artbooks.splice(udata.artbooks.indexOf(artbook), 1);
                    interaction.reply("Artbook supprimé avec succès!");
                } else {
                    interaction.reply("Cet artbook n'existe pas!");
                }

                all_data.set(interaction.user.id, udata);
                break;

            case 'list':
                ensureArtbook(udata);
                var artbooks = udata.artbooks;
                var index_artbooks = 0;
                var embed = new EmbedBuilder()
                    .setTitle("Liste de tes artbooks")
                    .setColor("#FF0000")

                var leftButton = new ButtonBuilder()
                    .setCustomId('left')
                    .setLabel('<<')
                    .setStyle(2);
                var rightButton = new ButtonBuilder()
                    .setCustomId('right')
                    .setLabel('>>')
                    .setStyle(2);

                var openButton = new ButtonBuilder()
                    .setCustomId('open')
                    .setLabel('Ouvrir')
                    .setStyle(1);

                var row = new ActionRowBuilder()
                    .addComponents(leftButton, rightButton, openButton);

                if (artbooks.length < 1) {
                    embed.setDescription("Tu n'as pas encore d'artbook! Tu peux en créer un avec la commande /artbook create");
                    interaction.reply({ embeds: [embed]});
                    return;
                }
                else {
                    var embed = new EmbedBuilder()
                    updateEmbed_artbook(embed, udata, index_artbooks);
                    interaction.reply({ embeds: [embed], components: [row]});

                    const filter = i => i.customId === 'left' || i.customId === 'right' || i.customId === 'open';
                    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });

                    collector.on('collect', async i => {
                        if (i.customId === 'left') {
                            index_artbooks--;
                            if (index_artbooks < 0) {
                                index_artbooks = artbooks.length - 1;
                            }
                            embed
                                .setFooter({text: "Page " + (index_artbooks + 1) + " sur " + artbooks.length, iconURL: interaction.user.avatarURL()})
                            updateEmbed_artbook(embed, udata, index_artbooks);
                        } else if (i.customId === 'right') {
                            index_artbooks++;
                            if (index_artbooks >= artbooks.length) {
                                index_artbooks = 0;
                            }
                            embed
                                .setFooter({text: "Page " + (index_artbooks + 1) + " sur " + artbooks.length, iconURL: interaction.user.avatarURL()})
                            updateEmbed_artbook(embed, udata, index_artbooks);
                        } else if (i.customId === 'open') {
                            var artbook = artbooks[index_artbooks];
                            collector.stop();
                            return exploreArtbook(i, artbook);
                        }

                        i.update({ embeds: [embed], components: [row]});
                    });

                }

                break;

            case 'cover':

                var name = interaction.options.getString('name');
                var url = interaction.options.getAttachment('page');
                var artbook = findArtbook(udata, name);

                interaction.deferReply({ephemeral:true});
                if (!artbook) {
                    return interaction.editReply("Cet artbook n'existe pas!");
                }
                var coverUrl = null;
                if (url) {
                    coverUrl = await uploadImage(url.url);
                }
                artbook.cover = coverUrl;
                interaction.editReply("Couverture changée avec succès!");
                all_data.set(interaction.user.id, udata);

                break;

            case 'add':
                var name = interaction.options.getString('nom');
                var url = interaction.options.getAttachment('page');
                var artbook = findArtbook(udata, name);
                await interaction.deferReply({ephemeral:true});
                if (!artbook) {
                    return interaction.editReply("Cet artbook n'existe pas!");
                }
                var pageUrl = null;
                if (url) {
                    pageUrl = await uploadImage(url.url);
                }
                artbook.pages.push({url: pageUrl, name: interaction.options.getString('nom_page')});
                interaction.editReply("Page ajoutée avec succès!");
                all_data.set(interaction.user.id, udata);
                break;

            case 'link':
                var name = interaction.options.getString('name');
                var channel = interaction.options.getChannel('channel');
                var artbook = findArtbook(udata, name);
                if (!artbook) {
                    return interaction.reply("Cet artbook n'existe pas!");
                }
                var artbook_channel = udata.artbook_channels;
                if (!artbook_channel) {
                    udata.artbook_channels = {};
                    artbook_channel = udata.artbook_channels;
                }
                artbook_channel[channel.id] = name;
                interaction.reply("Artbook lié avec succès!");
                all_data.set(interaction.user.id, udata);
                break;

            case 'unlink':
                var name = interaction.options.getString('name');
                var channel = interaction.options.getChannel('channel');
                var artbook = findArtbook(udata, name);
                if (!artbook) {
                    return interaction.reply("Cet artbook n'existe pas!");
                }
                var artbook_channel = udata.artbook_channels;
                if (!artbook_channel) {
                    return interaction.reply("Cet artbook n'est lié à aucun salon!");
                }
                if (!artbook_channel[channel.id]) {
                    return interaction.reply("Cet artbook n'est pas lié à ce salon!");
                }
                delete artbook_channel[channel.id];
                interaction.reply("Artbook délié avec succès!");
                all_data.set(interaction.user.id, udata);
                break;

            case 'edit':
                var name = interaction.options.getString('name');
                var new_name = interaction.options.getString('new_name');
                var cover = interaction.options.getAttachment('cover');
                var artbook = findArtbook(udata, name);
                if (!artbook) {
                    return interaction.reply("Cet artbook n'existe pas!");
                }
                if (new_name) {
                    artbook.name = new_name;
                }
                if (cover) {
                    artbook.cover = await uploadImage(cover.url);
                }
                interaction.reply("Artbook modifié avec succès!");
                all_data.set(interaction.user.id, udata);
                break;

            case 'publish' :
                // Ajout d'une propriété "public" à l'artbook
                var name = interaction.options.getString('name');
                var artbook = findArtbook(udata, name);
                if (!artbook) {
                    return interaction.reply("Cet artbook n'existe pas!");
                }

                if (!artbook.public) {
                    artbook.public = makeid(10);
                    public_db.set(artbook.public, artbook);
                    interaction.reply("Artbook publié avec succès, il peut être consulté avec la commande /artbook view " + artbook.public + "\nPour le modifier, re-effectue cette même commande.");
                    all_data.set(interaction.user.id, udata);
                } 
                else 
                {
                    public_db.set(artbook.public, artbook);
                    interaction.reply("Artbook mis à jour avec succès!");
                    all_data.set(interaction.user.id, udata);
                }
                
                break;
            }
	},
};