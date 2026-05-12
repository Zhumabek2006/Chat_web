# VibeChat Backend — always runs inside the venv
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$uvicorn   = Join-Path $scriptDir "venv\Scripts\uvicorn.exe"

if (-Not (Test-Path $uvicorn)) {
    Write-Error "venv not found. Run:  python -m venv venv  then  .\venv\Scripts\pip install -r requirements.txt"
    exit 1
}

Write-Host "Starting VibeChat backend (venv)..." -ForegroundColor Cyan
& $uvicorn main:app --reload --host 127.0.0.1 --port 8000
