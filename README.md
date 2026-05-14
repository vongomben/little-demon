# little-demon

A small project folder.

## p5.js viewer (`m1`)

Static page with a white background and `data/m1.png` centered (scaled to fit the window). Served locally so the browser can load assets without file:// restrictions.

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer (includes `npm`)

### Run from PowerShell

1. Open PowerShell.

2. Go to this project directory (adjust the path if yours differs):

   ```powershell
   Set-Location "D:\User\Documents\davide-productions\26-05-14_Sympathy-for-the-devil\demon"
   ```

3. Install dependencies (first time only):

   ```powershell
   npm install
   ```

4. Start the static server:

   ```powershell
   npm start
   ```

5. In your browser, open [http://localhost:3000](http://localhost:3000). You should see `index.html` and the sketch; stop the server with `Ctrl+C` in the same PowerShell window.

### One-off run without installing locally

From the project folder:

```powershell
npx --yes serve .
```

Then open [http://localhost:3000](http://localhost:3000).

### Files involved

- `index.html` — loads p5.js from the CDN and `sketch.js`
- `sketch.js` — draws white background and `data/m1.png`
- `data/m1.png` — image asset

### Custom port

If port 3000 is busy, `serve` may pick another port and print the URL in the terminal. To force a port (example: 5173):

```powershell
npx serve . -l tcp://localhost:5173
```
