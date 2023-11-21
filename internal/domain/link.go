package domain

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
	"time"
)

// TODO: remove click from link struct and use stats instead

// Link struct is the representation of a shortened link.
type Link struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Original  string    `gorm:"index" json:"original"`
	Title     string    `json:"title"`
	Shortened string    `gorm:"uniqueIndex" json:"shortened"`
	FinalURL  string    `json:"finalUrl"`
	UserId    string    `gorm:"index" json:"userId"`
	PageRefer string    `gorm:"type:text;index,unsigned" json:"pageRefer"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	Clicks    int       `json:"clicks"`
}

// BeforeCreate initialize UUID and set 0 as initial value for links' click.
func (Link *Link) BeforeCreate(scope *gorm.DB) error {
	id, err := uuid.NewRandom()
	if err != nil {
		return err
	}
	scope.Statement.SetColumn("id", id)
	scope.Statement.SetColumn("clicks", 0)
	return nil
}
