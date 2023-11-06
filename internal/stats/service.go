package stats

import (
	"github.com/google/uuid"
	"github.com/ronilsonalves/5lnk/internal/domain"
	"github.com/ronilsonalves/5lnk/pkg/web"
)

type Service interface {
	GetUserStatsOverview(userId string) (web.StatsOverview, error)
	RegisterLinkClick(stats domain.Stats) error
	RegisterPageView(stats domain.Stats) error
	GetStatsByUserId(pagination web.Pagination, userId string) (web.Pagination, error)
	GetLinkStats(pagination web.Pagination, linkId string) (web.Pagination, error)
	GetPageStats(pagination web.Pagination, pageId string) (web.Pagination, error)
	GetLinkStatsByUserIdAndDate(userId, startDate, endDate string) (*[]web.StatsByDate, error)
	GetPageStatsByUserIdAndDate(userId, startDate, endDate string) (*[]web.StatsByDate, error)
	GetLinkStatsByDate(linkId uuid.UUID, startDate, endDate string) (*[]web.StatsByDate, error)
	GetPageStatsByDate(pageId uuid.UUID, startDate, endDate string) (*[]web.StatsByDate, error)
}

type statsService struct {
	r Repository
}

// NewStatsService creates a new stats service
func NewStatsService(r Repository) Service {
	return &statsService{r: r}
}

// GetUserStatsOverview returns a summary of the user links and pages stats
func (s *statsService) GetUserStatsOverview(userId string) (web.StatsOverview, error) {
	links, err := s.r.CountLinksByUser(userId)
	if err != nil {
		return web.StatsOverview{}, err
	}

	clicks, err := s.r.CountLinkClicksByUser(userId)
	if err != nil {
		return web.StatsOverview{}, err
	}

	pages, err := s.r.CountPagesByUser(userId)
	if err != nil {
		return web.StatsOverview{}, err
	}

	views, err := s.r.CountPageViewsByUser(userId)
	if err != nil {
		return web.StatsOverview{}, err
	}

	return web.StatsOverview{
		Links: web.LinksSummary{
			Total:  links,
			Clicks: clicks,
		},
		Pages: web.PagesSummary{
			Total: pages,
			Views: views,
		},
	}, nil
}

// RegisterLinkClick registers a new click for a link
func (s *statsService) RegisterLinkClick(stats domain.Stats) error {
	return s.r.CreateLinkStats(stats)
}

// RegisterPageView registers a new view for a page
func (s *statsService) RegisterPageView(stats domain.Stats) error {
	return s.r.CreatePageStats(stats)
}

// GetStatsByUserId returns all stats for a user
func (s *statsService) GetStatsByUserId(pagination web.Pagination, userId string) (web.Pagination, error) {
	return s.r.FindStatsByUser(pagination, userId)
}

// GetLinkStats returns all stats for a link
func (s *statsService) GetLinkStats(pagination web.Pagination, linkId string) (web.Pagination, error) {
	return s.r.FindLinkStats(pagination, linkId)
}

// GetPageStats returns all stats for a page
func (s *statsService) GetPageStats(pagination web.Pagination, pageId string) (web.Pagination, error) {
	return s.r.FindPageStats(pagination, pageId)
}

// GetLinkStatsByUserIdAndDate returns all stats for a link grouped by date
func (s *statsService) GetLinkStatsByUserIdAndDate(userId, startDate, endDate string) (*[]web.StatsByDate, error) {
	return s.r.FindLinkStatsByUserAndDate(userId, startDate, endDate)
}

// GetPageStatsByUserIdAndDate returns all stats for a page grouped by date
func (s *statsService) GetPageStatsByUserIdAndDate(userId, startDate, endDate string) (*[]web.StatsByDate, error) {
	return s.r.FindPageStatsByUserAndDate(userId, startDate, endDate)
}

// GetLinkStatsByDate returns all stats for a link grouped by date
func (s *statsService) GetLinkStatsByDate(linkId uuid.UUID, startDate, endDate string) (*[]web.StatsByDate, error) {
	return s.r.CountLinkStatsByDate(linkId, startDate, endDate)
}

// GetPageStatsByDate returns all stats for a page grouped by date
func (s *statsService) GetPageStatsByDate(pageId uuid.UUID, startDate, endDate string) (*[]web.StatsByDate, error) {
	return s.r.CountPageStatsByDate(pageId, startDate, endDate)
}
