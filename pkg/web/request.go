package web

import (
	"github.com/google/uuid"
)

type ShortenURL struct {
	URL         string `json:"url" binding:"required"`
	ShortDomain string `json:"domain" biding:"required"`
	UserId      string `json:"userId" biding:"required"`
	Alias       string `json:"alias"`
}

type ShortenedURL struct {
	Id        uuid.UUID `json:"id" binding:"required"`
	Original  string    `json:"original" binding:"required"`
	Shortened string    `json:"shortened" binding:"required"`
	UserID    string    `json:"userId" binding:"required"`
}

type APIKey struct {
	UserId string `json:"userId" binding:"required"`
}
