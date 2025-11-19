# Cleanup script to remove archived source folders and tsconfig
# Run from PowerShell in the repository root (Windows PowerShell 5.1):
# .\scripts\cleanup-archives.ps1

$paths = @(
  "./archive_src",
  "./archive_src_20251119",
  "./archive_tsconfig_20251119.json"
)

foreach ($p in $paths) {
  if (Test-Path $p) {
    Write-Host "Removing: $p"
    Remove-Item -LiteralPath $p -Recurse -Force -ErrorAction SilentlyContinue
  } else {
    Write-Host "Not found (skipping): $p"
  }
}

Write-Host "Cleanup script finished. Verify changes and commit as needed."
