const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');

const { token, AUTH_TOKEN } = require('./config.json');
const { getRandom, getRandomList } = require("./utilitary/fn_global.js");
const intros = require("./utilitary/default_intros.json");


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
	// Load the present list and remove theses ids from the list
	var present = u_data.get('present');
	var ids_to_remove = ["260434058599727104", "365936942455586822", "350834037650358274"];
	if (present) {
		for (var i = 0; i < present.length; i++) {
			if (ids_to_remove.includes(present[i])) {
				present.splice(i, 1);
				i--;
			}
		}
		u_data.set('present', present);
	}
});

client.on(Events.GuildMemberAdd, member => {
	if (member.user.bot) return;
	if (member.guild.id != '875839479590567946') return;
	var channel = member.guild.channels.cache.get('984475852408496148');
	if (!channel) return;
	u_data.set('present', [member.id]);
	channel.send("Bienvenue à toi <@" + member.id + "> ! Je te présenterai chaque personne que tu verras parler ici pour la première fois, alors n'hésite pas à dire bonjour !");
});

client.on('messageCreate', async message => {
	if (message.author.bot) return;
	if (message.attachments.size > 0) {
		if (u_data.get(message.author.id) && u_data.get(message.author.id).artbook_channels) {
			var user_artbook_data = u_data.get(message.author.id);
			if (user_artbook_data.artbook_channels[message.channel.id]) {
				var artbook = ranks.findArtbook(user_artbook_data, user_artbook_data.artbook_channels[message.channel.id]);
				if (artbook) {
					artbook.pages.push({url: message.attachments.first().url, name: message.content});
					message.channel.send("Image ajoutée à l'artbook !").then (msg => {
						setTimeout(() => {
							msg.delete();
						}, 5000);
					});
					u_data.set(message.author.id, user_artbook_data);
				}
			}
		}
	}
	if (u_data.get('present')) {
		var present = u_data.get('present');
		if (!present.includes(message.author.id) && message.channel.id == '984475852408496148' && (intros[message.author.id] || message.author.id == "1159262796895240272")) {
			var embed;
			if (message.author.id == "1159262796895240272") {
				embed = new EmbedBuilder()
					.setTitle("Je présente..")
					.setAuthor({iconURL: message.author.displayAvatarURL(), name: "weyki"})
					.setImage("https://media1.tenor.com/m/FZJF5us3nt0AAAAd/young-thug-youngthug.gif")
					.setFooter({text: "Âge : 17"})
					.setColor("#FF0000");
			} else {
			embed = new EmbedBuilder()
				.setTitle("J'te présente !")
				.setAuthor({iconURL: message.author.displayAvatarURL(), name: intros[message.author.id] ? intros[message.author.id].name : message.author.username})
				.setDescription((intros[message.author.id] ? intros[message.author.id].description : "J'ai pas vraiment de données sur lui honnêtement, désolé..")  + "\n**Origine :** " + (intros[message.author.id] ? intros[message.author.id].origin : "Inconnue") )
				.setFooter({text: "Âge : " + (intros[message.author.id] ? intros[message.author.id].age : "Inconnu")})
				.setColor("#FF0000");
			}

			message.channel.send({embeds: [embed]});
			present.push(message.author.id);
			u_data.set('present', present);
		}
	}

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
