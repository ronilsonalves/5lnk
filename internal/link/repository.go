package link

import (
	"github.com/google/uuid"
	"github.com/ronilsonalves/5lnk/internal/domain"
	"gorm.io/gorm"
	"log"
)

type Repository interface {
	FindByID(id uuid.UUID) (*domain.Link, error)
	FindByOriginal(original string) (*domain.Link, error)
	FindByShortened(shortened string) (*domain.Link, error)
	FindAllByUser(userId string) (*[]domain.Link, error)
	Create(link *domain.Link) error
	Update(link *domain.Link) error
	Delete(link *domain.Link) error
}

type linkRepository struct {
	db *gorm.DB
}

// NewLinkRepository creates a new link repository
func NewLinkRepository(db *gorm.DB) Repository {
	return &linkRepository{db: db}
}

// FindByID finds a link by the ID
func (r *linkRepository) FindByID(id uuid.UUID) (*domain.Link, error) {
	var link domain.Link
	if err := r.db.Where("id = ?", id).First(&link).Error; err != nil {
		return nil, err
	}
	return &link, nil
}

// FindByOriginal finds a link by the original URL
func (r *linkRepository) FindByOriginal(original string) (*domain.Link, error) {
	var link domain.Link
	if err := r.db.Where("original = ?", original).First(&link).Error; err != nil {
		return nil, err
	}
	return &link, nil
}

// FindByShortened finds a link by the shortened URL
func (r *linkRepository) FindByShortened(shortened string) (*domain.Link, error) {
	var link domain.Link
	if err := r.db.Where("shortened = ?", shortened).First(&link).Error; err != nil {
		return nil, err
	}
	go r.db.Model(&link).Update("clicks", link.Clicks+1)
	return &link, nil
}

// FindAllByUser finds all links by user
func (r *linkRepository) FindAllByUser(userId string) (*[]domain.Link, error) {
	var links []domain.Link
	if err := r.db.Where("user_id = ?", userId).Find(&links).Error; err != nil {
		return nil, err
	}
	return &links, nil
}

// Update updates a link
func (r *linkRepository) Update(link *domain.Link) error {
	_, err := r.FindByID(link.ID)
	if err != nil {
		log.Printf("ERROR: unable to find link due to %v", err)
		return err
	}
	return r.db.Updates(link).Error
}

// Create creates a new shortened URL
func (r *linkRepository) Create(link *domain.Link) error {
	return r.db.Create(link).Error
}

// Delete deletes a link
func (r *linkRepository) Delete(link *domain.Link) error {
	return r.db.Where("id = ?", link.ID).Delete(link).Error
}
