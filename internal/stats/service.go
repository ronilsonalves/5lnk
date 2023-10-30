package stats

import "github.com/ronilsonalves/5lnk/pkg/web"

type Service interface {
	GetUserStatsOverview(userId string) (web.Stats, error)
	CountLinksByUser(userId string) (int64, error)
	CountLinkClicksByUser(userId string) (int64, error)
	CountPagesByUser(userId string) (int64, error)
	CountPageViewsByUser(userId string) (int64, error)
}

type statsService struct {
	r Repository
}

// NewStatsService creates a new stats service
func NewStatsService(r Repository) Service {
	return &statsService{r: r}
}

// GetUserStatsOverview returns a summary of the user links and pages stats
func (s *statsService) GetUserStatsOverview(userId string) (web.Stats, error) {
	links, err := s.CountLinksByUser(userId)
	if err != nil {
		return web.Stats{}, err
	}

	clicks, err := s.CountLinkClicksByUser(userId)
	if err != nil {
		return web.Stats{}, err
	}

	pages, err := s.CountPagesByUser(userId)
	if err != nil {
		return web.Stats{}, err
	}

	views, err := s.CountPageViewsByUser(userId)
	if err != nil {
		return web.Stats{}, err
	}

	return web.Stats{
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

// CountLinksByUser returns the number of links created by the user
func (s *statsService) CountLinksByUser(userId string) (int64, error) {
	return s.r.CountLinksByUser(userId)
}

// CountLinkClicksByUser returns the number of clicks by the user
func (s *statsService) CountLinkClicksByUser(userId string) (int64, error) {
	return s.r.CountLinkClicksByUser(userId)
}

// CountPagesByUser returns the number of links pages created by the user
func (s *statsService) CountPagesByUser(userId string) (int64, error) {
	return s.r.CountPagesByUser(userId)
}

// CountPageViewsByUser returns the number of views by the user
func (s *statsService) CountPageViewsByUser(userId string) (int64, error) {
	return s.r.CountPageViewsByUser(userId)
}
