// Google Apps Script for FuelPay Webhook
// 1. Open Google Sheets
// 2. Go to Extensions > Apps Script
// 3. Paste this code and click "Deploy" > "New Deployment"
// 4. Select "Web App", set "Execute as" to "Me", and "Who has access" to "Anyone"
// 5. Copy the Web App URL and paste it into server/routes.ts

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var type = contents.type;
    var data = contents.data;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Get or create sheets
    var customerSheet = ss.getSheetByName("Customers") || ss.insertSheet("Customers");
    var transactionSheet = ss.getSheetByName("Transactions") || ss.insertSheet("Transactions");
    
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
        data.authCode, 
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