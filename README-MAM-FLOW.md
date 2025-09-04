# Audiobooks: Fixed Labels with Live Link Refresh, 5-Item Pagination, MAM to Prowlarr Flow

## Overview

This feature implements a headless browsing and relay flow that starts with canonical genre selection, navigates MAM result pages using live URL construction, and forwards selected items to Prowlarr for proper downloading. The UX exactly matches the existing title search interface with 5-item pagination.

## Architecture

### Fixed Canonical Labels

- **36 MAM Genre Categories**: All AudioBooks, Action/Adventure, Art, Biographical, Business, Computer/Internet, Crafts, Crime/Thriller, Fantasy, Food, General Fiction, General Non-Fic, Historical Fiction, History, Home/Garden, Horror, Humor, Instructional, Juvenile, Language, Literary Classics, Math/Science/Tech, Medical, Mystery, Nature, Philosophy, Pol/Soc/Relig, Recreation, Romance, Science Fiction, Self-Help, Travel/Adventure, True Crime, Urban Fantasy, Western, Young Adult
- **6 Time Windows**: week, month, 3 months, 6 months, 1 year, all time
- **Runtime URL Construction**: Fresh MAM browse URLs built on-demand using current dates and search parameters

### Discord UX Flow

1. **Entry Point**: `📚 Audiobooks` button in main menu
2. **Genre Selection**: Choose from 36 canonical MAM categories
3. **Time Window Selection**: Choose popularity time range
4. **Results View**: 5 items per page, "Page X of Y" format
5. **Item Selection**: Number buttons (1)(2)(3)(4)(5) for selection
6. **Confirmation**: Brief card with Title and Author only
7. **Prowlarr Relay**: Send to Prowlarr button (no direct downloads)

### Technical Implementation

#### MAM URL Construction

```typescript
// Direct MAM browse URL building
const baseUrl = 'https://www.myanonamouse.net/tor/browse.php';
// Parameters: audiobook category (42), English language, date ranges, popularity sort
```

#### Rate Limiting

- **10 requests per minute** per guild/user combination
- **5-minute cache TTL** for genre/time combinations
- **Graceful degradation** on rate limit exceeded

#### Security & Privacy

- **No credential logging**: MAM login details never appear in logs
- **Magnet link redaction**: Only first 10 characters of infohash logged
- **Memory-only sessions**: No persistent credential storage

## Usage

### Entry Point
Send any message to the bot, then click `📚 Audiobooks`.

### Navigation
- **Choose Genre** → Select from 36 MAM categories
- **Choose Time Window** → Select popularity range
- **Browse Results** → 5 per page with pagination
- **Select Item** → Click [1]-[5] for item on current page
- **Confirm & Send** → Review and send to Prowlarr

### Controls
- **[1][2][3][4][5]**: Select item on current page
- **[← Prev]**: Previous page (if available)
- **[Next →]**: Next page (if available)
- **[Change Genre]**: Return to genre selection
- **[Change Time]**: Return to time window selection
- **[Send to Prowlarr]**: Relay selected item to Prowlarr
- **[Cancel]**: Cancel current selection

## Dry Run Mode

Test the scraping and formatting without calling Prowlarr:

```bash
npm run test:mam-flow
```

Sample output:
```
=== DRY RUN: General Fiction + week ===
Total items: 15, Page 1 of 3

1) The Thursday Murder Club, Richard Osman
2) Where the Forest Meets the Stars, Glendy Vanderah
3) The Guest List, Lucy Foley
4) The Silent Patient, Alex Michaelides
5) The Midnight Library, Matt Haig
```

## Error Recovery

### Rate Limiting
- **Detection**: 10 requests/minute threshold
- **Response**: "Rate limit exceeded. Please wait..."
- **Recovery**: User waits, system resets window

### MAM Connection Issues
- **Detection**: Login failure or page load timeout
- **Response**: Clear error message with context
- **Recovery**: [Retry], [Change Genre], [Change Time]

### Prowlarr Relay Failures
- **Detection**: API connection test before relay
- **Response**: "Failed to send to Prowlarr: [reason]"
- **Recovery**: [Try Again], [Pick Another], [Done]

### Empty Results
- **Detection**: No items found for genre/time combination
- **Response**: "No audiobooks found for this selection"
- **Recovery**: [Change Genre], [Change Time], [Try Different Time Window]

## State Management

### Session Persistence
- **Current selections**: Genre, time window preserved during navigation
- **Page position**: Maintained during item selection
- **Recovery context**: Previous selections available for quick retry

### Navigation Memory
- **Back button behavior**: Returns to previous step with selections intact
- **Error recovery**: Maintains context for seamless retry
- **Session timeout**: 5-minute expiration with graceful cleanup

## Validation Results

✅ **36 canonical MAM genres** loaded and available  
✅ **5-item pagination** matching title search UX exactly  
✅ **Runtime URL construction** building fresh MAM browse links  
✅ **Prowlarr relay** confirmed active and responding  
✅ **Rate limiting** enforced at 10 requests/minute per user  
✅ **Error recovery** with clear user guidance on all failure paths  
✅ **Security measures** in place for credential handling and log redaction  

## Testing

### Manual Testing Steps
1. Start bot: `npm run dev`
2. Send message to bot in Discord
3. Click `📚 Audiobooks`
4. Select "General Fiction"
5. Select "week"
6. Verify 5 items per page display
7. Click [1] to select first item
8. Click [Send to Prowlarr]
9. Verify success message

### Automated Testing
```bash
npm run test:mam-flow
```

Tests validate:
- Module loading and canonical labels
- Prowlarr connectivity
- Pagination logic (5 items per page)
- Error handling framework
- Rate limiting protection

## Dependencies

- **Puppeteer**: Headless browser for MAM navigation
- **Discord.js**: UI components and interaction handling  
- **Axios**: Prowlarr API communication
- **Environment variables**: MAM credentials in `.env`

## Notes

- **No direct downloads**: All items sent to Prowlarr for proper download management
- **Canonical labels only**: Genre and time window labels never change at runtime
- **Fresh URLs always**: MAM browse URLs constructed with current dates every time
- **UX consistency**: Matches existing title search interface exactly
- **Stateful navigation**: Users can change selections without losing context
