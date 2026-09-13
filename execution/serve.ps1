<#
.SYNOPSIS
    Lightweight zero-dependency local HTTP web server for the Smart Event Experience Platform.
.DESCRIPTION
    Uses native Windows .NET HttpListener to serve static HTML, CSS, JavaScript, SVG, and JSON files.
.PARAMETER Port
    The local TCP port to listen on. Default: 3000 (resilient against common Windows 8080 conflicts)
.PARAMETER OpenBrowser
    Switch to automatically launch the default web browser upon server startup.
#>
param (
    [int]$Port = 3000,
    [switch]$OpenBrowser
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir

$MimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".mjs"  = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".ico"  = "image/x-icon"
    ".txt"  = "text/plain; charset=utf-8"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
}

# Attempt binding to requested port, with automatic fallback if conflict detected
$CandidatePorts = @($Port, 3000, 8000, 8085, 8888, 5000) | Select-Object -Unique
$Listener = $null
$BoundPort = $null

foreach ($p in $CandidatePorts) {
    try {
        $testListener = New-Object System.Net.HttpListener
        $testUrl = "http://localhost:$p/"
        $testListener.Prefixes.Add($testUrl)
        $testListener.Start()
        $Listener = $testListener
        $BoundPort = $p
        break
    }
    catch {
        if ($testListener) {
            $testListener.Close()
        }
    }
}

if (-not $Listener -or -not $Listener.IsListening) {
    Write-Error "Failed to bind HttpListener to any candidate port ($($CandidatePorts -join ', ')). Please ensure you have permission to run local listeners."
    exit 1
}

$Url = "http://localhost:$BoundPort/"

try {
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host " NexusCon 2026: Smart Event Experience Platform" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host " Active Local URL : $Url" -ForegroundColor Yellow
    Write-Host " Serving from     : $RootDir" -ForegroundColor Gray
    Write-Host " Press Ctrl+C in terminal to stop server." -ForegroundColor Magenta
    Write-Host "==========================================================" -ForegroundColor Cyan

    if ($OpenBrowser) {
        Start-Process $Url
    }

    while ($Listener.IsListening) {
        $Context = $Listener.GetContext()
        $Request = $Context.Request
        $Response = $Context.Response

        $RawPath = [System.Uri]::UnescapeDataString($Request.Url.AbsolutePath.TrimStart('/'))
        if ([string]::IsNullOrWhiteSpace($RawPath)) {
            $RawPath = "index.html"
        }

        # Normalize relative path and prevent directory traversal
        $SafePath = $RawPath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        $FilePath = [System.IO.Path]::GetFullPath((Join-Path $RootDir $SafePath))

        if (-not $FilePath.StartsWith($RootDir, [System.StringComparison]::OrdinalIgnoreCase)) {
            $Response.StatusCode = 403
            $Buffer = [System.Text.Encoding]::UTF8.GetBytes("403 Forbidden")
            $Response.ContentLength64 = $Buffer.Length
            $Response.OutputStream.Write($Buffer, 0, $Buffer.Length)
            $Response.Close()
            continue
        }

        if (Test-Path $FilePath -PathType Leaf) {
            $Ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
            $ContentType = if ($MimeTypes.ContainsKey($Ext)) { $MimeTypes[$Ext] } else { "application/octet-stream" }
            $Response.ContentType = $ContentType
            
            # Add cache headers for local dev
            $Response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")
            $Response.AddHeader("Access-Control-Allow-Origin", "*")

            $Bytes = [System.IO.File]::ReadAllBytes($FilePath)
            $Response.ContentLength64 = $Bytes.Length
            $Response.StatusCode = 200
            $Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
        }
        else {
            $Response.StatusCode = 404
            $NotFoundHtml = "<html><body><h1>404 Not Found</h1><p>File '$RawPath' does not exist.</p></body></html>"
            $Buffer = [System.Text.Encoding]::UTF8.GetBytes($NotFoundHtml)
            $Response.ContentType = "text/html; charset=utf-8"
            $Response.ContentLength64 = $Buffer.Length
            $Response.OutputStream.Write($Buffer, 0, $Buffer.Length)
        }

        $Response.Close()
    }
}
catch {
    Write-Warning "Server stopped or error encountered: $_"
}
finally {
    if ($Listener -and $Listener.IsListening) {
        $Listener.Stop()
        $Listener.Close()
    }
    Write-Host "Server successfully shut down." -ForegroundColor Gray
}
