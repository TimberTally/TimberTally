// --- START OF FILE script.js ---

// --- Service Worker Registration ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('TimberTally ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(err => {
                console.log('TimberTally ServiceWorker registration failed: ', err);
            });
    });
} else {
    console.log('TimberTally: Service Workers not supported by this browser.');
}
// --- End of Service Worker Registration ---


// --- Application Logic ---
document.addEventListener('DOMContentLoaded', () => {

    // --- Get DOM Elements ---
    const dbhSelect = document.getElementById('dbhSelect');
    const speciesSelect = document.getElementById('speciesSelect');
    const logsSelect = document.getElementById('logsSelect');
    const cutCheckbox = document.getElementById('cutCheckbox');
    const notesTextarea = document.getElementById('notesTextarea');
    const getLocationBtn = document.getElementById('getLocationBtn');
    const locationStatus = document.getElementById('locationStatus');
    const submitBtn = document.getElementById('submitBtn');
    const saveCsvBtn = document.getElementById('saveCsvBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const deleteAllBtn = document.getElementById('deleteAllBtn');
    const entriesTableBody = document.getElementById('entriesTableBody');
    const noEntriesRow = document.getElementById('noEntriesRow');
    const entryCountSpan = document.getElementById('entryCount');
    const feedbackMsg = document.getElementById('feedbackMsg');

   // --- Species Management Elements ---
   const speciesManagementSection = document.getElementById('speciesManagementSection');
   const toggleSpeciesMgmtBtn = document.getElementById('toggleSpeciesMgmtBtn');
   const newSpeciesInput = document.getElementById('newSpeciesInput');
   const addSpeciesBtn = document.getElementById('addSpeciesBtn');
   const removeSpeciesSelect = document.getElementById('removeSpeciesSelect');
   const removeSpeciesBtn = document.getElementById('removeSpeciesBtn');
   const speciesMgmtFeedback = document.getElementById('speciesMgmtFeedback');

    // --- Plot Counter Elements ---
    const plotDecrementBtn = document.getElementById('plotDecrementBtn');
    const plotIncrementBtn = document.getElementById('plotIncrementBtn');
    const plotNumberDisplay = document.getElementById('plotNumberDisplay');

    // --- View Switching Elements ---
    const entryView = document.getElementById('entryView');
    const tallyView = document.getElementById('tallyView');
    const viewTallyBtn = document.getElementById('viewTallyBtn');
    const backToEntryBtn = document.getElementById('backToEntryBtn');
    const tallyResultsContainer = document.getElementById('tallyResults');

    // --- Add Modal Elements ---
    const fcPromptModal = document.getElementById('fcPromptModal');
    const confirmFcBtn = document.getElementById('confirmFcBtn');
    const cancelFcBtn = document.getElementById('cancelFcBtn');
    const fcRadioButtons = document.querySelectorAll('input[name="formClass"]');

    // --- **NEW:** Compass Elements ---
    const showCompassBtn = document.getElementById('showCompassBtn');
    const compassContainer = document.getElementById('compassContainer');
    const compassNeedle = document.getElementById('compassNeedle');
    const compassHeading = document.getElementById('compassHeading');
    const compassSource = document.getElementById('compassSource');
    const closeCompassBtn = document.getElementById('closeCompassBtn');

    // --- Data Storage ---
    let collectedData = [];
    const STORAGE_KEY = 'timberTallyTempSession';
    const SPECIES_STORAGE_KEY = 'timberTallyCustomSpecies';
    let currentLocation = null;
    let feedbackTimeout = null;
    let speciesFeedbackTimeout = null;

    // --- Plot Counter State ---
    let currentPlotNumber = 1;
    const MIN_PLOT_NUMBER = 1;
    const MAX_PLOT_NUMBER = 99;

    // *** Forestry Calculation Constants ***
    const BAF = 10; // Basal Area Factor (sq ft/acre/tree)
    const BA_CONST = 0.005454; // Constant for BA calculation (sq ft)

   // --- Default Species List ---
   const DEFAULT_SPECIES = [
       "White Oak", "Red Oak", "Yellow-poplar", "Hickory", "Maple",
       "Black Walnut", "Beech", "Eastern redcedar", "Elm", "Ash",
       "Black Cherry", "Hackberry", "Gum", "MISC"
   ].sort();

   // --- Current Species List (loaded from storage + defaults) ---
   let currentSpeciesList = [...DEFAULT_SPECIES];


    // --- Doyle Volume Table (FC78 is now the base) ---
    const DOYLE_FC78_VOLUMES = {
        '10': { '0.5': 0, '1.0': 14, '1.5': 17, '2.0': 20, '2.5': 21, '3.0': 22, '3.5': 0, '4.0': 0, '4.5': 0, '5.0': 0, '5.5': 0, '6.0': 0 },
        '11': { '0.5': 0, '1.0': 22, '1.5': 27, '2.0': 32, '2.5': 35, '3.0': 38, '3.5': 0, '4.0': 0, '4.5': 0, '5.0': 0, '5.5': 0, '6.0': 0 },
        '12': { '0.5': 0, '1.0': 29, '1.5': 36, '2.0': 43, '2.5': 48, '3.0': 53, '3.5': 54, '4.0': 56, '4.5': 0, '5.0': 0, '5.5': 0, '6.0': 0 },
        '13': { '0.5': 0, '1.0': 38, '1.5': 48, '2.0': 59, '2.5': 66, '3.0': 73, '3.5': 76, '4.0': 80, '4.5': 0, '5.0': 0, '5.5': 0, '6.0': 0 },
        '14': { '0.5': 0, '1.0': 48, '1.5': 62, '2.0': 75, '2.5': 84, '3.0': 93, '3.5': 98, '4.0': 103, '4.5': 0, '5.0': 0, '5.5': 0, '6.0': 0 },
        '15': { '0.5': 0, '1.0': 60, '1.5': 78, '2.0': 96, '2.5': 108, '3.0': 121, '3.5': 128, '4.0': 136, '4.5': 0, '5.0': 0, '5.5': 0, '6.0': 0 },
        '16': { '0.5': 0, '1.0': 72, '1.5': 94, '2.0': 116, '2.5': 132, '3.0': 149, '3.5': 160, '4.0': 170, '4.5': 0, '5.0': 0, '5.5': 0, '6.0': 0 },
        '17': { '0.5': 0, '1.0': 86, '1.5': 113, '2.0': 140, '2.5': 161, '3.0': 182, '3.5': 196, '4.0': 209, '4.5': 0, '5.0': 0, '5.5': 0, '6.0': 0 },
        '18': { '0.5': 0, '1.0': 100, '1.5': 132, '2.0': 164, '2.5': 190, '3.0': 215, '3.5': 232, '4.0': 248, '4.5': 0, '5.0': 0, '5.5': 0, '6.0': 0 },
        '19': { '0.5': 0, '1.0': 118, '1.5': 156, '2.0': 195, '2.5': 225, '3.0': 256, '3.5': 276, '4.0': 297, '4.5': 0, '5.0': 0, '5.5': 0, '6.0': 0 },
        '20': { '0.5': 0, '1.0': 135, '1.5': 180, '2.0': 225, '2.5': 261, '3.0': 297, '3.5': 322, '4.0': 346, '4.5': 364, '5.0': 383, '5.5': 0, '6.0': 0 },
        '21': { '0.5': 0, '1.0': 154, '1.5': 207, '2.0': 260, '2.5': 302, '3.0': 344, '3.5': 374, '4.0': 404, '4.5': 428, '5.0': 452, '5.5': 0, '6.0': 0 },
        '22': { '0.5': 0, '1.0': 174, '1.5': 234, '2.0': 295, '2.5': 344, '3.0': 392, '3.5': 427, '4.0': 462, '4.5': 492, '5.0': 521, '5.5': 0, '6.0': 0 },
        '23': { '0.5': 0, '1.0': 195, '1.5': 264, '2.0': 332, '2.5': 388, '3.0': 444, '3.5': 483, '4.0': 522, '4.5': 558, '5.0': 594, '5.5': 0, '6.0': 0 },
        '24': { '0.5': 0, '1.0': 216, '1.5': 293, '2.0': 370, '2.5': 433, '3.0': 496, '3.5': 539, '4.0': 582, '4.5': 625, '5.0': 668, '5.5': 0, '6.0': 0 },
        '25': { '0.5': 0, '1.0': 241, '1.5': 328, '2.0': 414, '2.5': 486, '3.0': 558, '3.5': 609, '4.0': 660, '4.5': 709, '5.0': 758, '5.5': 0, '6.0': 0 },
        '26': { '0.5': 0, '1.0': 266, '1.5': 362, '2.0': 459, '2.5': 539, '3.0': 619, '3.5': 678, '4.0': 737, '4.5': 793, '5.0': 849, '5.5': 0, '6.0': 0 },
        '27': { '0.5': 0, '1.0': 292, '1.5': 398, '2.0': 505, '2.5': 594, '3.0': 684, '3.5': 749, '4.0': 814, '4.5': 877, '5.0': 940, '5.5': 0, '6.0': 0 },
        '28': { '0.5': 0, '1.0': 317, '1.5': 434, '2.0': 551, '2.5': 651, '3.0': 750, '3.5': 820, '4.0': 890, '4.5': 961, '5.0': 1032, '5.5': 1096, '6.0': 1161 },
        '29': { '0.5': 0, '1.0': 346, '1.5': 475, '2.0': 604, '2.5': 714, '3.0': 824, '3.5': 902, '4.0': 980, '4.5': 1061, '5.0': 1142, '5.5': 1218, '6.0': 1294 },
        '30': { '0.5': 0, '1.0': 376, '1.5': 517, '2.0': 658, '2.5': 778, '3.0': 898, '3.5': 984, '4.0': 1069, '4.5': 1160, '5.0': 1251, '5.5': 1339, '6.0': 1427 },
        '31': { '0.5': 0, '1.0': 408, '1.5': 562, '2.0': 717, '2.5': 850, '3.0': 983, '3.5': 1080, '4.0': 1176, '4.5': 1273, '5.0': 1370, '5.5': 1470, '6.0': 1570 },
        '32': { '0.5': 0, '1.0': 441, '1.5': 608, '2.0': 776, '2.5': 922, '3.0': 1068, '3.5': 1176, '4.0': 1283, '4.5': 1386, '5.0': 1488, '5.5': 1600, '6.0': 1712 },
        '33': { '0.5': 0, '1.0': 474, '1.5': 654, '2.0': 835, '2.5': 994, '3.0': 1152, '3.5': 1268, '4.0': 1385, '4.5': 1497, '5.0': 1609, '5.5': 1734, '6.0': 1858 },
        '34': { '0.5': 0, '1.0': 506, '1.5': 700, '2.0': 894, '2.5': 1064, '3.0': 1235, '3.5': 1361, '4.0': 1487, '4.5': 1608, '5.0': 1730, '5.5': 1866, '6.0': 2003 },
        '35': { '0.5': 0, '1.0': 544, '1.5': 754, '2.0': 964, '2.5': 1149, '3.0': 1334, '3.5': 1472, '4.0': 1610, '4.5': 1743, '5.0': 1876, '5.5': 2020, '6.0': 2163 },
        '36': { '0.5': 0, '1.0': 581, '1.5': 808, '2.0': 1035, '2.5': 1234, '3.0': 1434, '3.5': 1583, '4.0': 1732, '4.5': 1878, '5.0': 2023, '5.5': 2173, '6.0': 2323 },
        '37': { '0.5': 0, '1.0': 618, '1.5': 860, '2.0': 1102, '2.5': 1318, '3.0': 1534, '3.5': 1694, '4.0': 1854, '4.5': 2013, '5.0': 2172, '5.5': 2332, '6.0': 2492 },
        '38': { '0.5': 0, '1.0': 655, '1.5': 912, '2.0': 1170, '2.5': 1402, '3.0': 1635, '3.5': 1805, '4.0': 1975, '4.5': 2148, '5.0': 2322, '5.5': 2491, '6.0': 2660 },
        '39': { '0.5': 0, '1.0': 698, '1.5': 974, '2.0': 1250, '2.5': 1498, '3.0': 1746, '3.5': 1932, '4.0': 2118, '4.5': 2298, '5.0': 2479, '5.5': 2662, '6.0': 2844 },
        '40': { '0.5': 0, '1.0': 740, '1.5': 1035, '2.0': 1330, '2.5': 1594, '3.0': 1858, '3.5': 2059, '4.0': 2260, '4.5': 2448, '5.0': 2636, '5.5': 2832, '6.0': 3027 }
    };

    // --- Function to save current data to localStorage ---
    function saveSessionData() {
        try {
            if (collectedData.length > 0) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(collectedData));
            } else {
                localStorage.removeItem(STORAGE_KEY);
            }
        } catch (e) { console.error('[Session] Error saving data to localStorage:', e); }
    }

    // --- Function to load data from localStorage and prompt user ---
    function loadAndPromptSessionData() {
        try {
            const savedDataJSON = localStorage.getItem(STORAGE_KEY);
            if (savedDataJSON) {
                const recoveredData = JSON.parse(savedDataJSON);
                if (Array.isArray(recoveredData) && recoveredData.length > 0) {
                    const lastEntry = recoveredData[recoveredData.length - 1];
                    if (lastEntry?.plotNumber) {
                        const lastPlot = parseInt(lastEntry.plotNumber, 10);
                        if (!isNaN(lastPlot) && lastPlot >= MIN_PLOT_NUMBER && lastPlot <= MAX_PLOT_NUMBER) { currentPlotNumber = lastPlot; }
                        else { currentPlotNumber = 1; }
                    } else { currentPlotNumber = 1; }
                    const numEntries = recoveredData.length;
                    const entryWord = numEntries === 1 ? 'entry' : 'entries';
                    if (confirm(`Recover ${numEntries} ${entryWord} from the last session? (Last plot was ${currentPlotNumber})`)) {
                        collectedData = recoveredData; console.log('[Session] Data recovered from localStorage.');
                    } else { localStorage.removeItem(STORAGE_KEY); console.log('[Session] User declined recovery. Cleared localStorage.'); currentPlotNumber = 1; }
                } else { localStorage.removeItem(STORAGE_KEY); currentPlotNumber = 1; }
            } else { currentPlotNumber = 1; }
        } catch (e) { console.error('[Session] Error loading or parsing data from localStorage:', e); localStorage.removeItem(STORAGE_KEY); currentPlotNumber = 1; }
        updatePlotDisplay(); renderEntries();
    }

   // --- Species Management Functions ---
   function showSpeciesFeedback(message, isError = false, duration = 2500) { if (speciesFeedbackTimeout) clearTimeout(speciesFeedbackTimeout); speciesMgmtFeedback.textContent = message; speciesMgmtFeedback.className = isError ? 'feedback-message error' : 'feedback-message'; speciesMgmtFeedback.style.display = 'block'; void speciesMgmtFeedback.offsetWidth; speciesMgmtFeedback.style.opacity = 1; speciesFeedbackTimeout = setTimeout(() => { speciesMgmtFeedback.style.opacity = 0; setTimeout(() => { speciesMgmtFeedback.style.display = 'none'; speciesFeedbackTimeout = null; }, 500); }, duration); }
   function saveSpeciesList() { try { localStorage.setItem(SPECIES_STORAGE_KEY, JSON.stringify(currentSpeciesList)); console.log("[Species] List saved to localStorage."); } catch (e) { console.error('[Species] Error saving species list to localStorage:', e); showSpeciesFeedback("Error saving species list!", true); } }
   function populateSpeciesDropdowns() { speciesSelect.innerHTML = ''; removeSpeciesSelect.innerHTML = ''; currentSpeciesList.sort((a, b) => a.localeCompare(b)); currentSpeciesList.forEach(species => { const optionMain = document.createElement('option'); optionMain.value = species; optionMain.textContent = species; speciesSelect.appendChild(optionMain); const optionRemove = document.createElement('option'); optionRemove.value = species; optionRemove.textContent = species; removeSpeciesSelect.appendChild(optionRemove); }); if (speciesSelect.options.length > 0) speciesSelect.selectedIndex = 0; console.log("[Species] Dropdowns populated."); }
   function initializeSpeciesManagement() { try { const storedSpeciesJSON = localStorage.getItem(SPECIES_STORAGE_KEY); if (storedSpeciesJSON) { const storedSpecies = JSON.parse(storedSpeciesJSON); if (Array.isArray(storedSpecies) && storedSpecies.every(s => typeof s === 'string')) { currentSpeciesList = storedSpecies; console.log("[Species] Loaded species list from localStorage."); } else { console.warn("[Species] Invalid data found in localStorage. Using defaults."); currentSpeciesList = [...DEFAULT_SPECIES]; saveSpeciesList(); } } else { console.log("[Species] No custom list found. Using defaults."); currentSpeciesList = [...DEFAULT_SPECIES]; saveSpeciesList(); } } catch (e) { console.error('[Species] Error loading or parsing species list from localStorage:', e); currentSpeciesList = [...DEFAULT_SPECIES]; } populateSpeciesDropdowns(); speciesManagementSection.hidden = true; toggleSpeciesMgmtBtn.setAttribute('aria-expanded', 'false'); }
   // --- End Species Management Functions ---

    // --- Populate Dropdowns ---
    function populateDbhOptions() { dbhSelect.innerHTML = ''; console.log("Populating DBH options..."); for (let i = 4; i <= 40; i += 2) { const option = document.createElement('option'); option.value = String(i); option.textContent = String(i); dbhSelect.appendChild(option); } if (dbhSelect.options.length > 0) dbhSelect.selectedIndex = 0; console.log("DBH options populated. Current value:", dbhSelect.value); }
    function populateLogsOptions() { logsSelect.innerHTML = ''; console.log("Populating Logs options..."); const logValues = ["0", "0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5", "5.5", "6", "Cull"]; logValues.forEach(value => { const option = document.createElement('option'); option.value = value; option.textContent = value; logsSelect.appendChild(option); }); if (logsSelect.options.length > 0) logsSelect.selectedIndex = 0; console.log("Logs options populated. Current value:", logsSelect.value); }
    function checkAndSetLogsForDbh() { if (!dbhSelect || !logsSelect) { console.error("Cannot check Logs for DBH: Select elements not found."); return; } const selectedDbh = dbhSelect.value; const dbhValuesToResetLogs = ['4', '6', '8', '10']; if (dbhValuesToResetLogs.includes(selectedDbh) && logsSelect.value !== '0') { logsSelect.value = '0'; console.log(`DBH is ${selectedDbh}. Logs forced to 0.`); } }

    // --- Plot Counter Logic ---
    function updatePlotDisplay() { plotNumberDisplay.textContent = currentPlotNumber; plotDecrementBtn.disabled = (currentPlotNumber <= MIN_PLOT_NUMBER); plotIncrementBtn.disabled = (currentPlotNumber >= MAX_PLOT_NUMBER); }
    plotDecrementBtn.addEventListener('click', () => { if (currentPlotNumber > MIN_PLOT_NUMBER) { currentPlotNumber--; updatePlotDisplay(); } });
    plotIncrementBtn.addEventListener('click', () => { if (currentPlotNumber < MAX_PLOT_NUMBER) { currentPlotNumber++; updatePlotDisplay(); } });

    // --- Render Entries List (Table Format) ---
    function renderEntries() {
        entriesTableBody.innerHTML = ''; // Clear current table body
        entryCountSpan.textContent = collectedData.length;
        const hasData = collectedData.length > 0;
        noEntriesRow.hidden = hasData; // Show/hide the 'no entries' row

        if (hasData) {
            for (let i = collectedData.length - 1; i >= 0; i--) { // Loop through data REVERSELY
                const entry = collectedData[i];
                const tableRow = document.createElement('tr');

                // 1. Checkbox Cell
                const cellCheckbox = document.createElement('td');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox'; checkbox.value = entry.id; checkbox.setAttribute('data-id', entry.id);
                cellCheckbox.appendChild(checkbox); tableRow.appendChild(cellCheckbox);

                // 2. Data Cells
                const cellPlot = document.createElement('td'); cellPlot.textContent = entry.plotNumber; tableRow.appendChild(cellPlot);
                const cellSpecies = document.createElement('td'); cellSpecies.textContent = entry.species; tableRow.appendChild(cellSpecies);
                const cellDbh = document.createElement('td'); cellDbh.textContent = entry.dbh; tableRow.appendChild(cellDbh);
                const cellLogs = document.createElement('td'); cellLogs.textContent = entry.logs; tableRow.appendChild(cellLogs);
                const cellCut = document.createElement('td'); cellCut.textContent = entry.cutStatus || 'No'; tableRow.appendChild(cellCut);

                entriesTableBody.appendChild(tableRow);
            }
        }
        // Update button states
        saveCsvBtn.disabled = !hasData; viewTallyBtn.disabled = !hasData; deleteAllBtn.disabled = !hasData; deleteBtn.disabled = !isAnyCheckboxChecked();
    }
    function isAnyCheckboxChecked() { return entriesTableBody.querySelector('input[type="checkbox"]:checked') !== null; }

    // --- Show Visual Feedback ---
    function showFeedback(message, isError = false, duration = 2500) { if (feedbackTimeout) clearTimeout(feedbackTimeout); feedbackMsg.textContent = message; feedbackMsg.className = isError ? 'feedback-message error' : 'feedback-message'; feedbackMsg.style.display = 'block'; void feedbackMsg.offsetWidth; feedbackMsg.style.opacity = 1; feedbackTimeout = setTimeout(() => { feedbackMsg.style.opacity = 0; setTimeout(() => { feedbackMsg.style.display = 'none'; feedbackTimeout = null; }, 500); }, duration); }

    // --- Get Location Handler ---
    getLocationBtn.addEventListener('click', () => { if (!('geolocation' in navigator)) { locationStatus.textContent = 'Geolocation not supported'; locationStatus.style.color = 'red'; locationStatus.title = 'Geolocation not supported by this browser.'; return; } locationStatus.textContent = 'Fetching...'; locationStatus.title = 'Attempting to get GPS coordinates...'; locationStatus.style.color = '#555'; getLocationBtn.disabled = true; navigator.geolocation.getCurrentPosition( (position) => { currentLocation = { lat: position.coords.latitude, lon: position.coords.longitude }; const displayCoords = `(${currentLocation.lat.toFixed(4)}, ${currentLocation.lon.toFixed(4)})`; locationStatus.textContent = `Location Set ${displayCoords}`; locationStatus.title = `Location Set: Latitude ${currentLocation.lat}, Longitude ${currentLocation.lon}`; locationStatus.style.color = 'green'; getLocationBtn.disabled = false; }, (error) => { currentLocation = null; let errorMsg = 'Error: '; let errorTitle = 'Error fetching location: '; switch (error.code) { case error.PERMISSION_DENIED: errorMsg += 'Denied'; errorTitle += 'Permission denied.'; break; case error.POSITION_UNAVAILABLE: errorMsg += 'Unavailable'; errorTitle += 'Position unavailable.'; break; case error.TIMEOUT: errorMsg += 'Timeout'; errorTitle += 'Request timed out.'; break; default: errorMsg += 'Unknown'; errorTitle += 'Unknown error.'; break; } locationStatus.textContent = errorMsg; locationStatus.title = errorTitle; locationStatus.style.color = 'red'; getLocationBtn.disabled = false; console.error(errorTitle, error); }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 } ); });

    // --- Submit Button Handler ---
    submitBtn.addEventListener('click', () => { checkAndSetLogsForDbh(); const newEntry = { id: Date.now(), plotNumber: currentPlotNumber, dbh: dbhSelect.value, species: speciesSelect.value, logs: logsSelect.value, cutStatus: cutCheckbox.checked ? 'Yes' : 'No', notes: notesTextarea.value.trim(), location: currentLocation }; collectedData.push(newEntry); renderEntries(); saveSessionData(); showFeedback("Entry Added!"); cutCheckbox.checked = false; notesTextarea.value = ''; currentLocation = null; locationStatus.textContent = 'Location not set'; locationStatus.title = 'GPS Status'; locationStatus.style.color = '#555'; });

    // --- Tally Logic ---
    function generateTallyData() { const tally = {}; collectedData.forEach(entry => { const { species, dbh, logs, cutStatus } = entry; if (!species || !dbh || !logs || !cutStatus) { console.warn("Skipping entry in tally due to missing data:", entry); return; } if (!tally[species]) tally[species] = {}; if (!tally[species][dbh]) tally[species][dbh] = {}; if (!tally[species][dbh][logs]) tally[species][dbh][logs] = {}; if (!tally[species][dbh][logs][cutStatus]) tally[species][dbh][logs][cutStatus] = 0; tally[species][dbh][logs][cutStatus]++; }); return tally; }
    function displayTallyResults(tallyData) { tallyResultsContainer.innerHTML = ''; const speciesKeys = Object.keys(tallyData).sort(); if (speciesKeys.length === 0) { const p = document.createElement('p'); p.textContent = 'No data available to tally.'; p.classList.add('no-tally-data'); tallyResultsContainer.appendChild(p); return; } speciesKeys.forEach(species => { const speciesDiv = document.createElement('div'); speciesDiv.classList.add('tally-species'); const speciesHeading = document.createElement('h3'); speciesHeading.textContent = species; speciesDiv.appendChild(speciesHeading); const dbhKeys = Object.keys(tallyData[species]).sort((a, b) => Number(a) - Number(b)); dbhKeys.forEach(dbh => { const dbhHeading = document.createElement('h4'); dbhHeading.textContent = `DBH: ${dbh}`; speciesDiv.appendChild(dbhHeading); const logKeys = Object.keys(tallyData[species][dbh]).sort((a, b) => { if (a === 'Cull') return 1; if (b === 'Cull') return -1; const numA = parseFloat(a); const numB = parseFloat(b); if (isNaN(numA) && isNaN(numB)) return 0; if (isNaN(numA)) return 1; if (isNaN(numB)) return -1; return numA - numB; }); logKeys.forEach(logs => { const countsObject = tallyData[species][dbh][logs]; const countCut = countsObject['Yes'] || 0; const countNotCut = countsObject['No'] || 0; if (countCut > 0) { const logItemDivCut = document.createElement('div'); logItemDivCut.classList.add('tally-log-item'); const labelSpanCut = document.createElement('span'); labelSpanCut.classList.add('log-label'); labelSpanCut.textContent = `Logs: ${logs} (Cut) - `; const countSpanCut = document.createElement('span'); countSpanCut.classList.add('log-count'); countSpanCut.textContent = `Count: ${countCut}`; logItemDivCut.appendChild(labelSpanCut); logItemDivCut.appendChild(countSpanCut); speciesDiv.appendChild(logItemDivCut); } if (countNotCut > 0) { const logItemDivNotCut = document.createElement('div'); logItemDivNotCut.classList.add('tally-log-item'); const labelSpanNotCut = document.createElement('span'); labelSpanNotCut.classList.add('log-label'); labelSpanNotCut.textContent = `Logs: ${logs} (Not Cut) - `; const countSpanNotCut = document.createElement('span'); countSpanNotCut.classList.add('log-count'); countSpanNotCut.textContent = `Count: ${countNotCut}`; logItemDivNotCut.appendChild(labelSpanNotCut); logItemDivNotCut.appendChild(countSpanNotCut); speciesDiv.appendChild(logItemDivNotCut); } }); }); tallyResultsContainer.appendChild(speciesDiv); }); }

    // --- Forestry Report Calculation Logic ---

    // Get Doyle Volume using specific FC78 table as BASE, scaling others
    function getDoyleVolume(dbhStr, logsStr, formClass = 78) {
        try {
            const dbhInt = parseInt(dbhStr, 10);
            const dbhKey = String(dbhInt);
            if (logsStr === 'Cull') return 0;
            const logsNum = parseFloat(logsStr);
            if (isNaN(logsNum) || logsNum <= 0) return 0;
            let logsKey;
            if (logsNum % 1 === 0 || logsNum % 0.5 === 0) {
                logsKey = logsNum.toFixed(1);
            } else {
                logsKey = (Math.floor(logsNum * 2) / 2).toFixed(1);
                if (parseFloat(logsKey) <= 0) return 0;
            }
            if (isNaN(dbhInt) || dbhInt < 10) return 0;

            let fcInt = parseInt(formClass, 10);
             if (isNaN(fcInt) || fcInt <= 0) {
                fcInt = 78; // Default to 78 if invalid
             }

            let volume = 0;
            const dbhEntryFC78 = DOYLE_FC78_VOLUMES[dbhKey];

            if (dbhEntryFC78 && dbhEntryFC78.hasOwnProperty(logsKey)) {
                 const baseVolumeFC78 = dbhEntryFC78[logsKey];
                 if (fcInt === 78) {
                    volume = baseVolumeFC78;
                 } else {
                     if (78.0 > 0) {
                        const scaleFactor = fcInt / 78.0;
                        volume = Math.round(baseVolumeFC78 * scaleFactor);
                     }
                 }
            }
            return volume;
        } catch (e) {
            console.error("Error in getDoyleVolume:", e, "Input:", dbhStr, logsStr, formClass);
            return 0;
        }
    }

    function getDbhClass(dbh) { if (isNaN(dbh)) return 'Invalid'; if (dbh >= 4 && dbh <= 5) return 'Sapling'; if (dbh >= 6 && dbh <= 11) return 'Poletimber'; if (dbh >= 12 && dbh <= 17) return 'Small Sawtimber'; if (dbh >= 18 && dbh <= 23) return 'Medium Sawtimber'; if (dbh >= 24) return 'Large Sawtimber'; return 'Other'; }

    function calculateForestryReport(data, baf = 10, formClass = 78) {
        const report = { summary: {}, standDistribution: {}, speciesSummary1: {}, speciesSummary2: {} };
        if (!data || data.length === 0) { return report; }
        const plotNumbers = new Set(data.map(entry => entry.plotNumber));
        const numberOfPlots = plotNumbers.size;
        if (numberOfPlots === 0) { return report; }

        let totalTrees = 0, totalCutTrees = 0, totalBaSum = 0, totalTpaSum = 0;
        let totalVolumeSum = 0, totalCutVolumeSum = 0, totalCutBaSum = 0, totalCutTpaSum = 0;
        const speciesData = {};
        const classData = { 'Sapling': { stemCount: 0, cutStemCount: 0, baSum: 0, cutBaSum: 0, tpaSum: 0, cutTpaSum: 0, volumeSum: 0, cutVolumeSum: 0 }, 'Poletimber': { stemCount: 0, cutStemCount: 0, baSum: 0, cutBaSum: 0, tpaSum: 0, cutTpaSum: 0, volumeSum: 0, cutVolumeSum: 0 }, 'Small Sawtimber': { stemCount: 0, cutStemCount: 0, baSum: 0, cutBaSum: 0, tpaSum: 0, cutTpaSum: 0, volumeSum: 0, cutVolumeSum: 0 }, 'Medium Sawtimber': { stemCount: 0, cutStemCount: 0, baSum: 0, cutBaSum: 0, tpaSum: 0, cutTpaSum: 0, volumeSum: 0, cutVolumeSum: 0 }, 'Large Sawtimber': { stemCount: 0, cutStemCount: 0, baSum: 0, cutBaSum: 0, tpaSum: 0, cutTpaSum: 0, volumeSum: 0, cutVolumeSum: 0 }, 'Other': { stemCount: 0, cutStemCount: 0, baSum: 0, cutBaSum: 0, tpaSum: 0, cutTpaSum: 0, volumeSum: 0, cutVolumeSum: 0 }, 'Invalid': { stemCount: 0, cutStemCount: 0, baSum: 0, cutBaSum: 0, tpaSum: 0, cutTpaSum: 0, volumeSum: 0, cutVolumeSum: 0 } };

        data.forEach(entry => {
            const dbh = parseFloat(entry.dbh);
            const species = entry.species;
            const isCut = entry.cutStatus === 'Yes';
            const dbhClass = getDbhClass(dbh);

            if (isNaN(dbh) || dbh <= 0 || !species || dbhClass === 'Invalid') {
                classData['Invalid'].stemCount++; if (isCut) classData['Invalid'].cutStemCount++; return;
            }

            totalTrees++; if (isCut) totalCutTrees++;
            const baTree = BA_CONST * Math.pow(dbh, 2); if (baTree <= 0) return;
            const tpaTree = baf / baTree;
            const volTree = getDoyleVolume(entry.dbh, entry.logs, formClass);
            const vpaTree = volTree * tpaTree;

            totalBaSum += baTree; totalTpaSum += tpaTree; totalVolumeSum += vpaTree;
            if (isCut) { totalCutBaSum += baTree; totalCutTpaSum += tpaTree; totalCutVolumeSum += vpaTree; }

            if (!speciesData[species]) { speciesData[species] = { stemCount: 0, cutStemCount: 0, saplingStemCount: 0, poleStemCount: 0, sawStemCount: 0, baSum: 0, tpaSum: 0, volumeSum: 0, volSmall: 0, volMedium: 0, volLarge: 0 }; }
            speciesData[species].stemCount++; speciesData[species].baSum += baTree; speciesData[species].tpaSum += tpaTree; speciesData[species].volumeSum += vpaTree;
            if (isCut) speciesData[species].cutStemCount++;
            if (dbhClass === 'Sapling') speciesData[species].saplingStemCount++; else if (dbhClass === 'Poletimber') speciesData[species].poleStemCount++; else if (dbhClass.includes('Sawtimber')) speciesData[species].sawStemCount++;
            if (dbhClass === 'Small Sawtimber') speciesData[species].volSmall += vpaTree; else if (dbhClass === 'Medium Sawtimber') speciesData[species].volMedium += vpaTree; else if (dbhClass === 'Large Sawtimber') speciesData[species].volLarge += vpaTree;

            if(classData[dbhClass]){
                classData[dbhClass].stemCount++; classData[dbhClass].baSum += baTree; classData[dbhClass].tpaSum += tpaTree; classData[dbhClass].volumeSum += vpaTree;
                if (isCut) { classData[dbhClass].cutStemCount++; classData[dbhClass].cutBaSum += baTree; classData[dbhClass].cutTpaSum += tpaTree; classData[dbhClass].cutVolumeSum += vpaTree; }
            } else { console.warn(`DBH Class '${dbhClass}' not found for DBH ${dbh}`); }
        });

        const treesPerAcre = totalTpaSum / numberOfPlots; const treesPerAcreCut = totalCutTpaSum / numberOfPlots; const treesPerAcreNotCut = treesPerAcre - treesPerAcreCut;
        const totalBaPerAcreSimple = (totalTrees * BAF) / numberOfPlots; const totalVolPerAcre = totalVolumeSum / numberOfPlots; const cutVolPerAcre = totalCutVolumeSum / numberOfPlots; const leaveVolPerAcre = totalVolPerAcre - cutVolPerAcre;
        let qmd = 0; if (treesPerAcre > 0 && totalBaPerAcreSimple > 0) { qmd = Math.sqrt( (totalBaPerAcreSimple / treesPerAcre) / BA_CONST ); }
        report.summary = { numberOfPlots, totalVolPerAcre, cutVolPerAcre, leaveVolPerAcre, avgTractDbh: qmd, treesPerAcre, treesPerAcreCut, treesPerAcreNotCut, totalBaPerAcreSimple };

        const dbhClassesOrder = ['Sapling', 'Poletimber', 'Small Sawtimber', 'Medium Sawtimber', 'Large Sawtimber', 'Other', 'Invalid']; let totalReportedStems = 0, totalReportedBaPerAcre = 0, totalReportedVolPerAcre = 0;
        dbhClassesOrder.forEach(cls => {
            const classInfo = classData[cls]; const classTpa = classInfo.tpaSum / numberOfPlots; const classBaPerAcre = (classInfo.stemCount * BAF) / numberOfPlots; const classCutBaPerAcre = (classInfo.cutStemCount * BAF) / numberOfPlots; const classLeaveBaPerAcre = classBaPerAcre - classCutBaPerAcre; const classVolPerAcre = classInfo.volumeSum / numberOfPlots;
            totalReportedStems += classTpa; totalReportedBaPerAcre += classBaPerAcre; totalReportedVolPerAcre += classVolPerAcre;
            report.standDistribution[cls] = { percentTotalStems: treesPerAcre > 0 ? (classTpa / treesPerAcre) * 100 : 0, baSqFtCut: classCutBaPerAcre, baSqFtNotCut: classLeaveBaPerAcre, baSqFtTotal: classBaPerAcre, percentBa: totalBaPerAcreSimple > 0 ? (classBaPerAcre / totalBaPerAcreSimple) * 100 : 0, volumeBf: classVolPerAcre, percentVolume: totalVolPerAcre > 0 ? (classVolPerAcre / totalVolPerAcre) * 100 : 0, };
        });
        report.standDistribution['TOTALS'] = { percentTotalStems: treesPerAcre > 0 ? (totalReportedStems / treesPerAcre) * 100 : 0, baSqFtCut: (totalCutTrees * BAF) / numberOfPlots, baSqFtNotCut: ((totalTrees - totalCutTrees) * BAF) / numberOfPlots, baSqFtTotal: totalReportedBaPerAcre, percentBa: totalBaPerAcreSimple > 0 ? (totalReportedBaPerAcre / totalBaPerAcreSimple) * 100 : 0, volumeBf: totalReportedVolPerAcre, percentVolume: totalVolPerAcre > 0 ? (totalReportedVolPerAcre / totalVolPerAcre) * 100 : 0, };

        const sortedSpecies = Object.keys(speciesData).sort(); let speciesVolTotalSum = 0;
        sortedSpecies.forEach(species => {
            const spData = speciesData[species]; const spTpa = spData.tpaSum / numberOfPlots; const spTotalStems = spData.stemCount; const spVolPerAcre = spData.volumeSum / numberOfPlots; speciesVolTotalSum += spVolPerAcre;
            report.speciesSummary1[species] = { percentTotalStems: treesPerAcre > 0 ? (spTpa / treesPerAcre) * 100 : 0, sawtimberPercent: spTotalStems > 0 ? (spData.sawStemCount / spTotalStems) * 100 : 0, poletimberPercent: spTotalStems > 0 ? (spData.poleStemCount / spTotalStems) * 100 : 0, saplingPercent: spTotalStems > 0 ? (spData.saplingStemCount / spTotalStems) * 100 : 0, };
            report.speciesSummary2[species] = { volSmall: spData.volSmall / numberOfPlots, volMedium: spData.volMedium / numberOfPlots, volLarge: spData.volLarge / numberOfPlots, totalSpeciesVolPerAcre: spVolPerAcre, percentTotalVolume: totalVolPerAcre > 0 ? (spVolPerAcre / totalVolPerAcre) * 100 : 0, };
        });
        const totalSmallVol = sortedSpecies.reduce((sum, sp) => sum + report.speciesSummary2[sp].volSmall, 0); const totalMediumVol = sortedSpecies.reduce((sum, sp) => sum + report.speciesSummary2[sp].volMedium, 0); const totalLargeVol = sortedSpecies.reduce((sum, sp) => sum + report.speciesSummary2[sp].volLarge, 0);
        report.speciesSummary2['TOTALS'] = { volSmall: totalSmallVol, volMedium: totalMediumVol, volLarge: totalLargeVol, totalSpeciesVolPerAcre: speciesVolTotalSum, percentTotalVolume: totalVolPerAcre > 0 ? (speciesVolTotalSum / totalVolPerAcre) * 100 : 0, };

        return report;
    }

    function formatReportForCsv(report, formClass = 78) {
        if (!report || !report.summary || Object.keys(report.summary).length === 0) { return "\n--- FORESTRY REPORT DATA ---\nNo data to report.\n"; }
        let csv = `\n\n--- FORESTRY REPORT DATA (BAF=${BAF}, Doyle FC${formClass} Volume Estimation) ---\n`;
        const fmt = (num, digits = 1) => (typeof num === 'number' && !isNaN(num) ? num.toFixed(digits) : '0.0');
        const fmtInt = (num) => (typeof num === 'number' && !isNaN(num) ? num.toFixed(0) : '0');

        csv += "TOTAL VOLUME PER ACRE IN BOARD FEET," + fmtInt(report.summary.totalVolPerAcre) + ",,"; csv += "VOLUME PER ACRE CUT IN BOARD FEET," + fmtInt(report.summary.cutVolPerAcre) + ",,"; csv += "VOLUME PER ACRE LEAVE IN BOARD FEET," + fmtInt(report.summary.leaveVolPerAcre) + "\n";
        csv += "AVERAGE TRACT DBH," + fmt(report.summary.avgTractDbh, 1) + ",,"; csv += "TOTAL NUMBER OF TREES PER ACRE," + fmt(report.summary.treesPerAcre, 1) + ",,"; csv += "NUMBER OF PLOTS," + fmtInt(report.summary.numberOfPlots) + "\n";
        csv += ",,," + "TREES PER ACRE CUT," + fmt(report.summary.treesPerAcreCut, 1) + ",," + "TREES PER ACRE LEAVE," + fmt(report.summary.treesPerAcreNotCut, 1) + "\n\n";

        csv += "STAND DISTRIBUTION TABLE,PERCENT OF TOTAL STEMS,\"BASAL AREA IN SQUARE FEET\",,,\"PER CENT OF BASAL AREA\",\"VOLUME IN BOARD FEET\",\"PER CENT OF VOLUME\"\n"; csv += ",,\"Cut Trees\",\"Not Cut Trees\",\"Total Trees\",,,\n";
        const classOrder = ['Sapling', 'Poletimber', 'Small Sawtimber', 'Medium Sawtimber', 'Large Sawtimber', 'Other', 'Invalid', 'TOTALS'];
        const classLabels = { 'Sapling': 'SAPLINGS (2 - 5 Inches DBH)', 'Poletimber': 'POLETIMBER (6 - 11 Inches DBH)', 'Small Sawtimber': 'SMALL SAWTIMBER (12 - 17 Inches DBH)', 'Medium Sawtimber': 'MEDIUM SAWTIMBER (18 - 23 Inches DBH)', 'Large Sawtimber': 'LARGE SAWTIMBER (24 - 40+ Inches DBH)', 'Other': 'OTHER DBH', 'Invalid': 'INVALID DBH ENTRIES', 'TOTALS': 'TOTALS' };
        classOrder.forEach(cls => {
            const data = report.standDistribution[cls] || {}; const label = classLabels[cls] || cls; const percentVolFormatted = data.percentVolume !== undefined ? fmt(data.percentVolume) : '0.0';
            csv += `"${label}",${fmt(data.percentTotalStems)}%,${fmt(data.baSqFtCut)},${fmt(data.baSqFtNotCut)},${fmt(data.baSqFtTotal)},${fmt(data.percentBa)}%,${fmtInt(data.volumeBf)},${percentVolFormatted}%\n`;
        }); csv += "\n";

        csv += "SPECIES,\"PER CENT OF TOTAL STEMS\",\"SAWTIMBER PERCENT\",\"POLETIMBER PERCENT\",\"SAPLING PERCENT\"\n"; const species1Order = Object.keys(report.speciesSummary1).sort();
        species1Order.forEach(species => { const data = report.speciesSummary1[species] || {}; csv += `"${species}",${fmt(data.percentTotalStems)}%,${fmt(data.sawtimberPercent)}%,${fmt(data.poletimberPercent)}%,${fmt(data.saplingPercent)}%\n`; }); csv += "\n";

        csv += "\"PER ACRE VOLUME BY SPECIES IN BOARD FEET\",\"SMALL SAWTIMBER (12-17 Inches DBH)\",\"MEDIUM SAWTIMBER (18-23 Inches DBH)\",\"LARGE SAWTIMBER (24+ Inches DBH)\",\"TOTAL SPECIES VOLUME PER ACRE\",\"PER CENT OF TOTAL\"\n";
        const species2Order = [...Object.keys(report.speciesSummary2).filter(s => s !== 'TOTALS').sort(), 'TOTALS'];
        species2Order.forEach(species => { const data = report.speciesSummary2[species] || {}; const label = species === 'TOTALS' ? "TOTALS" : `"${species}"`; const percentTotalVolFormatted = data.percentTotalVolume !== undefined ? fmt(data.percentTotalVolume) : '0.0'; csv += `${label},${fmtInt(data.volSmall)},${fmtInt(data.volMedium)},${fmtInt(data.volLarge)},${fmtInt(data.totalSpeciesVolPerAcre)},${percentTotalVolFormatted}%\n`; });
        return csv;
    }

    function generateAndDownloadCsv(selectedFormClass) {
        if (collectedData.length === 0) { showFeedback("No data to save.", true); return; }

        let rawCsvContent = "PlotNumber,DBH,Species,Logs,Cut,Notes,Latitude,Longitude\n"; collectedData.forEach(entry => { const notesSanitized = `"${(entry.notes || '').replace(/"/g, '""')}"`; const lat = entry.location ? entry.location.lat : ''; const lon = entry.location ? entry.location.lon : ''; const cut = entry.cutStatus || 'No'; rawCsvContent += `${entry.plotNumber},${entry.dbh},"${entry.species}",${entry.logs},${cut},${notesSanitized},${lat},${lon}\n`; });
        const tallyData = generateTallyData(); let tallyCsvContent = "\n\n--- TALLY DATA ---\nSpecies,DBH,Logs,Cut Status,Count\n"; const speciesKeys = Object.keys(tallyData).sort();
        speciesKeys.forEach(species => { const dbhKeys = Object.keys(tallyData[species]).sort((a, b) => Number(a) - Number(b)); dbhKeys.forEach(dbh => { const logKeys = Object.keys(tallyData[species][dbh]).sort((a, b) => { if (a === 'Cull') return 1; if (b === 'Cull') return -1; const numA = parseFloat(a); const numB = parseFloat(b); if (isNaN(numA) && isNaN(numB)) return 0; if (isNaN(numA)) return 1; if (isNaN(numB)) return -1; return numA - numB; }); logKeys.forEach(logs => { const countsObject = tallyData[species][dbh][logs]; const countCut = countsObject['Yes'] || 0; const countNotCut = countsObject['No'] || 0; if (countCut > 0) tallyCsvContent += `"${species}",${dbh},${logs},"Yes",${countCut}\n`; if (countNotCut > 0) tallyCsvContent += `"${species}",${dbh},${logs},"No",${countNotCut}\n`; }); }); });

        let plotStatsCsvContent = ""; let plotVpaList = []; let plotVpaMap = {}; let meanVpa = 0, varianceVpa = 0, stdDevVpa = 0, cvVpa = 0; const plotsWithData = {};
        collectedData.forEach(entry => { if (!plotsWithData[entry.plotNumber]) { plotsWithData[entry.plotNumber] = []; } plotsWithData[entry.plotNumber].push(entry); });
        const plotNumbers = Object.keys(plotsWithData).map(Number).sort((a, b) => a - b);
        if (plotNumbers.length > 0) {
            plotStatsCsvContent = `\n\n--- PER-PLOT VOLUME & STATISTICS (Doyle FC${selectedFormClass}, BAF=${BAF}) ---\n`; plotStatsCsvContent += "Plot,Volume (BF/Acre)\n";
            plotNumbers.forEach(plotNum => {
                let totalVpaForPlot = 0; plotsWithData[plotNum].forEach(tree => { try { const dbh = parseFloat(tree.dbh); if (isNaN(dbh) || dbh <= 0) return; const baTree = BA_CONST * Math.pow(dbh, 2); if (baTree <= 0) return; const tpaTree = BAF / baTree; const volTree = getDoyleVolume(tree.dbh, tree.logs, selectedFormClass); const vpaTree = volTree * tpaTree; totalVpaForPlot += vpaTree; } catch (e) { console.error(`Error processing tree in plot ${plotNum}:`, tree, e); } });
                const roundedVpa = Math.round(totalVpaForPlot); plotVpaMap[plotNum] = roundedVpa; plotVpaList.push(roundedVpa); plotStatsCsvContent += `${plotNum},${roundedVpa}\n`;
            });
            const n = plotVpaList.length; if (n > 0) { const sumVpa = plotVpaList.reduce((acc, val) => acc + val, 0); meanVpa = sumVpa / n; if (n > 1) { const sumOfSquares = plotVpaList.reduce((acc, val) => acc + Math.pow(val - meanVpa, 2), 0); varianceVpa = sumOfSquares / (n - 1); stdDevVpa = Math.sqrt(varianceVpa); if (meanVpa !== 0) { cvVpa = (stdDevVpa / meanVpa) * 100; } } }
            plotStatsCsvContent += "\n"; plotStatsCsvContent += `Number of Plots,${n}\n`; plotStatsCsvContent += `Mean BF/Acre,${meanVpa.toFixed(1)}\n`; plotStatsCsvContent += `Variance (BF/Acre)^2,${n > 1 ? varianceVpa.toFixed(1) : 'N/A'}\n`; plotStatsCsvContent += `Standard Deviation (BF/Acre),${n > 1 ? stdDevVpa.toFixed(1) : 'N/A'}\n`; plotStatsCsvContent += `Coefficient of Variation (CV),${(n > 1 && meanVpa !== 0) ? cvVpa.toFixed(1) + '%' : 'N/A'}\n`;
        } else { plotStatsCsvContent = "\n\n--- PER-PLOT VOLUME & STATISTICS ---\nNo plot data found.\n"; }

        console.log(`Calculating overall forestry report using FC ${selectedFormClass}...`); const reportData = calculateForestryReport(collectedData, BAF, selectedFormClass); const reportCsvContent = formatReportForCsv(reportData, selectedFormClass); console.log("Report calculation complete.");
        const combinedCsvContent = rawCsvContent + tallyCsvContent + plotStatsCsvContent + reportCsvContent; const blob = new Blob([combinedCsvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); const timestamp = new Date().toISOString().slice(0, 19).replace(/[-T:]/g, ""); link.setAttribute("href", url); link.setAttribute("download", `TimberTally_Export_FC${selectedFormClass}_${timestamp}.csv`); link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
        showFeedback(`CSV File (FC ${selectedFormClass}) Saved! Data remains.`); console.log(`[Session] CSV saved using FC ${selectedFormClass}.`);
    }

    saveCsvBtn.addEventListener('click', () => { if (collectedData.length === 0) { showFeedback("No data to save.", true); return; } fcPromptModal.style.display = 'flex'; });
    confirmFcBtn.addEventListener('click', () => { let selectedFc = null; for (const radioButton of fcRadioButtons) { if (radioButton.checked) { selectedFc = radioButton.value; break; } } if (!selectedFc) { const fc78Radio = document.querySelector('input[name="formClass"][value="78"]'); if(fc78Radio) { selectedFc = fc78Radio.value; fc78Radio.checked = true; } else { selectedFc = '78'; } console.warn("No Form Class selected, defaulting to FC 78."); } fcPromptModal.style.display = 'none'; generateAndDownloadCsv(selectedFc); });
    cancelFcBtn.addEventListener('click', () => { fcPromptModal.style.display = 'none'; });
    deleteBtn.addEventListener('click', () => { const checkboxes = entriesTableBody.querySelectorAll('input[type="checkbox"]:checked'); if (checkboxes.length === 0) { showFeedback("No entries selected.", true); return; } const idsToDelete = new Set(); checkboxes.forEach(cb => { const id = parseInt(cb.getAttribute('data-id'), 10); if (!isNaN(id)) idsToDelete.add(id); }); if (idsToDelete.size === 0) { showFeedback("Could not identify entries to delete.", true); return; } const numToDelete = idsToDelete.size; const entryWord = numToDelete === 1 ? 'entry' : 'entries'; if (!confirm(`Delete ${numToDelete} selected ${entryWord}?`)) return; collectedData = collectedData.filter(entry => !idsToDelete.has(entry.id)); renderEntries(); saveSessionData(); showFeedback(`${numToDelete} ${entryWord} deleted.`); });
    deleteAllBtn.addEventListener('click', () => { if (collectedData.length === 0) { showFeedback("No data to delete.", true); return; } if (!confirm('WARNING: Delete ALL collected data permanently? This cannot be undone.')) return; collectedData = []; try { localStorage.removeItem(STORAGE_KEY); console.log('[Session] All data cleared.'); } catch (e) { console.error('[Session] Error clearing localStorage:', e); } renderEntries(); showFeedback('All data deleted.'); currentLocation = null; locationStatus.textContent = 'Location not set'; locationStatus.title = 'GPS Status'; locationStatus.style.color = '#555'; });
    entriesTableBody.addEventListener('change', (event) => { if (event.target.type === 'checkbox') { deleteBtn.disabled = !isAnyCheckboxChecked(); } });
    viewTallyBtn.addEventListener('click', () => { const tallyData = generateTallyData(); displayTallyResults(tallyData); entryView.style.display = 'none'; tallyView.style.display = 'block'; });
    backToEntryBtn.addEventListener('click', () => { tallyView.style.display = 'none'; entryView.style.display = 'block'; });
   toggleSpeciesMgmtBtn.addEventListener('click', () => { const isHidden = speciesManagementSection.hidden; speciesManagementSection.hidden = !isHidden; toggleSpeciesMgmtBtn.setAttribute('aria-expanded', isHidden); toggleSpeciesMgmtBtn.innerHTML = isHidden ? 'Hide Species Management ▲' : 'Show Species Management ▼'; });
   addSpeciesBtn.addEventListener('click', () => { const newSpecies = newSpeciesInput.value.trim(); if (!newSpecies) { showSpeciesFeedback("Enter species name.", true); return; } const exists = currentSpeciesList.some(s => s.toLowerCase() === newSpecies.toLowerCase()); if (exists) { showSpeciesFeedback(`Species "${newSpecies}" already exists.`, true); return; } currentSpeciesList.push(newSpecies); populateSpeciesDropdowns(); saveSpeciesList(); newSpeciesInput.value = ''; showSpeciesFeedback(`Species "${newSpecies}" added.`); });
   removeSpeciesBtn.addEventListener('click', () => { const selectedOptions = Array.from(removeSpeciesSelect.selectedOptions); if (selectedOptions.length === 0) { showSpeciesFeedback("Select species to remove.", true); return; } const speciesToRemove = selectedOptions.map(option => option.value); currentSpeciesList = currentSpeciesList.filter(s => !speciesToRemove.includes(s)); populateSpeciesDropdowns(); saveSpeciesList(); const removedNames = speciesToRemove.join(', '); const plural = speciesToRemove.length > 1 ? 's' : ''; showSpeciesFeedback(`Species "${removedNames}" removed.`, false); });


    // --- **NEW:** Compass Logic ---
    let orientationHandler = null; // Store the handler reference

    // Function to handle orientation event
    const handleOrientationEvent = (event) => {
        let heading = null;
        let source = '---';

        // Prefer absolute orientation (True North)
        if (event.absolute === true && event.alpha !== null) {
            heading = 360 - event.alpha; // Alpha is rotation around Z axis (0 = North, increases clockwise)
            source = 'True North (absolute)';
        }
        // Fallback for iOS/Safari (Magnetic North)
        else if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
            heading = event.webkitCompassHeading;
            source = 'Magnetic North (webkit)';
        }
         // Generic fallback (likely Magnetic North)
        else if (event.alpha !== null) {
            heading = 360 - event.alpha; // Assuming same convention, but likely magnetic
             source = 'Magnetic North (alpha)';
        }

        if (heading !== null) {
             // Normalize heading to 0-359
            heading = (heading + 360) % 360;
            compassNeedle.style.transform = `translateX(-50%) rotate(${heading}deg)`;
            compassHeading.textContent = `${heading.toFixed(0)}°`;
            compassSource.textContent = ` (${source})`;
        } else {
             compassHeading.textContent = `---°`;
             compassSource.textContent = ` (No reading)`;
             console.log("Compass reading unavailable from event:", event);
        }
    };

    // Show Compass Button Listener
    showCompassBtn.addEventListener('click', () => {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            // iOS 13+ requires permission
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        console.log("Orientation permission granted.");
                        startCompass();
                    } else {
                         console.warn("Orientation permission denied.");
                         alert("Compass requires orientation permission.");
                    }
                })
                .catch(error => {
                     console.error("Error requesting orientation permission:", error);
                     alert("Could not request orientation permission.");
                });
        } else {
             // Non-iOS 13+ or devices without permission model
             console.log("Attempting to start compass without explicit permission request.");
             startCompass();
        }
    });

    // Function to start listening to compass events
    function startCompass() {
        compassContainer.style.display = 'flex'; // Show the compass UI
        compassHeading.textContent = `---°`; // Reset display
        compassSource.textContent = ` (Waiting...)`;

        // Store the handler function reference
        orientationHandler = handleOrientationEvent;

        // Add listeners - try absolute first, then standard
        if ('ondeviceorientationabsolute' in window) {
            window.addEventListener('deviceorientationabsolute', orientationHandler, true);
            console.log("Added 'deviceorientationabsolute' listener.");
        } else if ('ondeviceorientation' in window) {
            window.addEventListener('deviceorientation', orientationHandler, true);
            console.log("Added 'deviceorientation' listener (absolute not available).");
        } else {
            console.error("Device orientation events not supported by this browser.");
            compassHeading.textContent = `N/A`;
            compassSource.textContent = ` (Unsupported)`;
            alert("Sorry, your browser does not support device orientation.");
        }
    }

    // Close Compass Button Listener
    closeCompassBtn.addEventListener('click', () => {
        compassContainer.style.display = 'none';
        // Remove the specific listener that was added
        if (orientationHandler) {
            if ('ondeviceorientationabsolute' in window) {
                 window.removeEventListener('deviceorientationabsolute', orientationHandler, true);
                 console.log("Removed 'deviceorientationabsolute' listener.");
            } else if ('ondeviceorientation' in window) {
                 window.removeEventListener('deviceorientation', orientationHandler, true);
                 console.log("Removed 'deviceorientation' listener.");
            }
            orientationHandler = null; // Clear the handler reference
        }
    });
    // --- End Compass Logic ---


    // --- Initial Setup ---
    console.log("Initializing TimberTally application...");
    initializeSpeciesManagement();
    populateDbhOptions();
    populateLogsOptions();
    dbhSelect.addEventListener('change', checkAndSetLogsForDbh);
    checkAndSetLogsForDbh();
    console.log("Dropdowns (DBH, Logs) initialized and initial log check performed.");
    loadAndPromptSessionData(); // This also calls renderEntries()
    console.log("TimberTally application initialization complete.");
});

// --- END OF FILE script.js ---
