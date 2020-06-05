package services

import (
	"strings"

	"github.com/Amonith/mattermost-file-list/models"
	"github.com/mattermost/mattermost-server/store/sqlstore"
)

// DbService database service with dependencies
type DbService struct {
	Supplier *sqlstore.SqlSupplier
}

// GetFileList returns a list of files for the specific channel with additional info whether specified
// user can delete the file.
// Either `channelID` or `teamID` has to be specified.
// If you filter by team and not by cahnnel, `channelsOfUserIDOnly` can filter returned channels
// to only those whether specified user is a member.
func (s *DbService) GetFileList(
	channelID string,
	teamID string,
	channelsOfUserIDOnly string,
	page *models.ListPageRequest,
) ([]*models.FileListItem, error) {

	sql := `SELECT
			FileInfo.ID,
			FileInfo.Name as FileName,
			concat(Users.FirstName, ' ', Users.LastName, ' ', '(' ,Users.Username, ')') as CreateByName,
			FileInfo.CreateAt,
			Posts.UserId as CreateByID,
			FileInfo.Size,
			Posts.Id as PostID,
			FileInfo.HasPreviewImage
		`
	if len(teamID) > 0 {
		sql += `,Channels.DisplayName as ChannelName
		`
	}

	sql += `FROM Posts
		JOIN FileInfo ON FileInfo.PostId = Posts.Id
		JOIN Users ON FileInfo.CreatorId = Users.Id
	`

	if len(teamID) > 0 {
		sql += `JOIN Channels ON Channels.Id = Posts.ChannelId
		`
	}

	if len(channelsOfUserIDOnly) > 0 {
		sql += `JOIN ChannelMembers ON ChannelMembers.ChannelId = Posts.ChannelId
		`
	}

	sql += `WHERE FileInfo.DeleteAt = 0
	`

	if len(teamID) > 0 {
		sql += `AND Channels.TeamId = :TeamId
		`
	}

	if len(channelsOfUserIDOnly) > 0 {
		sql += `AND ChannelMembers.UserId = :UserId
		`
	}

	if len(channelID) > 0 {
		sql += `AND Posts.ChannelId = :ChannelId
		`
	}

	sqlParams := map[string]interface{}{
		"ChannelId": channelID,
		"TeamId":    teamID,
		"UserId":    channelsOfUserIDOnly,
		"PageSize":  page.PageSize,
		"Offset":    (page.Page - 1) * page.PageSize,
	}

	if len(page.SearchQuery) > 0 {
		if page.IsCaseInsensitive {
			sql += "AND UPPER(FileInfo.Name) "
			sqlParams["SearchQuery"] = "%" + strings.ToUpper(page.SearchQuery) + "%"
		} else {
			sql += "AND FileInfo.Name "
			sqlParams["SearchQuery"] = "%" + page.SearchQuery + "%"
		}

		if page.SearchInverted {
			sql += "NOT "
		}

		sql += `LIKE :SearchQuery
		`
	}

	if len(page.Extension) > 0 {
		sql += `AND FileInfo.Extension = :Extension
		`
		sqlParams["Extension"] = page.Extension
	}

	if len(page.OrderBy) > 0 {
		sql += "ORDER BY " + page.OrderBy
		if page.OrderDirection == models.ASCENDING {
			sql += " ASC"
		} else {
			sql += " DESC"
		}

		sql += `
		`
	}

	sql += `LIMIT :PageSize OFFSET :Offset`

	var files []*models.FileListItem
	_, err := s.Supplier.GetReplica().Select(&files, sql, sqlParams)

	return files, err
}

