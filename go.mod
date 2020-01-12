module github.com/Amonith/mattermost-file-list

go 1.12

require (
	github.com/Amonith/mattermost-file-list/helpers v0.0.0
	github.com/Amonith/mattermost-file-list/models v0.0.0
	github.com/Amonith/mattermost-file-list/services v0.0.0
	github.com/blang/semver v3.6.1+incompatible // indirect
	github.com/mattermost/mattermost-server v5.16.0+incompatible
	github.com/pkg/errors v0.8.1
	github.com/stretchr/testify v1.3.0
)

// Workaround for https://github.com/golang/go/issues/30831 and fallout.
replace github.com/golang/lint => github.com/golang/lint v0.0.0-20190227174305-8f45f776aaf1

replace github.com/Amonith/mattermost-file-list/helpers v0.0.0 => ./server/helpers

replace github.com/Amonith/mattermost-file-list/models v0.0.0 => ./server/models

replace github.com/Amonith/mattermost-file-list/services v0.0.0 => ./server/services
