import axios from 'axios';
import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import { config } from 'dotenv';

config();

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
  {
    name: 'invite',
    description: 'Issue an invitation code!',
  },
];

const rest = new REST({ version: '10' }).setToken(
  process.env.DISCORD_TOKEN ?? '',
);

try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(
    Routes.applicationCommands(process.env.DISCORD_CLIENT_ID ?? ''),
    {
      body: commands,
    },
  );

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.on('ready', async () => {
  await client.application?.commands.set(commands);
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.user.bot) return;

  switch (interaction.commandName) {
    case 'ping':
      void interaction.reply('Pong!');
      break;
    case 'invite':
      try {
        const response = await axios.post(
          `https://${process.env.MISSKEY_HOST}/api/invite`,
          { i: process.env.MISSKEY_TOKEN },
        );
        void interaction.reply({
          content: response.data.code,
          ephemeral: true,
        });
      } catch (e) {
        console.error(e);
      }
      break;
    default:
      break;
  }
});

void client.login(process.env.DISCORD_TOKEN);
