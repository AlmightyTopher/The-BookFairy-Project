const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const { config } = require('dotenv');

// Load environment variables
config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;

if (!DISCORD_TOKEN) {
  console.error('❌ DISCORD_TOKEN is required in .env file');
  process.exit(1);
}

if (!DISCORD_CLIENT_ID) {
  console.error('❌ DISCORD_CLIENT_ID is required in .env file');
  process.exit(1);
}

const commands = [
  new SlashCommandBuilder()
    .setName('menu')
    .setDescription('Open the Book Fairy quick actions menu')
    .setDMPermission(true)
];

const rest = new REST().setToken(DISCORD_TOKEN);

async function registerCommands() {
  try {
    console.log('🔄 Started refreshing application (/) commands...');

    await rest.put(
      Routes.applicationCommands(DISCORD_CLIENT_ID),
      { body: commands }
    );

    console.log('✅ Successfully reloaded application (/) commands!');
    console.log('📋 Registered commands:');
    commands.forEach(command => {
      console.log(`  - /${command.name}: ${command.description}`);
    });
    console.log('\n⏰ Commands may take 1-5 minutes to appear globally.');
    
  } catch (error) {
    console.error('❌ Failed to register commands:', error);
    process.exit(1);
  }
}

registerCommands();
