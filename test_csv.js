import Papa from 'papaparse';

const csvData = `Timestamp,Date,Name,Email,Phone,Offer,,,Timestamp,Date,Name,Email,Phone,Offer,Amount,Column 8,Column 9,Timestamp,Date,Name,Email,Phone,Offer
12/30/1899 0:00:00,12/30/1899,Sarah Collins,sarah.collins@example.com,+1-415-555-1023,Framework,,,12/30/1899 0:00:00,,Sarah Collins,sarah.collins@example.com,+1-415-555-1023,Framework,300,,,,,haseeb,haseeb@g.com,,`;

Papa.parse(csvData, {
    header: true,
    complete: (results) => {
        console.log("Headers:", results.meta.fields);
        console.log("First Row:", results.data[0]);
    }
});
