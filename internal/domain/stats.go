package domain

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
	"time"
)

// Stats struct is the representation of a shortened link's or page stats.
type Stats struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	LinkRefer string    `gorm:"index,unsigned" json:"linkRefer,omitempty"`
	PageRefer string    `gorm:"index,unsigned" json:"pageRefer,omitempty"`
	Timestamp time.Time `json:"timestamp"`
	Os        string    `json:"os"`
	Browser   string    `json:"browser"`
}

// BeforeCreate initialize UUID.
func (Stats *Stats) BeforeCreate(scope *gorm.DB) error {
	id, err := uuid.NewRandom()
	if err != nil {
		return err
	}
	scope.Statement.SetColumn("id", id)
	return nil
}
