const GoogleDocsService = require('./google-docs-service');

async function testGoogleDocsIntegration() {
  console.log('🔍 Testing Google Docs API Integration...\n');
  
  const docsService = new GoogleDocsService();
  
  // Test 1: Check credentials file
  console.log('1. Checking for credentials file...');
  const fs = require('fs');
  if (fs.existsSync(docsService.credentialsPath)) {
    console.log('✅ google-credentials.json found');
  } else {
    console.log('❌ google-credentials.json NOT found');
    console.log('   Please download credentials from Google Cloud Console');
    return;
  }
  
  // Test 2: Check authentication
  console.log('\n2. Checking authentication...');
  try {
    const authenticated = await docsService.authenticate();
    if (authenticated) {
      console.log('✅ Authentication successful');
    } else {
      console.log('❌ Authentication failed - token may be missing');
      console.log('   Use the /api/google-docs/auth-url endpoint to get auth URL');
      return;
    }
  } catch (error) {
    console.log('❌ Authentication error:', error.message);
    return;
  }
  
  // Test 3: Test document ID extraction
  console.log('\n3. Testing URL parsing...');
  const testUrl = 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit';
  const documentId = docsService.extractDocumentIdFromUrl(testUrl);
  if (documentId) {
    console.log('✅ URL parsing works');
    console.log(`   Extracted ID: ${documentId}`);
  } else {
    console.log('❌ URL parsing failed');
  }
  
  // Test 4: Try to list documents
  console.log('\n4. Testing document listing...');
  try {
    const documents = await docsService.listDocuments();
    console.log(`✅ Found ${documents.length} documents in Google Drive`);
    
    if (documents.length > 0) {
      console.log('   Sample documents:');
      documents.slice(0, 3).forEach(doc => {
        console.log(`   - ${doc.name} (${doc.id})`);
      });
    }
  } catch (error) {
    console.log('❌ Failed to list documents:', error.message);
  }
  
  // Test 5: Try to read a document (if any exist)
  console.log('\n5. Testing document reading...');
  try {
    const documents = await docsService.listDocuments();
    if (documents.length > 0) {
      const firstDoc = documents[0];
      console.log(`   Attempting to read: ${firstDoc.name}`);
      
      const document = await docsService.readDocument(firstDoc.id);
      console.log('✅ Document reading successful');
      console.log(`   Title: ${document.title}`);
      console.log(`   Content length: ${document.content.length} characters`);
      console.log(`   Preview: ${document.content.substring(0, 100)}...`);
    } else {
      console.log('   No documents found to test reading');
    }
  } catch (error) {
    console.log('❌ Failed to read document:', error.message);
  }
  
  console.log('\n🏁 Google Docs integration test complete!');
  console.log('\nSetup instructions if needed:');
  console.log('1. Go to https://console.cloud.google.com/');
  console.log('2. Create a new project or select existing');
  console.log('3. Enable Google Docs API and Google Drive API');
  console.log('4. Create OAuth 2.0 credentials (Web application)');
  console.log('5. Download credentials as google-credentials.json');
  console.log('6. Start server and visit /api/google-docs/auth-url');
  console.log('7. Complete OAuth flow with the returned authorization code');
}

// Run the test
if (require.main === module) {
  testGoogleDocsIntegration().catch(console.error);
}

module.exports = testGoogleDocsIntegration;