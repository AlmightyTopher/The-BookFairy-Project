import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { hcPing } from "../../integrations/hardcover/service";

export const data = new SlashCommandBuilder().setName("hc").setDescription("Hardcover tools")
  .addSubcommand(s => s.setName("ping").setDescription("Check Hardcover token"));

export async function execute(interaction: ChatInputCommandInteraction) {
  if (interaction.options.getSubcommand() === "ping") {
    try {
      const me = await hcPing();
      await interaction.reply({ content: `Hardcover OK for ${me.username}.`, ephemeral: true });
    } catch (e: any) {
      await interaction.reply({ content: `Hardcover error: ${e?.message || e}`, ephemeral: true });
    }
  }
}
