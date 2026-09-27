# Hypervision - Application Portal

A polished, minimalist, and efficient frontend application portal for the UPES Hypervision student technology society, complete with a serverless Google Sheets backend integration.

## Project Overview

Hypervision is a student technology community where students collaborate, experiment, build projects, and learn. This project provides a production-ready, responsive application page with a sophisticated dark UI, professional form UX, rigorous client-side validation, and a Google Apps Script backend that securely stores submissions into a Google Sheet.

**Note: The repository is configured to be integration-ready. Each deployment owner must set up their own Google Sheet and provide their unique Web App URL. See the Setup Guide below.**

## Features

- **Minimalist & Premium UI:** Sophisticated dark mode design with subtle grid overlays, clear typography, and a restrained visual hierarchy.
- **Fully Responsive:** Adapts seamlessly from 320px mobile screens to large desktop monitors.
- **Client-Side Validation:** 
  - Required field checking
  - College email formatting
  - SAP ID validation (exactly 9 digits)
  - Indian phone number validation (10 digits)
  - Smart character counters for textareas
- **Accessible UX:** Semantic HTML, ARIA attributes, keyboard navigation support, clear focus states, and inline errors. Respects `prefers-reduced-motion` settings.
- **Duplicate Protection:** The Google Apps Script backend verifies SAP IDs and actively prevents duplicate rows from being inserted into the database.
- **Formula Injection Prevention:** Input is sanitized on the server to prevent malicious spreadsheet formulas.
- **Clean Code Architecture:** Vanilla JavaScript divided into clear concerns (DOM References, Validation, UI State, and Network Logic).

## Technology Stack

- **Frontend:** HTML5, CSS3 (Custom properties, Grid, Flexbox), Vanilla JavaScript (ES6+). No UI frameworks or build tools required.
- **Backend:** Google Apps Script (`Code.gs`).
- **Database:** Google Sheets.
- **Typography:** Google Fonts (Inter and Space Grotesk).

## Project Structure

```text
/
├── index.html                  # Main HTML structure
├── css/
│   └── styles.css              # Styling, theming, and layout
├── js/
│   └── app.js                  # Frontend logic, validation, and network requests
├── google-apps-script/
│   └── Code.gs                 # The backend script to paste into Google Apps Script
├── README.md                   # Project overview
└── SETUP.md                    # Step-by-step backend deployment instructions
```

## Setup & Deployment

To protect privacy and ensure data ownership, this repository does not come pre-connected to a live database. You must configure your own Google Sheet.

**Please refer to [SETUP.md](SETUP.md) for exact, step-by-step instructions on how to:**
1. Create the Google Sheet
2. Deploy the Google Apps Script
3. Connect the frontend by pasting your Web App URL into `app.js`
4. Perform the critical live integration testing (verifying CORS, success states, and duplicate protection against the real `/exec` deployment).

Once configured, the frontend can be hosted for free on any static hosting provider like GitHub Pages, Netlify, or Vercel.
