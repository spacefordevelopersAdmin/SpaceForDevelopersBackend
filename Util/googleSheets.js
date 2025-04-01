const { google } = require('googleapis');
require('dotenv').config();

// Configure Google Sheets API
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL_GSHEETS,
        private_key: process.env.GOOGLE_CLIENT_API_KEY_GSHEETS?.replace(/\\n/g, '\n')
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});

const sheets = google.sheets({ version: 'v4', auth });

async function appendToSheet(data) {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = 'Sheet1!A:H'; // Adjust range based on number of columns

    // Convert current date to IST in a readable format
    const istDate = new Date().toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      hour12: true 
    });

    // Format the data for Google Sheets
    const values = [
      [
        data.fullName || '',
        data.email || '',
        data.phoneNumber || '',
        data.experienceLevel || '',
        data.preferredDate || '',
        data.preferredTime || '',
        data.learningGoals ? data.learningGoals.join(', ') : '', // Convert array to string
        data.sessionMode || '',
        istDate, // Store the formatted IST date
      ],
    ];

    console.log(values);
    
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    return response.data;
    
  } catch (error) {
    console.error('Error appending to Google Sheets:', error);
    throw error;
  }
}

module.exports = {
  appendToSheet,
};
