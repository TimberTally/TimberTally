# TimberTally

![TimberTally Tree Icon](icon.png)

A Progressive Web App (PWA) designed for simple and efficient offline-first collection of timber inventory data. Record plot number, area letter, forestry settings, tree species, diameter at breast height (DBH), log count, cut status, optional notes, and GPS location directly in the field.

This application allows users, such as foresters, researchers, or landowners, to quickly record timber data, even without an internet connection. Data is stored locally. Comprehensive CSV files, calculated forestry metrics, and optional graphs can be exported **per defined area** based on user-defined settings.

*Contact for inquiries: james.a.baunach@gmail.com*

## Understanding the App

*   [How TimberTally Calculates Results](./calculations_explained.html)
*   [Understanding the CSV Output File](./csv_explained.html)
*   [Proof of Work](./proof_of_work.html)

## Features

*   **Offline First:** Uses a Service Worker (`v6`) to cache application files, allowing it to load and function without network access after the first visit. Includes an update notification system.
*   **Simple Data Entry:** Intuitive interface for recording:
    *   Plot Number (1-99) with easy increment/decrement buttons.
    *   Area Letter (A-Z) with easy increment/decrement buttons.
    *   Forestry Settings (BAF, Log Rule, Doyle Form Class, Graph Generation) via a collapsible "Settings ⚙" section. Settings are saved locally.
    *   Tree Species (from a customizable list).
    *   DBH (Diameter at Breast Height - standard even classes).
    *   Logs (Number of logs, including halves and 'Cull').
    *   Cut Status (Yes/No checkbox).
    *   Optional Notes (Text area).
    *   Optional GPS Location (Latitude/Longitude via button).
