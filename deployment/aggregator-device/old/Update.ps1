if ($args[0]) {
  $SSTEPKIZ_PATH = $args[0]
} else {
  $SSTEPKIZ_PATH = "C:\sstep-kiz"
}

Set-Location -Path "$SSTEPKIZ_PATH\"
git pull
Set-Location -Path "$SSTEPKIZ_PATH\shared\"
npm install
npm run build
Set-Location -Path "$SSTEPKIZ_PATH\backends\"
npm install
npm run build:aggregator
Set-Location -Path "$SSTEPKIZ_PATH\frontends\"
npm install
npm run build:aggregator
