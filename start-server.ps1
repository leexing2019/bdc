$ErrorActionPreference = "Continue"
$env:NODE_ENV = "development"

# Change to project directory
Set-Location "C:/Users/zlx19/.minimax-agent-cn/projects/1"

# Run vite dev server
npm run dev

# Keep window open
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
