package web

// Pagination is a struct that represents a pageable object.
type Pagination struct {
	PageSize   int         `json:"pageSize,omitempty;query:pageSize"`
	PageNumber int         `json:"pageNumber,omitempty;query:pageNumber"`
	Sort       string      `json:"sort,omitempty;query:sort"`
	Items      int64       `json:"items,omitempty"`
	TotalPages int64       `json:"TotalPages,omitempty"`
	Data       interface{} `json:"data,omitempty"`
}

// GetOffset returns the offset value for a query.
func (p *Pagination) GetOffset() int {
	return (p.GetPage() - 1) * p.GetLimit()
}

// GetLimit returns the limit value for a query.
func (p *Pagination) GetLimit() int {
	if p.PageSize == 0 {
		return 10
	}
	return p.PageSize
}

// GetPage returns the page value for a query.
func (p *Pagination) GetPage() int {
	if p.PageNumber == 0 {
		return 1
	}
	return p.PageNumber
}

// GetSort returns the sort value for a query.
func (p *Pagination) GetSort() string {
	if p.Sort == "" {
		return "id desc"
	}
	return p.Sort
}
