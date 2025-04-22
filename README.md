# TimberTally

![TimberTally Tree Icon](icon.png)

A Progressive Web App (PWA) designed for simple and efficient offline-first collection of timber inventory data, including species, diameter at breast height (DBH), log count, cut status, optional notes, and GPS location.

This application allows users, such as foresters, researchers, or landowners, to quickly record timber data in the field, even without an internet connection. The data is stored locally and can be exported as a comprehensive CSV file when needed.

*Developed by: James Baunach*
*Contact: james.baunach@gmail.com*

## License

This software is provided free to use under an open license (similar to MIT). Feel free to use, modify, and distribute.

## Features

*   **Offline First:** Uses a Service Worker to cache application files, allowing it to load and function without network access after the first visit.
*   **Simple Data Entry:** Intuitive interface for recording Plot #, Species, DBH, Logs, Cut status, optional Notes, and optional GPS Location.
*   **Plot Counter:** Easily increment/decrement the current plot number (1-99).
*   **Custom Species Management:** Add new species to the dropdown list or remove existing ones. Your custom list is saved locally.
*   **Session Recovery:** If the browser is closed or refreshed unexpectedly, the app prompts to recover data entered during the session (uses localStorage).
*   **GPS Location:** Capture the device's current latitude and longitude with a button press (requires device support and user permission).
*   **Recent Entries List:** Displays a scrollable table of recently added trees for quick review.
*   **Entry Deletion:** Select and delete unwanted entries individually or *en masse* using checkboxes and the "Delete Selected" button. A "Delete All Data" button is also available with confirmation.
*   **Data Tally View:** Provides an on-screen summary tally grouped by Species, DBH, Logs, and Cut status.
*   **Comprehensive CSV Export:**
    *   **Selectable Form Class:** Choose Doyle Form Class (72, 74, 76, 78, 80, 82) via a modal prompt before saving. FC 78 is used as the base table for volume calculations, with others scaled from it.
    *   **Multiple Data Sections:** The generated CSV includes: Raw Data entries, Tally summary, Per-Plot Volume (BF/Acre) list, Statistical Summary (Mean BF/Acre, Variance, Standard Deviation, Coefficient of Variation), and detailed Forestry Report Tables (Stand Distribution, Species Summary 1 & 2).
*   **Integrated Compass:** A simple on-screen compass accessed via a button, using device orientation sensors (requires device support and user permission; accuracy depends on device and calibration).
*   **Responsive Design:** Layout adjusts for better usability on smaller mobile screens.

## How to Use

1.  **Load the App:** Open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari) on desktop or mobile.
2.  **Install (Optional PWA):** On supported browsers/devices, you may be prompted to "Add to Home Screen" or "Install App" for a more native-like experience and reliable offline access.
3.  **Recover Data (If Prompted):** If unsaved data from a previous session is found, you'll be asked if you want to recover it.
4.  **Set Plot Number:** Use the `+` and `-` buttons to set the current plot number.
5.  **Enter Tree Data:**
    *   Select Species, DBH, and Logs from the dropdowns. (Note: Logs may default to '0' for small DBH values).
    *   Check the "Cut" box if applicable.
    *   Optionally, click "Get Location" to record GPS coordinates (requires location permission).
    *   Optionally, add notes in the text area.
6.  **Submit:** Click "Submit Entry". The entry will appear at the top of the "Recent Entries" list.
7.  **Manage Species (Optional):** Expand the "Species Management" section (using the toggle button) to add or remove species from the dropdown list.
8.  **Review/Delete Entries:** View entries in the "Recent Entries" table. Check the box(es) next to entries and click "Delete Selected". Confirm the deletion. Use "Delete All Data" (at the bottom) with caution.
9.  **View Tally:** Click "View Tally" to see a summary of the collected data. Click "Back to Data Entry" to return.
10. **Use Compass:** Click "Show Compass" near the top of the "Recent Entries" section. Grant permission if requested. Click "Close" on the compass display when finished.
11. **Save Data:** Click "Save CSV File". Select the desired Doyle Form Class in the pop-up modal and click "Confirm & Save CSV". This will generate and download the comprehensive `.csv` file. Data remains in the app after saving.

## Technical Details

*   Built with vanilla HTML, CSS, and JavaScript.
*   Implements Progressive Web App features using a Service Worker for caching and offline functionality.
*   Uses LocalStorage for temporary session recovery and persistent custom species list storage.
*   Calculates timber volumes using the Doyle log scale, based on an embedded Form Class 78 table and scaling logic for other selected form classes (72, 74, 76, 80, 82).
*   Includes calculations for common forestry statistics (Mean, Variance, Standard Deviation, Coefficient of Variation on a per-plot basis) in the CSV export.
*   Utilizes the Device Orientation API for the compass feature (requires browser support and potentially user permissions).

## Files

*   `index.html`: The main structure and content of the web application.
*   `style.css`: Stylesheet for the application's appearance and layout.
*   `script.js`: Contains all the JavaScript logic for the application features.
*   `manifest.json`: Web App Manifest file for PWA capabilities.
*   `service-worker.js`: Manages caching and offline functionality.
*   `icon.png`: Application icon used in the manifest.

## Notes

*   Session recovery relies on browser localStorage. Clearing browser data will remove any unsaved session information as well as the custom species list. Saving the CSV is the primary way to permanently store collected plot data.
*   GPS accuracy depends on the device and environmental factors.
*   Compass accuracy depends heavily on device sensors, calibration, and potential magnetic interference. The displayed heading may be Magnetic North or True North depending on the specific event data provided by the browser/device.
