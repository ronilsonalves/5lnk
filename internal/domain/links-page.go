package domain

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
	"time"
)

type LinksPage struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Links       []Link    `gorm:"foreignKey:PageRefer" json:"links"`
	UserId      string    `gorm:"index" json:"userId"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	ImageURL    string    `json:"imageURL"`
	Alias       string    `gorm:"uniqueIndex" json:"alias"`
	Domain      string    `json:"domain"`
	FinalURL    string    `json:"finalURL"`
	Views       int       `json:"views"`
	CreatedAt   time.Time `json:"createdAt"`
}

// BeforeCreate initialize UUID.
func (LinksPage *LinksPage) BeforeCreate(scope *gorm.DB) error {
	id, err := uuid.NewRandom()
	if err != nil {
		return err
	}
	scope.Statement.SetColumn("id", id)
	scope.Statement.SetColumn("views", 0)
	return nil
}
