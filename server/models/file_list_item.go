package models

// FileListItem holds basic info about a file posted on some channel
type FileListItem struct {
	ID           string
	PostID       string
	FileName     string
	CreateByName string
	CreateByID   string
	CreateAt     int64
	Size         int64
}
