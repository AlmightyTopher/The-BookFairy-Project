# BUTTON IMPLEMENTATION DOCUMENTATION

This document provides a complete overview of the button system implementation that solves Discord customId length limitations while providing rich book detail views.

## OVERVIEW

The implementation replaces long base64url customIds with short tokens backed by an in-memory store. When users click numbered buttons (1-5), they now see rich detail cards with cover images, series info, and synopsis instead of immediate downloads.

## KEY COMPONENTS

### 1. Button Store (src/state/buttonStore.ts)
**PURPOSE**: TTL-based in-memory storage for book metadata with automatic cleanup

```typescript
export interface BookMeta {
  id: string;
  title: string;
  author: string;
  description?: string;
  series?: string;
  isbn?: string;
  publisher?: string;
  publishedDate?: string;
}

class ButtonStore {
  private store = new Map<string, { data: BookMeta; expires: number }>();
  private readonly TTL = 15 * 60 * 1000; // 15 minutes

  put(meta: BookMeta): string {
    const id = crypto.randomBytes(12).toString('base64url'); // 16 chars
    this.store.set(id, {
      data: meta,
      expires: Date.now() + this.TTL
    });
    this.cleanup();
    return id;
  }

  get(id: string): BookMeta | null {
    const entry = this.store.get(id);
    if (!entry || Date.now() > entry.expires) {
      this.store.delete(id);
      return null;
    }
    return entry.data;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [id, entry] of this.store.entries()) {
      if (now > entry.expires) {
        this.store.delete(id);
      }
    }
  }
}

export const buttonStore = new ButtonStore();
```

### 2. Book Buttons (src/discord/ui/bookButtons.ts)
**PURPOSE**: Generate short button IDs and create numbered buttons

```typescript
import { ButtonBuilder, ButtonStyle } from 'discord.js';
import { buttonStore, BookMeta } from '../../state/buttonStore';

export function buildBookViewId(meta: BookMeta): string {
  const id = buttonStore.put(meta);
  return `BOOK_VIEW:${id}`;
}

export function bookSelectButton(meta: BookMeta, index: number): ButtonBuilder {
  return new ButtonBuilder()
    .setCustomId(buildBookViewId(meta))
    .setLabel(`${index + 1}`)
    .setStyle(ButtonStyle.Primary);
}
```

### 3. Book Details Handler (src/discord/interactions/bookDetails.ts)
**PURPOSE**: Handle book detail interactions and create rich embeds

