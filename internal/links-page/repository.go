package links_page

import (
	"github.com/google/uuid"
	"github.com/ronilsonalves/5lnk/internal/domain"
	"gorm.io/gorm"
	"log"
)

type Repository interface {
	FindById(id uuid.UUID) (domain.LinksPage, error)
	FindByAddress(address string) (*domain.LinksPage, error)
	FindAllByUser(userId string) (*[]domain.LinksPage, error)
	Create(linksPage *domain.LinksPage) error
	Update(linksPage *domain.LinksPage) error
	Delete(linksPage *domain.LinksPage) error
}

type linksPageRepository struct {
	db *gorm.DB
}

// NewLinksPageRepository creates a new linksPage repository
func NewLinksPageRepository(db *gorm.DB) Repository {
	return &linksPageRepository{db: db}
}

// FindById finds a linksPage by the ID
func (r *linksPageRepository) FindById(id uuid.UUID) (domain.LinksPage, error) {
	var linksPage domain.LinksPage
	if err := r.db.Where("id = ?", id).Preload("Links").First(&linksPage).Error; err != nil {
		log.Printf("ERROR: unable to find the links page by ID due to %v", err.Error())
		return domain.LinksPage{}, err
	}
	return linksPage, nil
}

// FindByAddress finds a linksPage by the address
func (r *linksPageRepository) FindByAddress(alias string) (*domain.LinksPage, error) {
	var linksPage domain.LinksPage
	if err := r.db.Where("alias = ?", alias).Preload("Links").First(&linksPage).Error; err != nil {
		log.Printf("ERROR: unable to find the links page by address due to %v", err.Error())
		return nil, err
	}
	log.Printf("INFO: updating views for links page: %v", linksPage.ID)
	go r.db.Raw("UPDATE links_pages SET views = views + 1 WHERE id = ?", linksPage.ID).Scan(&linksPage)
	return &linksPage, nil
}

// FindAllByUser finds all linksPage by user
func (r *linksPageRepository) FindAllByUser(userId string) (*[]domain.LinksPage, error) {
	var linksPage []domain.LinksPage
	if err := r.db.Where("user_id = ?", userId).Preload("Links").Find(&linksPage).Error; err != nil {
		log.Printf("unable to find the links page by user: %v", err.Error())
		return nil, err
	}
	return &linksPage, nil
}

// Create creates a new linksPage
func (r *linksPageRepository) Create(linksPage *domain.LinksPage) error {
	return r.db.Create(linksPage).Error
}

// Update updates a linksPage
func (r *linksPageRepository) Update(linksPage *domain.LinksPage) error {
	return r.db.Updates(linksPage).Error
}

// Delete deletes a linksPage
func (r *linksPageRepository) Delete(linksPage *domain.LinksPage) error {
	return r.db.Select("Links").Delete(linksPage).Error
}
