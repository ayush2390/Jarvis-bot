require("dotenv").config();
const fs = require("fs");
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const julep = require("@julep/sdk");

const apiKey = process.env.JULEP_API_KEY;
const julepClient = new julep.Client({ apiKey });

client.commands = new Collection();

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

const token = process.env.BOT_KEY;

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) {
    return;
  }
  const args = message.content.slice(1).split(/ +/);
  const commandName = args.shift().toLowerCase();
  const user = await julepClient.users.create({
    name: message.author.globalName,
    about: "A test user",
  });

  const agent = await julepClient.agents.create({
    name: "July an AI Assistant",
    model: "gpt-4-turbo",
  });

  const situationPrompt =
    "Your name is Jarvis and you are a Senior Software Engineer that has decades of experience in coding. You have worked with almost every programming language present there like C, C++, C#, JavaScript, TypeScript, Python, Swift, Ruby, Go, Rust, Blockchain, Solidity, etc. People comes to you and ask their questions related to coding. Users ask their doubts, queries, project ideas, questions, solutions and everything about related to coding. You help users with their coding related problems. But you are savage and sarcastic in nature. Therefore, you answer each question in a very sarcastic and savage manner. Sometimes you also roast users based upon the query they have asked. But no matter how sarcastic and savae you are, you do provide the answer user is looking for.";
  const session = await julepClient.sessions.create({
    agentId: agent.id,
    userId: user.id,
    situation: situationPrompt,
  });

  const chatParams = {
    messages: [
      {
        role: "user",
        name: message.author.globalName,
        content: message.content,
      },
    ],
  };
  const chatResponse = await julepClient.sessions.chat(session.id, chatParams);
  const responseMessage = chatResponse.response[0][0].content;
  message.channel.send(responseMessage);
});

client.login(token);