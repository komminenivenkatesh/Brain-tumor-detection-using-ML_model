param(
	[switch]$NoOpen
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$webStartScript = Join-Path $root "web_app\start.ps1"

if (-not (Test-Path $webStartScript)) {
	Write-Host "[ERROR] Startup script not found: $webStartScript" -ForegroundColor Red
	exit 1
}

if ($NoOpen) {
	& $webStartScript -NoOpen
} else {
	& $webStartScript
}
