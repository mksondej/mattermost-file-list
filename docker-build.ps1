param (
    # Runs mattermost-preview container along with the build
    # and deploys the result to that container through its API
    [switch] $withPreview,
    [parameter(mandatory=$false, ValueFromRemainingArguments=$true)] $RemainingParameters = "make dist"
)

docker build -t build:latest .

if($withPreview) {
    Write-Host "Initializing mattermost preview image"

    # Create a custom network so mattermost-preview
    # can communicate with our build container

    $result = docker network inspect mattermost
    $errors = $result | Where-Object { $_ -is [System.Management.Automation.ErrorRecord]}

    if($errors.Count -gt 0) {
        if(($errors | Where-Object { $_ -like "*no such network*" }).Count -gt 0) {
            docker network create mattermost
        } else {
            Write-Error $errors
            return 1;
        }
    }

    $dockerPs = $(docker ps -a --filter ancestor=mattermost/mattermost-preview:latest)
    if($dockerPs.Count -gt 1) {
        # if the container already exists, first ensure that it is connected to "mattermost" network
        # then start it
        $mattermostNetworkContainers = $(docker network inspect mattermost -f "{{range .Containers}}{{.Name}}{{end}}")
        if($mattermostNetworkContainers -notcontains "mattermost-preview") {
            docker network connect mattermost mattermost-preview
        }

        $containerId = ($dockerPs[1] -split "\s")[0]
        docker start $containerId
    } else {
        docker run `
            --network mattermost `
            --name mattermost-preview `
            -d `
            --publish 8065:8065 `
            --publish 3306:3306 `
            mattermost/mattermost-preview:latest `
    }
}

if($LASTEXITCODE -eq 1) {
    return 1;
}

$runCmd = "docker run --rm -v `"$(pwd):/app`" -v `"$(pwd)/.docker_cache:/go`"";

if($withPreview) {
    $runCmd += " --network mattermost";
    $runCmd += " -e MM_SERVICESETTINGS_SITEURL=`"http://mattermost-preview:8065`"";
    $runCmd += " -e MM_ADMIN_USERNAME=admin";
    $runCmd += " -e MM_ADMIN_PASSWORD=admin";
}

$runCmd += " -w /app build:latest " + $RemainingParameters;

Invoke-Expression $runCmd
