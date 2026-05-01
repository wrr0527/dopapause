# DopaPause

Pause your dopamine. Choose your action.

DopaPause is a smartphone-first PWA for adding a 10-second pause before reflexively opening X/Twitter, Instagram, porn, or any other urge loop. It does not block anything. It helps you notice the urge, choose a reason, wait briefly, and either pick a better action or consciously continue.

## Features

- Customizable countdown before acting on an urge
- Fixed, customizable reasons and alternative actions
- "Other" inputs for one-off reasons or actions
- Stats for 7-day, monthly, and yearly views
- Reason and action rankings
- Did instead rate
- Countdown seconds setting
- English / Japanese language switch
- PWA support for adding to your home screen

## Run Locally

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5290
```

## Build

```bash
npm run build
npm run preview
```

## Deploy

This app is a static Vite PWA. Build output is generated in `dist`.

### Vercel

1. Push this project to GitHub.
2. Import the repository in Vercel.
3. Use these settings:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

The included `vercel.json` keeps app routes working on refresh.

### Netlify

1. Push this project to GitHub.
2. Import the repository in Netlify.
3. Use these settings:

```text
Build command: npm run build
Publish directory: dist
```

The included `public/_redirects` keeps app routes working on refresh.

## Add to Home Screen

### iPhone / iPad Safari

1. Open DopaPause in Safari.
2. Tap the share button.
3. Tap **Add to Home Screen**.
4. Tap **Add**.

### Android Chrome

1. Open DopaPause in Chrome.
2. Tap the menu button.
3. Tap **Add to Home screen** or **Install app**.
4. Confirm the install.

## Data

All settings and records are saved only in the browser with local storage. No account, server, or external API is used.

Each log stores:

- `timestamp`
- `selectedReason`: stable key for default items, or a one-off label for "Other"
- `selectedAction`: stable key for default items, or a one-off label for "Other"
- `outcome`: `didInstead` or `openedAnyway`
