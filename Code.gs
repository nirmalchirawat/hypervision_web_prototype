/**
 * Hypervision Application Backend - Google Apps Script
 * 
 * This script accepts POST requests from the frontend, validates the data,
 * and appends it to a Google Sheet named "Applications".
 */

function doGet(e) {
  return ContentService.createTextOutput("Hypervision Backend Web App is Live and Running!")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  // Use LockService to prevent race conditions during concurrent submissions
  var lock = LockService.getScriptLock();
  lock.waitLock(10000); // wait up to 10 seconds

  try {
    // Attempt to parse incoming data
    var data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        return createResponse({ success: false, message: "Invalid JSON payload." });
      }
    } else {
      return createResponse({ success: false, message: "No data received." });
    }

    // Backend Validation
    if (!data.consent || String(data.consent).toLowerCase() !== 'on') {
      return createResponse({ success: false, message: "Consent is required." });
    }

    var required = ['firstName', 'lastName', 'email', 'sapId', 'phone', 'school', 'year', 'preferredDomain', 'whyHypervision'];
    for (var i = 0; i < required.length; i++) {
      if (!data[required[i]] || String(data[required[i]]).trim() === '') {
        return createResponse({ success: false, message: "Missing required field: " + required[i] });
      }
    }

    // Format Validations
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return createResponse({ success: false, message: "Invalid email format." });
    }
    
    var sapId = sanitize(data.sapId);
    if (!/^\d{9}$/.test(sapId)) {
      return createResponse({ success: false, message: "Invalid SAP ID. Must be exactly 9 digits." });
    }
    
    if (!/^[6-9]\d{9}$/.test(sanitize(data.phone))) {
      return createResponse({ success: false, message: "Invalid phone number." });
    }

    // Length Validations
    if (data.whyHypervision && String(data.whyHypervision).trim().length > 500) {
      return createResponse({ success: false, message: "Why Hypervision must not exceed 500 characters." });
    }
    
    if (data.recentExperience && String(data.recentExperience).trim().length > 500) {
      return createResponse({ success: false, message: "Recent Experience must not exceed 500 characters." });
    }

    // URL Validation
    if (data.portfolioUrl && String(data.portfolioUrl).trim() !== '') {
      var urlStr = String(data.portfolioUrl).trim();
      if (!/^https?:\/\/[^\s]+$/.test(urlStr)) {
        return createResponse({ success: false, message: "Invalid portfolio URL." });
      }
    }

    // Setup Sheet
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheetByName("Applications");
    
    // Resilient Fallback: search for trimmed/case-insensitive "applications", or use first sheet tab
    if (!sheet) {
      var sheets = doc.getSheets();
      for (var s = 0; s < sheets.length; s++) {
        if (sheets[s].getName().trim().toLowerCase() === "applications") {
          sheet = sheets[s];
          break;
        }
      }
      if (!sheet && sheets.length > 0) {
        sheet = sheets[0]; // Fallback to the first worksheet tab
      }
    }

    // Duplicate SAP ID Protection
    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();
    var sapIndex = 4; // Assuming SAP ID is column E (index 4)
    
    // Start from row 1 to skip header
    for (var r = 1; r < values.length; r++) {
      if (String(values[r][sapIndex]).trim() === sapId) {
        return createResponse({ 
          success: false, 
          code: "DUPLICATE_APPLICATION", 
          message: "An application with this SAP ID has already been submitted." 
        });
      }
    }

    // Append Row
    // Columns expected: Timestamp, First Name, Last Name, College Email, SAP ID, Phone Number, School, Year, Domain, Why, Recent Experience, Portfolio URL
    var row = [
      new Date(),
      sanitize(data.firstName),
      sanitize(data.lastName),
      sanitize(data.email),
      sapId,
      sanitize(data.phone),
      sanitize(data.school),
      sanitize(data.year),
      sanitize(data.preferredDomain),
      sanitize(data.whyHypervision),
      sanitize(data.recentExperience || ""),
      sanitize(data.portfolioUrl || "")
    ];

    sheet.appendRow(row);

    return createResponse({ success: true, message: "Application submitted successfully." });

  } catch (err) {
    // Do not expose stack traces to the frontend
    return createResponse({ success: false, message: "Server error occurred while processing your application." });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Creates the JSON response.
 * Uses ContentService to ensure the Web App returns JSON properly.
 */
function createResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Sanitizes input to prevent spreadsheet formula injection
 * and handles missing values.
 */
function sanitize(value) {
  if (value === null || value === undefined) return "";
  var str = String(value).trim();
  // Prevent formula injection by prepending a single quote if string starts with formula characters
  if (str.match(/^[=\+\-@]/)) {
    str = "'" + str;
  }
  return str;
}
