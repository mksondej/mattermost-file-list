package services

import (
	"github.com/Amonith/mattermost-file-list/models"
	"github.com/mattermost/mattermost-server/store/sqlstore"
)

// DbService database service with dependencies
type DbService struct {
	Supplier *sqlstore.SqlSupplier
}

// GetFileList returns a list of files for the specific channel with additional info whether specified
// user can delete the file
func (s *DbService) GetFileList(channelID string, page *models.ListPageRequest) ([]*models.FileListItem, error) {
	sql := `
		SELECT
		FileInfo.ID,
		FileInfo.Name as FileName,
		concat(Users.FirstName, ' ', Users.LastName, ' ', '(' ,Users.Username, ')') as CreateByName,
		FileInfo.CreateAt,
		Posts.UserId as CreateByID,
		FileInfo.Size,
		Posts.Id as PostID
		FROM Posts
		JOIN FileInfo ON FileInfo.PostId = Posts.Id
		JOIN Users ON FileInfo.CreatorId = Users.Id
		WHERE Posts.ChannelId = :ChannelId
		AND FileInfo.DeleteAt = 0
	`

	sqlParams := map[string]interface{}{
		"ChannelId":   channelID,
		"PageSize":    page.PageSize,
		"Offset":      (page.Page - 1) * page.PageSize,
	}

	if len(page.SearchQuery) > 0 {
		sql += `AND FileInfo.Name `
		if page.SearchInverted {
			sql += "NOT "
		}

		sql += `LIKE :SearchQuery
		`

		sqlParams["SearchQuery"] = "%" + page.SearchQuery + "%"
	}

	if len(page.OrderBy) > 0 {
		sql += `ORDER BY ` + page.OrderBy

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

// GetTotalFilesCount returns total number of files in a channel
func (s *DbService) GetTotalFilesCount(channelID string, page *models.ListPageRequest) int64 {
	sql := `
		SELECT
		COUNT(*)
		FROM Posts
		JOIN FileInfo ON FileInfo.PostId = Posts.Id
		WHERE Posts.ChannelId = :ChannelId
		AND FileInfo.DeleteAt = 0
	`
	if len(page.SearchQuery) > 0 {
		sql += `AND FileInfo.Name `
		if page.SearchInverted {
			sql += "NOT "
		}

		sql += `LIKE '%' + :SearchQuery + '%'
		`
	}

	sqlParams := map[string]interface{}{
		"ChannelId":   channelID,
		"SearchQuery": page.SearchQuery,
	}

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

// CanUserDeleteAllPostsInChannel checks admin rights of the user to a channel
func (s *DbService) CanUserDeleteAllPostsInChannel(userID, channelID string) bool {
	memberInfo, _ := s.Supplier.Channel().GetMember(channelID, userID)
	return memberInfo.SchemeAdmin
}
