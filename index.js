const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });
const ranks = require('./utilitary/fn_ranks');

const Enmap = require("enmap");
const u_data = new Enmap({name: "points"});

u_data.set('active', true);
console.log(u_data.get('active'));

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, () => {
	console.log('Ready!');
});

client.on(Events.MessageCreate, message => {
	if (u_data.get(message.author.id)) 
	{
		var newUdata = ranks.addXp(3, u_data.get(message.author.id), message.channel.send, true);
		if (newUdata) u_data.set(message.author.id,
			newUdata);
	}
	});

client.on(Events.InteractionCreate, async interaction => {
	//if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);
	if (!command) return;
	
	try {
		await command.execute(interaction, client, u_data);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(token);