Add-Type -AssemblyName System.Drawing

$srcPath = "E:\AqliyaHQ\public\moha-icon.jpg"
if (-not (Test-Path $srcPath)) {
    Write-Error "Source image not found: $srcPath"
    exit 1
}

$srcImg = [System.Drawing.Image]::FromFile($srcPath)

# 1. Standard Legacy Icon Sizes (for ic_launcher.png and ic_launcher_round.png)
$legacySizes = [ordered]@{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

# 2. Android Adaptive Foreground Sizes (108dp standard canvas)
$adaptiveSizes = [ordered]@{
    "mipmap-mdpi" = 108
    "mipmap-hdpi" = 162
    "mipmap-xhdpi" = 216
    "mipmap-xxhdpi" = 324
    "mipmap-xxxhdpi" = 432
}

# Scale factor: 0.62 ensures 100% of the head and hair stay safely inside the circular/squircle mask
$safeScaleFactor = 0.64

foreach ($key in $legacySizes.Keys) {
    $targetDir = "E:\AqliyaHQ\android\app\src\main\res\$key"
    if (-not (Test-Path $targetDir)) { continue }

    $legacyDim = $legacySizes[$key]
    $adaptiveDim = $adaptiveSizes[$key]

    # --- A. Generate Adaptive Foreground (ic_launcher_foreground.png) ---
    # Canvas size = $adaptiveDim x $adaptiveDim
    # Safe graphic size = $adaptiveDim * $safeScaleFactor
    $fgBmp = New-Object System.Drawing.Bitmap $adaptiveDim, $adaptiveDim, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $fgG = [System.Drawing.Graphics]::FromImage($fgBmp)
    $fgG.Clear([System.Drawing.Color]::Transparent)
    $fgG.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $fgG.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $fgG.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $fgTargetDim = [int]($adaptiveDim * $safeScaleFactor)
    $fgOffsetX = [int](($adaptiveDim - $fgTargetDim) / 2)
    # Slightly nudge down by 2% of canvas so curly hair at top has maximum breathing room
    $fgOffsetY = [int](($adaptiveDim - $fgTargetDim) / 2 + ($adaptiveDim * 0.02))

    $fgG.DrawImage($srcImg, $fgOffsetX, $fgOffsetY, $fgTargetDim, $fgTargetDim)
    $fgG.Dispose()

    $fgPath = "$targetDir\ic_launcher_foreground.png"
    $fgBmp.Save($fgPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $fgBmp.Dispose()

    # --- B. Generate Legacy ic_launcher.png and ic_launcher_round.png ---
    # Give 12% padding on legacy so it doesn't clip on round launcher masks
    $legBmp = New-Object System.Drawing.Bitmap $legacyDim, $legacyDim, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $legG = [System.Drawing.Graphics]::FromImage($legBmp)
    $legG.Clear([System.Drawing.Color]::Black)
    $legG.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $legG.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

    $legTargetDim = [int]($legacyDim * 0.88)
    $legOffsetX = [int](($legacyDim - $legTargetDim) / 2)
    $legOffsetY = [int](($legacyDim - $legTargetDim) / 2 + ($legacyDim * 0.01))

    $legG.DrawImage($srcImg, $legOffsetX, $legOffsetY, $legTargetDim, $legTargetDim)
    $legG.Dispose()

    $legBmp.Save("$targetDir\ic_launcher.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $legBmp.Save("$targetDir\ic_launcher_round.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $legBmp.Dispose()

    Write-Host "Updated $key : Foreground ($adaptiveDim x $adaptiveDim with safe area $fgTargetDim px) | Legacy ($legacyDim x $legacyDim)"
}

# --- C. Also generate a 512x512 Master Play Store / Web Icon with safe zone ---
$masterDim = 512
$masterBmp = New-Object System.Drawing.Bitmap $masterDim, $masterDim, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$masterG = [System.Drawing.Graphics]::FromImage($masterBmp)
$masterG.Clear([System.Drawing.Color]::Black)
$masterG.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$masterG.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

$masterTargetDim = [int]($masterDim * 0.88)
$masterOffset = [int](($masterDim - $masterTargetDim) / 2)
$masterG.DrawImage($srcImg, $masterOffset, $masterOffset, $masterTargetDim, $masterTargetDim)
$masterG.Dispose()

$masterBmp.Save("E:\AqliyaHQ\public\icon-512.png", [System.Drawing.Imaging.ImageFormat]::Png)
$masterBmp.Save("E:\AqliyaHQ\public\logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
$masterBmp.Dispose()

$srcImg.Dispose()
Write-Host "ALL ICONS SUCCESSFULLY REGENERATED WITH SAFE ADAPTIVE MARGINS!"
