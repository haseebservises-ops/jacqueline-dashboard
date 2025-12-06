import Papa from 'papaparse';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRGW-efXuJJTZf2svEGhMFfCxkfF8kVTq0uN81hJg8drJwk2pxvYvegC80609d6gtlM6UFvF_iqq9n3/pub?gid=0&single=true&output=csv';

export const fetchDashboardData = async () => {
  const timestamp = new Date().getTime();
  const urlWithCacheBuster = `${CSV_URL}&t=${timestamp}`;
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
