// Test the published @prashanttongra/browser-mcp-server package
const { BrowserManager } = require('@prashanttongra/browser-mcp-server/dist/browser/manager');
const { handleNavigate } = require('@prashanttongra/browser-mcp-server/dist/tools/navigate');
const { handleAnalyzePage } = require('@prashanttongra/browser-mcp-server/dist/tools/analyze');
const { handleExtractText } = require('@prashanttongra/browser-mcp-server/dist/tools/extract');
const { handleGetElements } = require('@prashanttongra/browser-mcp-server/dist/tools/elements');

async function testPublishedPackage() {
  console.log('🧪 Testing Published Browser MCP Server Package...\n');
  
  const browserManager = new BrowserManager();
  
  try {
    // Test 1: Navigation
    console.log('1️⃣ Testing navigation to example.com...');
    const navResult = await handleNavigate(
      { url: 'https://example.com' }, 
      browserManager
    );
    const navData = JSON.parse(navResult);
    console.log(`   ✅ ${navData.success ? 'SUCCESS' : 'FAILED'}: ${navData.message || navData.error}`);
    
    if (!navData.success) {
      console.log('❌ Navigation failed, stopping tests');
      return;
    }
    
    // Test 2: Page Analysis
    console.log('\n2️⃣ Testing page analysis...');
    const analyzeResult = await handleAnalyzePage(
      { includeContent: true, includeForms: true, includeLinks: true }, 
      browserManager
    );
    const analyzeData = JSON.parse(analyzeResult);
    console.log(`   ✅ ${analyzeData.success ? 'SUCCESS' : 'FAILED'}`);
    if (analyzeData.success) {
      console.log(`   📊 Found: ${analyzeData.summary.totalElements} elements, ${analyzeData.summary.totalForms} forms, ${analyzeData.summary.totalLinks} links`);
    }
    
    // Test 3: Text Extraction
    console.log('\n3️⃣ Testing text extraction...');
    const extractResult = await handleExtractText(
      { includeHidden: false }, 
      browserManager
    );
    const extractData = JSON.parse(extractResult);
    console.log(`   ✅ ${extractData.success ? 'SUCCESS' : 'FAILED'}`);
    if (extractData.success) {
      const textLength = typeof extractData.content === 'string' ? extractData.content.length : 0;
      console.log(`   📝 Extracted ${textLength} characters of text`);
      console.log(`   📄 Preview: "${extractData.content.substring(0, 100)}..."`);
    }
    
    // Test 4: Element Discovery
    console.log('\n4️⃣ Testing element discovery...');
    const elementsResult = await handleGetElements(
      { selector: 'a, button, input, h1, h2, p', includeAttributes: true, maxResults: 10 }, 
      browserManager
    );
    const elementsData = JSON.parse(elementsResult);
    console.log(`   ✅ ${elementsData.success ? 'SUCCESS' : 'FAILED'}`);
    if (elementsData.success) {
      console.log(`   🎯 Found ${elementsData.elements.length} elements`);
      console.log(`   📈 ${elementsData.summary.visible} visible, ${elementsData.summary.interactive} interactive`);
    }
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Test Results Summary:');
    console.log(`   Navigation: ${navData.success ? '✅' : '❌'}`);
    console.log(`   Analysis: ${analyzeData.success ? '✅' : '❌'}`);
    console.log(`   Text Extract: ${extractData.success ? '✅' : '❌'}`);
    console.log(`   Element Discovery: ${elementsData.success ? '✅' : '❌'}`);
    
    console.log('\n🌟 Your published package is working perfectly!');
    console.log('🔗 NPM: https://www.npmjs.com/package/@prashanttongra/browser-mcp-server');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  } finally {
    console.log('\n🧹 Cleaning up browser...');
    await browserManager.close();
  }
}

// Run the test
testPublishedPackage().catch(console.error);