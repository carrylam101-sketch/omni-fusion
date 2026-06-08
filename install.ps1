#!/usr/bin/env pwsh
# Omni-Fusion Windows PowerShell Installer
# Co-installs CodeGraph + ECC + gstack (+ guides for Karpathy + Understand-Anything)

param(
  [switch]$All,
  [switch]$Status,
  [switch]$Help
)

function Write-OK  { Write-Host "  [OK] $args" -ForegroundColor Green }
function Write-Warn { Write-Host "  [!!] $args" -ForegroundColor Yellow }
function Write-Info { Write-Host "  [..] $args" -ForegroundColor Cyan }

if ($Help) {
  Write-Host @"
Omni-Fusion Windows Installer
Install:  .\install.ps1
Status:   .\install.ps1 -Status
Full:     .\install.ps1 -All
"@
  exit 0
}

Write-Host "`nOmni-Fusion Co-install Check (Windows)`n" -ForegroundColor Cyan

if ($Status) {
  $allOk = $true

  # 1. CodeGraph
  $cg = Get-Command codegraph -ErrorAction SilentlyContinue
  if ($cg) {
    Write-OK "CodeGraph CLI available"
  } elseif (Test-Path ".codegraph") {
    Write-OK "CodeGraph .codegraph/ present"
  } else {
    Write-Warn "CodeGraph not found. Run: npm install -g @colbymchenry/codegraph"
    $allOk = $false
  }

  # 2. ECC
  $eccCli = Get-Command ecc -ErrorAction SilentlyContinue
  if ($eccCli) {
    Write-OK "ECC CLI available"
  } else {
    Write-Warn "ECC not found. Run: npm install -g ecc-universal && ecc install --profile developer --target claude"
    $allOk = $false
  }

  # 3. gstack
  $gstackDir = "$env:USERPROFILE\.claude\skills\gstack"
  if (Test-Path "$gstackDir\SKILL.md") {
    Write-OK "gstack present"
  } else {
    Write-Warn "gstack not found. Run: git clone --depth 1 https://github.com/garrytan/gstack.git `"$gstackDir`""
    $allOk = $false
  }

  # 4. Understand-Anything
  $uaPlugin = "$env:USERPROFILE\.claude\plugins\cache\understand-anything"
  if (Test-Path "$uaPlugin") {
    Write-OK "Understand-Anything plugin cached"
  } elseif (Test-Path ".understand-anything") {
    Write-OK "Understand-Anything graph present"
  } else {
    Write-Warn "Understand-Anything not found. In Claude Code: /plugin install understand-anything"
    $allOk = $false
  }

  # 5. Karpathy
  if (Test-Path "CLAUDE.md") {
    $content = Get-Content "CLAUDE.md" -Raw
    if ($content -match "Think Before Coding") {
      Write-OK "Karpathy principles active"
    } else {
      Write-OK "CLAUDE.md present"
    }
  } else {
    Write-Warn "CLAUDE.md not found"
    $allOk = $false
  }

  if ($allOk) { Write-Host "`nAll checks passed!`n" -ForegroundColor Green }
  else { Write-Host "`nSome components missing — see warnings above`n" -ForegroundColor Yellow }
  exit
}

# Elevation check (admin rights needed for global npm install)
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
  Write-Warn "Not running as Administrator. Global npm install may fail."
  Write-Warn "Restart PowerShell as Administrator and re-run this script."
}

Write-Host "Installing Omni-Fusion components...`n"

# Step 1: CodeGraph
Write-Info "Installing CodeGraph..."
try {
  & "npm" install -g @colbymchenry/codegraph 2>&1
  if ($LASTEXITCODE -eq 0) {
    Write-OK "CodeGraph installed"
    $env:Path = [Environment]::GetEnvironmentVariable('Path', 'User') + ';' + [Environment]::GetEnvironmentVariable('Path', 'Machine')
  } else { Write-Warn "CodeGraph install failed (exit $LASTEXITCODE)" }
} catch {
  Write-Warn "CodeGraph install failed: $_"
}

# Step 2: ECC
Write-Info "Installing ECC..."
try {
  & "npm" install -g ecc-universal 2>&1
  if ($LASTEXITCODE -eq 0) { Write-OK "ECC package installed" } else { Write-Warn "ECC package install failed (exit $LASTEXITCODE)" }
  $env:Path = [Environment]::GetEnvironmentVariable('Path', 'User') + ';' + [Environment]::GetEnvironmentVariable('Path', 'Machine')
  & "ecc" install --profile developer --target claude 2>&1
  if ($LASTEXITCODE -eq 0) { Write-OK "ECC content installed" } else { Write-Warn "ECC content install may be incomplete (exit $LASTEXITCODE)" }
} catch {
  Write-Warn "ECC install failed: $_"
}

# Step 3: gstack
if ($All) {
  Write-Info "Cloning gstack..."
  $gstackTarget = "$env:USERPROFILE\.claude\skills\gstack"
  try {
    & "git" clone --depth 1 https://github.com/garrytan/gstack.git $gstackTarget 2>&1
    if ($LASTEXITCODE -eq 0) { Write-OK "gstack cloned to $gstackTarget" } else { Write-Warn "gstack clone failed (exit $LASTEXITCODE)" }
  } catch {
    Write-Warn "gstack clone failed: $_"
  }
}

Write-Host "`nInstallation complete!" -ForegroundColor Green
Write-Host "Next: copy CLAUDE.md and AGENTS.md to your project root" -ForegroundColor Cyan
Write-Host "Then start a fresh Claude Code session" -ForegroundColor Cyan
Write-Host "For Understand-Anything, run in Claude Code: /plugin install understand-anything`n"