*   **Persistent Settings:** Basal Area Factor (BAF), Log Rule (Doyle, Scribner, International 1/4"), Doyle Form Class (72, 74, 76, 78, 80, 82), and Graph Generation preference (Yes/No) are saved locally and persist between sessions. The Form Class selector is only shown when Doyle rule is selected.
*   **Custom Species Management:** Add new species to the dropdown list or remove existing ones via the collapsible "Species Management" section. Your custom list is saved locally.
*   **Project Management:**
    *   **Save/Load Named Projects:** Save the current dataset under a project name. Load previously saved projects (replaces current data). Project list is saved locally.
    *   **Load from CSV:** Load data from an external CSV file (requires specific headers: PlotNumber, Area, DBH, Species, Logs, Cut, etc.). Prompts user to assign an Area Letter to all loaded entries. Replaces current data.
    *   **Delete Saved Projects:** Remove previously saved projects from local storage.
*   **Session Recovery:** If the browser is closed or refreshed unexpectedly, the app prompts to recover unsaved data entered during the session (uses localStorage).
*   **GPS Location:** Capture the device's current latitude and longitude with a button press (requires device support and user permission). Status shown next to button.
*   **Recent Entries List:** Displays a scrollable table of recently added trees for quick review.
*   **Entry Deletion:** Select and delete unwanted entries individually using checkboxes and the "Delete Selected" button. A "Delete All Data" button (with confirmation) clears all current entries.
*   **Data Tally View:** Provides an on-screen summary tally grouped by Species, DBH, Logs, and Cut status for all collected data.
*   **Plot Goal Display:** Shows an estimate of plots needed for the **current Area** to achieve +/- 10% and +/- 20% precision (based on Coefficient of Variation from plots within that Area, t=2). Requires at least 2 plots in the current Area.
*   **Per-Area CSV Export & Optional Graphs:**
    *   **Uses Current Settings:** Generates outputs using the currently selected BAF, Log Rule, Form Class, and Graph settings.
    *   **Separate Files per Area:** Generates a distinct CSV file for each unique Area Letter (e.g., Area A, Area B) present in the data.
    *   **Comprehensive CSV Content (per Area):** Each CSV file includes:
        1.  **Raw Data:** All collected entries for that Area (Plot#, Area, DBH, Species, Logs, Cut, Notes, Lat, Lon).
        2.  **Tally Summary:** Count of trees grouped by Species, DBH, Logs, and Cut Status for that Area.
        3.  **Per-Plot Volume & Stats:** Volume (BF/Acre) calculated for each plot in that Area, plus statistical summary (Mean BF/Acre, Variance, Std Dev, CV across plots in that Area).
        4.  **Forestry Report:** Detailed stand tables calculated from the Area's data and current settings, including overall summaries (Vol/Acre, Trees/Acre, BA/Acre, QMD for Total/Cut/Leave) and breakdowns by DBH class and Species (% Stems, TPA, BA/Acre, Vol/Acre).
    *   **Optional Graph Generation (JPG):** If enabled in Settings, generates and downloads four JPG graphs **per Area**:
        1.  Basal Area Distribution (Cut/Leave by DBH Class).
        2.  Trees Per Acre Distribution (Cut/Leave by DBH Class).
        3.  Volume by Species (Total BF/Acre per Species).
        4.  Sawtimber Volume Distribution by Species (Small/Medium/Large Sawtimber BF/Acre per Species).
    *   **Filename Convention:** Files are named like `ProjectName_AreaX_RuleFC_BAF_Timestamp.csv` (or `.jpg`).
*   **Integrated Compass:** A simple on-screen compass accessed via the "Show Compass" button, using device orientation sensors (requires device support and user permission; accuracy depends on device and calibration).
*   **Integrated Tree ID Key:** A basic dichotomous key modal for common Eastern US Deciduous trees, accessed via the "Show Tree ID Key" button in Settings.
*   **Privacy Policy:** Link to the privacy policy available in the Settings section.
*   **Responsive Design:** Layout adjusts for better usability on smaller mobile screens.

## How to Use

1.  **Load the App:** Open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari) on desktop or mobile.
2.  **Install (Optional PWA):** On supported browsers/devices, you may be prompted to "Add to Home Screen" or "Install App" for a more native-like experience and reliable offline access.
3.  **Recover Data (If Prompted):** If unsaved data from a previous session is found, you'll be asked if you want to recover it.
4.  **Set Plot Number & Area Letter:** Use the `+` and `-` buttons next to "Plot #" and "Area:" to set the current identifiers for data entry. Check the "Plots Needed" display for guidance on the current Area.
5.  **Configure Settings:**
    *   Click the "Settings ⚙" button to expand the Forestry Settings section.
    *   Select your desired BAF, Log Rule, and Doyle Form Class (if applicable).
    *   Choose whether to "Generate Graph JPGs on Save".
    *   Optionally, check for updates, view the Tree Key, or view the Privacy Policy.
    *   Settings are saved automatically and will be used for calculations and export. Collapse the section when done.
6.  **Enter Tree Data:**
    *   Select Species, DBH, and Logs from the dropdowns. (Note: Logs may default to '0' for small DBH values under the Doyle rule).
    *   Check the "Cut" box if applicable.
    *   Optionally, click "Get Location" to record GPS coordinates (requires location permission). The status will update next to the button.
    *   Optionally, add notes in the text area.
7.  **Submit:** Click "Submit Entry". The entry will appear at the top of the "Recent Entries" list. Input fields (except Plot # and Area) are cleared or reset. The "Plots Needed" display may update if relevant.
8.  **Manage Species (Optional):** Click "Show Species Management ▼" to expand the section. Add new species names or select existing ones to remove. Changes are saved automatically.
9.  **Manage Projects (Optional):** Click "Show Project Management ▼" to expand the section.
    *   To Save: Enter a name in "Current Project Name" and click "Save Project".
    *   To Load: Select a project from the "Load Saved Project" dropdown and click "Load" (confirms replacing current data).
    *   To Delete Saved: Select a project and click "Del".
    *   To Load from File: Click "Choose File" under "Load Project from CSV", select your file, click "Load CSV". **You will be prompted to enter an Area Letter (A-Z) to assign to all loaded entries.**
10. **Review/Delete Entries:** View entries in the "Recent Entries" table. Check the box(es) next to entries and click "Delete Selected". Confirm the deletion. Use "Delete All Data" (at the bottom) with caution to clear all entries.
11. **View Tally:** Click "View Tally" to see an on-screen summary of **all** collected data across all areas. Click "Back to Data Entry" to return.
12. **Use Compass:** Click "Show Compass" (located above the Recent Entries table). Grant permission if requested. The compass will display the heading. Click "Close" on the compass display when finished.
13. **Save Data (Per Area):** Click "Save Area CSV(s)" (or "Save Area CSV(s) & Graphs" if enabled).
    *   This will generate and trigger downloads for **one CSV file for each Area Letter** present in your data (e.g., `Project_AreaA_....csv`, `Project_AreaB_....csv`).
    *   If graph generation is enabled, it will also trigger downloads for the **four JPG graph files for each Area**.
    *   All calculations use the **currently selected settings** (BAF, Log Rule, Form Class).
    *   Data remains in the app after saving.

## Technical Details

*   Built with vanilla HTML, CSS, and JavaScript.
*   Implements Progressive Web App features using a Service Worker (`CACHE_NAME = 'timber-tally-cache-v6'`) for caching and offline functionality. Includes update checking and user-prompted activation.
*   Uses `localStorage` for:
    *   Temporary session recovery data (`timberTallyTempSession`).
    *   Persistent custom species list (`timberTallyCustomSpecies`).
    *   Persistent saved projects (`timberTallyProjects`).
    *   Persistent forestry settings (`timberTallySettings`).
*   Utilizes Chart.js (`https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js`) for generating graphs when the corresponding setting is enabled. Graphs are rendered on hidden canvases and exported as JPG.
*   Calculates timber volumes using Doyle, Scribner, and International 1/4" log rules. Doyle calculations use an embedded Form Class 78 table and scale results based on the selected Form Class (72, 74, 76, 78, 80, 82).
*   Generates **per-area** CSV exports containing raw data, tally summaries, per-plot volume/acre calculations, and detailed forestry reports (stand tables, species summaries including TPA, BA/Acre, Vol/Acre, QMD). Calculates plot statistics (Mean, Std Dev, CV) within each area for the CSV and for the "Plots Needed" display (using CV%, t=2).
*   Utilizes the Device Orientation API (`deviceorientation` / `deviceorientationabsolute` events) for the compass feature (requires browser support and potentially user permissions).

## Files

*   `index.html`: The main structure and content of the web application.
*   `style.css`: Stylesheet for the application's appearance and layout.
*   `script.js`: Contains all the JavaScript logic for the application features.
*   `manifest.json`: Web App Manifest file for PWA capabilities.
*   `service-worker.js`: Manages caching (`v6`) and offline functionality.
*   `icon.png`: Application icon used in the manifest.
*   `README.md`: This file.

## Notes

*   Session recovery, custom species, saved projects, and forestry settings rely on browser `localStorage`. Clearing browser data (cache, site data, cookies) will remove this stored information. Saving the CSV(s) is the primary way to permanently store collected plot data externally.
*   GPS accuracy depends on the device and environmental factors.
*   Compass accuracy depends heavily on device sensors, calibration, and potential magnetic interference. The displayed heading may be Magnetic North or True North depending on the specific event data provided by the browser/device. The source type (e.g., `abs`, `webkit`, `alpha`) is indicated.
*   Graph generation requires Chart.js, loaded via CDN. Internet access might be needed the first time it's used if not cached by the service worker (though standard libraries often are).
