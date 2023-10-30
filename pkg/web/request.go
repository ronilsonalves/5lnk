package web

// CreateLinksPage represents the request to create a new links page
type CreateLinksPage struct {
	Title       string  `json:"title" binding:"required"`
	Description string  `json:"description" binding:"required"`
	ImageURL    string  `json:"imageURL" binding:"required"`
	UserId      string  `json:"userId" binding:"required"`
	Alias       string  `json:"alias" binding:"required"`
	Domain      string  `json:"domain" binding:"required"`
	Links       []links `json:"links" binding:"required"`
}

// CreateShortenURL represents the request to create a new shortened URL
type CreateShortenURL struct {
	URL         string `json:"url" binding:"required"`
	ShortDomain string `json:"domain" biding:"required"`
	UserId      string `json:"userId" biding:"required"`
	Title       string `json:"title"`
	PageRefer   string `json:"pageRefer"`
	Alias       string `json:"alias"`
}

type APIKey struct {
	UserId string `json:"userId" binding:"required"`
}

// Stats represents the stats summary
type Stats struct {
	Links LinksSummary `json:"links"`
	Pages PagesSummary `json:"pages"`
}

type links struct {
	Original string `json:"original" binding:"required"`
	Title    string `json:"title" binding:"required"`
}

type LinksSummary struct {
	Total  int64 `json:"total"`
	Clicks int64 `json:"clicks"`
}

type PagesSummary struct {
	Total int64 `json:"total"`
	Views int64 `json:"views"`
}
