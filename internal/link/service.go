package link

import (
	"fmt"
	"github.com/google/uuid"
	"github.com/ronilsonalves/5lnk/internal/domain"
	"github.com/ronilsonalves/5lnk/pkg/web"
	"math/rand"
	"time"
)

type Service interface {
	ShortenURL(request web.ShortenURL) (domain.Link, error)
	GetLink(id string) (*domain.Link, error)
	Update(request web.ShortenedURL) (domain.Link, error)
	GetOriginalURL(shortened string) (string, error)
	GetAllByUser(userId string) (*[]domain.Link, error)
	Delete(request web.ShortenedURL) error
	CountLinksByUser(userId string) (int64, error)
	CountLinkClicksByUser(userId string) (int64, error)
}

type linkService struct {
	repo Repository
}

// NewLinkService creates a new link service
func NewLinkService(repo Repository) Service {
	return &linkService{repo: repo}
}

// GetLink returns a link by the ID
func (s *linkService) GetLink(id string) (*domain.Link, error) {
	linkId, err := uuid.Parse(id)
	if err != nil {
		return nil, fmt.Errorf("invalid link id")
	}
	return s.repo.FindByID(linkId)
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
		UserId:    request.UserId,
		CreatedAt: time.Now(),
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

// GetAllByUser returns all shortened links by user
func (s *linkService) GetAllByUser(userId string) (*[]domain.Link, error) {
	return s.repo.FindAllByUser(userId)
}

// Update updates a link
func (s *linkService) Update(request web.ShortenedURL) (domain.Link, error) {
	toUpdate, err := s.repo.FindByID(request.Id)
	if err != nil {
		return domain.Link{}, err
	}

	// For now, only the original URL can be updated
	toUpdate.Original = request.Original

	if err := s.repo.Update(toUpdate); err != nil {
		return domain.Link{}, err
	}

	return *toUpdate, nil
}

// CountLinksByUser counts the number of shortened links by user
func (s *linkService) CountLinksByUser(userId string) (int64, error) {
	return s.repo.CountLinksByUser(userId)
}

// CountLinkClicksByUser counts the number of clicks by user
func (s *linkService) CountLinkClicksByUser(userId string) (int64, error) {
	return s.repo.CountLinkClicksByUser(userId)
}

// Delete deletes a link
func (s *linkService) Delete(request web.ShortenedURL) error {
	toDelete, err := s.repo.FindByID(request.Id)
	if err != nil {
		return fmt.Errorf("unable to delete link: %v", err)
	}
	return s.repo.Delete(toDelete)
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