```typescript
import { ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { buttonStore } from '../../state/buttonStore';
import { downloadService } from '../../services/downloads';
import { showMainMenu } from '../../discord/ui/mainMenu';
import { getBookCover, getBookDetails } from '../../integrations/hardcover/client';

export async function handleBookDetailsInteraction(interaction: ButtonInteraction): Promise<void> {
  const { action, id } = parseId(interaction.customId);
  
  switch (action) {
    case 'BOOK_VIEW':
      await handleView(interaction, id);
      break;
    case 'BOOK_DL_YES':
      await handleYes(interaction, id);
      break;
    case 'BOOK_DL_NO':
      await handleNo(interaction);
      break;
    default:
      await interaction.reply({ content: 'Unknown book action', ephemeral: true });
  }
}

function parseId(customId: string): { action: string; id: string } {
  const [action, id] = customId.split(':');
  return { action, id };
}

function makeYesId(meta: BookMeta): string {
  const id = buttonStore.put(meta);
  return `BOOK_DL_YES:${id}`;
}

function makeNoId(): string {
  return `BOOK_DL_NO:static`;
}

async function handleView(interaction: ButtonInteraction, id: string): Promise<void> {
  const meta = buttonStore.get(id);
  if (!meta) {
    await interaction.reply({ 
      content: 'Book information has expired. Please search again.', 
      ephemeral: true 
    });
    return;
  }

  try {
    // Get additional details from Hardcover API
    const details = await getBookDetails(meta.title, meta.author);
    const coverUrl = await getBookCover(meta.title, meta.author);
    
    // Create rich embed
    const embed = new EmbedBuilder()
      .setTitle(meta.title)
      .setAuthor({ name: meta.author })
      .setColor(0x7C4DFF);

    if (details?.description || meta.description) {
      const description = details?.description || meta.description!;
      const truncated = description.length > 500 
        ? description.substring(0, 500) + '...' 
        : description;
      embed.setDescription(truncated);
    }

    if (details?.series || meta.series) {
      embed.addFields({ 
        name: 'Series', 
        value: details?.series || meta.series!, 
        inline: true 
      });
    }

    if (details?.publisher || meta.publisher) {
      embed.addFields({ 
        name: 'Publisher', 
        value: details?.publisher || meta.publisher!, 
        inline: true 
      });
    }

    if (details?.publishedDate || meta.publishedDate) {
      embed.addFields({ 
        name: 'Published', 
        value: details?.publishedDate || meta.publishedDate!, 
        inline: true 
      });
    }

    if (coverUrl) {
      embed.setThumbnail(coverUrl);
    }

    // Download action buttons
    const actionRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(makeYesId(meta))
          .setLabel('📥 Download')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(makeNoId())
          .setLabel('❌ No thanks')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({
      embeds: [embed],
      components: [actionRow],
      ephemeral: true
    });

  } catch (error) {
    console.error('Error creating book details:', error);
    
    // Fallback to basic embed
    const embed = new EmbedBuilder()
      .setTitle(meta.title)
      .setAuthor({ name: meta.author })
      .setColor(0x7C4DFF);

    if (meta.description) {
      embed.setDescription(meta.description);
    }

    const actionRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(makeYesId(meta))
          .setLabel('📥 Download')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(makeNoId())
          .setLabel('❌ No thanks')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({
      embeds: [embed],
      components: [actionRow],
      ephemeral: true
    });
  }
}

async function handleYes(interaction: ButtonInteraction, id: string): Promise<void> {
  const meta = buttonStore.get(id);
  if (!meta) {
    await interaction.reply({ 
      content: 'Book information has expired. Please search again.', 
      ephemeral: true 
    });
    return;
  }

  try {
    await downloadService.requestDownload({
      title: meta.title,
      author: meta.author,
      userId: interaction.user.id,
      source: 'discord_interaction'
    });

    await interaction.update({
      content: `✅ Download requested for "${meta.title}" by ${meta.author}`,
      embeds: [],
      components: []
    });

    // Show main menu after 2 seconds
    setTimeout(async () => {
      const mainMenuResponse = await showMainMenu();
      await interaction.followUp(mainMenuResponse);
    }, 2000);

  } catch (error) {
    console.error('Error requesting download:', error);
    await interaction.reply({
      content: 'Sorry, there was an error requesting the download. Please try again.',
      ephemeral: true
    });
  }
}

async function handleNo(interaction: ButtonInteraction): Promise<void> {
  await interaction.update({
    content: 'No worries! Feel free to browse more books.',
    embeds: [],
    components: []
  });

  // Show main menu after 1 second
  setTimeout(async () => {
    const mainMenuResponse = await showMainMenu();
    await interaction.followUp(mainMenuResponse);
  }, 1000);
}
```

### 4. Environment Configuration (.env and .env.example)
**PURPOSE**: Add Hardcover API configuration

```env
# Add these lines:
HARDCOVER_API_TOKEN=
HARDCOVER_GRAPHQL_URL=https://api.hardcover.app/v1/graphql
```

### 5. Copy Text Updates
**PURPOSE**: Update user-facing text to reflect new behavior

**In src/bot/message-handler.ts:**
```typescript
// Changed from "pick a number to download" to:
"pick a number to view details"
```

**In src/navigation/unified-nav.ts:**
```typescript
// Changed from:
content += `\n\nSay "next" to see more results, or pick a number to download!`;
// And:
content += `\n\nPick a number to download!`;

// To:
content += `\n\nSay "next" to see more results, or pick a number to view details!`;
// And:
content += `\n\nPick a number to view details!`;
```

## USER FLOW

1. **Search Results**: User sees numbered buttons (1-5) with text "pick a number to view details"
2. **Click Button**: User clicks a number button
3. **Detail Card**: Rich embed appears with:
   - Book cover image (if available)
   - Full title and author
   - Series information (if available)
   - Publisher and publication date
   - Synopsis/description (truncated to 500 chars)
   - Two action buttons: "📥 Download" and "❌ No thanks"
4. **Download Flow**: 
   - "Download" → Processes download request → Shows main menu
   - "No thanks" → Shows main menu
5. **Expiration**: Button tokens expire after 15 minutes for security

## BENEFITS

- **Solves customId length limit**: Short 16-character tokens instead of long base64url data
- **Rich user experience**: Cover images, series info, synopsis before download
- **Security**: Automatic token expiration prevents replay attacks
- **Performance**: In-memory storage with automatic cleanup
- **Backward compatibility**: All existing flows (Next, New search, New chat) unchanged
- **No external dependencies**: Uses built-in crypto module for token generation

## RESTORATION INSTRUCTIONS

To restore this functionality to a previous working version:

1. Copy the entire contents of each file section above
2. Create/update the files in the exact locations specified
3. Ensure your .env file includes the Hardcover API configuration
4. The bot will now show rich detail cards instead of immediate downloads
5. All existing navigation (Next, Back, New Chat, Other Commands) remains functional

This implementation preserves all core bot functionality while adding the enhanced detail view system.
