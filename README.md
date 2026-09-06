# Deskfolk — secondhand décor & jewelry

A small vintage shop front-end built with React, TypeScript, and Vite. Cart and
order data are kept in the browser's localStorage, so there is no backend or
API key needed.

## Run locally

1. Install Node.js LTS from https://nodejs.org
2. Open this folder in VS Code, or a terminal.
3. Run:

   npm install
   npm run dev

4. Open the local URL shown in the terminal, normally http://localhost:5173

## Build for production

   npm run build

This outputs a static site to the `dist` folder, ready to deploy anywhere
that serves static files (Vercel, Netlify, GitHub Pages, etc).
