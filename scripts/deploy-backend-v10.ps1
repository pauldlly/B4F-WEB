param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectRef,

  [Parameter(Mandatory = $true)]
  [string]$PublicSiteUrl
)

$ErrorActionPreference = "Stop"

if (-not $env:SUMUP_API_KEY) {
  throw "Définis SUMUP_API_KEY dans le terminal avant de lancer ce script."
}

if (-not $env:SUMUP_MERCHANT_CODE) {
  throw "Définis SUMUP_MERCHANT_CODE dans le terminal avant de lancer ce script."
}

Write-Host "Connexion au projet Supabase $ProjectRef..." -ForegroundColor Cyan
npx supabase link --project-ref $ProjectRef

Write-Host "Application de la migration..." -ForegroundColor Cyan
npx supabase db push

$secretArguments = @(
  "SUMUP_API_KEY=$($env:SUMUP_API_KEY)",
  "SUMUP_MERCHANT_CODE=$($env:SUMUP_MERCHANT_CODE)",
  "PUBLIC_SITE_URL=$PublicSiteUrl"
)

if ($env:EXPO_ACCESS_TOKEN) {
  $secretArguments += "EXPO_ACCESS_TOKEN=$($env:EXPO_ACCESS_TOKEN)"
}

Write-Host "Enregistrement des secrets..." -ForegroundColor Cyan
npx supabase secrets set @secretArguments

$functions = @(
  "create-public-ticket-checkout",
  "public-sumup-webhook",
  "get-public-checkout-status",
  "get-public-order",
  "get-public-orders",
  "create-public-support-request"
)

foreach ($functionName in $functions) {
  Write-Host "Déploiement de $functionName..." -ForegroundColor Cyan
  npx supabase functions deploy $functionName
}

Write-Host "Backend B4F V10 déployé." -ForegroundColor Green
