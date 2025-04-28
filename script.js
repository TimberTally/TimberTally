// --- START OF CONDENSED script.js ---

// --- Service Worker Registration and Update Handling ---
if ('serviceWorker' in navigator) {
    const updateNotification = document.getElementById('updateNotification');
    const updateNowBtn = document.getElementById('updateNowBtn');
    const updateDismissBtn = document.getElementById('updateDismissBtn');
    let newWorker;

    function showUpdateBar() { if (updateNotification) { console.log('[App] Showing update bar.'); updateNotification.style.display = 'flex'; } else { console.error('[App] Update notification element not found.'); } }
    function hideUpdateBar() { if (updateNotification) { updateNotification.style.display = 'none'; } }

    window.addEventListener('load', () => {
        try {
            navigator.serviceWorker.register('./service-worker.js')
                .then(registration => {
                    console.log('TimberTally ServiceWorker registration successful with scope: ', registration.scope);
                    if (registration.waiting) { console.log('[App] New worker is waiting immediately.'); newWorker = registration.waiting; showUpdateBar(); }
                    registration.addEventListener('updatefound', () => {
                        console.log('[App] New service worker found. Installing...');
                        const installingWorker = registration.installing;
                        if (installingWorker) {
                            if (typeof newWorker === 'undefined' || !newWorker) { newWorker = installingWorker; }
                            installingWorker.addEventListener('statechange', () => {
                                if (installingWorker.state === 'installed') {
                                    console.log('[App] New service worker installed.');
                                    if (navigator.serviceWorker.controller) {
                                        console.log('[App] New worker is waiting (detected via updatefound). Showing update bar.');
                                        if(registration.waiting) newWorker = registration.waiting;
                                        showUpdateBar();
                                    } else { console.log('[App] Service worker installed for the first time.'); }
                                } else { console.log(`[App] Installing worker state changed: ${installingWorker.state}`); }
                            });
                        } else { console.warn('[App] registration.installing was null inside updatefound listener.'); }
                    });
                    setInterval(() => { console.log('[App] Checking for service worker updates (hourly)...'); registration.update().catch(err => console.error('[App] Error during periodic SW update check:', err)); }, 3600000);
                })
                .catch(err => console.error('TimberTally ServiceWorker registration failed: ', err));

            let refreshing = false;
            navigator.serviceWorker.addEventListener('controllerchange', () => { console.log('[App] Controller changed.'); if (!refreshing) { console.log('[App] Reloading page...'); window.location.reload(); refreshing = true; } });
        } catch (e) { console.error('Error during ServiceWorker registration setup:', e); }

        if (updateNowBtn) { updateNowBtn.addEventListener('click', () => { console.log('[App] Update Now clicked.'); if (newWorker) { newWorker.postMessage({ type: 'SKIP_WAITING' }); hideUpdateBar(); console.log('[App] SKIP_WAITING sent.'); } else { console.warn('[App] No waiting worker to activate.'); hideUpdateBar(); } }); } else { console.error('[App] Update Now button not found.'); }
        if (updateDismissBtn) { updateDismissBtn.addEventListener('click', () => { console.log('[App] Dismissed update.'); hideUpdateBar(); }); } else { console.error('[App] Update Dismiss button not found.'); }
    });
} else { console.log('TimberTally: Service Workers not supported.'); }
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
    const plotDecrementBtn = document.getElementById('plotDecrementBtn');
    const plotIncrementBtn = document.getElementById('plotIncrementBtn');
    const plotNumberDisplay = document.getElementById('plotNumberDisplay');
    const neededPlotsValue = document.getElementById('neededPlotsValue');
    const areaDecrementBtn = document.getElementById('areaDecrementBtn');
    const areaIncrementBtn = document.getElementById('areaIncrementBtn');
    const areaLetterDisplay = document.getElementById('areaLetterDisplay');
    const settingsSection = document.getElementById('settingsSection');
    const toggleSettingsBtn = document.getElementById('toggleSettingsBtn');
    const bafSelect = document.getElementById('bafSelect');
    const logRuleSelect = document.getElementById('logRuleSelect');
    const formClassSelect = document.getElementById('formClassSelect');
    const formClassGroup = document.getElementById('formClassGroup');
    const generateGraphsSelect = document.getElementById('generateGraphsSelect');
    const settingsFeedback = document.getElementById('settingsFeedback');
    const manualUpdateCheckBtn = document.getElementById('manualUpdateCheckBtn');
    const updateCheckStatus = document.getElementById('updateCheckStatus');
    const showPrivacyPolicyBtn = document.getElementById('showPrivacyPolicyBtn');
    const showReadmeBtn = document.getElementById('showReadmeBtn');
    const showTreeKeyBtn = document.getElementById('showTreeKeyBtn');
    const speciesManagementSection = document.getElementById('speciesManagementSection');
    const toggleSpeciesMgmtBtn = document.getElementById('toggleSpeciesMgmtBtn');
    const newSpeciesInput = document.getElementById('newSpeciesInput');
    const addSpeciesBtn = document.getElementById('addSpeciesBtn');
    const removeSpeciesSelect = document.getElementById('removeSpeciesSelect');
    const removeSpeciesBtn = document.getElementById('removeSpeciesBtn');
    const speciesMgmtFeedback = document.getElementById('speciesMgmtFeedback');
    const projectManagementSection = document.getElementById('projectManagementSection');
    const toggleProjectMgmtBtn = document.getElementById('toggleProjectMgmtBtn');
    const projectNameInput = document.getElementById('projectNameInput');
    const saveProjectBtn = document.getElementById('saveProjectBtn');
    const loadProjectSelect = document.getElementById('loadProjectSelect');
    const loadProjectBtn = document.getElementById('loadProjectBtn');
    const deleteProjectBtn = document.getElementById('deleteProjectBtn');
    const csvFileInput = document.getElementById('csvFileInput');
    const loadCsvBtn = document.getElementById('loadCsvBtn');
    const projectMgmtFeedback = document.getElementById('projectMgmtFeedback');
    const entryView = document.getElementById('entryView');
    const tallyView = document.getElementById('tallyView');
    const viewTallyBtn = document.getElementById('viewTallyBtn');
    const backToEntryBtn = document.getElementById('backToEntryBtn');
    const tallyResultsContainer = document.getElementById('tallyResults');
    const showCompassBtn = document.getElementById('showCompassBtn');
    const compassContainer = document.getElementById('compassContainer');
    const compassNeedle = document.getElementById('compassNeedle');
    const compassHeading = document.getElementById('compassHeading');
    const compassSource = document.getElementById('compassSource');
    const closeCompassBtn = document.getElementById('closeCompassBtn');
    const treeKeyModal = document.getElementById('treeKeyModal');
    const closeTreeKeyBtn = document.getElementById('closeTreeKeyBtn');
    const closeTreeKeyBtnBottom = document.getElementById('closeTreeKeyBtnBottom');
    const baChartCanvas = document.getElementById('baChartCanvas');
    const tpaChartCanvas = document.getElementById('tpaChartCanvas');
    const volSpeciesChartCanvas = document.getElementById('volSpeciesChartCanvas');
    const volSawtimberChartCanvas = document.getElementById('volSawtimberChartCanvas');

    // --- Data Storage Keys ---
    const STORAGE_KEY = 'timberTallyTempSession';
    const SPECIES_STORAGE_KEY = 'timberTallyCustomSpecies';
    const PROJECTS_STORAGE_KEY = 'timberTallyProjects';
    const SETTINGS_STORAGE_KEY = 'timberTallySettings';

    // --- Constants ---
    const PRIVACY_POLICY_URL = 'https://timbertally.github.io/TimberTally/privacy.html';
    const README_URL = 'https://github.com/TimberTally/TimberTally/blob/main/README.md';
    const BA_CONST = 0.005454;
    const MIN_PLOT_NUMBER = 1;
    const MAX_PLOT_NUMBER = 999;
    const VALID_DOYLE_FORM_CLASSES = [70, 72, 74, 76, 78, 80, 82, 84, 86]; 
    const areaLetters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
    const DEFAULT_SPECIES = ["White Oak", "Red Oak", "Yellow-poplar", "Hickory", "Red Maple","Black Walnut", "Beech", "Eastern redcedar", "Elm", "Ash", "Chestnut Oak","Black Cherry", "Hackberry", "Black Gum", "MISC", "Sugar Maple"].sort();

    // --- State Variables ---
    let collectedData = [];
    let currentLocation = null;
    let feedbackTimeout = null;
    let settingsFeedbackTimeout = null;
    let speciesFeedbackTimeout = null;
    let projectFeedbackTimeout = null;
    let updateStatusTimeout = null;
    let savedProjects = {};
    let currentPlotNumber = 1;
    let currentAreaIndex = 0;
    let currentBaf = 10;
    let currentLogRule = 'Doyle';
    let currentFormClass = 78;
    let currentGenerateGraphs = 'No';
    let currentSpeciesList = [];

    // --- Volume Tables (FC78 BASE) ---
    const DOYLE_FC78_VOLUMES = { /* ... unchanged ... */
        '10': { '0.5': 0, '1.0': 14, '1.5': 17, '2.0': 20, '2.5': 21, '3.0': 22 },'11': { '0.5': 0, '1.0': 22, '1.5': 27, '2.0': 32, '2.5': 35, '3.0': 38 },'12': { '0.5': 0, '1.0': 29, '1.5': 36, '2.0': 43, '2.5': 48, '3.0': 53, '3.5': 54, '4.0': 56 },'13': { '0.5': 0, '1.0': 38, '1.5': 48, '2.0': 59, '2.5': 66, '3.0': 73, '3.5': 76, '4.0': 80 },'14': { '0.5': 0, '1.0': 48, '1.5': 62, '2.0': 75, '2.5': 84, '3.0': 93, '3.5': 98, '4.0': 103 },'15': { '0.5': 0, '1.0': 60, '1.5': 78, '2.0': 96, '2.5': 108, '3.0': 121, '3.5': 128, '4.0': 136 },'16': { '0.5': 0, '1.0': 72, '1.5': 94, '2.0': 116, '2.5': 132, '3.0': 149, '3.5': 160, '4.0': 170 },'17': { '0.5': 0, '1.0': 86, '1.5': 113, '2.0': 140, '2.5': 161, '3.0': 182, '3.5': 196, '4.0': 209 },'18': { '0.5': 0, '1.0': 100, '1.5': 132, '2.0': 164, '2.5': 190, '3.0': 215, '3.5': 232, '4.0': 248 },'19': { '0.5': 0, '1.0': 118, '1.5': 156, '2.0': 195, '2.5': 225, '3.0': 256, '3.5': 276, '4.0': 297 },'20': { '0.5': 0, '1.0': 135, '1.5': 180, '2.0': 225, '2.5': 261, '3.0': 297, '3.5': 322, '4.0': 346, '4.5': 364, '5.0': 383 },'21': { '0.5': 0, '1.0': 154, '1.5': 207, '2.0': 260, '2.5': 302, '3.0': 344, '3.5': 374, '4.0': 404, '4.5': 428, '5.0': 452 },'22': { '0.5': 0, '1.0': 174, '1.5': 234, '2.0': 295, '2.5': 344, '3.0': 392, '3.5': 427, '4.0': 462, '4.5': 492, '5.0': 521 },'23': { '0.5': 0, '1.0': 195, '1.5': 264, '2.0': 332, '2.5': 388, '3.0': 444, '3.5': 483, '4.0': 522, '4.5': 558, '5.0': 594 },'24': { '0.5': 0, '1.0': 216, '1.5': 293, '2.0': 370, '2.5': 433, '3.0': 496, '3.5': 539, '4.0': 582, '4.5': 625, '5.0': 668 },'25': { '0.5': 0, '1.0': 241, '1.5': 328, '2.0': 414, '2.5': 486, '3.0': 558, '3.5': 609, '4.0': 660, '4.5': 709, '5.0': 758 },'26': { '0.5': 0, '1.0': 266, '1.5': 362, '2.0': 459, '2.5': 539, '3.0': 619, '3.5': 678, '4.0': 737, '4.5': 793, '5.0': 849 },'27': { '0.5': 0, '1.0': 292, '1.5': 398, '2.0': 505, '2.5': 594, '3.0': 684, '3.5': 749, '4.0': 814, '4.5': 877, '5.0': 940 },'28': { '0.5': 0, '1.0': 317, '1.5': 434, '2.0': 551, '2.5': 651, '3.0': 750, '3.5': 820, '4.0': 890, '4.5': 961, '5.0': 1032, '5.5': 1096, '6.0': 1161 },'29': { '0.5': 0, '1.0': 346, '1.5': 475, '2.0': 604, '2.5': 714, '3.0': 824, '3.5': 902, '4.0': 980, '4.5': 1061, '5.0': 1142, '5.5': 1218, '6.0': 1294 },'30': { '0.5': 0, '1.0': 376, '1.5': 517, '2.0': 658, '2.5': 778, '3.0': 898, '3.5': 984, '4.0': 1069, '4.5': 1160, '5.0': 1251, '5.5': 1339, '6.0': 1427 },'31': { '0.5': 0, '1.0': 408, '1.5': 562, '2.0': 717, '2.5': 850, '3.0': 983, '3.5': 1080, '4.0': 1176, '4.5': 1273, '5.0': 1370, '5.5': 1470, '6.0': 1570 },'32': { '0.5': 0, '1.0': 441, '1.5': 608, '2.0': 776, '2.5': 922, '3.0': 1068, '3.5': 1176, '4.0': 1283, '4.5': 1386, '5.0': 1488, '5.5': 1600, '6.0': 1712 },'33': { '0.5': 0, '1.0': 474, '1.5': 654, '2.0': 835, '2.5': 994, '3.0': 1152, '3.5': 1268, '4.0': 1385, '4.5': 1497, '5.0': 1609, '5.5': 1734, '6.0': 1858 },'34': { '0.5': 0, '1.0': 506, '1.5': 700, '2.0': 894, '2.5': 1064, '3.0': 1235, '3.5': 1361, '4.0': 1487, '4.5': 1608, '5.0': 1730, '5.5': 1866, '6.0': 2003 },'35': { '0.5': 0, '1.0': 544, '1.5': 754, '2.0': 964, '2.5': 1149, '3.0': 1334, '3.5': 1472, '4.0': 1610, '4.5': 1743, '5.0': 1876, '5.5': 2020, '6.0': 2163 },'36': { '0.5': 0, '1.0': 581, '1.5': 808, '2.0': 1035, '2.5': 1234, '3.0': 1434, '3.5': 1583, '4.0': 1732, '4.5': 1878, '5.0': 2023, '5.5': 2173, '6.0': 2323 },'37': { '0.5': 0, '1.0': 618, '1.5': 860, '2.0': 1102, '2.5': 1318, '3.0': 1534, '3.5': 1694, '4.0': 1854, '4.5': 2013, '5.0': 2172, '5.5': 2332, '6.0': 2492 },'38': { '0.5': 0, '1.0': 655, '1.5': 912, '2.0': 1170, '2.5': 1402, '3.0': 1635, '3.5': 1805, '4.0': 1975, '4.5': 2148, '5.0': 2322, '5.5': 2491, '6.0': 2660 },'39': { '0.5': 0, '1.0': 698, '1.5': 974, '2.0': 1250, '2.5': 1498, '3.0': 1746, '3.5': 1932, '4.0': 2118, '4.5': 2298, '5.0': 2479, '5.5': 2662, '6.0': 2844 },'40': { '0.5': 0, '1.0': 740, '1.5': 1035, '2.0': 1330, '2.5': 1594, '3.0': 1858, '3.5': 2059, '4.0': 2260, '4.5': 2448, '5.0': 2636, '5.5': 2832, '6.0': 3027 }
    };
    const SCRIBNER_FC78_VOLUMES = { /* ... unchanged ... */
        '10': { '1.0': 28, '1.5': 36, '2.0': 44, '2.5': 48, '3.0': 52 },'11': { '1.0': 38, '1.5': 49, '2.0': 60, '2.5': 67, '3.0': 74 },'12': { '1.0': 47, '1.5': 61, '2.0': 75, '2.5': 85, '3.0': 95, '3.5': 100, '4.0': 106 },'13': { '1.0': 58, '1.5': 76, '2.0': 94, '2.5': 107, '3.0': 120, '3.5': 128, '4.0': 136 },'14': { '1.0': 69, '1.5': 92, '2.0': 114, '2.5': 130, '3.0': 146, '3.5': 156, '4.0': 166 },'15': { '1.0': 82, '1.5': 109, '2.0': 136, '2.5': 157, '3.0': 178, '3.5': 192, '4.0': 206 },'16': { '1.0': 95, '1.5': 127, '2.0': 159, '2.5': 185, '3.0': 211, '3.5': 229, '4.0': 247 },'17': { '1.0': 109, '1.5': 146, '2.0': 184, '2.5': 215, '3.0': 246, '3.5': 268, '4.0': 289 },'18': { '1.0': 123, '1.5': 166, '2.0': 209, '2.5': 244, '3.0': 280, '3.5': 306, '4.0': 331 },'19': { '1.0': 140, '1.5': 190, '2.0': 240, '2.5': 281, '3.0': 322, '3.5': 352, '4.0': 382 },'20': { '1.0': 157, '1.5': 214, '2.0': 270, '2.5': 317, '3.0': 364, '3.5': 398, '4.0': 432, '4.5': 459, '5.0': 486 },'21': { '1.0': 176, '1.5': 240, '2.0': 304, '2.5': 358, '3.0': 411, '3.5': 450, '4.0': 490, '4.5': 523, '5.0': 556 },'22': { '1.0': 194, '1.5': 266, '2.0': 338, '2.5': 398, '3.0': 458, '3.5': 504, '4.0': 549, '4.5': 588, '5.0': 626 },'23': { '1.0': 214, '1.5': 294, '2.0': 374, '2.5': 441, '3.0': 508, '3.5': 558, '4.0': 607, '4.5': 652, '5.0': 698 },'24': { '1.0': 234, '1.5': 322, '2.0': 409, '2.5': 484, '3.0': 558, '3.5': 611, '4.0': 665, '4.5': 718, '5.0': 770 },'25': { '1.0': 258, '1.5': 355, '2.0': 452, '2.5': 534, '3.0': 617, '3.5': 678, '4.0': 740, '4.5': 799, '5.0': 858 },'26': { '1.0': 281, '1.5': 388, '2.0': 494, '2.5': 585, '3.0': 676, '3.5': 745, '4.0': 814, '4.5': 880, '5.0': 945 },'27': { '1.0': 304, '1.5': 420, '2.0': 536, '2.5': 636, '3.0': 736, '3.5': 811, '4.0': 886, '4.5': 959, '5.0': 1032 },'28': { '1.0': 327, '1.5': 452, '2.0': 578, '2.5': 686, '3.0': 795, '3.5': 877, '4.0': 959, '4.5': 1040, '5.0': 1120, '5.5': 1190, '6.0': 1261 },'29': { '1.0': 354, '1.5': 491, '2.0': 628, '2.5': 746, '3.0': 864, '3.5': 953, '4.0': 1042, '4.5': 1132, '5.0': 1222, '5.5': 1306, '6.0': 1389 },'30': { '1.0': 382, '1.5': 530, '2.0': 678, '2.5': 806, '3.0': 933, '3.5': 1028, '4.0': 1124, '4.5': 1224, '5.0': 1325, '5.5': 1421, '6.0': 1517 },'31': { '1.0': 411, '1.5': 571, '2.0': 731, '2.5': 871, '3.0': 1011, '3.5': 1117, '4.0': 1223, '4.5': 1328, '5.0': 1434, '5.5': 1541, '6.0': 1648 },'32': { '1.0': 440, '1.5': 612, '2.0': 784, '2.5': 936, '3.0': 1089, '3.5': 1206, '4.0': 1322, '4.5': 1432, '5.0': 1543, '5.5': 1661, '6.0': 1779 },'33': { '1.0': 469, '1.5': 654, '2.0': 838, '2.5': 1001, '3.0': 1164, '3.5': 1280, '4.0': 1414, '4.5': 1534, '5.0': 1654, '5.5': 1783, '6.0': 1912 },'34': { '1.0': 487, '1.5': 695, '2.0': 892, '2.5': 1066, '3.0': 1239, '3.5': 1373, '4.0': 1507, '4.5': 1636, '5.0': 1766, '5.5': 1906, '6.0': 2046 },'35': { '1.0': 530, '1.5': 742, '2.0': 954, '2.5': 1141, '3.0': 1328, '3.5': 1473, '4.0': 1618, '4.5': 1757, '5.0': 1896, '5.5': 2044, '6.0': 2192 },'36': { '1.0': 563, '1.5': 789, '2.0': 1015, '2.5': 1216, '3.0': 1416, '3.5': 1572, '4.0': 1728, '4.5': 1877, '5.0': 2026, '5.5': 2182, '6.0': 2338 },'37': { '1.0': 596, '1.5': 836, '2.0': 1075, '2.5': 1290, '3.0': 1506, '3.5': 1670, '4.0': 1835, '4.5': 1998, '5.0': 2160, '5.5': 2324, '6.0': 2488 },'38': { '1.0': 629, '1.5': 882, '2.0': 1135, '2.5': 1366, '3.0': 1596, '3.5': 1769, '4.0': 1942, '4.5': 2118, '5.0': 2295, '5.5': 2466, '6.0': 2637 },'39': { '1.0': 666, '1.5': 935, '2.0': 1204, '2.5': 1449, '3.0': 1694, '3.5': 1881, '4.0': 2068, '4.5': 2251, '5.0': 2434, '5.5': 2616, '6.0': 2799 },'40': { '1.0': 703, '1.5': 988, '2.0': 1274, '2.5': 1532, '3.0': 1791, '3.5': 1993, '4.0': 2195, '4.5': 2384, '5.0': 2574, '5.5': 2768, '6.0': 2961 }
    };
    const INTERNATIONAL_FC78_VOLUMES = { /* ... unchanged ... */
        '10': { '1.0': 36, '1.5': 48, '2.0': 59, '2.5': 66, '3.0': 73 },'11': { '1.0': 46, '1.5': 61, '2.0': 76, '2.5': 86, '3.0': 96 },'12': { '1.0': 56, '1.5': 74, '2.0': 92, '2.5': 106, '3.0': 120, '3.5': 128, '4.0': 137 },'13': { '1.0': 67, '1.5': 90, '2.0': 112, '2.5': 130, '3.0': 147, '3.5': 158, '4.0': 168 },'14': { '1.0': 78, '1.5': 105, '2.0': 132, '2.5': 153, '3.0': 174, '3.5': 187, '4.0': 200 },'15': { '1.0': 92, '1.5': 124, '2.0': 156, '2.5': 182, '3.0': 208, '3.5': 225, '4.0': 242 },'16': { '1.0': 106, '1.5': 143, '2.0': 180, '2.5': 210, '3.0': 241, '3.5': 263, '4.0': 285 },'17': { '1.0': 121, '1.5': 164, '2.0': 206, '2.5': 242, '3.0': 278, '3.5': 304, '4.0': 330 },'18': { '1.0': 136, '1.5': 184, '2.0': 233, '2.5': 274, '3.0': 314, '3.5': 344, '4.0': 374 },'19': { '1.0': 154, '1.5': 209, '2.0': 264, '2.5': 311, '3.0': 358, '3.5': 392, '4.0': 427 },'20': { '1.0': 171, '1.5': 234, '2.0': 296, '2.5': 348, '3.0': 401, '3.5': 440, '4.0': 480, '4.5': 511, '5.0': 542 },'21': { '1.0': 191, '1.5': 262, '2.0': 332, '2.5': 391, '3.0': 450, '3.5': 496, '4.0': 542, '4.5': 579, '5.0': 616 },'22': { '1.0': 211, '1.5': 289, '2.0': 357, '2.5': 434, '3.0': 499, '3.5': 552, '4.0': 593, '4.5': 646, '5.0': 681 },'23': { '1.0': 231, '1.5': 317, '2.0': 404, '2.5': 467, '3.0': 552, '3.5': 608, '4.0': 663, '4.5': 714, '5.0': 766 },'24': { '1.0': 251, '1.5': 345, '2.0': 441, '2.5': 523, '3.0': 605, '3.5': 664, '4.0': 723, '4.5': 782, '5.0': 840 },'25': { '1.0': 275, '1.5': 380, '2.0': 484, '2.5': 574, '3.0': 665, '3.5': 732, '4.0': 800, '4.5': 865, '5.0': 930 },'26': { '1.0': 299, '1.5': 414, '2.0': 528, '2.5': 626, '3.0': 725, '3.5': 801, '4.0': 877, '4.5': 949, '5.0': 1021 },'27': { '1.0': 323, '1.5': 448, '2.0': 572, '2.5': 680, '3.0': 788, '3.5': 870, '4.0': 952, '4.5': 1032, '5.0': 1111 },'28': { '1.0': 347, '1.5': 482, '2.0': 616, '2.5': 733, '3.0': 850, '3.5': 938, '4.0': 1027, '4.5': 1114, '5.0': 1201, '5.5': 1280, '6.0': 1358 },'29': { '1.0': 375, '1.5': 521, '2.0': 667, '2.5': 794, '3.0': 920, '3.5': 1016, '4.0': 1112, '4.5': 1210, '5.0': 1308, '5.5': 1398, '6.0': 1488 },'30': { '1.0': 403, '1.5': 560, '2.0': 718, '2.5': 854, '3.0': 991, '3.5': 1094, '4.0': 1198, '4.5': 1306, '5.0': 1415, '5.5': 1517, '6.0': 1619 },'31': { '1.0': 432, '1.5': 602, '2.0': 772, '2.5': 921, '3.0': 1070, '3.5': 1184, '4.0': 1299, '4.5': 1412, '5.0': 1526, '5.5': 1640, '6.0': 1754 },'32': { '1.0': 462, '1.5': 644, '2.0': 826, '2.5': 988, '3.0': 1149, '3.5': 1274, '4.0': 1400, '4.5': 1518, '5.0': 1637, '5.5': 1762, '6.0': 1888 },'33': { '1.0': 492, '1.5': 686, '2.0': 880, '2.5': 1053, '3.0': 1226, '3.5': 1360, '4.0': 1495, '4.5': 1622, '5.0': 1750, '5.5': 1888, '6.0': 2026 },'34': { '1.0': 521, '1.5': 728, '2.0': 934, '2.5': 1119, '3.0': 1304, '3.5': 1447, '4.0': 1590, '4.5': 1727, '5.0': 1864, '5.5': 2014, '6.0': 2163 },'35': { '1.0': 555, '1.5': 776, '2.0': 998, '2.5': 1196, '3.0': 1394, '3.5': 1548, '4.0': 1702, '4.5': 1851, '5.0': 2000, '5.5': 2156, '6.0': 2312 },'36': { '1.0': 589, '1.5': 826, '2.0': 1063, '2.5': 1274, '3.0': 1485, '3.5': 1650, '4.0': 1814, '4.5': 1974, '5.0': 2135, '5.5': 2298, '6.0': 2461 },'37': { '1.0': 622, '1.5': 873, '2.0': 1124, '2.5': 1351, '3.0': 1578, '3.5': 1752, '4.0': 1926, '4.5': 2099, '5.0': 2272, '5.5': 2444, '6.0': 2616 },'38': { '1.0': 656, '1.5': 921, '2.0': 1186, '2.5': 1428, '3.0': 1670, '3.5': 1854, '4.0': 2038, '4.5': 2224, '5.0': 2410, '5.5': 2590, '6.0': 2771 },'39': { '1.0': 694, '1.5': 976, '2.0': 1258, '2.5': 1514, '3.0': 1769, '3.5': 1968, '4.0': 2166, '4.5': 2359, '5.0': 2552, '5.5': 2744, '6.0': 2937 },'40': { '1.0': 731, '1.5': 1030, '2.0': 1329, '2.5': 1598, '3.0': 1868, '3.5': 2081, '4.0': 2294, '4.5': 2494, '5.0': 2693, '5.5': 2898, '6.0': 3103 }
    };


    // --- Function Definitions ---

    // --- General Utility Functions ---
    function showFeedbackMessage(element, message, isError = false, duration = 2500, timeoutVar) {
        if (!element) return timeoutVar;
        if (timeoutVar) clearTimeout(timeoutVar);
        element.textContent = message;
        element.className = isError ? 'feedback-message error' : 'feedback-message';
        element.style.display = 'block';
        void element.offsetWidth;
        element.style.opacity = 1;
        return setTimeout(() => {
            element.style.opacity = 0;
            setTimeout(() => { element.style.display = 'none'; }, 500);
        }, duration);
    }
    function showFeedback(message, isError = false, duration = 2500) { feedbackTimeout = showFeedbackMessage(feedbackMsg, message, isError, duration, feedbackTimeout); }
    function showSettingsFeedback(message, isError = false, duration = 2000) { settingsFeedbackTimeout = showFeedbackMessage(settingsFeedback, message, isError, duration, settingsFeedbackTimeout); }
    function showSpeciesFeedback(message, isError = false, duration = 2500) { speciesFeedbackTimeout = showFeedbackMessage(speciesMgmtFeedback, message, isError, duration, speciesFeedbackTimeout); }
    function showProjectFeedback(message, isError = false, duration = 3000) { projectFeedbackTimeout = showFeedbackMessage(projectMgmtFeedback, message, isError, duration, projectFeedbackTimeout); }

    // --- Session Data Management ---
    function saveSessionData() {
        try {
            const sessionState = { data: collectedData, plot: currentPlotNumber, areaIdx: currentAreaIndex };
            if (collectedData.length > 0) { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionState)); }
            else { localStorage.removeItem(STORAGE_KEY); }
        } catch (e) { console.error('[Session] Error saving data:', e); }
    }
    function loadAndPromptSessionData() {
        try {
            const savedSessionJSON = localStorage.getItem(STORAGE_KEY);
            if (savedSessionJSON) {
                const recoveredSession = JSON.parse(savedSessionJSON);
                const recoveredData = recoveredSession?.data;
                if (Array.isArray(recoveredData) && recoveredData.length > 0) {
                    const lastPlot = recoveredSession?.plot ?? 1;
                    const lastAreaIndex = recoveredSession?.areaIdx ?? 0;
                    const numEntries = recoveredData.length;
                    const entryWord = numEntries === 1 ? 'entry' : 'entries';
                    const lastAreaLetter = areaLetters[lastAreaIndex];
                    if (confirm(`Recover ${numEntries} unsaved ${entryWord} from the last session? (Last Plot: ${lastPlot}, Last Area: ${lastAreaLetter})`)) {
                        collectedData = recoveredData;
                        currentPlotNumber = lastPlot;
                        currentAreaIndex = lastAreaIndex;
                        console.log('[Session] Data recovered.');
                    } else {
                        localStorage.removeItem(STORAGE_KEY); console.log('[Session] Recovery declined.');
                        currentPlotNumber = 1; currentAreaIndex = 0;
                    }
                } else {
                    localStorage.removeItem(STORAGE_KEY); currentPlotNumber = 1; currentAreaIndex = 0;
                    console.log('[Session] Invalid/empty session data found.');
                }
            } else {
                currentPlotNumber = 1; currentAreaIndex = 0; console.log('[Session] No session data found.');
            }
        } catch (e) {
            console.error('[Session] Error loading session data:', e);
            localStorage.removeItem(STORAGE_KEY); currentPlotNumber = 1; currentAreaIndex = 0;
        }
        updatePlotDisplay(); updateAreaDisplay(); renderEntries();
    }
    function updateFormClassVisibility() {
        if (!logRuleSelect || !formClassGroup) return; // Safety check
        const selectedRule = logRuleSelect.value;
        formClassGroup.hidden = (selectedRule !== 'Doyle');
        // Optional: log state for debugging
        // console.log(`Log Rule changed to: ${selectedRule}. Form Class Group hidden: ${formClassGroup.hidden}`);
    }
    // --- Settings Functions ---
    function saveSettings() {
        try {
            const settings = { baf: currentBaf, logRule: currentLogRule, formClass: currentFormClass, generateGraphs: currentGenerateGraphs };
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
            console.log("[Settings] Saved:", settings);
        } catch (e) { console.error('[Settings] Error saving:', e); showSettingsFeedback("Error saving settings!", true); }
    }
    function loadSettings() {
        try {
            const storedSettingsJSON = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (storedSettingsJSON) {
                const storedSettings = JSON.parse(storedSettingsJSON);
                if (storedSettings && typeof storedSettings === 'object') {
                    currentBaf = parseInt(storedSettings.baf, 10) || 10;
                    currentLogRule = ['Doyle', 'Scribner', 'International'].includes(storedSettings.logRule) ? storedSettings.logRule : 'Doyle';
                    currentFormClass = parseInt(storedSettings.formClass, 10) || 78;
                    if (!VALID_DOYLE_FORM_CLASSES.includes(currentFormClass)) currentFormClass = 78; // Validate loaded FC using constant
                 currentGenerateGraphs = storedSettings.generateGraphs === 'Yes' ? 'Yes' : 'No';
                 console.log("[Settings] Loaded:", { baf: currentBaf, logRule: currentLogRule, formClass: currentFormClass, generateGraphs: currentGenerateGraphs });
                    if (bafSelect) bafSelect.value = String(currentBaf);
                    if (logRuleSelect) logRuleSelect.value = currentLogRule;
                    if (formClassSelect) formClassSelect.value = String(currentFormClass);
                    if (generateGraphsSelect) generateGraphsSelect.value = currentGenerateGraphs;
                } else { applyDefaultSettings(); }
            } else { applyDefaultSettings(); }
        } catch (e) { console.error('[Settings] Error loading:', e); applyDefaultSettings(); }
        if(settingsSection) settingsSection.hidden = true;
        if(toggleSettingsBtn) toggleSettingsBtn.setAttribute('aria-expanded', 'false');
    }
    function applyDefaultSettings() {
        console.log("[Settings] Applying default settings.");
        currentBaf = 10; currentLogRule = 'Doyle'; currentFormClass = 78; currentGenerateGraphs = 'No';
        if (bafSelect) bafSelect.value = '10';
        if (logRuleSelect) logRuleSelect.value = 'Doyle';
        if (formClassSelect) formClassSelect.value = '78';
        if (generateGraphsSelect) generateGraphsSelect.value = 'No';
        saveSettings();
    }

    // --- Species Management Functions ---
    function saveSpeciesList() { try { localStorage.setItem(SPECIES_STORAGE_KEY, JSON.stringify(currentSpeciesList)); console.log("[Species] List saved."); } catch (e) { console.error('[Species] Error saving list:', e); showSpeciesFeedback("Error saving species list!", true); } }
    function populateSpeciesDropdowns() { if (!speciesSelect || !removeSpeciesSelect) return; const currentVal = speciesSelect.value; speciesSelect.innerHTML = ''; removeSpeciesSelect.innerHTML = ''; currentSpeciesList.sort((a, b) => a.localeCompare(b)).forEach(species => { const optM = document.createElement('option'); optM.value = optM.textContent = species; speciesSelect.appendChild(optM); const optR = document.createElement('option'); optR.value = optR.textContent = species; removeSpeciesSelect.appendChild(optR); }); if (currentSpeciesList.includes(currentVal)) { speciesSelect.value = currentVal; } else if (speciesSelect.options.length > 0) { speciesSelect.selectedIndex = 0; } }
    function initializeSpeciesManagement() { try { const storedJSON = localStorage.getItem(SPECIES_STORAGE_KEY); if (storedJSON) { const stored = JSON.parse(storedJSON); if (Array.isArray(stored) && stored.every(s => typeof s === 'string')) { currentSpeciesList = stored; console.log("[Species] Loaded list."); } else { console.warn("[Species] Invalid stored list, using defaults."); currentSpeciesList = [...DEFAULT_SPECIES]; saveSpeciesList(); } } else { console.log("[Species] No list found, using defaults."); currentSpeciesList = [...DEFAULT_SPECIES]; saveSpeciesList(); } } catch (e) { console.error('[Species] Error loading list:', e); currentSpeciesList = [...DEFAULT_SPECIES]; } populateSpeciesDropdowns(); if (speciesManagementSection) speciesManagementSection.hidden = true; if(toggleSpeciesMgmtBtn) toggleSpeciesMgmtBtn.setAttribute('aria-expanded', 'false'); }

    // --- Project Management Functions ---
    function saveProjectsToStorage() { try { localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(savedProjects)); console.log("[Project] Projects saved."); } catch (e) { console.error('[Project] Error saving projects:', e); showProjectFeedback("Error saving projects!", true); } }
    function populateLoadProjectDropdown() { if (!loadProjectSelect) return; const currentVal = loadProjectSelect.value; loadProjectSelect.innerHTML = '<option value="">-- Select a project --</option>'; const names = Object.keys(savedProjects).sort((a, b) => a.localeCompare(b)); names.forEach(name => { const opt = document.createElement('option'); opt.value = opt.textContent = name; loadProjectSelect.appendChild(opt); }); const hasProj = names.length > 0; if(loadProjectBtn) loadProjectBtn.disabled = !hasProj; if(deleteProjectBtn) deleteProjectBtn.disabled = !hasProj; loadProjectSelect.disabled = !hasProj; if (names.includes(currentVal)) loadProjectSelect.value = currentVal; }
    function initializeProjectManagement() { try { const storedJSON = localStorage.getItem(PROJECTS_STORAGE_KEY); if (storedJSON) { const parsed = JSON.parse(storedJSON); if (typeof parsed === 'object' && parsed !== null) { savedProjects = parsed; console.log("[Project] Loaded projects."); } else { console.warn("[Project] Invalid stored projects, initializing."); savedProjects = {}; saveProjectsToStorage(); } } else { console.log("[Project] No saved projects found."); savedProjects = {}; } } catch (e) { console.error('[Project] Error loading projects:', e); savedProjects = {}; } populateLoadProjectDropdown(); if(projectManagementSection) projectManagementSection.hidden = true; if(toggleProjectMgmtBtn) toggleProjectMgmtBtn.setAttribute('aria-expanded', 'false'); }

    // --- UI Population & Updates ---
    function updatePlotNumberAndAreaFromData() {
        let lastValidPlot = null; let lastValidAreaIndex = null;
        if (collectedData.length > 0) {
            for (let i = collectedData.length - 1; i >= 0; i--) {
                if (collectedData[i]?.plotNumber && lastValidPlot === null) { const plot = parseInt(collectedData[i].plotNumber, 10); if (!isNaN(plot) && plot >= MIN_PLOT_NUMBER && plot <= MAX_PLOT_NUMBER) { lastValidPlot = plot; } }
                if (collectedData[i]?.areaLetter && lastValidAreaIndex === null) { const areaIdx = areaLetters.indexOf(collectedData[i].areaLetter); if (areaIdx !== -1) { lastValidAreaIndex = areaIdx; } }
                if (lastValidPlot !== null && lastValidAreaIndex !== null) break;
            }
        }
        currentPlotNumber = lastValidPlot !== null ? lastValidPlot : 1; currentAreaIndex = lastValidAreaIndex !== null ? lastValidAreaIndex : 0;
        updatePlotDisplay(); updateAreaDisplay();
    }
    function populateDbhOptions() { if (!dbhSelect) return; dbhSelect.innerHTML = ''; for (let i = 4; i <= 40; i += 2) { const opt = document.createElement('option'); opt.value = opt.textContent = String(i); dbhSelect.appendChild(opt); } if (dbhSelect.options.length > 0) dbhSelect.selectedIndex = 0; }
    function populateLogsOptions() { if (!logsSelect) return; logsSelect.innerHTML = ''; const vals = ["0", "0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5", "5.5", "6", "Cull"]; vals.forEach(v => { const opt = document.createElement('option'); opt.value = opt.textContent = v; logsSelect.appendChild(opt); }); if (logsSelect.options.length > 0) logsSelect.selectedIndex = 0; }
    function checkAndSetLogsForDbh() { if (currentLogRule === 'Doyle' && dbhSelect && logsSelect) { const selectedDbh = dbhSelect.value; const dbhResetVals = ['4', '6', '8', '10']; if (dbhResetVals.includes(selectedDbh) && logsSelect.value !== '0' && logsSelect.value !== 'Cull') { const currentLogsNum = parseFloat(logsSelect.value); if (!isNaN(currentLogsNum) && currentLogsNum > 0) { logsSelect.value = '0'; console.log(`Doyle Rule: DBH ${selectedDbh} -> Logs forced to 0.`); showFeedback(`Logs set to 0 for DBH ${selectedDbh} (Doyle)`, false, 1500); } } } }
    function updatePlotDisplay() { if(plotNumberDisplay) plotNumberDisplay.textContent = currentPlotNumber; if(plotDecrementBtn) plotDecrementBtn.disabled = (currentPlotNumber <= MIN_PLOT_NUMBER); if(plotIncrementBtn) plotIncrementBtn.disabled = (currentPlotNumber >= MAX_PLOT_NUMBER); }
    function updateAreaDisplay() { const currentLetter = areaLetters[currentAreaIndex]; if(areaLetterDisplay) areaLetterDisplay.textContent = currentLetter; if(areaDecrementBtn) areaDecrementBtn.disabled = (currentAreaIndex <= 0); if(areaIncrementBtn) areaIncrementBtn.disabled = (currentAreaIndex >= areaLetters.length - 1); }
    function renderEntries() {
        if (!entriesTableBody || !entryCountSpan || !noEntriesRow || !saveCsvBtn || !viewTallyBtn || !deleteAllBtn || !deleteBtn) return;
        entriesTableBody.innerHTML = ''; entryCountSpan.textContent = collectedData.length; const hasData = collectedData.length > 0; noEntriesRow.hidden = hasData;
        if (hasData) {
            collectedData.forEach((entry, index) => { if (!entry.id) { entry.id = Date.now() + index; console.warn("Assigned temporary ID to entry:", entry); } });
            for (let i = collectedData.length - 1; i >= 0; i--) { const entry = collectedData[i]; if (!entry) continue; const tr = document.createElement('tr'); tr.innerHTML = `<td><input type="checkbox" data-id="${entry.id}"></td><td>${entry.plotNumber ?? '?'}</td><td>${entry.areaLetter ?? '?'}</td><td>${entry.species ?? 'N/A'}</td><td>${entry.dbh ?? '?'}</td><td>${entry.logs ?? '?'}</td><td>${entry.cutStatus || 'No'}</td>`; entriesTableBody.appendChild(tr); }
        }
        saveCsvBtn.disabled = !hasData; viewTallyBtn.disabled = !hasData; deleteAllBtn.disabled = !hasData; deleteBtn.disabled = !isAnyCheckboxChecked();
        updatePlotNumberAndAreaFromData(); calculateAndDisplayNeededPlots();
    }
    function isAnyCheckboxChecked() { return entriesTableBody && entriesTableBody.querySelector('input[type="checkbox"]:checked') !== null; }

    // --- CSV Parsing Function (Simplified) ---
    function parseCsvAndLoadData(csvContent) {
        const lines = csvContent.split(/\r?\n/); let headerIndex = -1; let headers = [];
        const expectedHeaderStart = 'plotnumber,dbh,species';
        for(let i = 0; i < lines.length; i++) { const cleanLine = lines[i].trim().toLowerCase().replace(/\s/g, ''); if (cleanLine.startsWith(expectedHeaderStart)) { headerIndex = i; headers = lines[i].trim().split(',').map(h => h.trim().toLowerCase()); break; } }
        if (headerIndex === -1) throw new Error("CSV header 'PlotNumber,DBH,Species...' not found.");
        const idx = { p: headers.indexOf('plotnumber'), d: headers.indexOf('dbh'), sp: headers.indexOf('species'), l: headers.indexOf('logs'), c: headers.indexOf('cut'), n: headers.indexOf('notes'), lat: headers.indexOf('latitude'), lon: headers.indexOf('longitude') };
        const requiredIndices = [idx.p, idx.d, idx.sp, idx.l, idx.c]; if (requiredIndices.some(i => i === -1)) { throw new Error("CSV missing required columns (PlotNumber, DBH, Species, Logs, Cut)."); }
        const parsedData = []; const requiredColsCount = Math.max(...requiredIndices, idx.n, idx.lat, idx.lon) + 1;
        for (let i = headerIndex + 1; i < lines.length; i++) {
            const line = lines[i].trim(); if (!line || line.startsWith('---') || line.startsWith(',') || line.toLowerCase().startsWith('species,dbh,logs,cut status,count')) continue;
            const values = []; let currentVal = ''; let inQuotes = false;
            for (let j = 0; j < line.length; j++) { const char = line[j]; const nextChar = line[j+1]; if (char === '"' && inQuotes && nextChar === '"') { currentVal += '"'; j++; } else if (char === '"') { inQuotes = !inQuotes; } else if (char === ',' && !inQuotes) { values.push(currentVal.trim()); currentVal = ''; } else { currentVal += char; } } values.push(currentVal.trim());
            if (values.length < requiredIndices.length) { console.warn(`Skipping malformed row ${i + 1}. Not enough required columns.`); continue; }
            try {
                const plotNumStr = values[idx.p]; const dbhStr = values[idx.d]; const specStr = values[idx.sp]; const logsStr = values[idx.l]; const cutStr = (values[idx.c] || 'No').trim();
                const notesStr = idx.n > -1 ? (values[idx.n] || '') : ''; const latStr = idx.lat > -1 ? values[idx.lat] : null; const lonStr = idx.lon > -1 ? values[idx.lon] : null;
                if (!plotNumStr || !dbhStr || !specStr || !logsStr || !cutStr) { console.warn(`Skipping row ${i + 1}: Missing essential fields.`); continue; }
                const plotNum = parseInt(plotNumStr, 10); if (isNaN(plotNum)) { console.warn(`Skipping row ${i + 1}: PlotNumber NaN ('${plotNumStr}').`); continue; }
                const lat = latStr !== null && latStr !== '' ? parseFloat(latStr) : null; const lon = lonStr !== null && lonStr !== '' ? parseFloat(lonStr) : null;
                parsedData.push({ id: Date.now() + i, plotNumber: plotNum, dbh: dbhStr, species: specStr, logs: logsStr, cutStatus: cutStr.toLowerCase() === 'yes' ? 'Yes' : 'No', notes: notesStr, location: (lat !== null && lon !== null && !isNaN(lat) && !isNaN(lon)) ? { lat: lat, lon: lon } : null });
            } catch (parseError) { console.warn(`Skipping row ${i + 1} due to parsing error:`, parseError); }
        }
        console.log(`CSV Parsed. ${parsedData.length} entries found.`); return parsedData;
    }

    // --- Tally Logic ---
    function generateTallyData(dataSubset) {
        const tally = {}; try { dataSubset.forEach((entry) => { if (!entry) return; const { species, dbh, logs, cutStatus } = entry; if (!species || !dbh || !logs || !cutStatus) return; const kS=String(species), kD=String(dbh), kL=String(logs), kC=String(cutStatus); if (!tally[kS]) tally[kS]={}; if (!tally[kS][kD]) tally[kS][kD]={}; if (!tally[kS][kD][kL]) tally[kS][kD][kL]={}; if (!tally[kS][kD][kL][kC]) tally[kS][kD][kL][kC]=0; tally[kS][kD][kL][kC]++; }); } catch (error) { console.error("Tally Gen Error:", error); } return tally;
    }
    function displayTallyResults(tallyData) { if(!tallyResultsContainer) return; tallyResultsContainer.innerHTML = ''; try { const speciesKeys = Object.keys(tallyData).sort(); if (speciesKeys.length === 0) { tallyResultsContainer.innerHTML = '<p class="no-tally-data">No data to tally.</p>'; return; } speciesKeys.forEach(species => { const speciesDiv = document.createElement('div'); speciesDiv.classList.add('tally-species'); speciesDiv.innerHTML = `<h3>${species}</h3>`; const dbhKeys = Object.keys(tallyData[species]).sort((a,b) => Number(a)-Number(b)); dbhKeys.forEach(dbh => { speciesDiv.innerHTML += `<h4>DBH: ${dbh}</h4>`; const logKeys = Object.keys(tallyData[species][dbh]).sort((a,b) => { if(a==='Cull') return 1; if(b==='Cull') return -1; const nA=parseFloat(a),nB=parseFloat(b); return isNaN(nA)?1:isNaN(nB)?-1:nA-nB; }); logKeys.forEach(logs => { const counts = tallyData[species][dbh][logs]; const cut = counts['Yes']||0; const notCut = counts['No']||0; if (cut > 0) { const div=document.createElement('div'); div.classList.add('tally-log-item'); div.innerHTML = `<span class="log-label">Logs: ${logs} (Cut) - </span><span class="log-count">Count: ${cut}</span>`; speciesDiv.appendChild(div); } if (notCut > 0) { const div=document.createElement('div'); div.classList.add('tally-log-item'); div.innerHTML = `<span class="log-label">Logs: ${logs} (Not Cut) - </span><span class="log-count">Count: ${notCut}</span>`; speciesDiv.appendChild(div); } }); }); tallyResultsContainer.appendChild(speciesDiv); }); } catch (error) { console.error("Tally Display Error:", error); tallyResultsContainer.innerHTML = `<p class="no-tally-data" style="color: red;">Error displaying tally.</p>`; } }

    // --- Forestry Report Calculation Logic ---
    function getTreeVolume(dbhStr, logsStr, logRule, formClass = 78) {
        try {
            const dbhInt = parseInt(dbhStr, 10); if (isNaN(dbhInt) || dbhInt < 10) return 0;
            const dbhKey = String(dbhInt); if (logsStr === 'Cull') return 0;
            const logsNum = parseFloat(logsStr); if (isNaN(logsNum) || logsNum <= 0) return 0;
            let logsKey = (Math.floor(logsNum * 2) / 2).toFixed(1);
            if (parseFloat(logsKey) <= 0 && logsNum > 0) logsKey = '0.5'; else if (parseFloat(logsKey) <= 0) return 0;
            let baseTable = null;
            switch (logRule) { case 'Doyle': baseTable = DOYLE_FC78_VOLUMES; break; case 'Scribner': baseTable = SCRIBNER_FC78_VOLUMES; break; case 'International': baseTable = INTERNATIONAL_FC78_VOLUMES; break; default: return 0; }
            let volume = 0; const dbhEntry = baseTable?.[dbhKey];
            if (dbhEntry && dbhEntry.hasOwnProperty(logsKey)) {
                const baseVol = dbhEntry[logsKey];
                if (baseVol === undefined || baseVol === null || baseVol <= 0) { volume = 0; }
                else if (logRule === 'Doyle') { let fcInt = parseInt(formClass, 10); if (isNaN(fcInt) || !VALID_DOYLE_FORM_CLASSES.includes(fcInt)) fcInt = 78; volume = (fcInt === 78) ? baseVol : Math.round(baseVol * (fcInt / 78.0)); }
                else { volume = baseVol; }
            }
            return volume > 0 ? volume : 0;
        } catch (e) { console.error(`getTreeVolume Error (DBH: ${dbhStr}, Logs: ${logsStr}, Rule: ${logRule}, FC: ${formClass}):`, e); return 0; }
    }
    function getDbhClass(dbh) { const numDbh = parseFloat(dbh); if (isNaN(numDbh)) return 'Invalid'; if (numDbh >= 2 && numDbh <= 5.9) return 'Sapling'; if (numDbh >= 6 && numDbh <= 11.9) return 'Poletimber'; if (numDbh >= 12 && numDbh <= 17.9) return 'Small Sawtimber'; if (numDbh >= 18 && numDbh <= 23.9) return 'Medium Sawtimber'; if (numDbh >= 24) return 'Large Sawtimber'; return 'Other'; }
    function calculateForestryReport(dataSubset, baf, logRule, formClass) {
        console.log(`Calculating report for subset: ${dataSubset.length} entries, BAF=${baf}, Rule=${logRule}, FC=${formClass}`);
        const report = { summary: {}, standDistribution: {}, speciesSummary1: {}, speciesSummary2: {} };
        if (!dataSubset || dataSubset.length === 0) return report;
        const plotNums = new Set(dataSubset.map(e => e?.plotNumber).filter(p => p != null && !isNaN(parseInt(p, 10))));
        const numPlots = plotNums.size;
        if (numPlots === 0) { report.summary = { numberOfPlots: 0, error: "No valid plot numbers found in this subset." }; console.warn("No valid plots found for subset report calculation."); return report; }
        let totTrees = 0, cutTrees = 0, totTpaSum = 0, totVolSum = 0, cutTpaSum = 0, cutVolSum = 0;
        const specData = {}; const clsData = { 'Sapling':{s:0,c:0,t:0,v:0,ct:0},'Poletimber':{s:0,c:0,t:0,v:0,ct:0},'Small Sawtimber':{s:0,c:0,t:0,v:0,ct:0},'Medium Sawtimber':{s:0,c:0,t:0,v:0,ct:0},'Large Sawtimber':{s:0,c:0,t:0,v:0,ct:0},'Other':{s:0,c:0,t:0,v:0,ct:0},'Invalid':{s:0,c:0,t:0,v:0,ct:0} };
        dataSubset.forEach((entry) => { if (!entry) return; const dbh = parseFloat(entry.dbh); const spec = entry.species; const isCut = entry.cutStatus === 'Yes'; if (isNaN(dbh) || dbh <= 0 || !spec || spec.trim() === "") { clsData['Invalid'].s++; if (isCut) clsData['Invalid'].c++; return; } const dbhCls = getDbhClass(dbh); totTrees++; if (isCut) cutTrees++; const baT = BA_CONST * Math.pow(dbh, 2); const tpaT = (baT > 0) ? (baf / baT) : 0; const volT = getTreeVolume(entry.dbh, entry.logs, logRule, formClass); const vpaT = volT * tpaT; totTpaSum += tpaT; totVolSum += vpaT; if (isCut) { cutTpaSum += tpaT; cutVolSum += vpaT; } if (!specData[spec]) { specData[spec] = { s: 0, c: 0, t: 0, v: 0, vS: 0, vM: 0, vL: 0, tpaSap: 0, tpaPole: 0, tpaSaw: 0 }; } specData[spec].s++; specData[spec].t += tpaT; specData[spec].v += vpaT; if (isCut) specData[spec].c++; if (dbhCls === 'Small Sawtimber') specData[spec].vS += vpaT; else if (dbhCls === 'Medium Sawtimber') specData[spec].vM += vpaT; else if (dbhCls === 'Large Sawtimber') specData[spec].vL += vpaT; if (dbhCls === 'Sapling') specData[spec].tpaSap += tpaT; else if (dbhCls === 'Poletimber') specData[spec].tpaPole += tpaT; else if (dbhCls.includes('Sawtimber')) specData[spec].tpaSaw += tpaT; if (clsData[dbhCls]) { clsData[dbhCls].s++; clsData[dbhCls].t += tpaT; clsData[dbhCls].v += vpaT; if (isCut) { clsData[dbhCls].c++; clsData[dbhCls].ct += tpaT; } } else { clsData['Invalid'].s++; if (isCut) clsData['Invalid'].c++; } });
        const treesPerAcre = (numPlots > 0) ? (totTpaSum / numPlots) : 0; const treesPerAcreCut = (numPlots > 0) ? (cutTpaSum / numPlots) : 0; const treesPerAcreLeave = treesPerAcre - treesPerAcreCut; const volPerAcre = (numPlots > 0) ? (totVolSum / numPlots) : 0; const volPerAcreCut = (numPlots > 0) ? (cutVolSum / numPlots) : 0; const volPerAcreLeave = volPerAcre - volPerAcreCut; const baPerAcre = (numPlots > 0) ? (totTrees * baf) / numPlots : 0; const baPerAcreCut = (numPlots > 0) ? (cutTrees * baf) / numPlots : 0; const baPerAcreLeave = baPerAcre - baPerAcreCut; const qmd = (treesPerAcre > 0 && baPerAcre > 0) ? Math.sqrt((baPerAcre / treesPerAcre) / BA_CONST) : 0; report.summary = { numberOfPlots: numPlots, totalTreesPerAcre: treesPerAcre, treesPerAcreCut: treesPerAcreCut, treesPerAcreLeave: treesPerAcreLeave, totalBaPerAcre: baPerAcre, baPerAcreCut: baPerAcreCut, baPerAcreLeave: baPerAcreLeave, avgTractDbh: qmd, totalVolPerAcre: volPerAcre, volumePerAcreCut: volPerAcreCut, volumePerAcreLeave: volPerAcreLeave, bafUsed: baf, logRuleUsed: logRule, formClassUsed: logRule === 'Doyle' ? formClass : 'N/A' };
        const clsOrder = ['Sapling', 'Poletimber', 'Small Sawtimber', 'Medium Sawtimber', 'Large Sawtimber', 'Other', 'Invalid']; let sumClsPercStems = 0, sumClsBaPA = 0, sumClsBaPACut = 0, sumClsBaPALeave = 0, sumClsVolPA = 0, sumClsPercBa = 0, sumClsPercVol = 0; let sumClsTpaCut = 0, sumClsTpaLeave = 0; clsOrder.forEach(cls => { const cInfo = clsData[cls] || { s: 0, c: 0, t: 0, v: 0, ct: 0 }; const clsTpa = (numPlots > 0) ? (cInfo.t / numPlots) : 0; const clsVolPA = (numPlots > 0) ? (cInfo.v / numPlots) : 0; const clsBaPerAcre = (numPlots > 0) ? (cInfo.s * baf) / numPlots : 0; const clsBaPerAcreCut = (numPlots > 0) ? (cInfo.c * baf) / numPlots : 0; const clsBaPerAcreLeave = clsBaPerAcre - clsBaPerAcreCut; const clsTpaCut = (numPlots > 0) ? (cInfo.ct / numPlots) : 0; const clsTpaLeave = clsTpa - clsTpaCut; const percStems = treesPerAcre > 0 ? (clsTpa / treesPerAcre) * 100 : 0; const percBa = baPerAcre > 0 ? (clsBaPerAcre / baPerAcre) * 100 : 0; const percVol = volPerAcre > 0 ? (clsVolPA / volPerAcre) * 100 : 0; report.standDistribution[cls] = { percentTotalStems: percStems, baSqFtPerAcreCut: clsBaPerAcreCut, baSqFtPerAcreLeave: clsBaPerAcreLeave, baSqFtPerAcreTotal: clsBaPerAcre, percentBa: percBa, volumeBfPerAcre: clsVolPA, percentVolume: percVol, tpaPerAcreCut: clsTpaCut, tpaPerAcreLeave: clsTpaLeave }; sumClsPercStems += percStems; sumClsBaPACut += clsBaPerAcreCut; sumClsBaPALeave += clsBaPerAcreLeave; sumClsBaPA += clsBaPerAcre; sumClsPercBa += percBa; sumClsVolPA += clsVolPA; sumClsPercVol += percVol; sumClsTpaCut += clsTpaCut; sumClsTpaLeave += clsTpaLeave; }); report.standDistribution['TOTALS'] = { percentTotalStems: sumClsPercStems, baSqFtPerAcreCut: sumClsBaPACut, baSqFtPerAcreLeave: sumClsBaPALeave, baSqFtPerAcreTotal: sumClsBaPA, percentBa: sumClsPercBa, volumeBfPerAcre: sumClsVolPA, percentVolume: sumClsPercVol, tpaPerAcreCut: sumClsTpaCut, tpaPerAcreLeave: sumClsTpaLeave };
        const sortedSpec1 = Object.keys(specData).sort(); let sumSpecPercStems = 0, sumSpecPercSaw = 0, sumSpecPercPole = 0, sumSpecPercSap = 0; sortedSpec1.forEach(spec => { const spD = specData[spec]; const spTpa = (numPlots > 0) ? (spD.t / numPlots) : 0; const spTpaSawPA = (numPlots > 0) ? (spD.tpaSaw / numPlots) : 0; const spTpaPolePA = (numPlots > 0) ? (spD.tpaPole / numPlots) : 0; const spTpaSapPA = (numPlots > 0) ? (spD.tpaSap / numPlots) : 0; const percTotalStems = treesPerAcre > 0 ? (spTpa / treesPerAcre) * 100 : 0; const percSawtimber = treesPerAcre > 0 ? (spTpaSawPA / treesPerAcre) * 100 : 0; const percPoletimber = treesPerAcre > 0 ? (spTpaPolePA / treesPerAcre) * 100 : 0; const percSapling = treesPerAcre > 0 ? (spTpaSapPA / treesPerAcre) * 100 : 0; report.speciesSummary1[spec] = { percentTotalStems: percTotalStems, sawtimberPercent: percSawtimber, poletimberPercent: percPoletimber, saplingPercent: percSapling }; sumSpecPercStems += percTotalStems; sumSpecPercSaw += percSawtimber; sumSpecPercPole += percPoletimber; sumSpecPercSap += percSapling; }); report.speciesSummary1['TOTALS'] = { percentTotalStems: sumSpecPercStems, sawtimberPercent: sumSpecPercSaw, poletimberPercent: sumSpecPercPole, saplingPercent: sumSpecPercSap };
        let sumSpecVolPA = 0, sumSpecVolS = 0, sumSpecVolM = 0, sumSpecVolL = 0, sumSpecPercVol = 0; const sortedSpec2 = Object.keys(specData).sort(); sortedSpec2.forEach(spec => { const spD = specData[spec]; const spVolA = (numPlots > 0) ? (spD.v / numPlots) : 0; const spVolS = (numPlots > 0) ? (spD.vS / numPlots) : 0; const spVolM = (numPlots > 0) ? (spD.vM / numPlots) : 0; const spVolL = (numPlots > 0) ? (spD.vL / numPlots) : 0; const spPercVol = volPerAcre > 0 ? (spVolA / volPerAcre) * 100 : 0; report.speciesSummary2[spec] = { volSmallPerAcre: spVolS, volMediumPerAcre: spVolM, volLargePerAcre: spVolL, totalSpeciesVolPerAcre: spVolA, percentTotalVolume: spPercVol }; sumSpecVolPA += spVolA; sumSpecVolS += spVolS; sumSpecVolM += spVolM; sumSpecVolL += spVolL; sumSpecPercVol += spPercVol; }); report.speciesSummary2['TOTALS'] = { volSmallPerAcre: sumSpecVolS, volMediumPerAcre: sumSpecVolM, volLargePerAcre: sumSpecVolL, totalSpeciesVolPerAcre: sumSpecVolPA, percentTotalVolume: sumSpecPercVol };
        console.log("Subset report calculation finished."); return report;
    }
    function formatReportForCsv(report) { const fmt = (n, d = 1) => !isNaN(parseFloat(n)) ? parseFloat(n).toFixed(d) : '0.0'; const fmtI = (n) => !isNaN(parseFloat(n)) ? parseFloat(n).toFixed(0) : '0'; const fmtP = (n, d = 1) => !isNaN(parseFloat(n)) ? parseFloat(n).toFixed(d) + '%' : '0.0%'; console.log("Formatting report for CSV..."); if (!report || !report.summary || report.summary.numberOfPlots === undefined) { console.error("Incomplete report data for CSV formatting."); return "\n--- FORESTRY REPORT DATA ---\nError: Report data incomplete or missing.\n"; } const sum = report.summary; const baf = sum.bafUsed ?? 'N/A'; const rule = sum.logRuleUsed ?? 'N/A'; const fc = sum.formClassUsed ?? 'N/A'; let csv = `\n\n--- FORESTRY REPORT DATA (Settings: BAF=${baf}, Rule=${rule}${rule === 'Doyle' ? `, FC=${fc}` : ''}) ---\n`; csv += `TOTAL VOLUME/ACRE (BF),${fmtI(sum.totalVolPerAcre)},,VOL/ACRE CUT (BF),${fmtI(sum.volumePerAcreCut)},,VOL/ACRE LEAVE (BF),${fmtI(sum.volumePerAcreLeave)}\n`; csv += `AVG DBH (QMD),${fmt(sum.avgTractDbh, 1)},,TOTAL TREES/ACRE,${fmt(sum.totalTreesPerAcre, 1)},,NUMBER OF PLOTS,${fmtI(sum.numberOfPlots)}\n`; csv += `TOTAL BA/ACRE (SQ FT),${fmt(sum.totalBaPerAcre, 1)},,TREES/ACRE CUT,${fmt(sum.treesPerAcreCut, 1)},,TREES/ACRE LEAVE,${fmt(sum.treesPerAcreLeave, 1)}\n`; csv += `BA/ACRE CUT (SQ FT),${fmt(sum.baPerAcreCut, 1)},,BA/ACRE LEAVE (SQ FT),${fmt(sum.baPerAcreLeave, 1)},,\n\n`; csv += "STAND DISTRIBUTION,STEMS (%),\"BA/ACRE (SQ FT)\",,,\"BA (%)\",\"VOL/ACRE (BF)\",\"VOL (%)\",\"TPA/ACRE Cut\",\"TPA/ACRE Leave\"\n"; csv += ",,\"Cut\",\"Leave\",\"Total\",,,\n"; const clsOrd = ['Sapling', 'Poletimber', 'Small Sawtimber', 'Medium Sawtimber', 'Large Sawtimber', 'Other', 'Invalid', 'TOTALS']; const clsLbl = { 'Sapling': 'SAPLINGS (2-5.9")', 'Poletimber': 'POLETIMBER (6-11.9")', 'Small Sawtimber': 'S SAW (12-17.9")', 'Medium Sawtimber': 'M SAW (18-23.9")', 'Large Sawtimber': 'L SAW (24"+)', 'Other': 'OTHER', 'Invalid': 'INVALID', 'TOTALS': 'TOTALS' }; clsOrd.forEach(cls => { const d = report.standDistribution[cls] || {}; const lbl = clsLbl[cls] || cls; csv += `"${lbl}",${fmtP(d.percentTotalStems)},${fmt(d.baSqFtPerAcreCut, 1)},${fmt(d.baSqFtPerAcreLeave, 1)},${fmt(d.baSqFtPerAcreTotal, 1)},${fmtP(d.percentBa)},${fmtI(d.volumeBfPerAcre)},${fmtP(d.percentVolume)},${fmt(d.tpaPerAcreCut, 1)},${fmt(d.tpaPerAcreLeave, 1)}\n`; }); csv += "\n"; csv += "SPECIES COMPOSITION (Based on % Total TPA),STEMS (%),SAW (%),POLE (%),SAP (%)\n"; const spec1Ord = [...Object.keys(report.speciesSummary1).filter(s => s !== 'TOTALS').sort(), 'TOTALS']; spec1Ord.forEach(spec => { const d = report.speciesSummary1[spec] || {}; const lbl = spec === 'TOTALS' ? "TOTALS" : `"${spec}"`; csv += `${lbl},${fmtP(d.percentTotalStems)},${fmtP(d.sawtimberPercent)},${fmtP(d.poletimberPercent)},${fmtP(d.saplingPercent)}\n`; }); csv += "\n"; csv += "\"VOL/ACRE (BF) BY SPECIES\",\"S SAW (12-17.9\")\",\"M SAW (18-23.9\")\",\"L SAW (24\"+)\",\"TOTAL SPEC VOL/ACRE\",\"TOTAL VOL (%)\"\n"; const spec2Ord = [...Object.keys(report.speciesSummary2).filter(s => s !== 'TOTALS').sort(), 'TOTALS']; spec2Ord.forEach(spec => { const d = report.speciesSummary2[spec] || {}; const lbl = spec === 'TOTALS' ? "TOTALS" : `"${spec}"`; csv += `${lbl},${fmtI(d.volSmallPerAcre)},${fmtI(d.volMediumPerAcre)},${fmtI(d.volLargePerAcre)},${fmtI(d.totalSpeciesVolPerAcre)},${fmtP(d.percentTotalVolume)}\n`; }); console.log("CSV formatting complete."); return csv; }
    function calculatePlotStats(dataSubset, baf, logRule, formClass) { if (!dataSubset || dataSubset.length === 0) return null; const plots = {}; dataSubset.forEach(e => { if (e?.plotNumber) { const pNum = parseInt(e.plotNumber, 10); if (!isNaN(pNum)) { if (!plots[pNum]) plots[pNum] = []; plots[pNum].push(e); } } }); const plotNs = Object.keys(plots).map(Number).sort((a, b) => a - b); if (plotNs.length === 0) return null; const plotVolumes = []; plotNs.forEach(pN => { let plotVPA = 0; plots[pN].forEach(t => { try { if (!t?.dbh || !t?.logs) return; const dbh = parseFloat(t.dbh); if (isNaN(dbh) || dbh <= 0) return; const baT = BA_CONST * Math.pow(dbh, 2); if (baT <= 0) return; const tpaT = baf / baT; const volT = getTreeVolume(t.dbh, t.logs, logRule, formClass); plotVPA += (volT * tpaT); } catch (e) { console.error(`Volume calculation error in plot ${pN}:`, t, e); } }); plotVolumes.push(Math.round(plotVPA)); }); const n = plotVolumes.length; if (n < 2) return { meanV: (n === 1 ? plotVolumes[0] : 0), stdDevV: 0, cvV: 0, numValidPlots: n, plotVolumes }; const sumV = plotVolumes.reduce((a, v) => a + v, 0); const meanV = sumV / n; const sqDiffs = plotVolumes.reduce((a, v) => a + Math.pow(v - meanV, 2), 0); const varianceV = sqDiffs / (n - 1); const stdDevV = Math.sqrt(varianceV); const cvV = (meanV !== 0) ? (stdDevV / meanV) * 100 : 0; return { meanV, stdDevV, cvV, numValidPlots: n, plotVolumes }; }
    function calculateAndDisplayNeededPlots() { if (!neededPlotsValue) return; const currentLetter = areaLetters[currentAreaIndex]; const areaData = collectedData.filter(entry => entry.areaLetter === currentLetter); const plotCountInArea = new Set(areaData.map(e => e.plotNumber)).size; const stats = calculatePlotStats(areaData, currentBaf, currentLogRule, currentFormClass); let displayValue = "---"; let logMessage = `Calculating needed plots for Area ${currentLetter}: `; if (stats && plotCountInArea >= 2 && stats.cvV > 0) { const E10 = 10; const E20 = 20; const t = 2; const cv = stats.cvV; const n10_float = Math.pow((t * cv / E10), 2); const n10_rounded = Math.ceil(n10_float); const n20_float = Math.pow((t * cv / E20), 2); const n20_rounded = Math.ceil(n20_float); displayValue = `10%: ${n10_rounded} / 20%: ${n20_rounded}`; logMessage += `CV=${cv.toFixed(1)}%, n(10%)=${n10_float.toFixed(2)}->${n10_rounded}, n(20%)=${n20_float.toFixed(2)}->${n20_rounded}. (${plotCountInArea} plots in area)`; } else if (areaData.length > 0 && plotCountInArea < 2) { displayValue = "N/A (<2 plots in Area)"; logMessage += `N/A (<2 plots in this area).`; } else if (areaData.length === 0) { displayValue = "--- (No data in Area)"; logMessage += `--- (No data in this area).`; } else { displayValue = "--- (Calc Error?)"; logMessage += `--- (Zero CV or calculation error in area).`; } neededPlotsValue.textContent = displayValue; console.log(logMessage); }

    // --- Chart Generation Functions ---
    function destroyExistingChart(canvasId) {
        const existingChart = Chart.getChart(canvasId);
        if (existingChart) {
            existingChart.destroy();
        }
    }

    // --- Chart Generation Functions (Modified for Dynamic Canvases) ---

    /** Generates BA Distribution Chart ON A GIVEN CANVAS */
    function generateBaChart(report, canvasElement) { // <-- Accepts canvasElement parameter
        if (!canvasElement || !report?.standDistribution) {
             console.error("generateBaChart: Invalid canvasElement or report data.");
             return null; // Indicate failure
        }
        const ctx = canvasElement.getContext('2d');
        if (!ctx) {
            console.error("generateBaChart: Failed to get 2D context.");
            return null;
        }
        const dist = report.standDistribution;
        const labels = ['Sapling', 'Poletimber', 'S Saw', 'M Saw', 'L Saw', 'Other'];
        const classMap = { 'Sapling': 'Sapling', 'Poletimber': 'Poletimber', 'Small Sawtimber': 'S Saw', 'Medium Sawtimber': 'M Saw', 'Large Sawtimber': 'L Saw', 'Other': 'Other' };
        const leaveData = labels.map(lbl => dist[Object.keys(classMap).find(key => classMap[key] === lbl)]?.baSqFtPerAcreLeave || 0);
        const cutData = labels.map(lbl => dist[Object.keys(classMap).find(key => classMap[key] === lbl)]?.baSqFtPerAcreCut || 0);

        try {
            // Return the Chart instance for potential future use (like waiting for render)
            return new Chart(ctx, {
                type: 'bar', data: { labels: labels, datasets: [ { label: 'Leave BA/Acre', data: leaveData, backgroundColor: 'rgba(75, 192, 192, 0.6)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1 }, { label: 'Cut BA/Acre', data: cutData, backgroundColor: 'rgba(255, 99, 132, 0.6)', borderColor: 'rgba(255, 99, 132, 1)', borderWidth: 1 } ] },
                options: {
                    animation: false, // Turn off animation for faster toDataURL
                    plugins: { title: { display: true, text: 'Basal Area Distribution (SqFt/Acre)', font: { size: 16 } }, tooltip: { mode: 'index' } },
                    responsive: false, // Required for off-screen canvas sizing
                    maintainAspectRatio: false, // Required for off-screen canvas sizing
                    scales: { x: { stacked: true, title: { display: true, text: 'DBH Class' } }, y: { stacked: true, title: { display: true, text: 'BA / Acre (Sq Ft)' }, beginAtZero: true } }
                 }
            });
        } catch (error) {
            console.error("Error creating BA Chart:", error);
            return null;
        }
    }

    function downloadDataUrlAsJpg(dataUrl, filename) {
        if (!dataUrl || !filename) {
            console.error("downloadDataUrlAsJpg: Missing dataUrl or filename.");
            return;
        }
        try {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = filename;
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log(`Initiated download for: ${filename}`);
        } catch (error) {
            console.error(`Error downloading ${filename} from data URL:`, error);
            showFeedback(`Error saving graph ${filename}. See console.`, true, 5000);
        }
    }

    /** Generates TPA Distribution Chart ON A GIVEN CANVAS */
    function generateTpaChart(report, canvasElement) { // <-- Accepts canvasElement parameter
        if (!canvasElement || !report?.standDistribution) {
            console.error("generateTpaChart: Invalid canvasElement or report data.");
            return null;
        }
        const ctx = canvasElement.getContext('2d');
         if (!ctx) {
            console.error("generateTpaChart: Failed to get 2D context.");
            return null;
        }
        const dist = report.standDistribution;
        const labels = ['Sapling', 'Poletimber', 'S Saw', 'M Saw', 'L Saw', 'Other'];
        const classMap = { 'Sapling': 'Sapling', 'Poletimber': 'Poletimber', 'Small Sawtimber': 'S Saw', 'Medium Sawtimber': 'M Saw', 'Large Sawtimber': 'L Saw', 'Other': 'Other' };
        const leaveData = labels.map(lbl => dist[Object.keys(classMap).find(key => classMap[key] === lbl)]?.tpaPerAcreLeave || 0);
        const cutData = labels.map(lbl => dist[Object.keys(classMap).find(key => classMap[key] === lbl)]?.tpaPerAcreCut || 0);

        try {
             return new Chart(ctx, {
                type: 'bar', data: { labels: labels, datasets: [ { label: 'Leave TPA', data: leaveData, backgroundColor: 'rgba(75, 192, 192, 0.6)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1 }, { label: 'Cut TPA', data: cutData, backgroundColor: 'rgba(255, 99, 132, 0.6)', borderColor: 'rgba(255, 99, 132, 1)', borderWidth: 1 } ] },
                options: {
                    animation: false,
                    plugins: { title: { display: true, text: 'Trees Per Acre Distribution', font: { size: 16 } }, tooltip: { mode: 'index' } },
                    responsive: false, maintainAspectRatio: false,
                    scales: { x: { stacked: true, title: { display: true, text: 'DBH Class' } }, y: { stacked: true, title: { display: true, text: 'Trees / Acre' }, beginAtZero: true } }
                }
            });
        } catch (error) {
             console.error("Error creating TPA Chart:", error);
             return null;
        }
    }

    /** Generates Volume by Species Chart ON A GIVEN CANVAS */
    function generateVolSpeciesChart(report, canvasElement) { // <-- Accepts canvasElement parameter
        if (!canvasElement || !report?.speciesSummary2) {
             console.error("generateVolSpeciesChart: Invalid canvasElement or report data.");
             return null;
        }
        const ctx = canvasElement.getContext('2d');
         if (!ctx) {
            console.error("generateVolSpeciesChart: Failed to get 2D context.");
            return null;
        }
        const speciesVol = report.speciesSummary2;
        const sortedSpecies = Object.entries(speciesVol).filter(([spec, data]) => spec !== 'TOTALS' && data && data.totalSpeciesVolPerAcre > 0).sort(([, dataA], [, dataB]) => dataB.totalSpeciesVolPerAcre - dataA.totalSpeciesVolPerAcre);
        const labels = sortedSpecies.map(([spec]) => spec);
        const data = sortedSpecies.map(([, specData]) => specData.totalSpeciesVolPerAcre);

        try {
            return new Chart(ctx, {
                type: 'bar', data: { labels: labels, datasets: [{ label: 'Total Vol/Acre', data: data, backgroundColor: 'rgba(54, 162, 235, 0.6)', borderColor: 'rgba(54, 162, 235, 1)', borderWidth: 1 }] },
                options: {
                    animation: false,
                    indexAxis: 'y',
                    plugins: { title: { display: true, text: 'Volume by Species (BF/Acre)', font: { size: 16 } }, legend: { display: false } },
                    responsive: false, maintainAspectRatio: false,
                    scales: { x: { title: { display: true, text: 'Board Feet / Acre' }, beginAtZero: true }, y: { title: { display: true, text: 'Species' } } }
                 }
            });
         } catch (error) {
             console.error("Error creating Vol Species Chart:", error);
             return null;
         }
    }

    /** Generates Sawtimber Volume by Species Chart ON A GIVEN CANVAS */
    function generateVolSawtimberChart(report, canvasElement) { // <-- Accepts canvasElement parameter
        if (!canvasElement || !report?.speciesSummary2) {
             console.error("generateVolSawtimberChart: Invalid canvasElement or report data.");
             return null;
        }
        const ctx = canvasElement.getContext('2d');
         if (!ctx) {
            console.error("generateVolSawtimberChart: Failed to get 2D context.");
            return null;
        }
        const speciesVol = report.speciesSummary2;
        const sortedSpecies = Object.entries(speciesVol).filter(([spec, data]) => spec !== 'TOTALS' && data && (data.volSmallPerAcre > 0 || data.volMediumPerAcre > 0 || data.volLargePerAcre > 0))
                               .map(([spec, data]) => ({
                                   species: spec,
                                   small: data.volSmallPerAcre || 0,
                                   medium: data.volMediumPerAcre || 0,
                                   large: data.volLargePerAcre || 0,
                                   totalSaw: (data.volSmallPerAcre || 0) + (data.volMediumPerAcre || 0) + (data.volLargePerAcre || 0)
                               }))
                               .sort((a, b) => b.totalSaw - a.totalSaw);

        const labels = sortedSpecies.map(item => item.species);
        const smallData = sortedSpecies.map(item => item.small);
        const mediumData = sortedSpecies.map(item => item.medium);
        const largeData = sortedSpecies.map(item => item.large);

        try {
            return new Chart(ctx, {
                type: 'bar', data: { labels: labels, datasets: [ { label: 'S Saw Vol/Acre (12-17.9")', data: smallData, backgroundColor: 'rgba(255, 206, 86, 0.6)', borderColor: 'rgba(255, 206, 86, 1)', borderWidth: 1 }, { label: 'M Saw Vol/Acre (18-23.9")', data: mediumData, backgroundColor: 'rgba(255, 159, 64, 0.6)', borderColor: 'rgba(255, 159, 64, 1)', borderWidth: 1 }, { label: 'L Saw Vol/Acre (24"+)', data: largeData, backgroundColor: 'rgba(153, 102, 255, 0.6)', borderColor: 'rgba(153, 102, 255, 1)', borderWidth: 1 } ] },
                options: {
                    animation: false,
                    plugins: { title: { display: true, text: 'Sawtimber Volume Distribution by Species (BF/Acre)', font: { size: 16 } }, tooltip: { mode: 'index' } },
                    responsive: false, maintainAspectRatio: false,
                    scales: { x: { stacked: true, title: { display: true, text: 'Species' } }, y: { stacked: true, title: { display: true, text: 'Board Feet / Acre' }, beginAtZero: true } }
                }
            });
         } catch (error) {
             console.error("Error creating Sawtimber Vol Chart:", error);
             return null;
         }
    }
    function downloadCanvasAsJpg(canvasElement, filename) { if (!canvasElement) { console.error("Download failed: Canvas element not found."); return; } try { const dataUrl = canvasElement.toDataURL('image/jpeg', 0.9); const link = document.createElement('a'); link.href = dataUrl; link.download = filename; link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link); console.log(`Initiated download for: ${filename}`); } catch (error) { console.error(`Error generating or downloading ${filename}:`, error); showFeedback(`Error saving graph ${filename}. See console.`, true, 5000); } }

    // --- CSV Generation Function ---
    /** Generate and download CSV files AND optionally graph images PER AREA. */
    async function generateAndDownloadCsv() {
        if (collectedData.length === 0) { showFeedback("No data to save.", true); return; }

        const selBaf = currentBaf, selRule = currentLogRule, selFc = currentFormClass;
        const generateGraphsEnabled = currentGenerateGraphs === 'Yes'; // Check setting once

        console.log(`Generating outputs: BAF=${selBaf}, Rule=${selRule}, FC=${selFc}, Graphs=${generateGraphsEnabled}`);
        showFeedback("Starting CSV/Graph generation...", false, 10000); // Longer initial feedback

        try {
            // --- Group data by AreaLetter ---
            const groupedData = collectedData.reduce((acc, entry) => {
                const area = entry.areaLetter || 'Unknown'; // Default if missing
                if (!acc[area]) {
                    acc[area] = [];
                }
                acc[area].push(entry);
                return acc;
            }, {});

            const sortedAreas = Object.keys(groupedData).sort();
            if (sortedAreas.length === 0) {
                 showFeedback("No areas found in data.", true);
                 return;
            }

            const timestamp = new Date().toISOString().slice(0, 19).replace(/[-T:]/g, "");
            const projNameBase = projectNameInput?.value.trim().replace(/[^a-z0-9_\-]/gi, '_') || 'TimberTally';
            const chartWidth = 800; // Desired width for generated graphs
            const chartHeight = 500; // Desired height

            let areaCount = 0;
            for (const areaLetter of sortedAreas) { // --- Start Area Loop ---
                areaCount++;
                const areaData = groupedData[areaLetter];
                console.log(`--- Processing Area: ${areaLetter} (${areaData.length} entries) ---`);
                showFeedback(`Generating for Area ${areaLetter} (${areaCount}/${sortedAreas.length})...`, false, 6000);

                // --- Calculate data for the current area ---
                let reportData = null;
                let tallyData = null;
                let plotStats = null;

                try { reportData = calculateForestryReport(areaData, selBaf, selRule, selFc); }
                catch (e) { console.error(`Report calc error for Area ${areaLetter}:`, e); }

                try { tallyData = generateTallyData(areaData); } // Pass areaData
                catch (e) { console.error(`Tally calc error for Area ${areaLetter}:`, e); }

                try { plotStats = calculatePlotStats(areaData, selBaf, selRule, selFc); } // Pass areaData
                catch (e) { console.error(`Plot stats calc error for Area ${areaLetter}:`, e); }

                // --- Logging Report Summary (helpful for debugging) ---
                console.log(`--- Logging Data Before Graphing Area: ${areaLetter} ---`);
                console.log(`Number of entries processed in this area's data subset: ${areaData.length}`);
                if (reportData && reportData.summary && reportData.summary.numberOfPlots !== undefined) {
                    console.log(`Report Summary (Area ${areaLetter}): Plots=${reportData.summary.numberOfPlots}, TPA=${reportData.summary.totalTreesPerAcre?.toFixed(1)}, BA/A=${reportData.summary.totalBaPerAcre?.toFixed(1)}, Vol/A=${reportData.summary.totalVolPerAcre?.toFixed(0)}`);
                } else {
                     console.log(`Report data calculation failed, incomplete, or resulted in zero plots for Area ${areaLetter}`);
                }
                console.log(`---------------------------------------------------`);

                // --- Generate and Download Graphs (if enabled and data valid) ---
                if (generateGraphsEnabled && reportData && reportData.summary && reportData.summary.numberOfPlots > 0) {
                    console.log(`>>> Generating graphs for Area ${areaLetter}...`);
                    const graphFileNameBase = `${projNameBase}_Area${areaLetter}_${timestamp}`;
                    const graphDelay = 200; // Delay between graph downloads (ms)

                    try {
                        // Helper to create canvas and chart, then return data URL
                        const createChartAndGetDataUrl = async (chartType, generatorFn) => {
                            const tempCanvas = document.createElement('canvas');
                            tempCanvas.width = chartWidth;
                            tempCanvas.height = chartHeight;
                            // Get context *before* passing to Chart.js if needed for background fill
                            const tempCtx = tempCanvas.getContext('2d');
                             if (!tempCtx) {
                                console.error(`Failed to get context for ${chartType} chart (Area ${areaLetter})`);
                                return null;
                             }
                             // Optional: Fill background if transparency is an issue in JPG
                             tempCtx.fillStyle = '#FFFFFF'; // White background
                             tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

                            const chartInstance = generatorFn(reportData, tempCanvas);
                            if (!chartInstance) {
                                console.error(`Failed to create ${chartType} chart instance for Area ${areaLetter}.`);
                                return null;
                            }
                            // Wait for chart rendering *after* instance creation
                            await new Promise(r => setTimeout(r, 150));
                            try {
                                return tempCanvas.toDataURL('image/jpeg', 0.9);
                            } catch (urlError) {
                                 console.error(`Error getting data URL for ${chartType} chart (Area ${areaLetter}):`, urlError);
                                 return null;
                            }
                        };

                        // --- Generate and Download each chart sequentially ---
                        const baDataUrl = await createChartAndGetDataUrl('BA', generateBaChart);
                        if (baDataUrl) downloadDataUrlAsJpg(baDataUrl, `${graphFileNameBase}_BA_Dist.jpg`);
                        await new Promise(r => setTimeout(r, graphDelay)); // Wait between downloads

                        const tpaDataUrl = await createChartAndGetDataUrl('TPA', generateTpaChart);
                         if (tpaDataUrl) downloadDataUrlAsJpg(tpaDataUrl, `${graphFileNameBase}_TPA_Dist.jpg`);
                        await new Promise(r => setTimeout(r, graphDelay));

                        const volSpecDataUrl = await createChartAndGetDataUrl('VolSpecies', generateVolSpeciesChart);
                        if (volSpecDataUrl) downloadDataUrlAsJpg(volSpecDataUrl, `${graphFileNameBase}_Vol_Species.jpg`);
                        await new Promise(r => setTimeout(r, graphDelay));

                        const volSawDataUrl = await createChartAndGetDataUrl('VolSawtimber', generateVolSawtimberChart);
                        if (volSawDataUrl) downloadDataUrlAsJpg(volSawDataUrl, `${graphFileNameBase}_Vol_Sawtimber.jpg`);
                        await new Promise(r => setTimeout(r, graphDelay)); // Wait after last one too

                        console.log(`Graph download process completed for Area ${areaLetter}.`);

                    } catch (graphError) {
                        console.error(`Graph generation/download error for Area ${areaLetter}:`, graphError);
                        showFeedback(`Graph error for Area ${areaLetter}. See console.`, true, 4000);
                    }
                } else if (generateGraphsEnabled) {
                    console.warn(`Graph generation skipped for Area ${areaLetter}: No valid report data or zero plots.`);
                }

                // --- Generate CSV Sections for the current area ---
                let rawCsv = "PlotNumber,Area,DBH,Species,Logs,Cut,Notes,Latitude,Longitude\n"; // Added Area column header
                areaData.forEach(e => {
                    if (!e) return;
                    const n = `"${(e.notes || '').replace(/"/g, '""')}"`;
                    const l = e.location || {};
                    rawCsv += `${e.plotNumber ?? '?'},${e.areaLetter ?? '?'},${e.dbh ?? '?'},"${e.species ?? 'N/A'}",${e.logs ?? '?'},${e.cutStatus || 'No'},${n},${l.lat || ''},${l.lon || ''}\n`;
                });

                let tallyCsv = "\n\n--- TALLY DATA ---\nSpecies,DBH,Logs,Cut Status,Count\n";
                 if (tallyData) {
                   try { Object.keys(tallyData).sort().forEach(sp=>{ Object.keys(tallyData[sp]).sort((a,b)=>Number(a)-Number(b)).forEach(dbh=>{ Object.keys(tallyData[sp][dbh]).sort((a,b)=>{ if(a==='Cull')return 1; if(b==='Cull')return -1; const nA=parseFloat(a),nB=parseFloat(b); return isNaN(nA)?1:isNaN(nB)?-1:nA-nB; }).forEach(logs=>{ const c=tallyData[sp][dbh][logs]; const cut=c['Yes']||0, notCut=c['No']||0; if(cut>0) tallyCsv+=`"${sp}",${dbh},${logs},"Yes",${cut}\n`; if(notCut>0) tallyCsv+=`"${sp}",${dbh},${logs},"No",${notCut}\n`; }); }); }); }
                   catch (e) { console.error(`Tally CSV Err Area ${areaLetter}:`, e); tallyCsv+="Error generating tally section.\n"; }
                } else { tallyCsv += "Tally calculation failed for this area.\n"; }

                let plotCsv = `\n\n--- PER-PLOT VOLUME & STATS (Rule:${selRule}${selRule==='Doyle'?' FC'+selFc:''}, BAF:${selBaf}) ---\n`;
                if (plotStats && plotStats.numValidPlots > 0) {
                    plotCsv += `Plot,Volume (BF/Acre)\n`;
                    const plotsInArea = {}; areaData.forEach(e => { if(e?.plotNumber){ const pN=parseInt(e.plotNumber,10); if(!isNaN(pN)) plotsInArea[pN]=true;} }); const plotNsInArea = Object.keys(plotsInArea).map(Number).sort((a,b)=>a-b); const plotVolumeMap = {}; plotNsInArea.forEach((pN, index) => { if(plotStats.plotVolumes && plotStats.plotVolumes[index] !== undefined){ plotVolumeMap[pN] = plotStats.plotVolumes[index]; } else { console.warn(`Volume mapping issue for plot ${pN} in Area ${areaLetter}.`); plotVolumeMap[pN] = 0; } }); plotNsInArea.forEach(pN => { plotCsv += `${pN},${plotVolumeMap[pN]}\n`; });
                    plotCsv += `\nNum Plots,${plotStats.numValidPlots}\n`; plotCsv += `Mean BF/Acre,${plotStats.meanV.toFixed(1)}\n`; plotCsv += `Variance,${plotStats.numValidPlots > 1 ? (plotStats.stdDevV * plotStats.stdDevV).toFixed(1) : 'N/A'}\n`; plotCsv += `Std Dev,${plotStats.numValidPlots > 1 ? plotStats.stdDevV.toFixed(1) : 'N/A'}\n`; plotCsv += `CV (%),${plotStats.numValidPlots > 1 ? plotStats.cvV.toFixed(1) : 'N/A'}\n`;
                } else { plotCsv += `No plot data or insufficient plots for statistics in this area.\n`; }

                let reportCsv = "";
                if (reportData) {
                   try { reportCsv = formatReportForCsv(reportData); }
                   catch (e) { console.error(`Report CSV Formatting Err Area ${areaLetter}:`, e); reportCsv = "\n\n--- FORESTRY REPORT DATA ---\nError formatting report for this area.\n"; }
                } else { reportCsv = "\n\n--- FORESTRY REPORT DATA ---\nReport calculation failed for this area.\n"; }


                // --- Combine and Download CSV for the current area ---
                const combined = rawCsv + tallyCsv + plotCsv + reportCsv;
                const blob = new Blob([combined], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                const ruleP = selRule.substring(0,4);
                const fcP = selRule==='Doyle'?`FC${selFc}`:'';
                const bafP = `BAF${selBaf}`;
                const fName = `${projNameBase}_Area${areaLetter}_${ruleP}${fcP}_${bafP}_${timestamp}.csv`; // Area-specific CSV filename

                link.setAttribute("href", url);
                link.setAttribute("download", fName);
                link.style.visibility='hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                console.log(`CSV download initiated for Area ${areaLetter}: ${fName}`);
                // Wait a bit between *file downloads* (CSV or last graph)
                await new Promise(r => setTimeout(r, 250)); // Wait before next area processing

            } // --- End of Area Loop ---

            // --- Final Feedback ---
            const graphMsgPart = generateGraphsEnabled ? ' & Graphs' : '';
            const areaMsgPart = sortedAreas.length > 1 ? ` for Areas: ${sortedAreas.join(', ')}` : (sortedAreas.length === 1 ? ` for Area ${sortedAreas[0]}` : '');
            showFeedback(`CSV${graphMsgPart} Saved${areaMsgPart}`, false, 4000);

        } catch (error) {
            console.error("Overall CSV/Graph Generation Error:", error);
            showFeedback(`Save Error: ${error.message || 'Unknown error'}. See console.`, true, 6000);
        }
    }

    // --- Event Handlers ---
function handleSubmitEntry() {
        try {
            if (!dbhSelect || !speciesSelect || !logsSelect || !cutCheckbox || !notesTextarea) return;
            checkAndSetLogsForDbh(); // Run this before getting values if it can change Logs

            // *** ADDED: Get current area letter ***
            const currentLetter = areaLetters[currentAreaIndex];

            // *** MODIFIED: Include areaLetter in the newEntry object ***
            const newEntry = {
                id: Date.now(),
                plotNumber: currentPlotNumber,
                areaLetter: currentLetter, // <-- Added this line
                dbh: dbhSelect.value,
                species: speciesSelect.value,
                logs: logsSelect.value,
                cutStatus: cutCheckbox.checked ? 'Yes' : 'No',
                notes: notesTextarea.value.trim(),
                location: currentLocation
            };

            if (!newEntry.species || !newEntry.dbh || !newEntry.logs) { showFeedback("Species, DBH, and Logs required.", true); return; }
            collectedData.push(newEntry);
            renderEntries(); // This will now trigger needed plots calculation
            saveSessionData();
            showFeedback("Entry Added!");

            // Reset only non-persistent fields
            cutCheckbox.checked = false;
            notesTextarea.value = '';
            currentLocation = null; // Clear location after submit
            if(locationStatus) { locationStatus.textContent = 'Location not set'; locationStatus.style.color = '#555'; }
            // Keep Species, DBH, Logs, Plot, Area selected for faster repeat entries
         } catch (error) { console.error("Submit Error:", error); showFeedback(`Submit Error: ${error.message}`, true, 5000); }
    }
    function handleGetLocation() { if (!locationStatus) return; if (!('geolocation' in navigator)) { locationStatus.textContent = 'Not Supported'; locationStatus.style.color = 'red'; return; } locationStatus.textContent = 'Fetching...'; locationStatus.style.color = '#555'; getLocationBtn.disabled = true; navigator.geolocation.getCurrentPosition( (pos) => { currentLocation = { lat: pos.coords.latitude, lon: pos.coords.longitude }; const coords = `(${currentLocation.lat.toFixed(4)}, ${currentLocation.lon.toFixed(4)})`; locationStatus.textContent = `Set ${coords}`; locationStatus.style.color = 'green'; getLocationBtn.disabled = false; }, (err) => { currentLocation = null; let msg = 'Error: '; switch (err.code) { case 1: msg+='Denied'; break; case 2: msg+='Unavailable'; break; case 3: msg+='Timeout'; break; default: msg+='Unknown'; break; } locationStatus.textContent = msg; locationStatus.style.color = 'red'; getLocationBtn.disabled = false; console.error("Geolocation Error:", err); }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 } ); }
    function handleDeleteSelected() { if(!entriesTableBody) return; const checks = entriesTableBody.querySelectorAll('input[type="checkbox"]:checked'); if (checks.length === 0) { showFeedback("No entries selected.", true); return; } const idsToDelete = new Set(Array.from(checks).map(cb => { const idAttr = cb.getAttribute('data-id'); return idAttr ? parseInt(idAttr, 10) : NaN; }).filter(id => !isNaN(id))); if (idsToDelete.size === 0) { showFeedback("Cannot identify selected entries.", true); return; } const num = idsToDelete.size; const word = num === 1 ? 'entry' : 'entries'; if (!confirm(`Delete ${num} selected ${word}?`)) return; collectedData = collectedData.filter(entry => !(entry && entry.id && idsToDelete.has(entry.id))); renderEntries(); saveSessionData(); showFeedback(`${num} ${word} deleted.`); }
    function handleDeleteAll() { if (collectedData.length === 0) { showFeedback("No data to delete.", true); return; } if (!confirm('WARNING: Delete ALL collected data? This cannot be undone.')) return; collectedData = []; try { localStorage.removeItem(STORAGE_KEY); } catch (e) { console.error('Clear Storage Err:', e); } currentAreaIndex = 0; currentPlotNumber = 1; renderEntries(); showFeedback('All data deleted.'); currentLocation = null; if(locationStatus)locationStatus.textContent = 'Location not set'; if(projectNameInput)projectNameInput.value = ''; }
    function handleViewTally() { try { const tallyData = generateTallyData(collectedData); displayTallyResults(tallyData); if(entryView) entryView.style.display = 'none'; if(tallyView) tallyView.style.display = 'block'; } catch(error) { console.error("View Tally Err:", error); showFeedback(`Tally Error: ${error.message}`, true); if(tallyResultsContainer) tallyResultsContainer.innerHTML = `<p class="no-tally-data" style="color: red;">Tally Error</p>`; if(entryView) entryView.style.display = 'none'; if(tallyView) tallyView.style.display = 'block'; } }
    function handleBackToEntry() { if(tallyView) tallyView.style.display = 'none'; if(entryView) entryView.style.display = 'block'; }

    // --- Event Listeners ---
    if(submitBtn) submitBtn.addEventListener('click', handleSubmitEntry);
    if(getLocationBtn) getLocationBtn.addEventListener('click', handleGetLocation);
    if(saveCsvBtn) saveCsvBtn.addEventListener('click', generateAndDownloadCsv);
    if(deleteBtn) deleteBtn.addEventListener('click', handleDeleteSelected);
    if(deleteAllBtn) deleteAllBtn.addEventListener('click', handleDeleteAll);
    if(entriesTableBody) entriesTableBody.addEventListener('change', (event) => { if (event.target.type === 'checkbox' && deleteBtn) { deleteBtn.disabled = !isAnyCheckboxChecked(); } });
    if(dbhSelect) dbhSelect.addEventListener('change', checkAndSetLogsForDbh);
    if(viewTallyBtn) viewTallyBtn.addEventListener('click', handleViewTally);
    if(backToEntryBtn) backToEntryBtn.addEventListener('click', handleBackToEntry);
    if(plotDecrementBtn) plotDecrementBtn.addEventListener('click', () => { if (currentPlotNumber > MIN_PLOT_NUMBER) { currentPlotNumber--; updatePlotDisplay(); } });
    if(plotIncrementBtn) plotIncrementBtn.addEventListener('click', () => { if (currentPlotNumber < MAX_PLOT_NUMBER) { currentPlotNumber++; updatePlotDisplay(); } });
    if(areaDecrementBtn) areaDecrementBtn.addEventListener('click', () => { if (currentAreaIndex > 0) { currentAreaIndex--; updateAreaDisplay(); calculateAndDisplayNeededPlots(); } });
    if(areaIncrementBtn) areaIncrementBtn.addEventListener('click', () => { if (currentAreaIndex < areaLetters.length - 1) { currentAreaIndex++; updateAreaDisplay(); calculateAndDisplayNeededPlots(); } });
    if (toggleSettingsBtn) toggleSettingsBtn.addEventListener('click', () => { if(!settingsSection) return; const isHidden = settingsSection.hidden; settingsSection.hidden = !isHidden; toggleSettingsBtn.setAttribute('aria-expanded', String(isHidden)); toggleSettingsBtn.innerHTML = isHidden ? 'Hide Settings ▲' : 'Settings ⚙'; toggleSettingsBtn.title = isHidden ? 'Hide Settings' : 'Show Settings'; });
    if (bafSelect) bafSelect.addEventListener('change', (e) => { currentBaf = parseInt(e.target.value, 10); saveSettings(); showSettingsFeedback(`BAF set to ${currentBaf}`, false); calculateAndDisplayNeededPlots(); });
    if (logRuleSelect) logRuleSelect.addEventListener('change', (e) => { currentLogRule = e.target.value; saveSettings(); showSettingsFeedback(`Rule: ${currentLogRule}`, false); checkAndSetLogsForDbh(); calculateAndDisplayNeededPlots(); });
    if (formClassSelect) formClassSelect.addEventListener('change', (e) => { currentFormClass = parseInt(e.target.value, 10); saveSettings(); showSettingsFeedback(`Doyle FC: ${currentFormClass}`, false); calculateAndDisplayNeededPlots(); });
    if (logRuleSelect) {
        logRuleSelect.addEventListener('change', (e) => {
            currentLogRule = e.target.value; // Existing line
            saveSettings();                  // Existing line
            showSettingsFeedback(`Rule: ${currentLogRule}`, false); // Existing line
            checkAndSetLogsForDbh();         // Existing line
            calculateAndDisplayNeededPlots(); // Existing line
            updateFormClassVisibility();     // <-- ADD THIS LINE
        });
    }
    if (generateGraphsSelect) { generateGraphsSelect.addEventListener('change', (e) => { currentGenerateGraphs = e.target.value; saveSettings(); showSettingsFeedback(`Generate graphs set to ${currentGenerateGraphs}.`, false); if (saveCsvBtn) { saveCsvBtn.textContent = currentGenerateGraphs === 'Yes' ? 'Save Area CSV(s) & Graphs' : 'Save Area CSV(s)'; } }); if (saveCsvBtn) { saveCsvBtn.textContent = currentGenerateGraphs === 'Yes' ? 'Save Area CSV(s) & Graphs' : 'Save Area CSV(s)'; } }
    if (manualUpdateCheckBtn && updateCheckStatus && 'serviceWorker' in navigator) { manualUpdateCheckBtn.addEventListener('click', () => { if (updateStatusTimeout) clearTimeout(updateStatusTimeout); updateCheckStatus.textContent = 'Checking...'; manualUpdateCheckBtn.disabled = true; navigator.serviceWorker.ready.then(registration => registration.update()).then(reg => { if (!reg) { updateCheckStatus.textContent = 'Check failed (No SW?).'; updateStatusTimeout = setTimeout(() => { if(updateCheckStatus) updateCheckStatus.textContent = ''; }, 3000); return; } if (reg.installing) { updateCheckStatus.textContent = 'Update found, installing...'; console.log('[App] Update found via manual check (installing).'); } else if (reg.waiting) { updateCheckStatus.textContent = 'Update ready!'; console.log('[App] Update found via manual check (waiting).'); if (typeof newWorker === 'undefined' || !newWorker) { newWorker = reg.waiting; } if (typeof showUpdateBar === 'function') { showUpdateBar(); } else { console.error("showUpdateBar function not found"); } } else { updateCheckStatus.textContent = 'App is up-to-date.'; console.log('[App] No update found via manual check.'); updateStatusTimeout = setTimeout(() => { if(updateCheckStatus) updateCheckStatus.textContent = ''; }, 3000); } }).catch(err => { console.error('[App] Manual update check failed:', err); if(updateCheckStatus) updateCheckStatus.textContent = 'Check failed.'; updateStatusTimeout = setTimeout(() => { if(updateCheckStatus) updateCheckStatus.textContent = ''; }, 3000); }).finally(() => { if(manualUpdateCheckBtn) manualUpdateCheckBtn.disabled = false; }); }); } else if (!('serviceWorker' in navigator)) { if(manualUpdateCheckBtn) manualUpdateCheckBtn.disabled = true; if(updateCheckStatus) updateCheckStatus.textContent = 'Updates N/A'; }
    if (showPrivacyPolicyBtn) { showPrivacyPolicyBtn.addEventListener('click', () => { window.open(PRIVACY_POLICY_URL, '_blank', 'noopener,noreferrer'); }); } else { console.warn("Privacy Policy button element not found."); }
	if (showReadmeBtn) { showReadmeBtn.addEventListener('click', () => { window.open(README_URL, '_blank', 'noopener,noreferrer'); }); } else { console.warn("Show README button element not found."); } 
    if(toggleSpeciesMgmtBtn) toggleSpeciesMgmtBtn.addEventListener('click', () => { if(!speciesManagementSection) return; const isHidden = speciesManagementSection.hidden; speciesManagementSection.hidden = !isHidden; toggleSpeciesMgmtBtn.setAttribute('aria-expanded', String(isHidden)); toggleSpeciesMgmtBtn.innerHTML = isHidden ? 'Hide Species Mgt ▲' : 'Show Species Mgt ▼'; });
    if(addSpeciesBtn) addSpeciesBtn.addEventListener('click', () => { if(!newSpeciesInput) return; const news = newSpeciesInput.value.trim(); if (!news) { showSpeciesFeedback("Enter species name.", true); return; } if (currentSpeciesList.some(s => s.toLowerCase() === news.toLowerCase())) { showSpeciesFeedback(`"${news}" already exists.`, true); return; } currentSpeciesList.push(news); populateSpeciesDropdowns(); saveSpeciesList(); newSpeciesInput.value = ''; showSpeciesFeedback(`"${news}" added.`); });
    if(removeSpeciesBtn) removeSpeciesBtn.addEventListener('click', () => { if(!removeSpeciesSelect) return; const opts = Array.from(removeSpeciesSelect.selectedOptions); if (opts.length === 0) { showSpeciesFeedback("Select species to remove.", true); return; } const toRemove = opts.map(o => o.value); if (!confirm(`Remove selected species: ${toRemove.join(', ')}?`)) return; currentSpeciesList = currentSpeciesList.filter(s => !toRemove.includes(s)); populateSpeciesDropdowns(); saveSpeciesList(); showSpeciesFeedback(`Removed: ${toRemove.join(', ')}.`); });
    if(toggleProjectMgmtBtn) toggleProjectMgmtBtn.addEventListener('click', () => { if(!projectManagementSection) return; const isHidden = projectManagementSection.hidden; projectManagementSection.hidden = !isHidden; toggleProjectMgmtBtn.setAttribute('aria-expanded', String(isHidden)); toggleProjectMgmtBtn.innerHTML = isHidden ? 'Hide Project Mgt ▲' : 'Show Project Mgt ▼'; });
    if(saveProjectBtn) saveProjectBtn.addEventListener('click', () => { if(!projectNameInput) return; const name = projectNameInput.value.trim(); if (!name) { showProjectFeedback("Enter project name.", true); return; } if (savedProjects[name] && !confirm(`Overwrite project "${name}"?`)) return; try { savedProjects[name] = JSON.parse(JSON.stringify(collectedData)); saveProjectsToStorage(); populateLoadProjectDropdown(); showProjectFeedback(`Project "${name}" saved.`); } catch (e) { showProjectFeedback(`Save Error: ${e.message}`, true); } });
    if(loadProjectBtn) loadProjectBtn.addEventListener('click', () => { if(!loadProjectSelect) return; const name = loadProjectSelect.value; if (!name) { showProjectFeedback("Select project.", true); return; } if (!savedProjects[name]) { showProjectFeedback(`Project "${name}" not found.`, true); return; } if (collectedData.length > 0 && !confirm(`Load project "${name}"? This will REPLACE your current unsaved data.`)) return; try { collectedData = JSON.parse(JSON.stringify(savedProjects[name])); if(projectNameInput) projectNameInput.value = name; renderEntries(); saveSessionData(); showProjectFeedback(`Project "${name}" loaded.`); currentLocation = null; if(locationStatus)locationStatus.textContent = 'Location not set'; } catch (e) { showProjectFeedback(`Load Error: ${e.message}`, true); collectedData = []; renderEntries(); saveSessionData(); } });
    if(deleteProjectBtn) deleteProjectBtn.addEventListener('click', () => { if(!loadProjectSelect) return; const name = loadProjectSelect.value; if (!name) { showProjectFeedback("Select project.", true); return; } if (!savedProjects[name]) { showProjectFeedback(`Project "${name}" not found.`, true); return; } if (!confirm(`Delete saved project "${name}"? This cannot be undone.`)) return; delete savedProjects[name]; saveProjectsToStorage(); populateLoadProjectDropdown(); if (projectNameInput && projectNameInput.value === name) projectNameInput.value = ''; showProjectFeedback(`Project "${name}" deleted.`); });
    if(loadCsvBtn) loadCsvBtn.addEventListener('click', () => { if(!csvFileInput) return; const file = csvFileInput.files[0]; if (!file) { showProjectFeedback("Select CSV file.", true); return; } if (!file.name.toLowerCase().endsWith('.csv')) { showProjectFeedback("Must be .csv file.", true); csvFileInput.value = null; return; } const reader = new FileReader(); reader.onload = (e) => { try { const content = e.target.result; const parsedData = parseCsvAndLoadData(content); if (parsedData.length === 0) { showProjectFeedback("CSV parsed, but no valid data entries found.", true); csvFileInput.value = null; return; } let chosenArea = null; let promptCancelled = false; const initialPromptMessage = `Enter Area Letter (A-Z) to assign to all ${parsedData.length} loaded entries from "${file.name}".\n\nWARNING: If you choose an area already containing data, this new data will be ADDED to it and plots may be renumbered.`; do { chosenArea = prompt(initialPromptMessage, areaLetters[currentAreaIndex]); if (chosenArea === null) { promptCancelled = true; break; } chosenArea = chosenArea.trim().toUpperCase(); if (chosenArea.length === 1 && areaLetters.includes(chosenArea)) { break; } else { alert("Invalid input. Please enter a single letter from A to Z."); } } while (true); if (promptCancelled) { showProjectFeedback("CSV load cancelled.", false); csvFileInput.value = null; return; } let plotRenumberingApplied = false; let maxExistingPlotNumber = 0; const existingDataInArea = collectedData.filter(entry => entry.areaLetter === chosenArea); if (existingDataInArea.length > 0) { existingDataInArea.forEach(entry => { const plotNum = parseInt(entry.plotNumber, 10); if (!isNaN(plotNum) && plotNum > maxExistingPlotNumber) { maxExistingPlotNumber = plotNum; } }); } console.log(`Max existing plot number in Area ${chosenArea}: ${maxExistingPlotNumber}`); if (maxExistingPlotNumber > 0) { plotRenumberingApplied = true; const plotMap = {}; let nextNewPlotNumber = maxExistingPlotNumber + 1; const originalPlotNumbers = [...new Set(parsedData.map(entry => parseInt(entry.plotNumber, 10)))].filter(num => !isNaN(num)).sort((a, b) => a - b); originalPlotNumbers.forEach(originalPlot => { if (plotMap[originalPlot] === undefined) { if (nextNewPlotNumber <= MAX_PLOT_NUMBER) { plotMap[originalPlot] = nextNewPlotNumber++; } else { console.warn(`Exceeded MAX_PLOT_NUMBER (${MAX_PLOT_NUMBER}) during renumbering. Plot ${originalPlot} mapped to ${MAX_PLOT_NUMBER}`); plotMap[originalPlot] = MAX_PLOT_NUMBER; } } }); console.log("Plot renumbering map:", plotMap); parsedData.forEach(entry => { const originalPlot = parseInt(entry.plotNumber, 10); if (!isNaN(originalPlot) && plotMap[originalPlot] !== undefined) { entry.plotNumber = plotMap[originalPlot]; } entry.areaLetter = chosenArea; }); } else { parsedData.forEach(entry => { entry.areaLetter = chosenArea; }); } collectedData = collectedData.concat(parsedData); renderEntries(); saveSessionData(); let feedbackText = `Added ${parsedData.length} entries from "${file.name}" to Area ${chosenArea}.`; if (plotRenumberingApplied) { feedbackText += " Plots were automatically renumbered."; console.log("CSV Load: Plots renumbered starting after plot " + maxExistingPlotNumber); } else { console.log("CSV Load: Plots not renumbered (no existing data in area)."); } showProjectFeedback(feedbackText, false, 4000); currentLocation = null; if(locationStatus)locationStatus.textContent = 'Location not set'; csvFileInput.value = null; } catch (err) { showProjectFeedback(`CSV Load Error: ${err.message}`, true, 5000); csvFileInput.value = null; } }; reader.onerror = () => { showProjectFeedback("File read error.", true); csvFileInput.value = null; }; reader.readAsText(file); });
    // --- Compass Listeners ---
    let orientationHandler = null; const handleOrientationEvent = (event) => { let h=null, s='---'; try { if(event.absolute===true && event.alpha!==null){h=360-event.alpha;s='True (abs)';} else if(event.webkitCompassHeading!==undefined && event.webkitCompassHeading!==null){h=event.webkitCompassHeading;s='Mag (webkit)';} else if(event.alpha!==null){h=360-event.alpha;s='Mag (alpha)';} if(h!==null){h=(h+360)%360; if(compassNeedle)compassNeedle.style.transform=`translateX(-50%) rotate(${h}deg)`; if(compassHeading)compassHeading.textContent=`${h.toFixed(0)}°`; if(compassSource)compassSource.textContent=` (${s})`;} else {if(compassHeading)compassHeading.textContent=`---°`; if(compassSource)compassSource.textContent=` (No reading)`;}} catch (e) { console.error("Orientation handling error:", e); if(compassHeading)compassHeading.textContent=`ERR`; if(compassSource)compassSource.textContent=` (Error)`;}};
    if(showCompassBtn){showCompassBtn.addEventListener('click',()=>{ try{if(typeof DeviceOrientationEvent!=='undefined'){if(typeof DeviceOrientationEvent.requestPermission==='function'){DeviceOrientationEvent.requestPermission().then(p=>{if(p==='granted'){startCompass();}else{alert("Permission required for compass.");}}).catch(e=>{alert("Permission error: "+e.message);});}else{startCompass();}}else{alert("Compass features not supported by this browser.");}}catch(e){alert("Error accessing compass: "+e.message);}}); } else { console.error("showCompassBtn not found"); }
    function startCompass() { if(!compassContainer||!compassNeedle||!compassHeading||!compassSource){alert("Compass UI elements missing.");return;} compassContainer.style.display='flex';compassHeading.textContent=`---°`;compassSource.textContent=` (Initializing...)`; orientationHandler=handleOrientationEvent; if('ondeviceorientationabsolute' in window){console.log("Using deviceorientationabsolute");window.addEventListener('deviceorientationabsolute',orientationHandler,true);}else if('ondeviceorientation' in window){console.log("Using deviceorientation");window.addEventListener('deviceorientation',orientationHandler,true);}else{alert("Device orientation events are not supported.");compassHeading.textContent=`N/A`;compassSource.textContent=` (Unsupported)`;}}
    if(closeCompassBtn){closeCompassBtn.addEventListener('click',()=>{ if(!compassContainer) return; compassContainer.style.display='none'; if(orientationHandler){console.log("Removing orientation listener.");if('ondeviceorientationabsolute' in window)window.removeEventListener('deviceorientationabsolute',orientationHandler,true); if('ondeviceorientation' in window)window.removeEventListener('deviceorientation',orientationHandler,true); orientationHandler=null;}}); } else { console.error("closeCompassBtn not found"); }

    // --- Tree Key Modal Listeners ---
    if (showTreeKeyBtn && treeKeyModal) { showTreeKeyBtn.addEventListener('click', () => { treeKeyModal.style.display = 'flex'; }); } else { console.warn("Tree Key Button or Modal not found"); }
    const closeKeyModal = () => { if (treeKeyModal) { treeKeyModal.style.display = 'none'; } };
    if (closeTreeKeyBtn) { closeTreeKeyBtn.addEventListener('click', closeKeyModal); }
    if (closeTreeKeyBtnBottom) { closeTreeKeyBtnBottom.addEventListener('click', closeKeyModal); }
    if (treeKeyModal) { treeKeyModal.addEventListener('click', (event) => { if (event.target === treeKeyModal) { closeKeyModal(); } }); }

    function initializeApp() {
        console.log("Initializing TimberTally application...");
        try {
            const updateNotificationElement = document.getElementById('updateNotification');
            if (updateNotificationElement) updateNotificationElement.style.display = 'none';
            loadSettings(); // Load settings first
            initializeSpeciesManagement();
            initializeProjectManagement();
            populateDbhOptions();
            populateLogsOptions();
            checkAndSetLogsForDbh(); // Check logs based on loaded settings
            loadAndPromptSessionData();
            updatePlotDisplay();
            updateAreaDisplay();
            calculateAndDisplayNeededPlots();
            updateFormClassVisibility(); // <-- ADD THIS LINE (sets initial visibility)
            console.log("TimberTally application initialization complete.");
        } catch(initError) {
            console.error("FATAL ERROR during initialization:", initError);
            document.body.innerHTML = `<div style='padding:20px; color:red;'><h2>App Init Failed</h2><p>${initError.message}</p>Check console.</div>`;
        }
    }

    initializeApp();

}); // --- End DOMContentLoaded ---

// --- END OF CONDENSED script.js ---
