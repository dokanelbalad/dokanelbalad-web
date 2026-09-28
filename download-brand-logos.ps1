$slugs = @("toyota","nissan","ford","mercedes","chevrolet","lexus","dodge","bmw","gmc","hyundai","kia","honda","mazda","mitsubishi","suzuki","peugeot","renault","fiat","opel","skoda","volkswagen","audi","jeep","chery","mg","lada","daewoo")
New-Item -ItemType Directory -Force -Path "public\brands" | Out-Null
foreach ($s in $slugs) {
  try {
    Invoke-WebRequest -UseBasicParsing -Uri "https://cdn.simpleicons.org/$s" -OutFile "public\brands\$s.svg"
    Write-Host "ok   $s"
  } catch {
    Write-Host "skip $s (will show name instead)"
  }
}
