package stats

import (
	"github.com/google/uuid"
	"github.com/ronilsonalves/5lnk/internal/domain"
	"github.com/ronilsonalves/5lnk/internal/utils"
	"github.com/ronilsonalves/5lnk/pkg/web"
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
	FindStatsByUser(pagination web.Pagination, userId string) (web.Pagination, error)
	FindLinkStats(pagination web.Pagination, linkId string) (web.Pagination, error)
	FindPageStats(pagination web.Pagination, pageId string) (web.Pagination, error)
	FindLinkStatsByUserAndDate(userId, startDate, endDate string) (*[]web.StatsByDate, error)
	FindPageStatsByUserAndDate(userId, startDate, endDate string) (*[]web.StatsByDate, error)
	CountPageStatsByDate(pageId uuid.UUID, startDate, endDate string) (*[]web.StatsByDate, error)
	CountLinkStatsByDate(linkId uuid.UUID, startDate, endDate string) (*[]web.StatsByDate, error)
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

// FindLinkStatsByUserAndDate returns all link stats for a user and date
func (r *statsRepository) FindLinkStatsByUserAndDate(userId, startDate, endDate string) (*[]web.StatsByDate, error) {
	var userLinkStatsByDate []web.StatsByDate
	if err := r.db.Raw("SELECT DATE(timestamp) as date, os, browser, COUNT(stats.id) as total from stats INNER JOIN links ON links.id::text = link_refer WHERE links.user_id = ? AND DATE(timestamp) BETWEEN ? AND ? GROUP BY DATE(timestamp), os, browser", userId, startDate, endDate).Scan(&userLinkStatsByDate).Error; err != nil {
		log.Printf("ERROR: unable to find the user link stats by date due to %v", err.Error())
		return &[]web.StatsByDate{}, err
	}
	for _, s := range userLinkStatsByDate {
		s.Date = s.Date[0:10]
	}
	return &userLinkStatsByDate, nil
}

// FindPageStatsByUserAndDate returns all page stats for a user and date
func (r *statsRepository) FindPageStatsByUserAndDate(userId, startDate, endDate string) (*[]web.StatsByDate, error) {
	var userPageStatsByDate []web.StatsByDate
	if err := r.db.Raw("SELECT DATE(timestamp) as date, os, browser, COUNT(stats.id) as total from stats INNER JOIN links_pages as l ON l.id::text = page_refer WHERE l.user_id = ? AND DATE(timestamp) BETWEEN ? AND ? GROUP BY DATE(timestamp), os, browser", userId, startDate, endDate).Scan(&userPageStatsByDate).Error; err != nil {
		log.Printf("ERROR: unable to find the user page stats by date due to %v", err.Error())
		return &[]web.StatsByDate{}, err
	}
	for _, s := range userPageStatsByDate {
		s.Date = s.Date[0:10]
	}
	return &userPageStatsByDate, nil
}

// FindStatsByUser returns all stats for a user
func (r *statsRepository) FindStatsByUser(pagination web.Pagination, userId string) (web.Pagination, error) {
	var stats []domain.Stats
	if err := r.db.Scopes(utils.PaginateStatsByUserID(userId, stats, &pagination, r.db)).Find(&stats).Error; err != nil {
		log.Printf("ERROR: unable to list stats by user: %v", err.Error())
		return web.Pagination{}, err
	}
	pagination.Data = stats
	return pagination, nil
}

// FindLinkStats returns all stats for a link
func (r *statsRepository) FindLinkStats(pagination web.Pagination, linkId string) (web.Pagination, error) {
	var stats []domain.Stats
	if err := r.db.Scopes(utils.PaginateStatsByLinkRef(linkId, stats, &pagination, r.db)).Find(&stats).Error; err != nil {
		log.Printf("ERROR: unable to find stats for link due to %v", err.Error())
		return web.Pagination{}, err
	}
	pagination.Data = stats
	return pagination, nil
}

// FindPageStats returns all stats for a page
func (r *statsRepository) FindPageStats(pagination web.Pagination, pageId string) (web.Pagination, error) {
	var stats []domain.Stats

	if err := r.db.Scopes(utils.PaginateStatsByPageRef(pageId, stats, &pagination, r.db)).Find(&stats).Error; err != nil {
		log.Printf("ERROR: unable to find stats for page due to %v", err.Error())
		return web.Pagination{}, err
	}

	pagination.Data = stats
	return pagination, nil
}

// CountPageStatsByDate returns the number of views by date
func (r *statsRepository) CountPageStatsByDate(pageId uuid.UUID, startDate, endDate string) (*[]web.StatsByDate, error) {
	var statsByDate []web.StatsByDate
	if err := r.db.Raw("SELECT DATE(timestamp) as date, os, browser, COUNT(id) as total FROM stats WHERE page_refer = ? AND DATE(timestamp) BETWEEN ? AND ? GROUP BY DATE(timestamp), os, browser", pageId, startDate, endDate).Scan(&statsByDate).Error; err != nil {
		log.Printf("ERROR: unable to count the number of views by date: %v", err.Error())
		return &[]web.StatsByDate{}, err
	}
	for _, s := range statsByDate {
		s.Date = s.Date[0:10]
	}
	return &statsByDate, nil
}

// CountLinkStatsByDate returns the number of clicks by date
func (r *statsRepository) CountLinkStatsByDate(linkId uuid.UUID, startDate, endDate string) (*[]web.StatsByDate, error) {
	var statsByDate []web.StatsByDate
	if err := r.db.Raw("SELECT DATE(timestamp) as date, os, browser, COUNT(id) as total FROM stats WHERE link_refer = ? AND DATE(timestamp) BETWEEN ? AND ? GROUP BY DATE(timestamp), os, browser", linkId, startDate, endDate).Scan(&statsByDate).Error; err != nil {
		log.Printf("ERROR: unable to count the number of clicks by date: %v", err.Error())
		return &[]web.StatsByDate{}, err
	}
	for _, s := range statsByDate {
		s.Date = s.Date[0:10]
	}
	return &statsByDate, nil
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