// GetTotalFilesCount returns total number of files in a channel or team, optionally
// filtered by channels only of the specified user.
func (s *DbService) GetTotalFilesCount(
	channelID string,
	teamID string,
	channelsOfUserIDOnly string,
	page *models.ListPageRequest,
) int64 {
	sqlParams := make(map[string]interface{})

	sql := `
		SELECT
		COUNT(*)
		FROM Posts
		JOIN FileInfo ON FileInfo.PostId = Posts.Id
	`

	//joins {
	if len(teamID) > 0 {
		sql += `JOIN Channels ON Channels.Id = Posts.ChannelId
		`
	}

	if len(channelsOfUserIDOnly) > 0 {
		sql += `JOIN ChannelMembers ON ChannelMembers.ChannelId = Posts.ChannelId
		`
	}
	//}

	//conditions {
	sql += `WHERE FileInfo.DeleteAt = 0
	`

	if len(channelID) > 0 {
		sql += `AND Posts.ChannelId = :ChannelId
		`
		sqlParams["ChannelId"] = channelID
	}

	if len(teamID) > 0 {
		sql += `AND Channels.TeamId = :TeamId
		`
		sqlParams["TeamId"] = teamID
	}

	if len(channelsOfUserIDOnly) > 0 {
		sql += `AND ChannelMembers.UserId = :UserId
		`

		sqlParams["UserId"] = channelsOfUserIDOnly
	}

	if len(page.SearchQuery) > 0 {
		if page.IsCaseInsensitive {
			sql += "AND UPPER(FileInfo.Name) "
			sqlParams["SearchQuery"] = "%" + strings.ToUpper(page.SearchQuery) + "%"
		} else {
			sql += "AND FileInfo.Name "
			sqlParams["SearchQuery"] = "%" + page.SearchQuery + "%"
		}

		if page.SearchInverted {
			sql += "NOT "
		}

		sql += `LIKE :SearchQuery
		`
	}

	if len(page.Extension) > 0 {
		sql += `AND FileInfo.Extension = :Extension
		`
		sqlParams["Extension"] = page.Extension
	}

	//}

	count, err := s.Supplier.GetReplica().SelectInt(sql, sqlParams)
	if err != nil {
		return 0
	}

	return count
}

// CheckUserIsInChannel returns true if the specified user is a member of the specified channel
func (s *DbService) CheckUserIsInChannel(userID, channelID string) bool {
	sql := "SELECT EXISTS (SELECT ChannelId FROM ChannelMembers WHERE ChannelId = :ChannelId AND UserId = :UserId)"
	sqlParams := map[string]interface{}{"ChannelId": channelID, "UserID": userID}

	result, err := s.Supplier.GetReplica().SelectInt(sql, sqlParams)
	return err != nil && result > 0
}

// IsChannelAdmin checks admin rights of the user to a channel
func (s *DbService) IsChannelAdmin(userID, channelID string) bool {
	memberInfo, _ := s.Supplier.Channel().GetMember(channelID, userID)
	return memberInfo.SchemeAdmin
}

// IsTeamAdmin checks admin rights of the user to an entire team
func (s *DbService) IsTeamAdmin(userID, teamID string) bool {
	memberInfo, _ := s.Supplier.Team().GetMember(teamID, userID)
	return memberInfo.SchemeAdmin
}

// GetAllExtensions returns distinct list of all uploaded file extensions in alphabetic order
func (s *DbService) GetAllExtensions(channelID string, teamID string) ([]string, error) {
	sqlParams := make(map[string]interface{})
	sql := `SELECT DISTINCT FileInfo.Extension
		FROM FileInfo
		JOIN Posts ON Posts.Id = FileInfo.PostId
		`
	if len(channelID) > 0 {
		sql += `WHERE Posts.ChannelId = :ChannelId
		`
		sqlParams["ChannelId"] = channelID
	} else if len(teamID) > 0 {
		sql += `JOIN Channels ON Channels.Id = Posts.ChannelId
		WHERE Channels.TeamId = :TeamId
		`
		sqlParams["TeamId"] = teamID
	}

	sql += `ORDER BY FileInfo.Extension ASC`

	var extensions []string
	_, err := s.Supplier.GetReplica().Select(&extensions, sql, sqlParams)
	return extensions, err
}
