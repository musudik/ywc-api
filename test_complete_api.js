const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let authToken = '';
let coachId = '';
let personalId = '';

// Test configuration
const testData = {
  login: {
    email: 'coach@ywc.com',
    password: 'coach123'
  },
  personalDetails: {
    applicant_type: 'PrimaryApplicant',
    salutation: 'Mr.',
    first_name: 'Test',
    last_name: 'User',
    street: 'Test Street',
    house_number: '123',
    postal_code: '12345',
    city: 'Berlin',
    email: 'test.user@example.com',
    phone: '+49123456789',
    whatsapp: '+49123456789',
    marital_status: 'Single',
    birth_date: '1990-01-01',
    birth_place: 'Berlin',
    nationality: 'German',
    residence_permit: 'EU Citizen',
    eu_citizen: true,
    tax_id: '12345678901',
    iban: 'DE89370400440532013000',
    housing: 'Rent'
  },
  employment: {
    employment_type: 'PrimaryEmployment',
    occupation: 'Software Engineer',
    contract_type: 'Permanent',
    contract_duration: 'Unlimited',
    employer_name: 'Tech Company GmbH',
    employed_since: '2020-01-01'
  },
  income: {
    gross_income: 5000.00,
    net_income: 3500.00,
    tax_class: '1',
    tax_id: '12345678901',
    number_of_salaries: 12,
    child_benefit: 200.00,
    other_income: 500.00,
    income_trade_business: 0.00,
    income_self_employed_work: 1000.00,
    income_side_job: 300.00
  },
  expenses: {
    cold_rent: 800.00,
    electricity: 80.00,
    living_expenses: 400.00,
    gas: 60.00,
    telecommunication: 50.00,
    account_maintenance_fee: 15.00,
    alimony: 0.00,
    subscriptions: 30.00,
    other_expenses: 200.00
  },
  assets: {
    real_estate: 250000.00,
    securities: 50000.00,
    bank_deposits: 25000.00,
    building_savings: 15000.00,
    insurance_values: 10000.00,
    other_assets: 5000.00
  },
  liabilities: {
    loan_type: 'HomeLoan',
    loan_bank: 'Deutsche Bank',
    loan_amount: 200000.00,
    loan_monthly_rate: 1200.00,
    loan_interest: 2.5
  }
};

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      },
      ...(data && { data })
    };

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
};

// Test functions
const testLogin = async () => {
  console.log('\n🔐 Testing Login...');
  const result = await makeRequest('POST', '/api/auth/login', testData.login);
  
  if (result.success && result.data.success) {
    authToken = result.data.data.token;
    coachId = result.data.data.user.id;
    console.log('✅ Login successful');
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
    console.log(`   Coach ID: ${coachId}`);
    return true;
  } else {
    console.log('❌ Login failed:', result.error);
    return false;
  }
};

const testCreatePersonalDetails = async () => {
  console.log('\n👤 Testing Create Personal Details...');
  const data = { ...testData.personalDetails, coach_id: coachId };
  const result = await makeRequest('POST', '/api/personal-details', data);
  
  if (result.success && result.data.success) {
    personalId = result.data.data.personal_id;
    console.log('✅ Personal details created');
    console.log(`   Personal ID: ${personalId}`);
    return true;
  } else {
    console.log('❌ Personal details creation failed:', result.error);
    return false;
  }
};

const testCreateEmployment = async () => {
  console.log('\n💼 Testing Create Employment...');
  const data = { ...testData.employment, personal_id: personalId };
  const result = await makeRequest('POST', '/api/employment', data);
  
  if (result.success && result.data.success) {
    console.log('✅ Employment details created');
    return true;
  } else {
    console.log('❌ Employment creation failed:', result.error);
    return false;
  }
};

const testCreateIncome = async () => {
  console.log('\n💰 Testing Create Income...');
  const data = { ...testData.income, personal_id: personalId };
  const result = await makeRequest('POST', '/api/income', data);
  
  if (result.success && result.data.success) {
    console.log('✅ Income details created');
    return true;
  } else {
    console.log('❌ Income creation failed:', result.error);
    return false;
  }
};

