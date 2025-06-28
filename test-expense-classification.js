// Test the expense classification system with the clown nose example
const sqlite3 = require('sqlite3').verbose();

// Connect to the database
const db = new sqlite3.Database('personal_ai.db');

// Example: Testing the clown nose expense classification
async function testClownNoseClassification() {
  console.log('Testing Expense Classification System');
  console.log('====================================\n');

  // Test the clown nose expense from France
  const clownNoseExpense = {
    vendor_name: 'French Art Supply Co',
    description: 'Red clown nose for performance art project',
    amount: 50.00,
    expense_date: '2024-01-15',
    payment_method: 'credit_card'
  };

  console.log('Clown Nose Expense:');
  console.log(JSON.stringify(clownNoseExpense, null, 2));
  
  // Apply classification logic (same as in server.js)
  const classification = classifyExpense(clownNoseExpense);
  
  console.log('\nAutomatic Classification Result:');
  console.log(JSON.stringify(classification, null, 2));
  
  console.log('\nInterpretation:');
  console.log(`- Classification: ${classification.classification}`);
  console.log(`- Confidence: ${(classification.confidence * 100).toFixed(0)}%`);
  console.log(`- Reason: ${classification.reason}`);
  console.log(`- Suggested Category: ${classification.category}`);
  
  if (classification.classification === 'pending') {
    console.log('\n🤔 Manual Review Required:');
    console.log('   This expense could be either:');
    console.log('   1. Art Project: Personal creative expense');
    console.log('   2. Campaign Prop: If used for campaign events');
    console.log('   3. Mixed Use: If used for both purposes');
  }

  // Test other example expenses
  console.log('\n\nTesting Other Expense Types:');
  console.log('=============================\n');

  const testExpenses = [
    {
      vendor_name: 'Campaign Print Shop',
      description: 'Campaign flyers and posters',
      amount: 250.00,
      expense_date: '2024-01-20'
    },
    {
      vendor_name: 'Grocery Store',
      description: 'Personal groceries',
      amount: 85.50,
      expense_date: '2024-01-22'
    },
    {
      vendor_name: 'Facebook Ads',
      description: 'Political advertisement boost',
      amount: 100.00,
      expense_date: '2024-01-25'
    }
  ];

  testExpenses.forEach((expense, index) => {
    const result = classifyExpense(expense);
    console.log(`${index + 1}. ${expense.vendor_name} - $${expense.amount}`);
    console.log(`   Classification: ${result.classification} (${(result.confidence * 100).toFixed(0)}% confidence)`);
    console.log(`   Reason: ${result.reason}\n`);
  });
}

// Classification function (copied from server.js for testing)
function classifyExpense(expense) {
  const description = expense.description.toLowerCase();
  const vendor = expense.vendor_name.toLowerCase();
  const amount = parseFloat(expense.amount);

  // Campaign-related keywords
  const campaignKeywords = ['campaign', 'political', 'voter', 'election', 'donation', 'fundraising'];
  const personalKeywords = ['grocery', 'restaurant', 'personal', 'family', 'vacation'];
  const artKeywords = ['art', 'creative', 'costume', 'prop', 'clown', 'performance'];

  // Check for campaign classification
  if (campaignKeywords.some(keyword => description.includes(keyword) || vendor.includes(keyword))) {
    return {
      classification: 'campaign',
      confidence: 0.90,
      reason: 'Contains campaign-related keywords',
      category: 'campaign_operations',
      subcategory: 'general'
    };
  }

  // Check for personal classification
  if (personalKeywords.some(keyword => description.includes(keyword) || vendor.includes(keyword))) {
    return {
      classification: 'personal',
      confidence: 0.85,
      reason: 'Contains personal-related keywords',
      category: 'personal',
      subcategory: 'personal_expense'
    };
  }

  // Special case for art project items (like the clown nose example)
  if (artKeywords.some(keyword => description.includes(keyword) || vendor.includes(keyword))) {
    return {
      classification: 'pending',
      confidence: 0.60,
      reason: 'Could be art project or campaign prop - requires manual review',
      category: 'art_project',
      subcategory: 'creative_materials'
    };
  }

  // Default classification
  return {
    classification: 'pending',
    confidence: 0.50,
    reason: 'Automatic classification uncertain - manual review recommended',
    category: 'other',
    subcategory: null
  };
}

// Test CSV parsing functionality
function testCSVParsing() {
  console.log('\n\nTesting Bank Statement CSV Parsing:');
  console.log('===================================\n');
  
  // Example CSV data from your bank statement format
  const csvData = `Date,Description,Amount,Balance,Reference
2024-01-15,"French Art Supply Co - Red clown nose",-50.00,2450.00,TXN123456
2024-01-20,"Campaign Print Shop - Flyers",-250.00,2200.00,TXN123457
2024-01-22,"Grocery Store - Personal",-85.50,2114.50,TXN123458
2024-01-25,"Square - Donation via QR code",25.00,2139.50,TXN123459`;

  const transactions = parseCSVTransactions(csvData);
  
  console.log('Parsed Transactions:');
  transactions.forEach((transaction, index) => {
    console.log(`${index + 1}. ${transaction.date}: ${transaction.description} - $${transaction.amount}`);
  });
  
  console.log(`\nTotal transactions parsed: ${transactions.length}`);
}

// CSV parsing function (copied from server.js for testing)
function parseCSVTransactions(csvData) {
  const lines = csvData.trim().split('\n');
  const transactions = [];

  // Skip header row and parse each transaction
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV line accounting for quoted fields
    const fields = parseCSVLine(line);
    
    if (fields.length >= 4) {
      const transaction = {
        date: fields[0],
        description: fields[1],
        amount: parseFloat(fields[2]),
        balance: fields[3] ? parseFloat(fields[3]) : null,
        reference: fields[4] || null
      };

      if (!isNaN(transaction.amount)) {
        transactions.push(transaction);
      }
    }
  }

  return transactions;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Run the tests
if (require.main === module) {
  console.log('Campaign Expense Tracking System Test');
  console.log('====================================\n');
  
  testClownNoseClassification();
  testCSVParsing();
  
  console.log('\n\nNext Steps:');
  console.log('1. Start the server: npm start');
  console.log('2. Upload a bank statement CSV via the API');
  console.log('3. Add expenses and see automatic classification');
  console.log('4. Use FEC compliance checking endpoints');
  console.log('5. Generate reports for campaign finance filing');
}