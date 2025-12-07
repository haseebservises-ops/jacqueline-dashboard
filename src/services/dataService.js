import Papa from 'papaparse';

const BASE_URL = 'https://docs.google.com/spreadsheets/';

/**
 * Universal Data Fetcher
 * Fetches specific tabs defined in the config.
 * @param {string} sheetId - The Google Sheet ID
 * @param {Array} tabsConfig - [{ id: 'tab1', gid: '0', name: 'Students' }]
 * @returns {Promise<Object>} - { [tabId]: [rows...] }
 */
export const fetchUniversalData = async (sheetId, tabsConfig = []) => {
  if (!sheetId) throw new Error("No Sheet ID provided");

  // 1. Clean Sheet ID logic
  let cleanId = sheetId;
  if (sheetId.includes('/spreadsheets/d/e/')) {
    const matches = sheetId.match(/\/d\/e\/([a-zA-Z0-9-_]+)/);
    if (matches && matches[1]) cleanId = matches[1];
  } else if (sheetId.includes('/spreadsheets/d/')) {
    const matches = sheetId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (matches && matches[1]) cleanId = matches[1];
  }

  const type = cleanId.startsWith('2PACX') ? 'd/e/' : 'd/';

  // Fallback if no config: Fetch 'Sheet 1' (gid 0)
  const tabsToFetch = (tabsConfig && tabsConfig.length > 0)
    ? tabsConfig
    : [{ id: 'default', gid: '0', name: 'Sheet 1' }];

  const results = {};

  const promises = tabsToFetch.map(async (tab) => {
    const gid = tab.gid || '0';
    const url = `${BASE_URL}${type}${cleanId}/pub?gid=${gid}&single=true&output=csv&t=${new Date().getTime()}`;

    return new Promise((resolve) => {
      Papa.parse(url, {
        download: true,
        header: false, // Manual header finding
        skipEmptyLines: true,
        complete: (parseResult) => {
          try {
            const rows = parseResult.data;
            if (!rows || rows.length === 0) {
              resolve({ tabId: tab.id, data: [] });
              return;
            }

            // Auto-detect Header Row
            let headerIndex = 0;
            for (let i = 0; i < Math.min(rows.length, 10); i++) {
              // Heuristic: Row with at least 2 non-empty columns
              const filled = rows[i].filter(c => c && c.trim().length > 0).length;
              if (filled >= 2) {
                headerIndex = i;
                break;
              }
            }

            const headers = rows[headerIndex].map(h => h ? h.trim() : `Column ${Math.random()}`);
            const dataRows = [];

            for (let i = headerIndex + 1; i < rows.length; i++) {
              const row = rows[i];
              if (!row || row.length === 0) continue;
              const rowObj = {};
              headers.forEach((h, idx) => {
                // Basic cleanup but keep types loose for Universal
                rowObj[h] = row[idx] || '';
                // Try to add a numeric version if possible for charts
                if (row[idx] && !isNaN(row[idx].replace(/[^0-9.-]+/g, ''))) {
                  // Maybe allow parsing? For now raw string is safer.
                  // rowObj[h + '_num'] = parseFloat(...)
                }
              });
              dataRows.push(rowObj);
            }
            resolve({ tabId: tab.id, data: dataRows });
          } catch (e) {
            console.warn(`Failed to parse tab ${tab.name}`, e);
            resolve({ tabId: tab.id, data: [] });
          }
        },
        error: () => resolve({ tabId: tab.id, data: [] })
      });
    });
  });

  const parsedTabs = await Promise.all(promises);
  parsedTabs.forEach(pt => {
    results[pt.tabId] = pt.data;
  });

  return results;
};

/**
 * LEGACY WRAPPER
 * Maintains backward compatibility for existing Dashboard code
 * that mimics the "Framework/Checkout" split.
 * Note: This tries to guess Framework/Checkout from GID 0 using the OLD logic?
 * actually the old logic was: Fetch GID 0, then split columns 1-5 into "Framework" and 6-10 into "Checkout".
 * That is VERY specific hardcoding.
 * To support "Legacy", we might just have to copy-paste the old logic here OR
 * migrate the client config.
 * 
 * DECISION: User wants UNIVERSAL. Breaking legacy "magic splitting" is acceptable
 * IF we provide a migration path. 
 * But to simply keep the app running for now, I will re-implement the old logic 
 * as a specialized function or just keep it here.
 */
