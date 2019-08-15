package helpers

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetURLPathParams(t *testing.T) {
	assert := assert.New(t)
	params := GetURLPathParams("/something/asdf/gfdsfg/cvnbdfg", "/something")

	expected := []string{
		"asdf",
		"gfdsfg",
		"cvnbdfg",
	}

	assert.Equal(expected, params)
	fmt.Println(params)
}
