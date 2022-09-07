##########################################################
####        Fetch the steppkiz project from           ####
#### and force a complete replacement of local files  ####
####   then install and build everything neccessary   ####
####       and starts the aggregator software         ####
##########################################################

$gitpath = "C:\\sstep-kiz\"

## Create the directory to the git repo if not exists
if (!(Test-Path $gitpath)) {
    cd "C:\\"
    git clone "https://git.bs-wit.de/jop/sstep-kiz.git"
}

# Go to the git repo on the computer (must be changed if the location of the git instllation changes)
cd "C:\\sstep-kiz\"

## Pull the current remote main branch (replacing the local one)
# Check for changes in the project
git fetch --all

# Only pull if the remote has new commits
if ($(git rev-parse HEAD) -ne $(git rev-parse origin/$(git branch --show-current))) {
    # Replaces the local files with version from remote
    git reset --hard
    git pull

    ## Prepare Shared library for production mode deployment
    cd ".\shared\"
    npm install
    npm run build

    ## Build the aggregator-UI in production mode
    cd "..\frontends"
    npm install
    npm run build:aggregator

    ## Build the aggregator backend for production mode
    cd "..\backends"
    npm install
    npm run build:aggregator
}

## Finally start the aggregator server
cd "C:\\sstep-kiz\backends"
npm run start:aggregator:prod
