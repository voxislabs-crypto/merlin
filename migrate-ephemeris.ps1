Write-Host "Migration starting..." -ForegroundColor Green
git add .
git commit -m "Migrate to Penguin Alpha"
npm install
npm run dev