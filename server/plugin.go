package main

import (
	"net/http"
	"sync"

	"github.com/mattermost/mattermost-server/plugin"
	"github.com/mattermost/mattermost-server/store/sqlstore"

	"github.com/Amonith/mattermost-file-list/helpers"
	"github.com/Amonith/mattermost-file-list/models"
	"github.com/Amonith/mattermost-file-list/services"
)

// Plugin implements the interface expected by the Mattermost server to communicate between the server and plugin processes.
type Plugin struct {
	plugin.MattermostPlugin

	// configurationLock synchronizes access to the configuration.
	configurationLock sync.RWMutex

	// configuration is the active plugin configuration. Consult getConfiguration and
	// setConfiguration for usage.
	configuration *configuration

	dbService *services.DbService
}

// OnActivate is called when plugin activates. Reads the config and inits connection to the db
func (p *Plugin) OnActivate() error {
	appConfig := p.API.GetUnsanitizedConfig()

	p.dbService = &services.DbService{
		Supplier: sqlstore.NewSqlSupplier(appConfig.SqlSettings, nil),
	}

	return nil
}

// ServeHTTP is the entry point
func (p *Plugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	//header set automatically by MM on the backend. It is enough to reject requests without it.
	//https://developers.mattermost.com/extend/plugins/server/best-practices/#how-can-plugins-make-sure-http-requests-are-authentic
	userID := getCurrentUserID(r)
	if len(userID) == 0 {
		w.WriteHeader(401)
		return
	}

	handlers := [](func(c *plugin.Context, w http.ResponseWriter, r *http.Request) bool){
		makeHandler("/files/channel", p.serveChannelFileList),
		makeHandler("/files/team", p.serveTeamFileList),
		makeHandler("/files/extensions", p.serveExtensionList),
		makeHandler("/config", p.serveConfig),
	}

	for _, handler := range handlers {
		if didHandle := handler(c, w, r); didHandle {
			return
		}
	}

	w.WriteHeader(404)
}

// returns current user id from a header which is automatically provided by mattermost
// backend and can be trusted (it is not sent from the browser)
func getCurrentUserID(r *http.Request) string {
	return r.Header.Get("Mattermost-User-Id")
}

func makeHandler(path string, handler func(basePath string, c *plugin.Context, w http.ResponseWriter, r *http.Request)) func(c *plugin.Context, w http.ResponseWriter, r *http.Request) bool {
	return func(c *plugin.Context, w http.ResponseWriter, r *http.Request) bool {
		if len(r.URL.Path) >= len(path) && r.URL.Path[:len(path)] == path {
			handler(path, c, w, r)
			return true
		}

		return false
	}
}

// /files/channel/:CHANNEL_ID
func (p *Plugin) serveChannelFileList(basePath string, c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	urlParams := helpers.GetURLPathParams(r.URL.Path, basePath)
	if len(urlParams) == 0 {
		w.WriteHeader(404)
		return
	}

	currentUser := getCurrentUserID(r)
	targetChannel := urlParams[0]
	if isInChannel := p.dbService.CheckUserIsInChannel(currentUser, targetChannel); isInChannel {
		p.API.LogWarn("User not in channel wanted to get file list", map[string]string{
			"currentUser":   currentUser,
			"targetChannel": targetChannel,
		})
		w.WriteHeader(401)
		return
	}

	q := r.URL.Query()
	page := &models.ListPageRequest{
		Page:           1,
		PageSize:       10,
		OrderBy:        "CreateAt",
		OrderDirection: models.DESCENDING,
	}
	page.FromQueryString(&q, []string{"FileName", "CreateByName", "CreateByID", "CreateAt", "Size"})

	if !page.IsValid() {
		w.WriteHeader(400)
		return
	}

	if files, err := p.dbService.GetFileList(targetChannel, "", "", page); err != nil {
		p.API.LogError("Error occured in GetFileList: " + err.Error())
		w.WriteHeader(500)
	} else {
		totalCount := p.dbService.GetTotalFilesCount(targetChannel, "", "", page)
		isChannelAdmin := p.dbService.IsChannelAdmin(currentUser, targetChannel)
		response := &models.FileListResponse{
			Items:                        files,
			Total:                        totalCount,
			CanCurrentUserDeleteAllFiles: isChannelAdmin,
			Request:                      page,
		}
		helpers.ServeJSON(response, w)
	}
}

// /files/team/:TEAM_ID/[all]
func (p *Plugin) serveTeamFileList(basePath string, c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	urlParams := helpers.GetURLPathParams(r.URL.Path, basePath)
	if len(urlParams) == 0 {
		w.WriteHeader(404)
		return
	}

	teamID := urlParams[0]
	shouldReturnAll := false
	currentUser := getCurrentUserID(r)
	if len(urlParams) > 1 {
		shouldReturnAll = urlParams[1] == "all" && p.dbService.IsTeamAdmin(currentUser, teamID)
	}

	q := r.URL.Query()
	page := &models.ListPageRequest{
		Page:           1,
		PageSize:       10,
		OrderBy:        "CreateAt",
		OrderDirection: models.DESCENDING,
	}
	page.FromQueryString(&q, []string{"FileName", "CreateByName", "CreateByID", "CreateAt", "Size"})

	if !page.IsValid() {
		w.WriteHeader(400)
		return
	}

	var limitResultToChannelsOfUser string
	if !shouldReturnAll {
		limitResultToChannelsOfUser = currentUser
	}

	if files, err := p.dbService.GetFileList("", teamID, limitResultToChannelsOfUser, page); err != nil {
		p.API.LogError("Error occured in GetFileList: " + err.Error())
		w.WriteHeader(500)
	} else {
		totalCount := p.dbService.GetTotalFilesCount("", teamID, limitResultToChannelsOfUser, page)
		response := &models.FileListResponse{
			Items:   files,
			Total:   totalCount,
			Request: page,
		}
		helpers.ServeJSON(response, w)
	}
}

// /files/extensions
func (p *Plugin) serveExtensionList(basePath string, c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	if extensions, err := p.dbService.GetAllExtensions(); err != nil {
		p.API.LogError("Error occured in DbService.GetAllExtensions: " + err.Error())
		w.WriteHeader(500)
	} else {
		helpers.ServeJSON(extensions, w)
	}
}

// /config
func (p *Plugin) serveConfig(basePath string, c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	config := p.getConfiguration()
	helpers.ServeJSON(config, w)
}
