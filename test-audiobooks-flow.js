#!/usr/bin/env node

// Simple test to validate the audiobooks flow is properly configured

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Audiobooks Flow Configuration...\n');

// Check if MAM flow files exist
const mamFlowPath = path.join(__dirname, 'src', 'integrations', 'mango', 'mam-flow.ts');
const prowlarrRelayPath = path.join(__dirname, 'src', 'integrations', 'mango', 'prowlarr-relay.ts');
const quickActionsPath = path.join(__dirname, 'src', 'quick-actions', 'index.ts');

console.log('✅ Checking required files:');
console.log(`   MAM Flow: ${fs.existsSync(mamFlowPath) ? '✅' : '❌'} ${mamFlowPath}`);
console.log(`   Prowlarr Relay: ${fs.existsSync(prowlarrRelayPath) ? '✅' : '❌'} ${prowlarrRelayPath}`);
console.log(`   Quick Actions: ${fs.existsSync(quickActionsPath) ? '✅' : '❌'} ${quickActionsPath}`);

// Check if canonical genres are properly defined
try {
  const mamFlowContent = fs.readFileSync(mamFlowPath, 'utf8');
  const canonicalGenresMatch = mamFlowContent.match(/export const CANONICAL_GENRES.*?\[(.*?)\]/s);
  if (canonicalGenresMatch) {
    const genresText = canonicalGenresMatch[1];
    const genreCount = (genresText.match(/'/g) || []).length / 2;
    console.log(`✅ Canonical Genres: ${genreCount} MAM genres defined`);
    
    // Check for some key genres
    const hasAllAudiobooks = genresText.includes("'All AudioBooks'");
    const hasScienceFiction = genresText.includes("'Science Fiction'");
    const hasGeneralFiction = genresText.includes("'General Fiction'");
    
    console.log(`   - All AudioBooks: ${hasAllAudiobooks ? '✅' : '❌'}`);
    console.log(`   - Science Fiction: ${hasScienceFiction ? '✅' : '❌'}`);
    console.log(`   - General Fiction: ${hasGeneralFiction ? '✅' : '❌'}`);
  } else {
    console.log('❌ Could not find CANONICAL_GENRES definition');
  }
} catch (error) {
  console.log(`❌ Error reading MAM flow file: ${error.message}`);
}

// Check quick actions for proper button handlers
try {
  const quickActionsContent = fs.readFileSync(quickActionsPath, 'utf8');
  
  console.log('\n✅ Checking button handlers:');
  
  // Check for audiobooks button
  const hasAudiobooksButton = quickActionsContent.includes("'bf_flow_audiobooks'");
  console.log(`   - Audiobooks Button: ${hasAudiobooksButton ? '✅' : '❌'} bf_flow_audiobooks`);
  
  // Check for audiobooks genre select
  const hasAudiobooksGenreSelect = quickActionsContent.includes("'bf_audiobooks_genre_select'");
  console.log(`   - Genre Selection: ${hasAudiobooksGenreSelect ? '✅' : '❌'} bf_audiobooks_genre_select`);
  
  // Check for audiobooks time select
  const hasAudiobooksTimeSelect = quickActionsContent.includes("'bf_audiobooks_time_select'");
  console.log(`   - Time Selection: ${hasAudiobooksTimeSelect ? '✅' : '❌'} bf_audiobooks_time_select`);
  
  // Check for item selection buttons
  const hasAudiobooksSelect = quickActionsContent.includes("'bf_audiobooks_select_'");
  console.log(`   - Item Selection: ${hasAudiobooksSelect ? '✅' : '❌'} bf_audiobooks_select_*`);
  
  // Check for Prowlarr relay button
  const hasProwlarrButton = quickActionsContent.includes("'bf_audiobooks_send_to_prowlarr'");
  console.log(`   - Prowlarr Relay: ${hasProwlarrButton ? '✅' : '❌'} bf_audiobooks_send_to_prowlarr`);
  
  // Check that old handlers are redirected
  const hasOldGenreRedirect = quickActionsContent.includes('Redirecting to the new audiobooks interface');
  console.log(`   - Old Flow Redirect: ${hasOldGenreRedirect ? '✅' : '❌'} Redirects old handlers`);
  
} catch (error) {
  console.log(`❌ Error reading quick actions file: ${error.message}`);
}

// Check for Prowlarr relay functionality
try {
  const prowlarrContent = fs.readFileSync(prowlarrRelayPath, 'utf8');
  
  console.log('\n✅ Checking Prowlarr integration:');
  
  const hasRelayFunction = prowlarrContent.includes('relayToDownload');
  console.log(`   - Relay Function: ${hasRelayFunction ? '✅' : '❌'} relayToDownload`);
  
  const hasHealthCheck = prowlarrContent.includes('testConnection');
  console.log(`   - Health Check: ${hasHealthCheck ? '✅' : '❌'} testConnection`);
  
  const hasRedaction = prowlarrContent.includes('redactDownloadUrl');
  console.log(`   - URL Redaction: ${hasRedaction ? '✅' : '❌'} redactDownloadUrl`);
  
} catch (error) {
  console.log(`❌ Error reading Prowlarr relay file: ${error.message}`);
}

console.log('\n🎯 Audiobooks Flow Summary:');
console.log('   User Experience:');
console.log('   1. Click "📚 Audiobooks" button');
console.log('   2. Select from 36 canonical MAM genres');
console.log('   3. Select time window (week, month, etc.)');
console.log('   4. Browse results (5 per page)');
console.log('   5. Click [1]-[5] to select item');
console.log('   6. Confirm and send to Prowlarr');
console.log('   7. Success! No direct downloads.');
console.log('\n✅ Validation complete! Test the flow in Discord.');
