// Simple test script for the execute functionality
// Run with: node test-execute.js

const testExecute = async () => {
  console.log('🧪 Testing frontend execute integration...');
  
  const testQueries = [
    {
      name: "Basic SELECT query",
      sql: "SELECT * FROM b01001 LIMIT 3",
      max_rows: 3
    },
    {
      name: "Count query",
      sql: "SELECT COUNT(*) as total FROM b01001",
      max_rows: 1
    },
    {
      name: "Invalid INSERT query (should fail)",
      sql: "INSERT INTO b01001 VALUES ('test', 2023, 100)",
      max_rows: 1
    }
  ];
  
  for (const test of testQueries) {
    console.log(`\n🔍 Testing: ${test.name}`);
    console.log(`SQL: ${test.sql}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/govquery/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sql: test.sql,
          max_rows: test.max_rows
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          console.log(`  ✅ Query successful`);
          console.log(`  📊 Rows: ${result.row_count}`);
          console.log(`  📊 Columns: ${result.columns.join(', ')}`);
          console.log(`  ⏱️  Time: ${result.execution_time_ms.toFixed(2)}ms`);
          
          if (result.rows && result.rows.length > 0) {
            console.log(`  📄 Sample: ${JSON.stringify(result.rows[0], null, 2)}`);
          }
        } else {
          console.log(`  ❌ Query failed: ${result.error}`);
        }
      } else {
        const error = await response.text();
        console.log(`  ❌ HTTP ${response.status}: ${error}`);
      }
    } catch (error) {
      console.log(`  ❌ Request failed: ${error.message}`);
    }
  }
  
  console.log('\n🏁 Frontend execute test completed!');
};

// Run the test
testExecute().catch(console.error);
