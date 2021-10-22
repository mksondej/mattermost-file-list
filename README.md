# Mattermost File List

> Hi there!,
>
> I'm glad that my project piqued your attention but I have to be honest:
>
> Since version 5.35.0 of Mattermost, an official file list functionality is already built-in.
> Because of that, this plugin doesn't really make sense anymore, so I'd recommend not installing it and just updating your server to the latest version.
> Maybe I'll think of some additional useful features in the future, but I don't have an opportunity to work with Mattermost very often, so it may take some time.
> 
> I appreciate all of the stars on Github, I really do.
>
> Cheers,
>
> Mike, the dev

Adds a paged, searchable and sortable file list to each channel and team.
You can open the channel file list through a button in the top panel.
The team file list is available above channel list, but it has to be first enabled in the plugin settings.
Admins can additionally access a list of all files from all channels, even where they are not a member.

Through the list you can obtain public or normal links to the files, open and delete entire posts.

Preview:

![Sample list](docs/img/list.jpg)


## How to install

1. Grab the latest `.tar.gz` archive from [Releases](https://github.com/Amonith/mattermost-file-list/releases).
2. Follow standard Mattermost plugin installation procedure (either install it through the web system console or directly by extracting it to /plugins/ folder).
3. Remember to check out plugin settings for additonal features!

## How to develop

This projects uses Docker containers to build, so you don't have to install any dependencies other than Docker.
Simply run `docker-build.ps1` (on *nix systems you need Powershell) and the project will be built inside an autmatically configured temporary container.
The container caches entire GOPATH inside `.docker_cache` directory, so it should be fast and dependencies won't be redownloaded everytime you run the build.
Have fun :)

Optionally you can also pass `-withPreview` which will spin up the mattermost-preview instance (if it's not running) and deploy the plugin to it.

## Troubleshooting

### 1. Error uploading plugin

If you are using a suported platform, can upload other plugins but still receive an error trying to upload this one, check the Maximum File Size setting in Mattermost's configuration as mentioned in:

https://github.com/blindsidenetworks/mattermost-plugin-bigbluebutton/issues/101#issuecomment-643446448

Thanks [@bbodenmiller](https://github.com/bbodenmillerr) for this find :)
