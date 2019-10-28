# Mattermost File List

Adds a paged, searchable and sortable file list to each channel.
The list is opened through a button in the top panel.
Through the list you can obtain public or normal links to the files, open and delete entire posts.

Preview:

![Sample list](docs/img/list.jpg)


## How to install

1. Grab the latest `.tar.gz` archive from [Releases](https://github.com/Amonith/mattermost-file-list/releases).
2. Follow standard Mattermost plugin installation procedure (either install it through the web system console or directly by extracting it to /plugins/ folder).

## How to develop

This projects uses Docker containers to build, so you don't have to install any dependencies other than Docker.
Simply run `docker-build.sh` (or `.ps1` on Windows) and the project will be built inside an autmatically configured temporary container.
The container caches entire GOPATH inside `.docker_cache` directory, so it should be fast and dependencies won't be redownloaded everytime you run the build.
Have fun :)
