# TimberTally

![TimberTally Tree Icon](icon.png)

A Progressive Web App (PWA) designed for simple and efficient offline-first collection of timber inventory data. Record plot information, forestry settings, tree species, diameter at breast height (DBH), log count, cut status, optional notes, and GPS location directly in the field.

This application allows users, such as foresters, researchers, or landowners, to quickly record timber data, even without an internet connection. Data is stored locally and can be exported as a comprehensive CSV file containing raw data, summaries, and calculated forestry metrics based on user-defined settings.

*Contact for inquiries: james.a.baunach@gmail.com*

## Features

*   **Offline First:** Uses a Service Worker to cache application files, allowing it to load and function without network access after the first visit.
*   **Simple Data Entry:** Intuitive interface for recording:
    *   Plot Number (1-99) with easy increment/decrement buttons.
    *   Forestry Settings (BAF, Log Rule, Doyle Form Class) via a collapsible "Settings" section. Settings are saved locally.
    *   Tree Species (from a customizable list).
    *   DBH (Diameter at Breast Height).
    *   Logs (Number of logs).
    *   Cut Status (Yes/No checkbox).
    *   Optional Notes (Text area).
    *   Optional GPS Location (Latitude/Longitude via button).
*   **Persistent Settings:** Basal Area Factor (BAF), Log Rule (Doyle, Scribner, International 1/4"), and Doyle Form Class (72, 74, 76, 78, 80, 82) are saved locally and persist between sessions. The Form Class selector is only shown when Doyle rule is selected.
*   **Custom Species Management:** Add new species to the dropdown list or remove existing ones via the collapsible "Species Management" section. Your custom list is saved locally.
*   **Project Management:**
    *   **Save/Load Named Projects:** Save the current dataset under a project name. Load previously saved projects (replaces current data). Project list is saved locally.
    *   **Load from CSV:** Load data from an external CSV file (requires specific headers: PlotNumber, DBH, Species, Logs, Cut, etc.). Replaces current data.
*   **Session Recovery:** If the browser is closed or refreshed unexpectedly, the app prompts to recover unsaved data entered during the session (uses localStorage).
*   **GPS Location:** Capture the device's current latitude and longitude with a button press (requires device support and user permission).
*   **Recent Entries List:** Displays a scrollable table of recently added trees for quick review.
*   **Entry Deletion:** Select and delete unwanted entries individually using checkboxes and the "Delete Selected" button. A "Delete All Data" button (with confirmation) clears all current entries.
*   **Data Tally View:** Provides an on-screen summary tally grouped by Species, DBH, Logs, and Cut status.
*   **Comprehensive CSV Export:**
    *   **Uses Current Settings:** Generates a CSV file using the currently selected BAF, Log Rule, and Doyle Form Class from the Settings section (no longer prompts at save time).
    *   **Multiple Data Sections:** The generated CSV includes:
        1.  **Raw Data:** All collected entries with Plot#, DBH, Species, Logs, Cut, Notes, Lat, Lon.
        2.  **Tally Summary:** Count of trees grouped by Species, DBH, Logs, and Cut Status.
        3.  **Per-Plot Volume & Stats:** Volume (BF/Acre) calculated for each plot based on current settings, plus statistical summary (Mean BF/Acre, Variance, Standard Deviation, Coefficient of Variation across plots).
        4.  **Forestry Report:** Detailed stand tables calculated from the data and settings, including overall summaries (Vol/Acre, Trees/Acre, Avg DBH for Total/Cut/Leave) and breakdowns by DBH class and Species (% Stems, BA/Acre, Vol/Acre).
*   **Integrated Compass:** A simple on-screen compass accessed via the "Show Compass" button, using device orientation sensors (requires device support and user permission; accuracy depends on device and calibration).
*   **Responsive Design:** Layout adjusts for better usability on smaller mobile screens.

## How to Use

1.  **Load the App:** Open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari) on desktop or mobile.
2.  **Install (Optional PWA):** On supported browsers/devices, you may be prompted to "Add to Home Screen" or "Install App" for a more native-like experience and reliable offline access.
3.  **Recover Data (If Prompted):** If unsaved data from a previous session is found, you'll be asked if you want to recover it.
4.  **Set Plot Number & Settings:**
    *   Use the `+` and `-` buttons next to "Plot #" to set the current plot number.
    *   Click the "Settings ⚙" button to expand the Forestry Settings section. Select your desired BAF, Log Rule, and Doyle Form Class (if applicable). These settings are saved automatically and will be used for calculations and CSV export. Collapse the section when done.
