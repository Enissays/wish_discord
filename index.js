const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, Partials } = require('discord.js');

const { token, AUTH_TOKEN } = require('./config.json');
const { getRandom, getRandomList } = require("./utilitary/fn_global.js");

const private = require('./private.js');
private.start();

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
const u_data = new Enmap({name: "points"})

u_data.set('active', true);
console.log(u_data.get('active'));

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) { 
	const filePath = path.join(commandsPath, file)
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

// Bjr tout le monde

// C.A.I. stuff
let chat;
var actuallyTalking = false;
client.once(Events.ClientReady, async () => {

	console.log('Ready!');
});



client.on('messageCreate', async message => {
	if (message.author.bot) return;

	if (message.content.toLowerCase().includes("eni?")) {
		console.log("Replying...");
		actuallyTalking = message.channel.id;
		// Send a message to the chatbot
		let response = await characterAI.send(message.author.username + " : " + message.content + (message.author.username == "tayioukimura" ? "(réponds d'une manière douce et amoureuse en utilisant des mots comme 'bb' ou 'mv')" : "") + (message.author.username == "theysaideni" ? "(c'est ton créateur qui te parle ici)" : ""));
		message.reply(response);
		console.log("Replied.");

	}  else if (message.content.toLowerCase().includes("ciao") || message.content.toLowerCase().includes("bye") || message.content.toLowerCase().includes("au revoir") || message.content.toLowerCase().includes("pas toi")) {
		actuallyTalking = false;
	}
	else if (message.channel.id === actuallyTalking && !message.content.includes("(") && !message.content.includes(")")) {
		// Send a message to the chatbot
		let response = await characterAI.send(message.author.username + " : " + message.content + (message.author.username == "tayioukimura" ? "(réponds d'une manière douce et amoureuse en utilisant des mots comme 'bb' ou 'mv')" : "") + (message.author.username == "theysaideni" ? "(c'est ton créateur qui te parle ici)" : ""));
		message.reply(response);
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
		await interaction.reply({ content: 'Oups! Il semblerait qu\'il y ai eu une erreur lors de l\'éxécution de cette commande ! Mentionne Eni si ça persiste !', ephemeral: true });
	}
});

client.login(token);