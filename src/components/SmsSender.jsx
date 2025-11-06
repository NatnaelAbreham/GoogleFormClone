import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

const SmsSender = () => {
  const [smsType, setSmsType] = useState('single');
  const [singleData, setSingleData] = useState({
    phoneNumber: '',
    message: ''
  });
  const [bulkData, setBulkData] = useState({
    fileData: null,
    columnMapping: { name: '', phone: '' },
    availableColumns: [],
    message: '',
    preview: []
  });
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState('');
  const [sendDetails, setSendDetails] = useState(null); // Store detailed response
  const fileInputRef = useRef(null);

  // Handle single SMS input changes
  const handleSingleChange = (e) => {
    const { name, value } = e.target;
    setSingleData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file upload - FIXED: Don't auto-select columns
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length > 0) {
        const columns = jsonData[0].map(c => String(c).trim());

        const previewData = jsonData.slice(1, 6).map(row => {
          const obj = {};
          columns.forEach((col, index) => {
            obj[col] = row[index] || '';
          });
          return obj;
        });

        // FIX: Don't auto-select columns - let user choose
        setBulkData(prev => ({
          ...prev,
          fileData: jsonData,
          availableColumns: columns,
          preview: previewData,
          columnMapping: {
            name: '',  // ← Empty initially
            phone: ''  // ← Empty initially
          }
        }));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle column mapping changes
  const handleColumnMappingChange = (field, value) => {
    setBulkData(prev => ({
      ...prev,
      columnMapping: {
        ...prev.columnMapping,
        [field]: value
      }
    }));
  };

  // Handle bulk message change with template preview
  const handleBulkMessageChange = (e) => {
    const message = e.target.value;
    setBulkData(prev => ({
      ...prev,
      message
    }));
  };

  // Generate preview message with template variables
  const getPreviewMessage = () => {
    if (!bulkData.message || bulkData.preview.length === 0) return '';
    
    const sampleRow = bulkData.preview[0];
    let preview = bulkData.message;
    
    if (bulkData.columnMapping.name && sampleRow[bulkData.columnMapping.name]) {
      preview = preview.replace(/{name}/gi, sampleRow[bulkData.columnMapping.name]);
    }
    
    return preview;
  };

  // Send SMS based on type
  const sendSingleSms = async () => {
    const payload = {
      timestamp: new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 17),
      phoneNumber: singleData.phoneNumber,
      userName: "Vacancy",
      password: "54fdsddDsddDDer4SOWEQSNCsddDK3K53gdsddDf4DDrts1212",
      message: singleData.message,
      language: "Geez"
    };

    const response = await fetch("http://localhost:4000/onesms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || responseData.Message || "Failed to send SMS");
    }

    return responseData;
  };
const sendBulkSms = async () => {
  try {
    // Validate column mapping
    if (!bulkData.columnMapping.name || !bulkData.columnMapping.phone) {
      throw new Error("Please select both Name and Phone columns");
    }

    const nameIndex = bulkData.availableColumns.findIndex(
      col => col.trim().toLowerCase() === bulkData.columnMapping.name.trim().toLowerCase()
    );

    const phoneIndex = bulkData.availableColumns.findIndex(
      col => col.trim().toLowerCase() === bulkData.columnMapping.phone.trim().toLowerCase()
    );

    if (nameIndex === -1 || phoneIndex === -1) {
      throw new Error("Invalid column mapping. Please check your selections.");
    }

    const formData = new FormData();
    formData.append("File", fileInputRef.current.files[0]);
    formData.append("NameIndex", nameIndex);
    formData.append("PhoneIndex", phoneIndex);
    formData.append("Message", bulkData.message);

    const response = await fetch("http://localhost:4000/bulksms", {
      method: "POST",
      body: formData
    });

    // Parse response first
    const responseData = await response.json();
    
    // Log for debugging
    console.log("Backend response:", responseData);
    console.log("SuccessCount:", responseData.SuccessCount);
    console.log("FailCount:", responseData.FailCount);
    console.log("Message:", responseData.Message);
    
    if (!response.ok) {
      // Throw error with backend message
      throw new Error(responseData.message || responseData.Message || `HTTP ${response.status}: Failed to send bulk SMS`);
    }

    // Return the full response data
    return responseData;
  } catch (error) {
    console.error("Error in sendBulkSms:", error);
    // Re-throw the error to be handled by handleSendSMS
    throw error;
  }
};

const handleSendSMS = async () => {
  try {
    setIsSending(true);
    setSendStatus("");
    setSendDetails(null); // Clear previous details

    if (smsType === "single") {
      // Validate single SMS
      if (!singleData.phoneNumber.trim()) {
        throw new Error("Please enter a phone number");
      }
      if (!singleData.message.trim()) {
        throw new Error("Please enter a message");
      }

      const result = await sendSingleSms();
      
      // Use direct backend message
      const backendMessage = result.message || result.Message || "SMS sent successfully";
      setSendStatus(backendMessage);
      setSendDetails(result); // Store full response
      
      // Clear form on success
      if (!result.error) {
        setSingleData({ phoneNumber: "", message: "" });
      }
    } else {
      // Validate bulk SMS
      if (!bulkData.fileData) {
        throw new Error("Please upload a file first");
      }
      if (!bulkData.message.trim()) {
        throw new Error("Please enter a message");
      }

      const result = await sendBulkSms();
      
      console.log("Result from sendBulkSms:", result);
      
      // Extract values from backend response - check both camelCase and PascalCase
      const successCount = result.SuccessCount !== undefined ? result.SuccessCount : 
                          result.successCount !== undefined ? result.successCount : 0;
      
      const failCount = result.FailCount !== undefined ? result.FailCount : 
                       result.failCount !== undefined ? result.failCount : 0;
      
      const backendMessage = result.Message || result.message || "Bulk SMS processed";
      
      // Create status message - ensure it's a success message
      const statusMessage = `${backendMessage} | Success: ${successCount}, Failed: ${failCount}`;
      
      setSendStatus(statusMessage);
      setSendDetails(result); // Store full response
      
      // Clear form on success - only if no error
      // Check if response was successful (2xx status)
      if (result.StatusCode && result.StatusCode >= 200 && result.StatusCode < 300) {
        setBulkData(prev => ({
          ...prev,
          fileData: null,
          message: "",
          preview: []
        }));
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  } catch (error) {
    // Show exact error message from backend
    console.error("Error in handleSendSMS:", error);
    setSendStatus(`Error: ${error.message}`);
    setSendDetails({ 
      error: error.message,
      isError: true,
      timestamp: new Date().toISOString()
    });
  } finally {
    setIsSending(false);
  }
};

  // Clear form
  const handleClear = () => {
    if (smsType === 'single') {
      setSingleData({ phoneNumber: '', message: '' });
    } else {
      setBulkData({
        fileData: null,
        columnMapping: { name: '', phone: '' },
        availableColumns: [],
        message: '',
        preview: []
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
    setSendStatus('');
    setSendDetails(null);
  };

  return (
    <div className="min-h-screen p-4 md:p-6" style={{backgroundColor: 'rgb(231, 227, 235)'}}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-2 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            SMS Sender Platform
          </h1>
          <p className="text-gray-600">
            Send single messages or bulk SMS campaigns
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* SMS Type Selector */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Select SMS Type
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className={`sms-option ${smsType === 'single' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="smsType"
                    value="single"
                    checked={smsType === 'single'}
                    onChange={(e) => setSmsType(e.target.value)}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-3 p-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${smsType === 'single' ? 'border-blue-500' : 'border-gray-300'}`}>
                      {smsType === 'single' && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-800">Single SMS</div>
                      <div className="text-sm text-gray-500">Send to one recipient</div>
                    </div>
                  </div>
                </label>
              </div>
              
              <div className="flex-1">
                <label className={`sms-option ${smsType === 'bulk' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="smsType"
                    value="bulk"
                    checked={smsType === 'bulk'}
                    onChange={(e) => setSmsType(e.target.value)}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-3 p-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${smsType === 'bulk' ? 'border-blue-500' : 'border-gray-300'}`}>
                      {smsType === 'bulk' && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-800">Bulk SMS</div>
                      <div className="text-sm text-gray-500">Send to multiple recipients</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {smsType === 'single' ? (
              // Single SMS Form
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={singleData.phoneNumber}
                    onChange={handleSingleChange}
                    placeholder="Enter recipient's phone number"
                    className="single-input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={singleData.message}
                    onChange={handleSingleChange}
                    rows="6"
                    placeholder="Type your message here..."
                    className="single-input"
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    Characters: {singleData.message.length} | SMS Count: {Math.ceil(singleData.message.length / 160)}
                  </div>
                </div>
              </div>
            ) : (
              // Bulk SMS Form
              <div className="space-y-6">
                {/* File Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Excel File
                  </label>
                  <div className="file-upload-container">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="file-upload-label">
                      <svg className="w-8 h-8 text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="font-medium">
                        {bulkData.fileData ? 'File Uploaded' : 'Click to upload Excel file'}
                      </span>
                      <span className="text-sm text-gray-500 mt-1">
                        .xlsx, .xls, or .csv files with Name and Phone columns
                      </span>
                    </label>
                  </div>
                  
                  {bulkData.fileData && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center text-green-700">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        File uploaded successfully! {bulkData.preview.length} rows loaded
                      </div>
                    </div>
                  )}
                </div>

                {/* Column Mapping Section */}
                {bulkData.availableColumns.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Map Excel Columns (Select which columns contain Name and Phone)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Name Column
                        </label>
                        <select
                          value={bulkData.columnMapping.name}
                          onChange={(e) => handleColumnMappingChange('name', e.target.value)}
                          className="mapping-select"
                        >
                          <option value="">-- Select Name Column --</option>
                          {bulkData.availableColumns.map((col, idx) => (
                            <option key={idx} value={col}>{col}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Phone Column
                        </label>
                        <select
                          value={bulkData.columnMapping.phone}
                          onChange={(e) => handleColumnMappingChange('phone', e.target.value)}
                          className="mapping-select"
                        >
                          <option value="">-- Select Phone Column --</option>
                          {bulkData.availableColumns.map((col, idx) => (
                            <option key={idx} value={col}>{col}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {/* Validation warning */}
                    {bulkData.availableColumns.length > 0 && 
                     (!bulkData.columnMapping.name || !bulkData.columnMapping.phone) && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-700">
                          ⚠️ Please select both Name and Phone columns to send SMS
                        </p>
                      </div>
                    )}
                    
                    {/* Data Preview */}
                    {bulkData.preview.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-xs font-medium text-gray-600 mb-2">Data Preview (first 5 rows):</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr>
                                {bulkData.availableColumns.map((col, idx) => (
                                  <th key={idx} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {col}
                                    {col === bulkData.columnMapping.name && (
                                      <span className="ml-1 text-blue-500">(Name)</span>
                                    )}
                                    {col === bulkData.columnMapping.phone && (
                                      <span className="ml-1 text-green-500">(Phone)</span>
                                    )}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {bulkData.preview.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-gray-50">
                                  {bulkData.availableColumns.map((col, colIndex) => (
                                    <td key={colIndex} className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                      {row[col] || '-'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Message Section with Template */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Template
                  </label>
                  <div className="mb-3">
                    <div className="text-xs text-gray-600 mb-2">
                      Use <code className="bg-gray-100 px-1 py-0.5 rounded">{'{name}'}</code> to insert names from your file
                    </div>
                    <textarea
                      value={bulkData.message}
                      onChange={handleBulkMessageChange}
                      rows="6"
                      placeholder="Hello {name}, welcome to our service!"
                      className="bulk-input"
                    />
                    <div className="mt-2 text-sm text-gray-500">
                      Characters: {bulkData.message.length} | SMS Count: {Math.ceil(bulkData.message.length / 160)}
                    </div>
                  </div>
                  
                  {/* Preview Section */}
                  {bulkData.columnMapping.name && bulkData.preview.length > 0 && bulkData.message.includes('{name}') && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">Message Preview:</h4>
                      <div className="text-sm text-blue-700">
                        <div className="font-medium mb-1">Sample with first contact:</div>
                        <div className="bg-white p-3 rounded border border-blue-100">
                          {getPreviewMessage()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleClear}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex-1"
              >
                Clear
              </button>
              <button
                onClick={handleSendSMS}
                disabled={isSending || (smsType === 'bulk' && (!bulkData.columnMapping.name || !bulkData.columnMapping.phone))}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 flex items-center justify-center"
              >
                {isSending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  `Send ${smsType === 'single' ? 'SMS' : `Bulk SMS (${bulkData.preview.length} contacts)`}`
                )}
              </button>
            </div>
            
            {/* Status Messages - Show backend messages directly */}
           {sendStatus && (
  <div className={`mt-4 p-4 rounded-lg ${
    // Check if it's an error based on message content or status code
    sendStatus.toLowerCase().includes('error') || 
    sendStatus.toLowerCase().includes('fail:') ||
    (sendDetails && (sendDetails.isError || sendDetails.StatusCode >= 400))
      ? 'bg-red-50 text-red-700 border border-red-200' 
      : 'bg-green-50 text-green-700 border border-green-200'
  }`}>
    <div className="font-medium">{sendStatus}</div>
    
    {/* Show additional details if available */}
    {sendDetails && (
      <div className="mt-2 text-sm opacity-90">
        {sendDetails.error && <div>❌ Error: {sendDetails.error}</div>}
        {sendDetails.SuccessCount !== undefined && <div>✅ Success: {sendDetails.SuccessCount}</div>}
        {sendDetails.FailCount !== undefined && <div>⚠️ Failed: {sendDetails.FailCount}</div>}
        {sendDetails.StatusCode && <div className="text-xs mt-1 opacity-75">Status Code: {sendDetails.StatusCode}</div>}
        {sendDetails.timestamp && <div className="text-xs mt-1 opacity-75">Time: {new Date(sendDetails.timestamp).toLocaleString()}</div>}
      </div>
    )}
  </div>
)}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h3 className="font-medium text-gray-800 mb-3">How to use:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span><strong>Single SMS:</strong> Enter phone number and message directly</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span><strong>Bulk SMS:</strong> Upload Excel/CSV file, then select which columns contain Name and Phone numbers</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Use <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{'{name}'}</code> in your message to personalize each SMS</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Messages will show exactly what the backend API returns, including success/error counts</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};



export default SmsSender;