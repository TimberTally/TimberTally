// --- START OF FILE script.js ---

// --- Service Worker Registration ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js') // Using the dynamically caching version
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
    const fcRadioButtons = document.querySelectorAll('input[name="formClass"]'); // Get all radio buttons

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
   ].sort(); // Keep it sorted initially

   // --- Current Species List (loaded from storage + defaults) ---
   let currentSpeciesList = [...DEFAULT_SPECIES];


    // --- Doyle Volume Tables (FC72 base, others scaled) ---
    // Base Doyle Form Class 72 Volume Table (Board Feet)
    const DOYLE_FC72_VOLUMES = {
        '12': { '0.5': 9, '1.0': 18, '1.5': 25, '2.0': 31, '2.5': 35, '3.0': 40, '3.5': 43, '4.0': 46 },
        '14': { '0.5': 16, '1.0': 33, '1.5': 45, '2.0': 57, '2.5': 66, '3.0': 74, '3.5': 81, '4.0': 87 },
        '16': { '0.5': 27, '1.0': 54, '1.5': 73, '2.0': 92, '2.5': 107, '3.0': 122, '3.5': 134, '4.0': 144 },
        '18': { '0.5': 40, '1.0': 80, '1.5': 109, '2.0': 138, '2.5': 162, '3.0': 185, '3.5': 204, '4.0': 221 },
        '20': { '0.5': 56, '1.0': 111, '1.5': 152, '2.0': 193, '2.5': 229, '3.0': 261, '3.5': 289, '4.0': 315 },
        '22': { '0.5': 74, '1.0': 148, '1.5': 203, '2.0': 258, '2.5': 307, '3.0': 352, '3.5': 392, '4.0': 429 },
        '24': { '0.5': 96, '1.0': 192, '1.5': 263, '2.0': 335, '2.5': 401, '3.0': 461, '3.5': 516, '4.0': 565 },
        '26': { '0.5': 121, '1.0': 241, '1.5': 332, '2.0': 422, '2.5': 507, '3.0': 585, '3.5': 656, '4.0': 721 },
        '28': { '0.5': 149, '1.0': 297, '1.5': 410, '2.0': 521, '2.5': 627, '3.0': 725, '3.5': 814, '4.0': 895 },
        '30': { '0.5': 180, '1.0': 359, '1.5': 496, '2.0': 631, '2.5': 760, '3.0': 881, '3.5': 993, '4.0': 1095 },
        '32': { '0.5': 214, '1.0': 428, '1.5': 592, '2.0': 753, '2.5': 908, '3.0': 1054, '3.5': 1189, '4.0': 1313 },
        '34': { '0.5': 252, '1.0': 503, '1.5': 696, '2.0': 885, '2.5': 1068, '3.0': 1241, '3.5': 1401, '4.0': 1551 },
        '36': { '0.5': 293, '1.0': 585, '1.5': 809, '2.0': 1029, '2.5': 1241, '3.0': 1442, '3.5': 1629, '4.0': 1804 },
        '38': { '0.5': 337, '1.0': 673, '1.5': 931, '2.0': 1184, '2.5': 1429, '3.0': 1662, '3.5': 1879, '4.0': 2081 },
        '40': { '0.5': 384, '1.0': 767, '1.5': 1062, '2.0': 1350, '2.5': 1629, '3.0': 1897, '3.5': 2146, '4.0': 2377 },
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
    function populateLogsOptions() { logsSelect.innerHTML = ''; console.log("Populating Logs options..."); const logValues = ["0", "0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "Cull"]; logValues.forEach(value => { const option = document.createElement('option'); option.value = value; option.textContent = value; logsSelect.appendChild(option); }); if (logsSelect.options.length > 0) logsSelect.selectedIndex = 0; console.log("Logs options populated. Current value:", logsSelect.value); }
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
    function displayTallyResults(tallyData) { tallyResultsContainer.innerHTML = ''; const speciesKeys = Object.keys(tallyData).sort(); if (speciesKeys.length === 0) { const p = document.createElement('p'); p.textContent = 'No data available to tally.'; p.classList.add('no-tally-data'); tallyResultsContainer.appendChild(p); return; } speciesKeys.forEach(species => { const speciesDiv = document.createElement('div'); speciesDiv.classList.add('tally-species'); const speciesHeading = document.createElement('h3'); speciesHeading.textContent = species; speciesDiv.appendChild(speciesHeading); const dbhKeys = Object.keys(tallyData[species]).sort((a, b) => Number(a) - Number(b)); dbhKeys.forEach(dbh => { const dbhHeading = document.createElement('h4'); dbhHeading.textContent = `DBH: ${dbh}`; speciesDiv.appendChild(dbhHeading); const logKeys = Object.keys(tallyData[species][dbh]).sort((a, b) => { if (a === 'Cull') return 1; if (b === 'Cull') return -1; return Number(a) - Number(b); }); logKeys.forEach(logs => { const countsObject = tallyData[species][dbh][logs]; const countCut = countsObject['Yes'] || 0; const countNotCut = countsObject['No'] || 0; if (countCut > 0) { const logItemDivCut = document.createElement('div'); logItemDivCut.classList.add('tally-log-item'); const labelSpanCut = document.createElement('span'); labelSpanCut.classList.add('log-label'); labelSpanCut.textContent = `Logs: ${logs} (Cut) - `; const countSpanCut = document.createElement('span'); countSpanCut.classList.add('log-count'); countSpanCut.textContent = `Count: ${countCut}`; logItemDivCut.appendChild(labelSpanCut); logItemDivCut.appendChild(countSpanCut); speciesDiv.appendChild(logItemDivCut); } if (countNotCut > 0) { const logItemDivNotCut = document.createElement('div'); logItemDivNotCut.classList.add('tally-log-item'); const labelSpanNotCut = document.createElement('span'); labelSpanNotCut.classList.add('log-label'); labelSpanNotCut.textContent = `Logs: ${logs} (Not Cut) - `; const countSpanNotCut = document.createElement('span'); countSpanNotCut.classList.add('log-count'); countSpanNotCut.textContent = `Count: ${countNotCut}`; logItemDivNotCut.appendChild(labelSpanNotCut); logItemDivNotCut.appendChild(countSpanNotCut); speciesDiv.appendChild(logItemDivNotCut); } }); }); tallyResultsContainer.appendChild(speciesDiv); }); }

    // --- Forestry Report Calculation Logic ---

    // **MODIFIED:** Get Doyle Volume (BF) using Form Class lookup table and scaling
    function getDoyleVolume(dbhStr, logsStr, formClass = 72) {
        const dbhInt = parseInt(dbhStr, 10);
        const dbhKey = String(dbhInt);

        // Basic validation
        if (logsStr === 'Cull' || isNaN(parseFloat(logsStr))) return 0;
        const logsNum = parseFloat(logsStr);
        if (isNaN(dbhInt) || dbhInt < 12 || logsNum <= 0) return 0;

        const logsKey = logsNum.toFixed(1); // Format to "1.0", "1.5", etc.

        // Get base volume from FC72 table
        const dbhEntryFC72 = DOYLE_FC72_VOLUMES[dbhKey];
        let baseVolume = 0;
        if (dbhEntryFC72 && dbhEntryFC72.hasOwnProperty(logsKey)) {
            baseVolume = dbhEntryFC72[logsKey];
        } else {
            return 0; // No volume found for this DBH/Log combination in base table
        }

        // Apply scaling factor for other form classes (approximation)
        const fcInt = parseInt(formClass, 10);
        if (isNaN(fcInt) || fcInt <= 0) {
             console.warn(`Invalid Form Class '${formClass}', using FC72.`);
             return baseVolume; // Default to FC72 if invalid
        }

        if (fcInt === 72) {
            return baseVolume; // No scaling needed
        } else {
            // Simple scaling - adjust based on ratio to FC72
            // Note: Real forestry tables might have more complex relationships
            const scaleFactor = fcInt / 72.0;
            return Math.round(baseVolume * scaleFactor); // Return scaled volume, rounded
        }
    }

    function getDbhClass(dbh) { if (isNaN(dbh)) return 'Invalid'; if (dbh >= 4 && dbh <= 5) return 'Sapling'; if (dbh >= 6 && dbh <= 11) return 'Poletimber'; if (dbh >= 12 && dbh <= 17) return 'Small Sawtimber'; if (dbh >= 18 && dbh <= 23) return 'Medium Sawtimber'; if (dbh >= 24) return 'Large Sawtimber'; return 'Other'; }

    // **MODIFIED:** Calculate Forestry Report, now accepts formClass
    function calculateForestryReport(data, baf = 10, formClass = 72) {
        const report = { summary: {}, standDistribution: {}, speciesSummary1: {}, speciesSummary2: {} };
        // ... (keep existing initial checks for data and plotNumbers) ...
        if (!data || data.length === 0) { console.warn("No data for report."); return report; }
        const plotNumbers = new Set(data.map(entry => entry.plotNumber));
        const numberOfPlots = plotNumbers.size;
        if (numberOfPlots === 0) { console.warn("No plots found."); return report; }

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
                classData['Invalid'].stemCount++;
                if (isCut) classData['Invalid'].cutStemCount++;
                return; // Skip invalid entries
            }

            totalTrees++;
            if (isCut) totalCutTrees++;

            const baTree = BA_CONST * Math.pow(dbh, 2);
            const tpaTree = baf / baTree;
            // **MODIFIED:** Call getDoyleVolume with the selected formClass
            const volTree = getDoyleVolume(entry.dbh, entry.logs, formClass);
            const vpaTree = volTree * tpaTree; // Volume per Acre represented by this tree

            totalBaSum += baTree;
            totalTpaSum += tpaTree;
            totalVolumeSum += vpaTree;

            if (isCut) {
                totalCutBaSum += baTree;
                totalCutTpaSum += tpaTree;
                totalCutVolumeSum += vpaTree;
            }

            // --- Update Species Data ---
            if (!speciesData[species]) {
                speciesData[species] = { stemCount: 0, cutStemCount: 0, saplingStemCount: 0, poleStemCount: 0, sawStemCount: 0, baSum: 0, tpaSum: 0, volumeSum: 0, volSmall: 0, volMedium: 0, volLarge: 0 };
            }
            speciesData[species].stemCount++;
            speciesData[species].baSum += baTree;
            speciesData[species].tpaSum += tpaTree;
            speciesData[species].volumeSum += vpaTree; // Accumulate VPA
            if (isCut) speciesData[species].cutStemCount++;
            if (dbhClass === 'Sapling') speciesData[species].saplingStemCount++;
            else if (dbhClass === 'Poletimber') speciesData[species].poleStemCount++;
            else if (dbhClass.includes('Sawtimber')) speciesData[species].sawStemCount++;

            if (dbhClass === 'Small Sawtimber') speciesData[species].volSmall += vpaTree;
            else if (dbhClass === 'Medium Sawtimber') speciesData[species].volMedium += vpaTree;
            else if (dbhClass === 'Large Sawtimber') speciesData[species].volLarge += vpaTree;

            // --- Update Class Data ---
            if(classData[dbhClass]){
                classData[dbhClass].stemCount++;
                classData[dbhClass].baSum += baTree;
                classData[dbhClass].tpaSum += tpaTree;
                classData[dbhClass].volumeSum += vpaTree; // Accumulate VPA
                if (isCut) {
                    classData[dbhClass].cutStemCount++;
                    classData[dbhClass].cutBaSum += baTree;
                    classData[dbhClass].cutTpaSum += tpaTree;
                    classData[dbhClass].cutVolumeSum += vpaTree;
                }
            } else {
                console.warn(`DBH Class '${dbhClass}' not found in classData structure for DBH ${dbh}`);
            }
        });

        // --- Calculate Averages and Totals ---
        const treesPerAcre = totalTpaSum / numberOfPlots;
        const treesPerAcreCut = totalCutTpaSum / numberOfPlots;
        const treesPerAcreNotCut = treesPerAcre - treesPerAcreCut;
        const totalBaPerAcreSimple = (totalTrees * BAF) / numberOfPlots; // BA based on stem count and BAF
        const totalVolPerAcre = totalVolumeSum / numberOfPlots; // Total VPA / plots
        const cutVolPerAcre = totalCutVolumeSum / numberOfPlots; // Cut VPA / plots
        const leaveVolPerAcre = totalVolPerAcre - cutVolPerAcre;
        let qmd = 0;
        if (treesPerAcre > 0 && totalBaPerAcreSimple > 0) {
            qmd = Math.sqrt( (totalBaPerAcreSimple / treesPerAcre) / BA_CONST );
        }

        // --- Populate Report Object ---
        report.summary = { numberOfPlots, totalVolPerAcre, cutVolPerAcre, leaveVolPerAcre, avgTractDbh: qmd, treesPerAcre, treesPerAcreCut, treesPerAcreNotCut, totalBaPerAcreSimple };

        const dbhClassesOrder = ['Sapling', 'Poletimber', 'Small Sawtimber', 'Medium Sawtimber', 'Large Sawtimber', 'Other', 'Invalid'];
        let totalReportedStems = 0, totalReportedBaPerAcre = 0, totalReportedVolPerAcre = 0;

        dbhClassesOrder.forEach(cls => {
            const classInfo = classData[cls];
            const classTpa = classInfo.tpaSum / numberOfPlots;
            const classBaPerAcre = (classInfo.stemCount * BAF) / numberOfPlots;
            const classCutBaPerAcre = (classInfo.cutStemCount * BAF) / numberOfPlots;
            const classLeaveBaPerAcre = classBaPerAcre - classCutBaPerAcre;
            const classVolPerAcre = classInfo.volumeSum / numberOfPlots; // Class VPA / plots

            totalReportedStems += classTpa;
            totalReportedBaPerAcre += classBaPerAcre;
            totalReportedVolPerAcre += classVolPerAcre;

            report.standDistribution[cls] = {
                percentTotalStems: treesPerAcre > 0 ? (classTpa / treesPerAcre) * 100 : 0,
                baSqFtCut: classCutBaPerAcre,
                baSqFtNotCut: classLeaveBaPerAcre,
                baSqFtTotal: classBaPerAcre,
                percentBa: totalBaPerAcreSimple > 0 ? (classBaPerAcre / totalBaPerAcreSimple) * 100 : 0,
                volumeBf: classVolPerAcre, // Volume per acre for this class
                percentVolume: totalVolPerAcre > 0 ? (classVolPerAcre / totalVolPerAcre) * 100 : 0,
            };
        });

        // Add Totals row for Stand Distribution
        report.standDistribution['TOTALS'] = {
            percentTotalStems: treesPerAcre > 0 ? (totalReportedStems / treesPerAcre) * 100 : 0, // Should be close to 100% excluding invalid
            baSqFtCut: (totalCutTrees * BAF) / numberOfPlots,
            baSqFtNotCut: ((totalTrees - totalCutTrees) * BAF) / numberOfPlots,
            baSqFtTotal: totalReportedBaPerAcre, // Sum of class BA per acre
            percentBa: totalBaPerAcreSimple > 0 ? (totalReportedBaPerAcre / totalBaPerAcreSimple) * 100 : 0, // Should be 100%
            volumeBf: totalReportedVolPerAcre, // Sum of class VPA per acre
            percentVolume: totalVolPerAcre > 0 ? (totalReportedVolPerAcre / totalVolPerAcre) * 100 : 0, // Should be 100%
        };


        // --- Species Summaries ---
        const sortedSpecies = Object.keys(speciesData).sort();
        let speciesVolTotalSum = 0;

        sortedSpecies.forEach(species => {
            const spData = speciesData[species];
            const spTpa = spData.tpaSum / numberOfPlots;
            const spTotalStems = spData.stemCount;
            const spVolPerAcre = spData.volumeSum / numberOfPlots; // Species VPA / plots
            speciesVolTotalSum += spVolPerAcre;

            report.speciesSummary1[species] = {
                percentTotalStems: treesPerAcre > 0 ? (spTpa / treesPerAcre) * 100 : 0,
                sawtimberPercent: spTotalStems > 0 ? (spData.sawStemCount / spTotalStems) * 100 : 0,
                poletimberPercent: spTotalStems > 0 ? (spData.poleStemCount / spTotalStems) * 100 : 0,
                saplingPercent: spTotalStems > 0 ? (spData.saplingStemCount / spTotalStems) * 100 : 0,
            };
            report.speciesSummary2[species] = {
                volSmall: spData.volSmall / numberOfPlots,
                volMedium: spData.volMedium / numberOfPlots,
                volLarge: spData.volLarge / numberOfPlots,
                totalSpeciesVolPerAcre: spVolPerAcre,
                percentTotalVolume: totalVolPerAcre > 0 ? (spVolPerAcre / totalVolPerAcre) * 100 : 0,
            };
        });

        // Add Totals row for Species Summary 2
        const totalSmallVol = sortedSpecies.reduce((sum, sp) => sum + report.speciesSummary2[sp].volSmall, 0);
        const totalMediumVol = sortedSpecies.reduce((sum, sp) => sum + report.speciesSummary2[sp].volMedium, 0);
        const totalLargeVol = sortedSpecies.reduce((sum, sp) => sum + report.speciesSummary2[sp].volLarge, 0);

        report.speciesSummary2['TOTALS'] = {
            volSmall: totalSmallVol,
            volMedium: totalMediumVol,
            volLarge: totalLargeVol,
            totalSpeciesVolPerAcre: speciesVolTotalSum,
            percentTotalVolume: totalVolPerAcre > 0 ? (speciesVolTotalSum / totalVolPerAcre) * 100 : 0, // Should be 100%
        };

        return report;
    }


    // **MODIFIED:** Format Report, now accepts formClass
    function formatReportForCsv(report, formClass = 72) {
        if (!report || !report.summary || Object.keys(report.summary).length === 0) {
            return "\n--- FORESTRY REPORT DATA ---\nNo data to report.\n";
        }

        // **MODIFIED:** Include BAF and Form Class in the header
        let csv = `\n\n--- FORESTRY REPORT DATA (BAF=${BAF}, Doyle FC${formClass} Volume Estimation) ---\n`;

        const fmt = (num, digits = 1) => (typeof num === 'number' && !isNaN(num) ? num.toFixed(digits) : '0.0');
        const fmtInt = (num) => (typeof num === 'number' && !isNaN(num) ? num.toFixed(0) : '0');

        // --- Summary Section ---
        csv += "TOTAL VOLUME PER ACRE IN BOARD FEET," + fmtInt(report.summary.totalVolPerAcre) + ",,";
        csv += "VOLUME PER ACRE CUT IN BOARD FEET," + fmtInt(report.summary.cutVolPerAcre) + ",,";
        csv += "VOLUME PER ACRE LEAVE IN BOARD FEET," + fmtInt(report.summary.leaveVolPerAcre) + "\n";
        csv += "AVERAGE TRACT DBH," + fmt(report.summary.avgTractDbh, 1) + ",,";
        csv += "TOTAL NUMBER OF TREES PER ACRE," + fmt(report.summary.treesPerAcre, 1) + ",,";
        csv += "NUMBER OF PLOTS," + fmtInt(report.summary.numberOfPlots) + "\n";
        csv += ",,," + "TREES PER ACRE CUT," + fmt(report.summary.treesPerAcreCut, 1) + ",," + "TREES PER ACRE LEAVE," + fmt(report.summary.treesPerAcreNotCut, 1) + "\n\n";

        // --- Stand Distribution Table ---
        csv += "STAND DISTRIBUTION TABLE,PERCENT OF TOTAL STEMS,\"BASAL AREA IN SQUARE FEET\",,,\"PER CENT OF BASAL AREA\",\"VOLUME IN BOARD FEET\",\"PER CENT OF VOLUME\"\n";
        csv += ",,\"Cut Trees\",\"Not Cut Trees\",\"Total Trees\",,,\n";
        const classOrder = ['Sapling', 'Poletimber', 'Small Sawtimber', 'Medium Sawtimber', 'Large Sawtimber', 'Other', 'Invalid', 'TOTALS'];
        const classLabels = { 'Sapling': 'SAPLINGS (2 - 5 Inches DBH)', 'Poletimber': 'POLETIMBER (6 - 11 Inches DBH)', 'Small Sawtimber': 'SMALL SAWTIMBER (12 - 17 Inches DBH)', 'Medium Sawtimber': 'MEDIUM SAWTIMBER (18 - 23 Inches DBH)', 'Large Sawtimber': 'LARGE SAWTIMBER (24 - 40+ Inches DBH)', 'Other': 'OTHER DBH', 'Invalid': 'INVALID DBH ENTRIES', 'TOTALS': 'TOTALS' };

        classOrder.forEach(cls => {
            const data = report.standDistribution[cls] || {};
            const label = classLabels[cls] || cls;
            csv += `"${label}",${fmt(data.percentTotalStems)}%,${fmt(data.baSqFtCut)},${fmt(data.baSqFtNotCut)},${fmt(data.baSqFtTotal)},${fmt(data.percentBa)}%,${fmtInt(data.volumeBf)},${fmt(data.percentVolume)}%\n`;
        });
        csv += "\n";

        // --- Species Summary Table 1 ---
        csv += "SPECIES,\"PER CENT OF TOTAL STEMS\",\"SAWTIMBER PERCENT\",\"POLETIMBER PERCENT\",\"SAPLING PERCENT\"\n";
        const species1Order = Object.keys(report.speciesSummary1).sort();
        species1Order.forEach(species => {
            const data = report.speciesSummary1[species] || {};
            csv += `"${species}",${fmt(data.percentTotalStems)}%,${fmt(data.sawtimberPercent)}%,${fmt(data.poletimberPercent)}%,${fmt(data.saplingPercent)}%\n`;
        });
        csv += "\n";

        // --- Species Summary Table 2 ---
        csv += "\"PER ACRE VOLUME BY SPECIES IN BOARD FEET\",\"SMALL SAWTIMBER (12-17 Inches DBH)\",\"MEDIUM SAWTIMBER (18-23 Inches DBH)\",\"LARGE SAWTIMBER (24+ Inches DBH)\",\"TOTAL SPECIES VOLUME PER ACRE\",\"PER CENT OF TOTAL\"\n";
        const species2Order = [...Object.keys(report.speciesSummary2).filter(s => s !== 'TOTALS').sort(), 'TOTALS'];
        species2Order.forEach(species => {
            const data = report.speciesSummary2[species] || {};
            const label = species === 'TOTALS' ? "TOTALS" : `"${species}"`;
            csv += `${label},${fmtInt(data.volSmall)},${fmtInt(data.volMedium)},${fmtInt(data.volLarge)},${fmtInt(data.totalSpeciesVolPerAcre)},${fmt(data.percentVolume)}%\n`;
        });

        return csv;
    }

    // --- **NEW:** Function to generate and download the CSV ---
    function generateAndDownloadCsv(selectedFormClass) {
        if (collectedData.length === 0) {
            showFeedback("No data to save.", true);
            return;
        }

        // 1. Raw Data
        let rawCsvContent = "PlotNumber,DBH,Species,Logs,Cut,Notes,Latitude,Longitude\n";
        collectedData.forEach(entry => {
            const notesSanitized = `"${(entry.notes || '').replace(/"/g, '""')}"`;
            const lat = entry.location ? entry.location.lat : '';
            const lon = entry.location ? entry.location.lon : '';
            const cut = entry.cutStatus || 'No';
            rawCsvContent += `${entry.plotNumber},${entry.dbh},"${entry.species}",${entry.logs},${cut},${notesSanitized},${lat},${lon}\n`;
        });

        // 2. Tally Data
        const tallyData = generateTallyData();
        let tallyCsvContent = "\n\n--- TALLY DATA ---\nSpecies,DBH,Logs,Cut Status,Count\n";
        const speciesKeys = Object.keys(tallyData).sort();
        speciesKeys.forEach(species => {
            const dbhKeys = Object.keys(tallyData[species]).sort((a, b) => Number(a) - Number(b));
            dbhKeys.forEach(dbh => {
                const logKeys = Object.keys(tallyData[species][dbh]).sort((a, b) => {
                    if (a === 'Cull') return 1;
                    if (b === 'Cull') return -1;
                    return Number(a) - Number(b);
                });
                logKeys.forEach(logs => {
                    const countsObject = tallyData[species][dbh][logs];
                    const countCut = countsObject['Yes'] || 0;
                    const countNotCut = countsObject['No'] || 0;
                    if (countCut > 0) tallyCsvContent += `"${species}",${dbh},${logs},"Yes",${countCut}\n`;
                    if (countNotCut > 0) tallyCsvContent += `"${species}",${dbh},${logs},"No",${countNotCut}\n`;
                });
            });
        });

        // 3. Forestry Report Data (using selected Form Class)
        console.log(`Calculating forestry report using FC ${selectedFormClass}...`);
        const reportData = calculateForestryReport(collectedData, BAF, selectedFormClass);
        const reportCsvContent = formatReportForCsv(reportData, selectedFormClass);
        console.log("Report calculation complete.");

        // 4. Combine and Download
        const combinedCsvContent = rawCsvContent + tallyCsvContent + reportCsvContent;
        const blob = new Blob([combinedCsvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[-T:]/g, "");
        link.setAttribute("href", url);
        // Include FC in filename
        link.setAttribute("download", `TimberTally_Export_FC${selectedFormClass}_${timestamp}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showFeedback(`CSV File (FC ${selectedFormClass}) Saved! Data remains.`);
        console.log(`[Session] CSV saved using FC ${selectedFormClass}. Data remains in session.`);
    }


    // --- **MODIFIED:** Save CSV Button Handler (Now shows modal) ---
    saveCsvBtn.addEventListener('click', () => {
        if (collectedData.length === 0) {
            showFeedback("No data to save.", true);
            return;
        }
        // Show the modal instead of generating CSV directly
        fcPromptModal.style.display = 'flex'; // Use flex to enable centering
    });

    // --- **NEW:** Modal Button Event Listeners ---
    confirmFcBtn.addEventListener('click', () => {
        let selectedFc = '72'; // Default to 72
        for (const radioButton of fcRadioButtons) {
            if (radioButton.checked) {
                selectedFc = radioButton.value;
                break;
            }
        }
        fcPromptModal.style.display = 'none'; // Hide modal
        generateAndDownloadCsv(selectedFc); // Proceed with CSV generation
    });

    cancelFcBtn.addEventListener('click', () => {
        fcPromptModal.style.display = 'none'; // Hide modal, do nothing else
    });

    // --- Delete Selected Button Handler ---
    deleteBtn.addEventListener('click', () => { const checkboxes = entriesTableBody.querySelectorAll('input[type="checkbox"]:checked'); if (checkboxes.length === 0) { showFeedback("No entries selected for deletion.", true); return; } const idsToDelete = new Set(); checkboxes.forEach(cb => { const id = parseInt(cb.getAttribute('data-id'), 10); if (!isNaN(id)) idsToDelete.add(id); }); if (idsToDelete.size === 0) { showFeedback("Could not identify entries to delete.", true); return; } const numToDelete = idsToDelete.size; const entryWord = numToDelete === 1 ? 'entry' : 'entries'; if (!confirm(`Are you sure you want to delete ${numToDelete} selected ${entryWord}?`)) return; collectedData = collectedData.filter(entry => !idsToDelete.has(entry.id)); renderEntries(); saveSessionData(); showFeedback(`${numToDelete} ${entryWord} deleted.`); });

    // --- Delete All Button Handler ---
    deleteAllBtn.addEventListener('click', () => { if (collectedData.length === 0) { showFeedback("No data to delete.", true); return; } if (!confirm('WARNING: This will delete ALL collected data permanently. This action cannot be undone. Are you absolutely sure?')) return; collectedData = []; try { localStorage.removeItem(STORAGE_KEY); console.log('[Session] All data cleared by user.'); } catch (e) { console.error('[Session] Error clearing localStorage during Delete All:', e); } renderEntries(); showFeedback('All data has been deleted.'); currentLocation = null; locationStatus.textContent = 'Location not set'; locationStatus.title = 'GPS Status'; locationStatus.style.color = '#555'; });

    // --- Enable/Disable Delete Selected Button Based on Checkbox Clicks ---
    entriesTableBody.addEventListener('change', (event) => { if (event.target.type === 'checkbox') { deleteBtn.disabled = !isAnyCheckboxChecked(); } });

    // --- View Switching Logic ---
    viewTallyBtn.addEventListener('click', () => { const tallyData = generateTallyData(); displayTallyResults(tallyData); entryView.style.display = 'none'; tallyView.style.display = 'block'; });
    backToEntryBtn.addEventListener('click', () => { tallyView.style.display = 'none'; entryView.style.display = 'block'; });

   // --- Species Management Event Listeners ---
   toggleSpeciesMgmtBtn.addEventListener('click', () => { const isHidden = speciesManagementSection.hidden; speciesManagementSection.hidden = !isHidden; toggleSpeciesMgmtBtn.setAttribute('aria-expanded', isHidden); toggleSpeciesMgmtBtn.innerHTML = isHidden ? 'Hide Species Management ▲' : 'Show Species Management ▼'; });
   addSpeciesBtn.addEventListener('click', () => { const newSpecies = newSpeciesInput.value.trim(); if (!newSpecies) { showSpeciesFeedback("Please enter a species name.", true); return; } const exists = currentSpeciesList.some(s => s.toLowerCase() === newSpecies.toLowerCase()); if (exists) { showSpeciesFeedback(`Species "${newSpecies}" already exists.`, true); return; } currentSpeciesList.push(newSpecies); populateSpeciesDropdowns(); saveSpeciesList(); newSpeciesInput.value = ''; showSpeciesFeedback(`Species "${newSpecies}" added successfully.`); });
   removeSpeciesBtn.addEventListener('click', () => { const selectedOptions = Array.from(removeSpeciesSelect.selectedOptions); if (selectedOptions.length === 0) { showSpeciesFeedback("Select one or more species to remove.", true); return; } const speciesToRemove = selectedOptions.map(option => option.value); currentSpeciesList = currentSpeciesList.filter(s => !speciesToRemove.includes(s)); populateSpeciesDropdowns(); saveSpeciesList(); const removedNames = speciesToRemove.join(', '); const plural = speciesToRemove.length > 1 ? 's' : ''; showSpeciesFeedback(`Species "${removedNames}" removed successfully.`, false); });
   // --- End Species Management Event Listeners ---

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
