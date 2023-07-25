package web

type ShortenURL struct {
	URL         string `json:"url" binding:"required"`
	ShortDomain string `json:"domain" biding:"required"`
	Alias       string `json:"alias"`
}