const testCreateExpenses = async () => {
  console.log('\n💸 Testing Create Expenses...');
  const data = { ...testData.expenses, personal_id: personalId };
  const result = await makeRequest('POST', '/api/expenses', data);
  
  if (result.success && result.data.success) {
    console.log('✅ Expenses details created');
    return true;
  } else {
    console.log('❌ Expenses creation failed:', result.error);
    return false;
  }
};

const testCreateAssets = async () => {
  console.log('\n🏠 Testing Create Assets...');
  const data = { ...testData.assets, personal_id: personalId };
  const result = await makeRequest('POST', '/api/assets', data);
  
  if (result.success && result.data.success) {
    console.log('✅ Assets created');
    return true;
  } else {
    console.log('❌ Assets creation failed:', result.error);
    return false;
  }
};

const testCreateLiabilities = async () => {
  console.log('\n💳 Testing Create Liabilities...');
  const data = { ...testData.liabilities, personal_id: personalId };
  const result = await makeRequest('POST', '/api/liabilities', data);
  
  if (result.success && result.data.success) {
    console.log('✅ Liabilities created');
    return true;
  } else {
    console.log('❌ Liabilities creation failed:', result.error);
    return false;
  }
};

const testCompletePersonProfile = async () => {
  console.log('\n📊 Testing Complete Person Profile...');
  const result = await makeRequest('GET', `/api/person/${personalId}/complete`);
  
  if (result.success && result.data.success) {
    const person = result.data.data;
    console.log('✅ Complete person profile retrieved');
    console.log(`   Employment records: ${person.employmentDetails.length}`);
    console.log(`   Income records: ${person.incomeDetails.length}`);
    console.log(`   Expense records: ${person.expensesDetails.length}`);
    console.log(`   Asset records: ${person.assets.length}`);
    console.log(`   Liability records: ${person.liabilities.length}`);
    return true;
  } else {
    console.log('❌ Failed to get complete profile:', result.error);
    return false;
  }
};

const testFinancialSummary = async () => {
  console.log('\n📈 Testing Financial Summary...');
  const result = await makeRequest('GET', `/api/person/${personalId}/financial-summary`);
  
  if (result.success && result.data.success) {
    const summary = result.data.data;
    console.log('✅ Financial summary retrieved');
    console.log(`   Total Net Income: €${summary.total_net_income}`);
    console.log(`   Total Expenses: €${summary.total_expenses}`);
    console.log(`   Total Assets: €${summary.total_assets}`);
    console.log(`   Total Liabilities: €${summary.total_loan_amount}`);
    console.log(`   Net Worth: €${summary.net_worth}`);
    console.log(`   Monthly Cash Flow: €${summary.net_monthly_cash_flow}`);
    return true;
  } else {
    console.log('❌ Failed to get financial summary:', result.error);
    return false;
  }
};

const testPersonsByCoach = async () => {
  console.log('\n👥 Testing Get Persons by Coach...');
  const result = await makeRequest('GET', `/api/person/coach/${coachId}`);
  
  if (result.success && result.data.success) {
    const persons = result.data.data;
    console.log('✅ Persons by coach retrieved');
    console.log(`   Number of persons: ${persons.length}`);
    return true;
  } else {
    console.log('❌ Failed to get persons by coach:', result.error);
    return false;
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Complete API Test Suite');
  console.log('=====================================');

  const tests = [
    testLogin,
    testCreatePersonalDetails,
    testCreateEmployment,
    testCreateIncome,
    testCreateExpenses,
    testCreateAssets,
    testCreateLiabilities,
    testCompletePersonProfile,
    testFinancialSummary,
    testPersonsByCoach
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const success = await test();
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log('\n=====================================');
  console.log('📊 Test Results Summary');
  console.log('=====================================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! The complete Person API is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the server and database.');
  }
};

// Run the tests
runTests().catch(console.error); 