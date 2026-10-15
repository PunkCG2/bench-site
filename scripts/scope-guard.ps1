# scope-guard.ps1
# Compara los archivos cambiados con la seccion "Archivos en alcance" de la tarea, borra los archivos temporales
# evidentes (sin seguimiento) y avisa del resto. Informativo: siempre termina con codigo 0.
#
# Uso: powershell -ExecutionPolicy Bypass -File scripts/scope-guard.ps1 -TaskFile docs/tasks/012-carrusel-movil.md [-Clean]
# (Archivo sin tildes a proposito: Windows PowerShell 5.1 lee mal UTF-8 sin BOM.)

param(
    [Parameter(Mandatory)][string]$TaskFile,   # tarea o lista de correcciones (.fix-K.md)
    [switch]$Clean                              # borrar los temporales sin seguimiento
)
$ErrorActionPreference = "Stop"

# Una correccion (.fix-K.md) usa el alcance de su tarea original.
$leaf = [System.IO.Path]::GetFileName($TaskFile) -replace '\.fix-\d+\.md$', '.md'
$scopeFile = Join-Path (Split-Path $TaskFile -Parent) $leaf

$allowed = @()
if (Test-Path $scopeFile) {
    $inScope = $false
    foreach ($line in Get-Content $scopeFile -Encoding UTF8) {
        if ($line -match '^##\s+Archivos en alcance') { $inScope = $true; continue }
        if ($inScope -and $line -match '^##\s') { break }
        if ($inScope -and $line -match '^-\s+(\S+)') { $allowed += $Matches[1].Trim('`') }
    }
}

$tempPatterns = @('_tmp*', '*.tmp', 'scratch', 'scripts-tmp', '__pycache__')
$changed = @()
foreach ($l in (git status --porcelain --untracked-files=all)) {
    if ($l.Length -lt 4) { continue }
    $changed += [pscustomobject]@{ Flag = $l.Substring(0, 2); Path = $l.Substring(3).Trim('"') }
}

function Test-Temp([string]$path) {
    foreach ($seg in ($path -split '/')) {
        foreach ($pat in $tempPatterns) { if ($seg -like $pat) { return $true } }
    }
    return $false
}
function Test-Allowed([string]$path) {
    if ($path -like 'docs/tasks/logs/*') { return $true }
    if ($path -eq 'package-lock.json' -and ($allowed -contains 'package.json')) { return $true }
    foreach ($a in $allowed) {
        if ($path -eq $a) { return $true }
        if ($a.EndsWith('/') -and $path.StartsWith($a)) { return $true }
    }
    return $false
}

$removed = @(); $outside = @()
foreach ($c in $changed) {
    if (Test-Allowed $c.Path) { continue }
    if ($c.Flag -eq '??' -and (Test-Temp $c.Path)) {
        if ($Clean) { Remove-Item -LiteralPath $c.Path -Recurse -Force -ErrorAction SilentlyContinue; $removed += $c.Path }
        else { $outside += $c.Path }
        continue
    }
    $outside += $c.Path
}

if ($allowed.Count -eq 0) { Write-Output "ALCANCE: no encontre 'Archivos en alcance' en $scopeFile; no se pudo comprobar." }
if ($removed.Count -gt 0) { Write-Output ("ALCANCE: temporales borrados: " + ($removed -join ', ')) }
if ($outside.Count -gt 0) { Write-Output ("ALCANCE: FUERA DE ALCANCE: " + ($outside -join ', ')) }
if ($allowed.Count -gt 0 -and $removed.Count -eq 0 -and $outside.Count -eq 0) { Write-Output "ALCANCE: OK" }
exit 0
