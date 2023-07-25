package link

import (
	"github.com/ronilsonalves/5lnk/internal/domain"
	"gorm.io/gorm"
)

type Repository interface {
	FindByOriginal(original string) (*domain.Link, error)
	FindByShortened(shortened string) (*domain.Link, error)
	Create(link *domain.Link) error
}

type linkRepository struct {
	db *gorm.DB
}

func NewLinkRepository(db *gorm.DB) Repository {
	return &linkRepository{db: db}
}

func (r *linkRepository) FindByOriginal(original string) (*domain.Link, error) {
	var link domain.Link
	if err := r.db.Where("original = ?", original).First(&link).Error; err != nil {
		return nil, err
	}
	return &link, nil
}

func (r *linkRepository) FindByShortened(shortened string) (*domain.Link, error) {
	var link domain.Link
	if err := r.db.Where("shortened = ?", shortened).First(&link).Error; err != nil {
		return nil, err
	}
	return &link, nil
}

func (r *linkRepository) Create(link *domain.Link) error {
	return r.db.Create(link).Error
}
