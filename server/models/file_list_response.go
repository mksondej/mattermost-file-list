package models

// FileListResponse holds response for /files/channel
type FileListResponse struct {
	Items                        []*FileListItem
	Total                        int64
	CanCurrentUserDeleteAllFiles bool
	Request                      *ListPageRequest
}
