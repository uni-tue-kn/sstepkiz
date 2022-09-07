$SSTEPKIZ_DIR = "C:\sstep-kiz"
$LOGS_DIR = "$env:userprofile\sstepkiz\$env:username\logs"
if (Test-Path $LOGS_DIR) {} else {
  New-Item $LOGS_DIR -ItemType Directory
}
$DATE_TIME = Get-Date -format "yyyy_MM_dd_hh_mm_ss"
Write-Output "Das Beenden dieses Fensters beendet die Aggregator Software!"
node.exe ".\dist\apps\aggregator\main.js" 2>&1 | Out-File "$LOGS_DIR\$DATE_TIME.log"
