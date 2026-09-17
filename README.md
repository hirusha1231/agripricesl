# AgriPriceSL

A small React and Vite app for browsing **illustrative sample** produce prices across three Sri Lankan markets, comparing costs by quantity, and recording personal price observations.

Prices on the Prices and Compare pages are sample figures. They are not live market prices. Reports are separate user observations and are **saved only in this browser** using `localStorage`; they are not submitted to a server, shared between devices, or included in comparisons.

## Build and check

From the project root, with Node.js and npm installed:

```powershell
npm ci
npm run lint
npm run build
```

On Windows PowerShell installations that block `npm.ps1`, use `npm.cmd` in place of `npm` for each command. The production files are generated in `dist/` (including `dist/index.html`). To inspect the built app locally, run `npm run preview` (or `npm.cmd run preview`) and open the URL printed by Vite.

## Deploy the built site with Netlify Drop

This is a static site with no server or environment variables. These steps deploy the exact files produced by the build above:

1. Complete the build and check commands above. Confirm `dist/index.html` exists.
2. Sign in to the Netlify team that should own the site at [Netlify login](https://app.netlify.com/login).
3. Open [Netlify Drop](https://app.netlify.com/drop) and drag the **`dist` folder** from the project root into the drop zone. Do not drag the repository root or `src` folder.
4. Wait for Netlify to provide the public `netlify.app` URL. Open it in a private browser window and confirm Prices loads, navigation opens Compare and Report Price, and there are no missing assets or console errors.
5. On the public URL, save a test report, refresh to confirm it remains, then delete it. Check the phone layout in browser device mode. Record and share the public URL for final deployment verification.

For later releases, rebuild locally, then drag the updated `dist` folder into the **Production deploys** drop zone on the Netlify project dashboard. The hosted site should be considered verified only after checking its public URL. See [Netlify's manual deploy instructions](https://docs.netlify.com/start/quickstarts/netlify-drop-quickstart/).

## Known limitations

- Sample prices are fixed illustrative data, not a live feed.
- Reports use `localStorage`, so they are tied to one browser profile and origin. Clearing browser storage, changing device or browser, or changing the site URL can make those reports unavailable.
- Reports have no server backup or cross-device sync, and are not included in Prices or Compare.
