const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, Partials } = require('discord.js');

const { token, AUTH_TOKEN } = require('./config.json');
Partials.Channel;
const client = new Client({
	'intents': [
	  GatewayIntentBits.DirectMessages,
	  GatewayIntentBits.Guilds,
	  GatewayIntentBits.GuildPresences,
	  GatewayIntentBits.GuildMembers,
	  GatewayIntentBits.GuildMessages, 
	  GatewayIntentBits.GuildVoiceStates,
	  GatewayIntentBits.MessageContent
	],
	'partials': [Partials.Channel]
  });const ranks = require('./utilitary/fn_ranks');


const characterAI = require("@parking-master/node_characterai");
characterAI.authenticate(AUTH_TOKEN);
characterAI.setup("nuZnZrHcZnDQQgnDKQWccG-Rw1lOACX8rHqX96fJav8", "0bb19191-1013-4870-9bd0-9fb63650b009", "46330081", "Enienieni");


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

// C.A.I. stuff
let chat;
var actuallyTalking = false;
client.once(Events.ClientReady, async () => {
	// Authenticate as a guest
	(async () => {
		let response = await characterAI.send("Désolé..");
		console.log(response);
	  })();
	console.log('Ready!');
});

client.on(Events.VoiceServerUpdate, async (oldState, newState) => {
	// On compare si une nouvelle personne a rejoint le vocal 
	if (oldState.channelId === null && newState.channelId !== null) {
		// On envoie un message privé à un utilisateur
		client.users.fetch("849936690915442698").then((user) => {
			user.send(newState.member.displayName + " a rejoint le channel vocal " + newState.channel.name);
		});
	}
});

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
	// On compare si une nouvelle personne a rejoint le vocal 
	if (oldState.channelId === null && newState.channelId !== null) {
		// On envoie un message privé à un utilisateur
		client.users.fetch("849936690915442698").then((user) => {
			user.send(newState.member.displayName + " a rejoint le channel vocal " + newState.channel.name);
		});
	}
});

client.on('messageCreate', async message => {
	if (message.author.bot) return;

	if (message.content.toLowerCase().includes("eni?")) {
		console.log("Replying...");
		actuallyTalking = message.channel.id;
		// Send a message to the chatbot
		let response = await characterAI.send(message.content);
		message.reply(response);
		console.log("Replied.");

	}

	if (message.channel.id === actuallyTalking) {
		// Send a message to the chatbot
		let response = await characterAI.send(message.content);
		message.reply(response);
	}

	if (message.content.toLowerCase().includes("ciao") || message.content.toLowerCase().includes("bye") || message.content.toLowerCase().includes("au revoir") || message.content.toLowerCase().includes("pas toi")) {
		actuallyTalking = false;
	}

	if (message.author.id == '679076920096325643' && message.channel.type == 1)
	{
		var channel = client.channels.cache.get('1195492736674037780');
		await channel.send("Tom a dit : " + message.content);
	}
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