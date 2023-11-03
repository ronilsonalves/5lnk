package stats

import (
	"github.com/ronilsonalves/5lnk/internal/domain"
	"gorm.io/gorm"
	"log"
)

type Repository interface {
	CountLinksByUser(userId string) (int64, error)
	CountLinkClicksByUser(userId string) (int64, error)
	CountPagesByUser(userId string) (int64, error)
	CountPageViewsByUser(userId string) (int64, error)
	CreateLinkStats(stats domain.Stats) error
	CreatePageStats(stats domain.Stats) error
	FindLinkStats(linkId string) ([]domain.Stats, error)
	FindPageStats(pageId string) ([]domain.Stats, error)
	Delete(statsId string) error
}

type statsRepository struct {
	db *gorm.DB
}

// NewStatsRepository creates a new stats repository
func NewStatsRepository(db *gorm.DB) Repository {
	return &statsRepository{db: db}
}

// CreateLinkStats registers in database a new stats for a link
func (r *statsRepository) CreateLinkStats(stats domain.Stats) error {
	if err := r.db.Create(&stats).Error; err != nil {
		log.Printf("ERROR: unable to register stats for link: %v", err.Error())
		return err
	}
	return nil
}

// CreatePageStats registers in database a new stats for a page
func (r *statsRepository) CreatePageStats(stats domain.Stats) error {
	if err := r.db.Create(&stats).Error; err != nil {
		log.Printf("ERROR: unable to register stats for page: %v", err.Error())
		return err
	}
	return nil
}

// FindLinkStats returns all stats for a link
func (r *statsRepository) FindLinkStats(linkId string) ([]domain.Stats, error) {
	var stats []domain.Stats
	if err := r.db.Where("link = ?", linkId).Find(&stats).Error; err != nil {
		log.Printf("ERROR: unable to find stats for link: %v", err.Error())
		return nil, err
	}
	return stats, nil
}

// FindPageStats returns all stats for a page
func (r *statsRepository) FindPageStats(pageId string) ([]domain.Stats, error) {
	var stats []domain.Stats
	if err := r.db.Where("page = ?", pageId).Find(&stats).Error; err != nil {
		log.Printf("ERROR: unable to find stats for page: %v", err.Error())
		return nil, err
	}
	return stats, nil
}

// Delete removes a stats from database
func (r *statsRepository) Delete(statsId string) error {
	return r.db.Where("id = ?", statsId).Delete(&domain.Stats{}).Error
}

// CountLinksByUser returns the number of links created by the user
func (r *statsRepository) CountLinksByUser(userId string) (int64, error) {
	var count int64
	if err := r.db.Model(&domain.Link{}).Where("user_id = ?", userId).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

// CountLinkClicksByUser returns the number of clicks by the user
func (r *statsRepository) CountLinkClicksByUser(userId string) (int64, error) {
	var total int
	if err := r.db.Raw("SELECT SUM(clicks) as total FROM links WHERE user_id = ?", userId).Scan(&total).Error; err != nil {
		if err.Error() == `sql: Scan error on column index 0, name "total": converting NULL to int is unsupported` {
			return 0, nil
		}
		return 0, err
	}
	return int64(total), nil
}

// CountPagesByUser returns the number of links pages created by the user
func (r *statsRepository) CountPagesByUser(userId string) (int64, error) {
	var count int64
	if err := r.db.Model(&domain.LinksPage{}).Where("user_id = ?", userId).Count(&count).Error; err != nil {
		log.Printf("ERROR: unable to count the number of pages by user: %v", err.Error())
		return 0, err
	}
	return count, nil
}

// CountPageViewsByUser returns the number of views by the user
func (r *statsRepository) CountPageViewsByUser(userId string) (int64, error) {
	var viewsCount int
	if err := r.db.Raw("SELECT SUM(views) as views_count FROM links_pages WHERE user_id = ?", userId).Scan(&viewsCount).Error; err != nil {
		if err.Error() == `sql: Scan error on column index 0, name "views_count": converting NULL to int is unsupported` {
			return 0, nil
		}
		log.Printf("ERROR: unable to count the number of views by user: %v", err.Error())
		return 0, err
	}
	return int64(viewsCount), nil
}
