# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## 0.7.0 - 2020-01-19
### Added
- Added list of all files in the team. Also added an optional for admin list of all files even from channels where the admin is not a member. Both of those lists are opt-in: have to be enabled in plugin settings.
- Disabled "Get public link" button when the public links are disabled in the admin console

## 0.6.0 - 2020-01-12

### Breaking changes
- Raised min version of MM to 5.16 because it officially introduced an API for reading unsanitized configuration which this plugin needs. Previous version relied on quite a hack and it was a reason for bugs especially in non-standard Mattermost installations.

### Fixed
- Errors related to the config.json file should be now fixed
- Improved styling for all themes

### Added
- Jumping to post with file

## 0.5.1 - 2019-10-28

The plugin was rebuilt using a new pipeline which may solve the problem on alpine-based environments.
No additional features or fixes.

## 0.5.0 - 2019-09-22
### Added
- Sortable columns
### Fixed
- Mattermost web app crashing when using "go to post" links from e-mails and other occassions [[Issue #4](https://github.com/Amonith/mattermost-file-list/issues/4)]

## 0.4.0 - 2019-08-27
### Fixed
- Fixed search not working on PostgreSQL databases

## 0.3.0 - 2019-08-18
### Fixed
- Fixed copying links to clipboard in electron desktop app

## 0.2.0 - 2019-08-18
### Added
- Minor UI improvements
### Fixes
- Fixed API calls in electron desktop app

## 0.1.0 - 2019-08-15
### Added
- Search files by names
- Delete files
- Genereate public or internal links with one click
