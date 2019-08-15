package helpers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

// ServeJSON serves `obj` as json to `w` or reports an internal server error
func ServeJSON(obj interface{}, w http.ResponseWriter) {
	if objJSON, err := json.Marshal(obj); err == nil {
		w.Header().Set("Content-Type", "application/json")
		w.Write(objJSON)
		return
	}

	w.WriteHeader(500)
	fmt.Fprint(w, "Error during encoding to JSON")
}

// GetURLPathParams extracts remaining path components from url after some prefix
func GetURLPathParams(url string, ignorePrefix string) []string {
	urlAfterIgnore := url[len(ignorePrefix):]
	if len(urlAfterIgnore) > 0 && urlAfterIgnore[0] == '/' {
		urlAfterIgnore = urlAfterIgnore[1:]
	}

	return strings.Split(urlAfterIgnore, "/")
}
