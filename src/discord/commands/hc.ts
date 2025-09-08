import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { hcPing, searchBooksDescriptionFirst, searchAuthors } from "../../integrations/hardcover/service";

export const data = new SlashCommandBuilder().setName("hc").setDescription("Hardcover tools")
  .addSubcommand(s => s.setName("ping").setDescription("Check Hardcover token"))
  .addSubcommand(s => s.setName("search").setDescription("Search Hardcover database")
    .addStringOption(o => o.setName("query").setDescription("Search query").setRequired(true))
    .addStringOption(o => o.setName("type").setDescription("Search type").setRequired(false)
      .addChoices(
        { name: "Books", value: "books" },
        { name: "Authors", value: "authors" }
      )))
  .addSubcommand(s => s.setName("status").setDescription("Show your Hardcover integration status"));

export async function execute(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand();
  
  if (subcommand === "ping") {
    try {
      const me = await hcPing();
      await interaction.reply({ content: `✅ Hardcover OK for **${me.username}**${me.name ? ` (${me.name})` : ''}.`, ephemeral: true });
    } catch (e: any) {
      await interaction.reply({ content: `❌ Hardcover error: ${e?.message || e}`, ephemeral: true });
    }
  }
  
  else if (subcommand === "search") {
    const query = interaction.options.getString("query", true);
    const type = interaction.options.getString("type") || "books";
    
    try {
      if (type === "authors") {
        const results = await searchAuthors(query, 5);
        if (!results.items.length) {
          await interaction.reply({ content: `No authors found for "${query}".`, ephemeral: true });
          return;
        }
        
        const authorList = results.items.map((author, i) => 
          `${i + 1}. **${author.name}** (${author.booksCount} books)`
        ).join('\n');
        
        await interaction.reply({ 
          content: `📚 Authors matching "${query}":\n${authorList}`, 
          ephemeral: true 
        });
      } else {
        const results = await searchBooksDescriptionFirst(query, 5);
        if (!results.items.length) {
          await interaction.reply({ content: `No books found for "${query}".`, ephemeral: true });
          return;
        }
        
        const bookList = results.items.map((book, i) => 
          `${i + 1}. **${book.title}** by ${book.authors.join(', ')}`
        ).join('\n');
        
        await interaction.reply({ 
          content: `📖 Books matching "${query}":\n${bookList}`, 
          ephemeral: true 
        });
      }
    } catch (e: any) {
      await interaction.reply({ content: `❌ Search failed: ${e?.message || e}`, ephemeral: true });
    }
  }
  
  else if (subcommand === "status") {
    try {
      const me = await hcPing();
      const userId = process.env.HARDCOVER_USER_ID;
      const statusLines = [
        `✅ **Connected** as ${me.username}${me.name ? ` (${me.name})` : ''}`,
        `🔑 **API Token**: Configured`,
        `👤 **User ID**: ${userId || 'Not set (library features disabled)'}`,
        '',
        '**Available Features:**',
        '• Rich book menus with cover images',
        '• Author browsing and search',
        '• Smart query generation for downloads',
        userId ? '• Library duplicate detection' : '• Library features (disabled - set HARDCOVER_USER_ID)',
        '• Graceful fallback to Google Books'
      ];
      
      await interaction.reply({ content: statusLines.join('\n'), ephemeral: true });
    } catch (e: any) {
      await interaction.reply({ content: `❌ Status check failed: ${e?.message || e}`, ephemeral: true });
    }
  }
}