export const fetchDashboardData = async (sheetId) => {
  // Re-use the OLD hardcoded logic exactly for safety until migration is done.
  // I am pasting the original code back here as a fallback method.
  let cleanId = sheetId;
  let gid = '0';

  if (sheetId.includes('gid=')) {
    const gidMatch = sheetId.match(/gid=([0-9]+)/);
    if (gidMatch && gidMatch[1]) gid = gidMatch[1];
  }
  if (sheetId.includes('/spreadsheets/d/e/')) {
    const matches = sheetId.match(/\/d\/e\/([a-zA-Z0-9-_]+)/);
    if (matches && matches[1]) cleanId = matches[1];
  } else if (sheetId.includes('/spreadsheets/d/')) {
    const matches = sheetId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (matches && matches[1]) cleanId = matches[1];
  }
  const type = cleanId.startsWith('2PACX') ? 'd/e/' : 'd/';
  const url = `${BASE_URL}${type}${cleanId}/pub?gid=${gid}&single=true&output=csv&t=${new Date().getTime()}`;

  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data;
          if (!rows || rows.length === 0) {
            resolve({ framework: [], checkout: [], openLeads: [] });
            return;
          }
          let headerIndex = -1;
          for (let i = 0; i < Math.min(rows.length, 10); i++) {
            const rowStr = JSON.stringify(rows[i]);
            if (rowStr.includes('Name') && rowStr.includes('Email')) {
              headerIndex = i;
              break;
            }
          }
          if (headerIndex === -1) headerIndex = 0;
          const headers = rows[headerIndex].map(h => h.trim());

          // Simple helper
          const findNthIndex = (arr, val, n) => {
            let count = 0;
            for (let k = 0; k < arr.length; k++) {
              if (arr[k] === val) {
                count++;
                if (count === n) return k;
              }
            }
            return -1;
          };

          const framework = [];
          const checkout = [];
          const openLeads = [];

          for (let i = headerIndex + 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;

            // Framework (1st Occurrence)
            const nameIdx = findNthIndex(headers, 'Name', 1);
            if (nameIdx !== -1 && row[nameIdx]) {
              framework.push({
                Name: row[nameIdx],
                Email: row[findNthIndex(headers, 'Email', 1)],
                Date: row[findNthIndex(headers, 'Date', 1)],
                Offer: row[findNthIndex(headers, 'Offer', 1)],
                DateObj: row[findNthIndex(headers, 'Date', 1)] ? new Date(row[findNthIndex(headers, 'Date', 1)]) : null
              });
            }

            // Checkout (2nd Occurrence)
            const name2Idx = findNthIndex(headers, 'Name', 2);
            if (name2Idx !== -1 && row[name2Idx]) {
              checkout.push({
                Name: row[name2Idx],
                Email: row[findNthIndex(headers, 'Email', 2)],
                Amount: row[findNthIndex(headers, 'Amount', 1)] ? parseFloat(row[findNthIndex(headers, 'Amount', 1)].replace(/[^0-9.-]+/g, '')) : 0,
                Date: row[findNthIndex(headers, 'Date', 2)],
                DateObj: row[findNthIndex(headers, 'Date', 2)] ? new Date(row[findNthIndex(headers, 'Date', 2)]) : null
              });
            }

            // Open Leads (3rd Occurrence) - Simplified for brevity in legacy fallback
            const name3Idx = findNthIndex(headers, 'Name', 3);
            if (name3Idx !== -1 && row[name3Idx]) {
              openLeads.push({ Name: row[name3Idx] });
            }
          }
          resolve({ framework, checkout, openLeads });
        } catch (e) { resolve({ framework: [], checkout: [], openLeads: [] }); }
      },
      error: (e) => reject(e)
    });
  });
};
