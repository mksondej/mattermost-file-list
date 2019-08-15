package models

import (
	"net/url"
	"strconv"
)

type OrderDirection byte

const (
	ASCENDING OrderDirection = iota
	DESCENDING
)

type ListPageRequest struct {
	Page           int
	PageSize       int
	OrderBy        string
	OrderDirection OrderDirection
}

// FromQueryString initializes page request from query sting values
func (p *ListPageRequest) FromQueryString(q *url.Values) {
	var err error

	if p.Page, err = strconv.Atoi(q.Get("Page")); err != nil {
		p.Page = 1
	}

	if p.PageSize, err = strconv.Atoi(q.Get("PageSize")); err != nil {
		p.PageSize = 10
	}

	p.OrderBy = q.Get("OrderBy")

	if p.PageSize, err = strconv.Atoi(q.Get("PageSize")); err != nil {
		p.PageSize = 10
	}

	if dir, err := strconv.Atoi(q.Get("OrderDirection")); err != nil {
		p.OrderDirection = ASCENDING
	} else {
		p.OrderDirection = OrderDirection(dir)
	}
}
