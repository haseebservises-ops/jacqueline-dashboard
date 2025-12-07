import Papa from 'papaparse';

const BASE_URL = 'https://docs.google.com/spreadsheets/';
const CSV_SUFFIX = '/pub?gid=0&single=true&output=csv';

export const fetchDashboardData = async (sheetId) => {
  if (!sheetId) throw new Error("No Sheet ID provided");

  // Helper to extract ID if user pasted full URL
  let cleanId = sheetId;
  if (sheetId.includes('/spreadsheets/d/')) {
    const matches = sheetId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (matches && matches[1]) {
      cleanId = matches[1];
    } else if (sheetId.includes('/e/')) {
      // Handle published to web links
      const matches = sheetId.match(/\/d\/e\/([a-zA-Z0-9-_]+)/);
      if (matches && matches[1]) cleanId = '2PACX-' + matches[1]; // 2PACX IDs are special, usually handled differently. 
      // Actually, for 2PACX, the ID is usually the whole string after /e/.
      // Let's rely on the simple check below matching the start.
    }
  }
  // simpler extraction for published links which are tricky
  if (sheetId.includes('2PACX')) {
    // If it's a full URL with 2PACX
    if (sheetId.includes('/e/')) {
      const parts = sheetId.split('/e/');
      if (parts[1]) {
        cleanId = parts[1].split('/')[0];
      }
    }
  }

  // Handle "Published to Web" IDs (start with 2PACX) vs Standard IDs
  const type = cleanId.startsWith('2PACX') ? 'd/e/' : 'd/';
  const urlWithCacheBuster = `${BASE_URL}${type}${cleanId}${CSV_SUFFIX}&t=${new Date().getTime()}`;

  return new Promise((resolve, reject) => {
    Papa.parse(urlWithCacheBuster, {
      download: true,
      header: true,
      complete: (results) => {
        const framework = [];
        const checkout = [];
        const openLeads = [];

        results.data.forEach(row => {
          // Framework: Columns A-F (Timestamp, Date, Name, Email, Phone, Offer)
          // Using standard keys as they appear first
          if (row.Name || row.Email) {
            framework.push({
              Timestamp: row.Timestamp,
              Date: row.Date,
              Name: row.Name,
              Email: row.Email,
              Phone: row.Phone,
              Offer: row.Offer,
              DateObj: row.Date ? new Date(row.Date) : null,
            });
          }

          // Framework Checkout: Columns I-O (Timestamp_1, Date_1, Name_1, Email_1, Phone_1, Offer_1, Amount)
          // Using _1 suffix keys
          if (row.Name_1 || row.Email_1) {
            checkout.push({
              Timestamp: row.Timestamp_1,
              Date: row.Date_1,
              Name: row.Name_1,
              Email: row.Email_1,
              Phone: row.Phone_1,
              Offer: row.Offer_1,
              Amount: row.Amount ? parseFloat(row.Amount.replace(/[^0-9.-]+/g, '')) : 0,
              DateObj: row.Date_1 ? new Date(row.Date_1) : null,
            });
          }

          // Framework Open Leads: Columns Q-V (Timestamp_2, Date_2, Name_2, Email_2, Phone_2, Offer_2)
          // Using _2 suffix keys
          if (row.Name_2 || row.Email_2) {
            openLeads.push({
              Timestamp: row.Timestamp_2,
              Date: row.Date_2,
              Name: row.Name_2,
              Email: row.Email_2,
              Phone: row.Phone_2,
              Offer: row.Offer_2,
              DateObj: row.Date_2 ? new Date(row.Date_2) : null,
            });
          }
        });

        resolve({ framework, checkout, openLeads });
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};