5.  **Enter Tree Data:**
    *   Select Species, DBH, and Logs from the dropdowns. (Note: Logs may default to '0' for small DBH values under the Doyle rule).
    *   Check the "Cut" box if applicable.
    *   Optionally, click "Get Location" to record GPS coordinates (requires location permission). The status will update next to the button.
    *   Optionally, add notes in the text area.
6.  **Submit:** Click "Submit Entry". The entry will appear at the top of the "Recent Entries" list, and input fields will be ready for the next tree (except Plot #).
7.  **Manage Species (Optional):** Click "Show Species Management ▼" to expand the section. Add new species names or select existing ones to remove. Changes are saved automatically.
8.  **Manage Projects (Optional):** Click "Show Project Management ▼" to expand the section.
    *   To Save: Enter a name in "Current Project Name" and click "Save Project".
    *   To Load: Select a project from the "Load Saved Project" dropdown and click "Load".
    *   To Delete Saved: Select a project and click "Del".
    *   To Load from File: Click "Choose File" under "Load Project from CSV", select your file, and click "Load CSV".
9.  **Review/Delete Entries:** View entries in the "Recent Entries" table. Check the box(es) next to entries and click "Delete Selected". Confirm the deletion. Use "Delete All Data" (at the bottom) with caution to clear all entries.
10. **View Tally:** Click "View Tally" to see an on-screen summary of the collected data. Click "Back to Data Entry" to return.
11. **Use Compass:** Click "Show Compass" (located above the Recent Entries table). Grant permission if requested. The compass will display the heading. Click "Close" on the compass display when finished.
12. **Save Data:** Click "Save CSV". This will generate and trigger a download of the comprehensive `.csv` file, calculated using the **currently selected settings** (BAF, Log Rule, Form Class). Data remains in the app after saving.

## Technical Details

*   Built with vanilla HTML, CSS, and JavaScript.
*   Implements Progressive Web App features using a Service Worker for caching and offline functionality.
*   Uses `localStorage` for:
    *   Temporary session recovery data (`timberTallyTempSession`).
    *   Persistent custom species list (`timberTallyCustomSpecies`).
    *   Persistent saved projects (`timberTallyProjects`).
    *   Persistent forestry settings (`timberTallySettings`).
*   Calculates timber volumes using Doyle, Scribner, and International 1/4" log rules. Doyle calculations use an embedded Form Class 78 table and scale results based on the selected Form Class (72, 74, 76, 78, 80, 82).
*   Includes calculations for per-plot volume/acre and summary statistics (Mean, Variance, Standard Deviation, Coefficient of Variation) in the CSV export. Generates detailed stand and species tables for the forestry report section of the CSV.
*   Utilizes the Device Orientation API (`deviceorientation` / `deviceorientationabsolute` events) for the compass feature (requires browser support and potentially user permissions).

## Files

*   `index.html`: The main structure and content of the web application.
*   `style.css`: Stylesheet for the application's appearance and layout.
*   `script.js`: Contains all the JavaScript logic for the application features.
*   `manifest.json`: Web App Manifest file for PWA capabilities.
*   `service-worker.js`: Manages caching and offline functionality.
*   `icon.png`: Application icon used in the manifest.

## Notes

*   Session recovery, custom species, saved projects, and forestry settings rely on browser `localStorage`. Clearing browser data (cache, site data, cookies) will remove this stored information. Saving the CSV is the primary way to permanently store collected plot data externally.
*   GPS accuracy depends on the device and environmental factors.
*   Compass accuracy depends heavily on device sensors, calibration, and potential magnetic interference. The displayed heading may be Magnetic North or True North depending on the specific event data provided by the browser/device.
