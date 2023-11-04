package stats

import (
	"github.com/ronilsonalves/5lnk/internal/domain"
	"github.com/ronilsonalves/5lnk/pkg/web"
)

type Service interface {
	GetUserStatsOverview(userId string) (web.StatsOverview, error)
	RegisterLinkClick(stats domain.Stats) error
	RegisterPageView(stats domain.Stats) error
	GetLinkStats(pagination web.Pagination, linkId string) (web.Pagination, error)
	GetPageStats(pagination web.Pagination, pageId string) (web.Pagination, error)
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

// GetLinkStats returns all stats for a link
func (s *statsService) GetLinkStats(pagination web.Pagination, linkId string) (web.Pagination, error) {
	return s.r.FindLinkStats(pagination, linkId)
}

// GetPageStats returns all stats for a page
func (s *statsService) GetPageStats(pagination web.Pagination, pageId string) (web.Pagination, error) {
	return s.r.FindPageStats(pagination, pageId)
}
