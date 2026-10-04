$NODE_HOME = "D:\tools\node-v22.23.3-win-x64"
Set-Location $PSScriptRoot
Write-Host "[Neon Serpent] PS launcher"
Write-Host "Dir: $(Get-Location)"
Write-Host "NODE_HOME=$NODE_HOME"
if (-not (Test-Path "$NODE_HOME\node.exe")) {
  Write-Host "ERROR: node.exe not found. Listing D:\tools\ :"
  Get-ChildItem "D:\tools\" -ErrorAction Continue
  Read-Host "Press Enter to exit"
  exit 1
}
$env:Path = "$NODE_HOME;" + $env:Path
& "$NODE_HOME\node.exe" -v
& "$NODE_HOME\npm.cmd" -v
if (-not (Test-Path ".\node_modules")) {
  Write-Host "Installing dependencies..."
  & "$NODE_HOME\npm.cmd" install
  if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install failed."
    Read-Host "Press Enter to exit"
    exit 1
  }
}
Write-Host "Starting Vite... open http://localhost:3000"
& "$NODE_HOME\npm.cmd" run dev
Read-Host "Vite exited. Press Enter to close"
