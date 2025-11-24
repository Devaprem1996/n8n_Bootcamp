#!/usr/bin/env powershell
# Setup script to configure Supabase credentials

Write-Host "🚀 N8N Bootcamp - Supabase Configuration Setup" -ForegroundColor Cyan
Write-Host ""
Write-Host "To get your Supabase credentials:" -ForegroundColor Yellow
Write-Host "1. Go to https://supabase.com and log in"
Write-Host "2. Open your N8N Bootcamp project"
Write-Host "3. Click 'Settings' in the left sidebar"
Write-Host "4. Click 'API' to see your credentials"
Write-Host ""

$supabaseUrl = Read-Host "📌 Enter your Supabase Project URL (e.g., https://xxxxx.supabase.co)"
$supabaseKey = Read-Host "🔑 Enter your Anon Key"

if ($supabaseUrl -and $supabaseKey) {
    # Update index.html
    $indexPath = Join-Path $PSScriptRoot "index.html"
    $indexContent = Get-Content $indexPath -Raw
    
    $indexContent = $indexContent -replace "window\.SUPABASE_URL = 'https://your-project\.supabase\.co'", "window.SUPABASE_URL = '$supabaseUrl'"
    $indexContent = $indexContent -replace "window\.SUPABASE_ANON_KEY = 'your-anon-key-here'", "window.SUPABASE_ANON_KEY = '$supabaseKey'"
    
    Set-Content $indexPath $indexContent
    
    Write-Host ""
    Write-Host "✅ Credentials updated in index.html" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Also update .env.example for your team:" -ForegroundColor Cyan
    Write-Host "   VITE_SUPABASE_URL=$supabaseUrl"
    Write-Host "   VITE_SUPABASE_ANON_KEY=$supabaseKey"
} else {
    Write-Host "❌ Setup cancelled - credentials were empty" -ForegroundColor Red
}
