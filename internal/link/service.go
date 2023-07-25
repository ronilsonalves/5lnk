package link

import (
	"github.com/ronilsonalves/5lnk/internal/domain"
	"github.com/ronilsonalves/5lnk/pkg/web"
	"math/rand"
)

type Service interface {
	ShortenURL(request web.ShortenURL) (domain.Link, error)
	GetOriginalURL(shortened string) (string, error)
}

type linkService struct {
	repo Repository
}

// NewLinkService creates a new link service
func NewLinkService(repo Repository) Service {
	return &linkService{repo: repo}
}

// ShortenURL creates a new shortened URL
func (s *linkService) ShortenURL(request web.ShortenURL) (domain.Link, error) {
	// Check if the URL already exists in the database
	link, err := s.repo.FindByOriginal(request.URL)
	if err == nil {
		return *link, nil
	}

	// Generate a new shortened URL
	shortened := generateShortURL(request.Alias)

	// Create a new Link object
	link = &domain.Link{
		Original:  request.URL,
		Shortened: shortened,
		FinalURL:  "https://" + request.ShortDomain + "/" + shortened,
	}

	// Insert the link into the database
	if err := s.repo.Create(link); err != nil {
		return domain.Link{}, err
	}

	return *link, nil
}

// GetOriginalURL returns the original URL from the shortened URL
func (s *linkService) GetOriginalURL(shortened string) (string, error) {
	link, err := s.repo.FindByShortened(shortened)
	if err != nil {
		return "", err
	}
	return link.Original, nil
}

// generateShortURL generates a random 6-character alphanumeric string for the shortened URL
func generateShortURL(alias string) string {
	if alias != "" {
		return alias
	}
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	shortened := make([]byte, 6)
	for i := range shortened {
		shortened[i] = chars[rand.Intn(len(chars))]
	}
	return string(shortened)
}
