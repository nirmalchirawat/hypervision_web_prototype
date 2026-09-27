# Backend Setup Guide

This guide explains how to connect the Hypervision frontend to a Google Sheet so that incoming applications are securely saved as rows. 

The backend runs entirely on **Google Apps Script**, requiring no servers, no Node.js, and no databases.

---

### STEP 1: Create a Google Sheet
Create a new, blank Google Sheet where you want the data to be stored.

### STEP 2: Name the Tab
At the bottom of the screen, rename the active worksheet/tab to:
**`Applications`**
*(Note: It must be exactly this name, case-sensitive.)*

### STEP 3: Setup Column Headers
In Row 1, add the following headers in this **exact** order from Column A to L:
1. Timestamp
2. First Name
3. Last Name
4. College Email
5. SAP ID
6. Phone Number
7. School / Department
8. Year of Study
9. Preferred Domain
10. Why Hypervision
11. Recent Experience
12. Portfolio URL

*(Tip: Make Row 1 bold and freeze it so you can scroll easily).*

### STEP 4: Open Apps Script
In your Google Sheet menu, click:
**`Extensions`** → **`Apps Script`**

### STEP 5: Add the Code
1. Delete any default code (like `function myFunction() { ... }`).
2. Open the file `google-apps-script/Code.gs` from this project.
3. Copy all the contents and paste it into the Apps Script editor.

### STEP 6: Save the Project
Click the floppy disk icon (Save project) or press `Ctrl+S` / `Cmd+S`. Give the project a name like "Hypervision Backend".

### STEP 7: Deploy as Web App
1. In the top right of the Apps Script editor, click the **`Deploy`** button.
2. Select **`New deployment`**.
3. Click the gear icon next to "Select type" and choose **`Web app`**.
4. Fill out the configuration exactly as follows:
   - **Description:** Version 1 (or whatever you prefer)
   - **Execute as:** `Me` (Your Google Account)
   - **Who has access:** `Anyone` (This is required so the public frontend can send data).
5. Click **`Deploy`**.

### STEP 8: Authorize the Script
Because the script writes to your Google Sheet, Google requires you to grant it permission.
1. Click **`Authorize access`**.
2. Select your Google account.
3. You may see a warning saying "Google hasn't verified this app." 
   Click **`Advanced`** at the bottom, then click **`Go to [Project Name] (unsafe)`**.
4. Click **`Allow`**.

### STEP 9: Copy the Web App URL
Once deployment is complete, Google will give you a **Web app URL**.
It should look something like: 
`https://script.google.com/macros/s/AKfycby.../exec`
**Copy this URL.** 
*(Warning: Make sure it ends in `/exec`. Do not use the `/dev` URL for production).*

### STEP 10: Configure the Frontend
1. Open the file `js/app.js` in your code editor.
2. At the very top of the file, find this line:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
   ```
3. Replace the placeholder string with your deployed Web App URL:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby.../exec';
   ```

### STEP 11: Test Locally
1. Run the frontend using a local web server (e.g., VS Code Live Server, or Python `python -m http.server`).
2. Fill out the application form with test data.
3. Click Submit. 
4. **CRITICAL INTEGRATION TEST:** Since cross-origin (CORS) behavior and Apps Script redirects cannot be fully verified without a live deployment, you must verify both sides of the transaction:
   - **Frontend Verification:** Ensure the frontend successfully receives the JSON response and displays the "APPLICATION RECEIVED" success screen.
   - **Backend Verification:** Check your Google Sheet. The test application should appear as a new row in the "Applications" tab!

### STEP 12: Test Duplicate Protection
Try submitting the exact same SAP ID again.
- **Backend Verification:** No second row should be inserted in the Google Sheet.
- **Frontend Verification:** The form should receive the `DUPLICATE_APPLICATION` response code and throw an inline error stating that the SAP ID has already been submitted.

### STEP 13: Deploy the Frontend
You are now ready to host the frontend. Because it is a static site (HTML/CSS/JS only), you can deploy it for free on platforms like:
- **GitHub Pages**
- **Netlify**
- **Vercel**

---

## Troubleshooting

- **"Developer Error: GOOGLE_SCRIPT_URL is not configured"**
  You forgot to paste your URL in Step 10, or you didn't save `app.js`.

- **CORS Errors in the Browser Console**
  This usually happens if you set "Who has access" to something other than "Anyone" in Step 7. It can also happen if you accidentally used the `/dev` URL instead of `/exec`.

- **Script successfully runs but data isn't showing up**
  Double-check Step 2. Is your sheet tab named exactly `Applications`?

- **"Missing required field" error in network response**
  Make sure your frontend HTML `name` attributes exactly match the keys expected by the Apps Script (e.g., `firstName`, `lastName`, etc.). This should work out of the box unless you modified the HTML.

- **I updated the Code.gs script, but nothing changed**
  If you edit the code in Apps Script, you MUST create a **New deployment** (or manage deployments and update the existing version). Merely saving the script does not update the live `/exec` URL.
