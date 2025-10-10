// Simple test script to verify DataCommons NL integration
// Run with: node test-datacommons-nl.js

const testDataCommonsNL = async () => {
  try {
    console.log('Testing DataCommons NL API proxy...');
    
    // Test point query (toolformer_rig)
    const pointQuery = 'population+of+California';
    const pointResponse = await fetch(`http://localhost:3000/api/datacommons/nl?q=${pointQuery}&mode=toolformer_rig&allCharts=1&idx=base_uae_mem`);
    
    console.log('Point query response status:', pointResponse.status);
    const pointData = await pointResponse.json();
    console.log('Point query data:', JSON.stringify(pointData, null, 2));

    // Test table query (toolformer_rag)
    const tableQuery = 'unemployment+rate+by+state';
    const tableResponse = await fetch(`http://localhost:3000/api/datacommons/nl?q=${tableQuery}&mode=toolformer_rag&client=table&idx=base_uae_mem`);
    
    console.log('Table query response status:', tableResponse.status);
    const tableData = await tableResponse.json();
    console.log('Table query data:', JSON.stringify(tableData, null, 2));

    if (pointData.success || tableData.success) {
      console.log('✅ DataCommons NL integration working!');
    } else if (pointData.fallback || tableData.fallback) {
      console.log('⚠️  DataCommons NL API not available, fallback working');
    } else {
      console.log('❌ DataCommons NL integration failed');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Test the service directly
const testDataCommonsService = async () => {
  try {
    console.log('\nTesting DataCommons service...');
    
    // This would need to be run in a browser environment or with proper module imports
    console.log('Service test requires browser environment or proper module setup');
  } catch (error) {
    console.error('Service test error:', error.message);
  }
};

console.log('DataCommons NL Integration Test');
console.log('===============================');
console.log('Make sure the development server is running on localhost:3000');
console.log('');

testDataCommonsNL();
