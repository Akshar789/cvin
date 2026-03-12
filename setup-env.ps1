# PowerShell script to help set up environment variables
# Run this script to create a .env.local file

Write-Host "Setting up environment variables for M.AASIRI..." -ForegroundColor Green
Write-Host ""

# Check if .env.local already exists
if (Test-Path .env.local) {
    Write-Host "Warning: .env.local already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "Cancelled." -ForegroundColor Red
        exit
    }
}

Write-Host "Please provide the following information:" -ForegroundColor Cyan
Write-Host ""

# Database URL
$databaseUrl = Read-Host "Enter DATABASE_URL (PostgreSQL connection string)"
if ([string]::IsNullOrWhiteSpace($databaseUrl)) {
    Write-Host "Error: DATABASE_URL is required!" -ForegroundColor Red
    exit 1
}

# JWT Secret
Write-Host ""
Write-Host "Generating JWT_SECRET..." -ForegroundColor Cyan
$jwtSecret = Read-Host "Enter JWT_SECRET (or press Enter to generate one)"
if ([string]::IsNullOrWhiteSpace($jwtSecret)) {
    # Generate a random secret
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    $jwtSecret = [Convert]::ToBase64String($bytes)
    Write-Host "Generated JWT_SECRET: $jwtSecret" -ForegroundColor Green
}

# NextAuth Secret
Write-Host ""
$nextAuthSecret = Read-Host "Enter NEXTAUTH_SECRET (or press Enter to generate one)"
if ([string]::IsNullOrWhiteSpace($nextAuthSecret)) {
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    $nextAuthSecret = [Convert]::ToBase64String($bytes)
    Write-Host "Generated NEXTAUTH_SECRET: $nextAuthSecret" -ForegroundColor Green
}

# NextAuth URL
Write-Host ""
$nextAuthUrl = Read-Host "Enter NEXTAUTH_URL (default: http://localhost:3000)"
if ([string]::IsNullOrWhiteSpace($nextAuthUrl)) {
    $nextAuthUrl = "http://localhost:3000"
}

# Create .env.local file
$envContent = @"
# Database Configuration
DATABASE_URL=$databaseUrl

# Authentication & Security
JWT_SECRET=$jwtSecret
NEXTAUTH_SECRET=$nextAuthSecret
NEXTAUTH_URL=$nextAuthUrl

# Optional: Add other environment variables below
# OPENAI_API_KEY=your-key-here
# STRIPE_SECRET_KEY=your-key-here
# NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your-key-here
"@

$envContent | Out-File -FilePath .env.local -Encoding utf8

Write-Host ""
Write-Host "Success! Created .env.local file." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your development server (npm run dev)" -ForegroundColor White
Write-Host "2. Try logging in again" -ForegroundColor White
Write-Host ""

