package link

import (
	"fmt"
	"github.com/google/uuid"
	"github.com/ronilsonalves/5lnk/internal/domain"
	"github.com/ronilsonalves/5lnk/internal/utils"
	"github.com/ronilsonalves/5lnk/pkg/web"
	"log"
	"strings"
	"time"
)

type Service interface {
	ShortenURL(request web.CreateShortenURL) (domain.Link, error)
	GetLink(linkId uuid.UUID) (*domain.Link, error)
	Update(shortened domain.Link) (domain.Link, error)
	GetOriginalURL(shortened string) (string, error)
	GetShortenedByOriginal(original string) (*domain.Link, error)
	GetAllByUser(userId string) (*[]domain.Link, error)
	Delete(shortened domain.Link) error
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
func (s *linkService) GetLink(linkId uuid.UUID) (*domain.Link, error) {
	return s.repo.FindByID(linkId)
}

// ShortenURL creates a new shortened URL
func (s *linkService) ShortenURL(request web.CreateShortenURL) (domain.Link, error) {
	if request.UserId == "" || !strings.HasPrefix(request.UserId, "CREATED_BY_SYSTEM_") {
		link, err := s.repo.FindByOriginal(request.URL)
		if err == nil {
			return *link, nil
		}
	}

	// Generate a new shortened URL
	shortened := utils.GenerateRandomAlias(request.Alias)

	// Create a new Link object
	var link = &domain.Link{
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

// GetShortenedByOriginal returns the shortened URL from the original URL
func (s *linkService) GetShortenedByOriginal(original string) (*domain.Link, error) {
	link, err := s.repo.FindByOriginal(original)
	if err != nil {
		log.Printf("ERROR: unable to find the shortened URL for the original URL `%s` due to %v", original, err.Error())
		return &domain.Link{}, err
	}
	if strings.HasPrefix(link.UserId, "CREATED_BY_SYSTEM_") {
		return link, nil
	}
	return &domain.Link{}, fmt.Errorf("the original URL `%s` already been used by a shortened URL", original)
}

// GetAllByUser returns all shortened links by user
func (s *linkService) GetAllByUser(userId string) (*[]domain.Link, error) {
	log.Printf("INFO: getting all links pages by userId `%v`...", userId)
	return s.repo.FindAllByUser(userId)
}

// Update updates a link
func (s *linkService) Update(request domain.Link) (domain.Link, error) {
	if err := s.repo.Update(&request); err != nil {
		return domain.Link{}, err
	}
	return request, nil
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
func (s *linkService) Delete(request domain.Link) error {
	return s.repo.Delete(&request)
}
