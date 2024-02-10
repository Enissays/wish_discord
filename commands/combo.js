const { ContextMenuCommandBuilder, ApplicationCommandType, ChannelType } = require('discord.js');

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('combo')
        .setType(ApplicationCommandType.User),
	async execute(interaction, client, lines) {
		// Access the member object from the interaction
        interaction.guild.channels.create({name:`La tombe de ${interaction.targetMember.displayName}`, type:2, parent:interaction.channel.parent})
        .then(async (channel) => {
        interaction.targetMember.edit({mute:true, deaf:true, channel:channel});
        setTimeout(() => {
            channel.delete();
        }, 10000/2);
        interaction.reply({content:'Combo!', ephemeral:true})
    });
	},
};