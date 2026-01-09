// Google Apps Script for FuelPay Webhook
// 1. Open Google Sheets
// 2. Go to Extensions > Apps Script
// 3. Paste this code and click "Deploy" > "New Deployment"
// 4. Select "Web App", set "Execute as" to "Me", and "Who has access" to "Anyone"
// 5. Copy the Web App URL and paste it into server/routes.ts

function doGet(e) {
  var type = e.parameter.type;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(type === "customer" ? "Customers" : "Transactions");
  
  if (!sheet) return ContentService.createTextOutput(JSON.stringify({data: []})).setMimeType(ContentService.MimeType.JSON);
  
  var data = sheet.getDataRange().getValues();
  var headers = data.shift();
  var result = data.map(function(row) {
    var obj = {};
    headers.forEach(function(header, i) {
      var key = header.toLowerCase().replace(/ /g, "");
      // Map sheet headers to schema keys
      if (key === "customerid") key = "customerId";
      if (key === "originalamount") key = "originalAmount";
      if (key === "discount") key = "discountAmount";
      if (key === "finalamount") key = "finalAmount";
      if (key === "authcode") key = "authCode";
      if (key === "vehiclenumber") key = "vehicleNumber";
      obj[key] = row[i];
    });
    return obj;
  });

  // Simple filtering for customerId if provided
  if (e.parameter.customerId) {
    result = result.filter(function(item) {
      return item.customerId == e.parameter.customerId;
    });
  }

  return ContentService.createTextOutput(JSON.stringify({data: result}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var type = contents.type;
    var data = contents.data;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Get or create sheets
    var customerSheet = ss.getSheetByName("Customers") || ss.insertSheet("Customers");
    var transactionSheet = ss.getSheetByName("Transactions") || ss.insertSheet("Transactions");
    var otpSheet = ss.getSheetByName("OTP-AMOUNT DATA") || ss.insertSheet("OTP-AMOUNT DATA");
    
    if (type === "customer") {
      // Set headers if new sheet
      if (customerSheet.getLastRow() === 0) {
        customerSheet.appendRow(["ID", "Phone", "Vehicle Number", "Created At"]);
      }
      customerSheet.appendRow([data.id, data.phone, data.vehicleNumber || "", data.createdAt]);
    } 
    else if (type === "transaction") {
      // Set headers if new sheet
      if (transactionSheet.getLastRow() === 0) {
        transactionSheet.appendRow(["ID", "Customer ID", "Original Amount", "Discount", "Final Amount", "Savings", "Method", "Auth Code", "Status", "Date"]);
      }
      transactionSheet.appendRow([
        data.id, 
        data.customerId, 
        data.originalAmount, 
        data.discountAmount, 
        data.finalAmount, 
        data.savings, 
        data.paymentMethod, 
        data.authCode || "PENDING", 
        data.status, 
        data.createdAt
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({result: "success"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({result: "error", message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}