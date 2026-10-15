# delegar-local.ps1
# Ejecuta UNA tarea con el modelo local de LM Studio, usando Claude Code en modo headless.
# Lo llama la sesion principal de Claude (tu suscripcion). Las variables de entorno de abajo
# solo existen dentro de este proceso, asi que la sesion principal no se ve afectada.
#
# Uso:
#   powershell -ExecutionPolicy Bypass -File scripts/delegar-local.ps1 -TaskFile docs/tasks/002-parser.md -Branch task/002-parser
#
# (Archivo sin tildes a proposito: Windows PowerShell 5.1 lee mal UTF-8 sin BOM.)

param(
    [Parameter(Mandatory)][string]$TaskFile,   # tarea o lista de correcciones (.fix-K.md)
    [Parameter(Mandatory)][string]$Branch,     # rama de la tarea
    [string]$Model = "qwen3.8-27b",            # identificador EXACTO que muestra LM Studio
    [int]$MaxTurns = 40
)
$ErrorActionPreference = "Stop"
$OutputEncoding = [System.Text.UTF8Encoding]::new()   # para que las tildes de la tarea lleguen bien al modelo

# 1) LM Studio debe estar sirviendo (LM Studio, no Bionic: no pueden correr a la vez)
try { Invoke-RestMethod -Uri "http://localhost:1234/v1/models" -TimeoutSec 5 | Out-Null }
catch { Write-Error "LM Studio no responde en :1234. Abre LM Studio, carga el modelo e inicia el servidor."; exit 2 }

# 2) Rama de la tarea: se crea desde main si no existe
git show-ref --verify --quiet "refs/heads/$Branch"
if ($LASTEXITCODE -eq 0) { git switch $Branch } else { git switch -c $Branch main }

# 3) Apuntar SOLO este proceso al servidor local, a traves de scripts/lm-proxy.py.
# Claude Code mete un mensaje con role "system" dentro de `messages`; la plantilla del modelo lo rechaza
# ("System message must be at the beginning"). El proxy lo mueve al campo `system` y reenvia lo demas.
$proxyPort = 1235
$proxy = Start-Process -FilePath "python" -ArgumentList "scripts/lm-proxy.py", "--port", $proxyPort, "--target", "http://localhost:1234" `
    -WindowStyle Hidden -PassThru
Start-Sleep -Seconds 2
if ($proxy.HasExited) { Write-Error "No se pudo iniciar scripts/lm-proxy.py (puerto $proxyPort ocupado o Python no disponible)."; exit 3 }
$env:ANTHROPIC_BASE_URL = "http://127.0.0.1:$proxyPort"
$env:ANTHROPIC_AUTH_TOKEN = "lmstudio"
$env:CLAUDE_CODE_ATTRIBUTION_HEADER = "0"

$worker = @"
Eres un worker de implementacion. Haz SOLO lo que pide la tarea, sin refactors extra.
No cambies archivos fuera del alcance indicado. Si algo es ambiguo, elige lo mas simple y anotalo.
Antes de terminar ejecuta los comandos de validacion de CLAUDE.md y corrige lo que falle.
Al terminar responde en maximo 10 lineas: archivos tocados, decisiones tomadas, resultado de la validacion y dudas.
"@

# 4) Ejecutar. Herramientas limitadas: menos esquemas = menos contexto para el modelo local.
$logDir = "docs/tasks/logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$log = Join-Path $logDir ([System.IO.Path]::GetFileNameWithoutExtension($TaskFile) + ".txt")

# --tools y --system-prompt reducen el prompt base de Claude Code (~36k tokens con todas las herramientas)
# para que quepa en el contexto del modelo local (32k).
try {
    $out = Get-Content $TaskFile -Raw -Encoding UTF8 | claude -p `
        --model $Model `
        --max-turns $MaxTurns `
        --permission-mode acceptEdits `
        --tools "Read,Edit,Write,Glob,Grep,Bash" `
        --allowedTools "Read,Edit,Write,Glob,Grep,Bash(npm *)" `
        --strict-mcp-config `
        --system-prompt $worker | Out-String
}
finally {
    if ($proxy -and -not $proxy.HasExited) { Stop-Process -Id $proxy.Id -Force }
}
$out | Set-Content -Path $log -Encoding UTF8
Write-Output $out

# 5) Commit para que el revisor vea un diff limpio
git add -A
git commit -m "worker(local/$Model): $(Split-Path $TaskFile -Leaf)" --allow-empty | Out-Null
Write-Output "`n--- commit listo en $Branch. Resumen del worker en $log ---"
