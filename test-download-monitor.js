import { downloadMonitor } from './src/services/download-monitor';
import { logger } from './src/utils/logger';

async function testDownloadMonitoring() {
  console.log('🧪 Testing Download Monitoring System...\n');

  // Test 1: Track a fake download
  console.log('📥 Test 1: Tracking a fake download...');
  downloadMonitor.trackDownload(
    'fake_hash_123',
    'Test Audiobook - The Great Gatsby',
    'user123',
    'channel456'
  );
  
  // Test 2: Check tracked downloads
  console.log('📊 Test 2: Checking tracked downloads...');
  const userDownloads = downloadMonitor.getUserDownloads('user123');
  console.log(`Found ${userDownloads.length} tracked downloads for user123`);
  console.log('Downloads:', userDownloads.map(d => ({ name: d.name, notified: d.notified })));
  
  // Test 3: Check active downloads count
  console.log('📈 Test 3: Checking active downloads count...');
  const activeCount = downloadMonitor.getActiveDownloadsCount();
  console.log(`Active downloads: ${activeCount}`);
  
  // Test 4: Check download status (will return not completed since it's fake)
  console.log('🔍 Test 4: Checking download status...');
  try {
    const status = await downloadMonitor.checkDownloadStatus('fake_hash_123');
    console.log('Download status:', status);
  } catch (error) {
    console.log('Expected error checking fake download:', error.message);
  }
  
  // Test 5: Remove tracking
  console.log('🗑️ Test 5: Removing download tracking...');
  downloadMonitor.removeTracking('fake_hash_123');
  const remainingDownloads = downloadMonitor.getUserDownloads('user123');
  console.log(`Remaining downloads: ${remainingDownloads.length}`);
  
  console.log('\n✅ Download monitoring tests completed!');
}

// Run the test
testDownloadMonitoring().catch(console.error);
