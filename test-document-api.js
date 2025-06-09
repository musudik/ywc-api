const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// Test data based on user's JSON structure
const testDocumentData = {
  "clientId": "e3337879-bb7a-47b8-b14c-3897b1fe6190",
  "formConfigId": "sample_financial_form_1748618592.017441",
  "fileName": "Newmika-Eyetest-Claim-Jun2025.pdf",
  "applicant_type": "single",
  "document_id": "income_proof",
  "firebase_path": "coaches/6b2c586f-7de7-4d54-b927-c9b3e7cdec00/clients/e3337879-bb7a-47b8-b14c-3897b1fe6190/applicants/single/documents/income_proof-proof_of_income",
  "form_submission_id": "bab937ed-959d-4992-8555-a6ad58347b1b",
  "upload_status": "uploaded",
  "uploaded_at": "2025-06-09T08:07:27.173Z"
};

// Helper function to make authenticated requests
const makeRequest = async (method, url, data = null) => {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      },
      ...(data && { data })
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ ${method.toUpperCase()} ${url} failed:`, error.response?.data || error.message);
    throw error;
  }
};

// Test functions
async function loginAsCoach() {
  console.log('🔐 Logging in as coach...');
  try {
    const response = await makeRequest('POST', '/auth/login', {
      email: 'coach@ywc.com',
      password: 'coach123'
    });
    
    authToken = response.data.token;
    console.log('✅ Login successful');
    return response.data;
  } catch (error) {
    console.error('❌ Login failed');
    throw error;
  }
}

async function createFormSubmission() {
  console.log('\n📝 Creating a test form submission...');
  try {
    const formSubmissionData = {
      form_config_id: testDocumentData.formConfigId,
      form_data: {
        personal_details: {
          first_name: "Test",
          last_name: "Client",
          email: "test@example.com"
        }
      },
      status: "draft"
    };

    const response = await makeRequest('POST', '/form-submissions', formSubmissionData);
    console.log('✅ Form submission created:', response.form_submission.id);
    return response.form_submission;
  } catch (error) {
    console.error('❌ Form submission creation failed');
    // If it fails, we'll use the existing ID from test data
    console.log('📝 Using existing form submission ID from test data');
    return { id: testDocumentData.form_submission_id };
  }
}

async function createDocument(formSubmissionId) {
  console.log('\n📄 Creating document record...');
  try {
    const documentData = {
      client_id: testDocumentData.clientId,
      form_config_id: testDocumentData.formConfigId,
      file_name: testDocumentData.fileName,
      applicant_type: testDocumentData.applicant_type,
      document_id: testDocumentData.document_id,
      firebase_path: testDocumentData.firebase_path,
      upload_status: "pending", // Start as pending
      uploaded_at: new Date().toISOString()
    };

    const response = await makeRequest('POST', `/form-submissions/${formSubmissionId}/documents`, documentData);
    console.log('✅ Document record created:', response.document.id);
    return response.document;
  } catch (error) {
    console.error('❌ Document creation failed');
    throw error;
  }
}

async function updateDocumentStatus(formSubmissionId, documentId) {
  console.log('\n🔄 Updating document status to uploaded...');
  try {
    const statusUpdate = {
      upload_status: "uploaded",
      uploaded_at: testDocumentData.uploaded_at
    };

    const response = await makeRequest('PATCH', `/form-submissions/${formSubmissionId}/documents/${documentId}/status`, statusUpdate);
    console.log('✅ Document status updated:', response.document.upload_status);
    return response.document;
  } catch (error) {
    console.error('❌ Document status update failed');
    throw error;
  }
}

async function getDocumentStatus(formSubmissionId) {
  console.log('\n📊 Getting document status...');
  try {
    const response = await makeRequest('GET', `/form-submissions/${formSubmissionId}/document-status`);
    console.log('✅ Document status retrieved:');
    console.log(`   📁 Total documents: ${response.total_documents}`);
    console.log(`   ✅ Uploaded: ${response.uploaded_count}`);
    console.log(`   ⏳ Pending: ${response.pending_count}`);
    console.log(`   ❌ Failed: ${response.failed_count}`);
    
    if (response.documents.length > 0) {
      console.log('\n📋 Document details:');
      response.documents.forEach((doc, index) => {
        console.log(`   ${index + 1}. ${doc.file_name}`);
        console.log(`      📄 Document ID: ${doc.document_id}`);
        console.log(`      👤 Applicant: ${doc.applicant_type}`);
        console.log(`      📊 Status: ${doc.upload_status}`);
        console.log(`      📅 Uploaded: ${doc.uploaded_at}`);
        console.log(`      🔗 Firebase Path: ${doc.firebase_path}`);
      });
    }
    
    return response;
  } catch (error) {
    console.error('❌ Document status retrieval failed');
    throw error;
  }
}

async function getAllDocuments(formSubmissionId) {
  console.log('\n📚 Getting all documents for form submission...');
  try {
    const response = await makeRequest('GET', `/form-submissions/${formSubmissionId}/documents`);
    console.log(`✅ Retrieved ${response.total_count} documents`);
    return response.documents;
  } catch (error) {
    console.error('❌ Document retrieval failed');
    throw error;
  }
}

async function updateDocument(formSubmissionId, documentId) {
  console.log('\n✏️ Updating document details...');
  try {
    const updateData = {
      file_name: "Updated-Newmika-Eyetest-Claim-Jun2025.pdf",
      firebase_path: testDocumentData.firebase_path + "_updated"
    };

    const response = await makeRequest('PUT', `/form-submissions/${formSubmissionId}/documents/${documentId}`, updateData);
    console.log('✅ Document updated:', response.document.file_name);
    return response.document;
  } catch (error) {
    console.error('❌ Document update failed');
    throw error;
  }
}

async function testDocumentAPI() {
  console.log('🚀 Starting Document Tracking API Test');
  console.log('=====================================');

  try {
    // Step 1: Login
    await loginAsCoach();

    // Step 2: Create or use existing form submission
    const formSubmission = await createFormSubmission();
    const formSubmissionId = formSubmission.id;

    // Step 3: Create document record
    const document = await createDocument(formSubmissionId);
    const documentId = document.id;

    // Step 4: Update document status
    await updateDocumentStatus(formSubmissionId, documentId);

    // Step 5: Get document status (main API endpoint requested)
    await getDocumentStatus(formSubmissionId);

    // Step 6: Get all documents
    await getAllDocuments(formSubmissionId);

    // Step 7: Update document details
    await updateDocument(formSubmissionId, documentId);

    // Step 8: Final status check
    console.log('\n🔍 Final document status check...');
    await getDocumentStatus(formSubmissionId);

    console.log('\n🎉 Document Tracking API Test Completed Successfully!');
    console.log('=====================================');
    console.log('\n📋 Available Endpoints:');
    console.log(`✅ GET  ${API_BASE_URL}/form-submissions/{id}/document-status`);
    console.log(`✅ POST ${API_BASE_URL}/form-submissions/{id}/documents`);
    console.log(`✅ GET  ${API_BASE_URL}/form-submissions/{id}/documents`);
    console.log(`✅ GET  ${API_BASE_URL}/form-submissions/{id}/documents/{docId}`);
    console.log(`✅ PUT  ${API_BASE_URL}/form-submissions/{id}/documents/{docId}`);
    console.log(`✅ PATCH ${API_BASE_URL}/form-submissions/{id}/documents/{docId}/status`);
    console.log(`✅ DELETE ${API_BASE_URL}/form-submissions/{id}/documents/{docId}`);

  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  }
}

// Test with specific form submission ID from user's request
async function testWithSpecificId() {
  console.log('\n🎯 Testing with specific form submission ID...');
  console.log('===============================================');
  
  try {
    await loginAsCoach();
    
    // Test the exact endpoint requested by user
    const specificFormSubmissionId = "bab937ed-959d-4992-8555-a6ad58347b1b";
    console.log(`\n📊 Testing endpoint: GET /form-submissions/${specificFormSubmissionId}/document-status`);
    
    try {
      await getDocumentStatus(specificFormSubmissionId);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️  Form submission not found. Creating test document...');
        
        // Create a document for this specific form submission ID
        const documentData = {
          client_id: testDocumentData.clientId,
          form_config_id: testDocumentData.formConfigId,
          file_name: testDocumentData.fileName,
          applicant_type: testDocumentData.applicant_type,
          document_id: testDocumentData.document_id,
          firebase_path: testDocumentData.firebase_path,
          upload_status: testDocumentData.upload_status,
          uploaded_at: testDocumentData.uploaded_at
        };

        // First create the form submission if it doesn't exist
        try {
          await makeRequest('POST', '/form-submissions', {
            form_config_id: testDocumentData.formConfigId,
            form_data: { test: true },
            status: "draft"
          });
        } catch (createError) {
          console.log('📝 Form submission might already exist or creation failed');
        }

        // Then try to create the document
        try {
          await makeRequest('POST', `/form-submissions/${specificFormSubmissionId}/documents`, documentData);
          console.log('✅ Test document created');
          
          // Now try the status endpoint again
          await getDocumentStatus(specificFormSubmissionId);
        } catch (docError) {
          console.log('⚠️  Could not create test document for this form submission ID');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Specific ID test failed:', error.message);
  }
}

// Run the tests
async function runAllTests() {
  await testDocumentAPI();
  await testWithSpecificId();
}

// Execute if run directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testDocumentAPI,
  testWithSpecificId,
  runAllTests
}; 