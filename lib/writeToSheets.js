async function writeToGoogleSheets(name, email, message) {
    try {
        const auth = new JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const doc = new GoogleSpreadsheet(SPREADSHEET_ID, auth);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0]; // First sheet

        // Ensure headers are set
        await sheet.setHeaderRow(["Name", "Email", "Message"]);

        // Add new row with contact details
        await sheet.addRow({ Name: name, Email: email, Message: message });

        console.log("Contact details added to Google Sheets");
    } catch (error) {
        console.error("Error writing to Google Sheets:", error);
    }
}

// ✅ Correctly export the function
module.exports = { writeToGoogleSheets };
