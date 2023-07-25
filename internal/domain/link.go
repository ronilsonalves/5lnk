package domain

type Link struct {
	ID        uint   `gorm:"primaryKey"`
	Original  string `gorm:"uniqueIndex"`
	Shortened string `gorm:"uniqueIndex"`
	FinalURL  string
}
