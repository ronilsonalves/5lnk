package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ronilsonalves/5lnk/internal/stats"
	"github.com/ronilsonalves/5lnk/pkg/web"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"
)

type statsHandler struct {
	s stats.Service
}

func NewStatsHandler(s stats.Service) *statsHandler {
	return &statsHandler{s: s}
}

// GetUserStatsOverview returns a summary of the user links and pages stats.
// @BasePath /api/v1
// CountLinksByUser godoc
// @Summary Returns a summary of the user links and pages stats.
// @Schemes
// @Description Returns a summary of the user links and pages stats.
// @Tags Stats
// @Accept json
// @Produce json
// @Param userId path string true "User ID"
// @Success 200 {object} web.StatsOverview
// @Failure 401 {object} web.errorResponse
// @Failure 503 {object} web.errorResponse
// @Router /api/v1/stats/user/{userId}/overview [GET]
func (h *statsHandler) GetUserStatsOverview() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		userID := ctx.Param("userId")
		response, err := h.s.GetUserStatsOverview(userID)
		if err != nil {
			web.BadResponse(ctx, http.StatusInternalServerError, "error", err.Error())
			return
		}
		web.ResponseOK(ctx, http.StatusOK, response)
	}
}

// GetStatsByUserId returns all stats for a user in a pageable object.
// @BasePath /api/v1
// GetStatsByUserId godoc
// @Summary Returns all stats for a user in a pageable object.
// @Schemes
// @Description Returns all stats for a user in a pageable object.
// @Tags Stats
// @Accept json
// @Produce json
// @Param userId path string true "User ID"
// @Param pageSize query int true "Page Size"
// @Param pageNumber query int true "Page Number"
// @Param sort query string false "Sort"
// @Success 200 {object} web.Pagination
// @Failure 401 {object} web.errorResponse
// @Failure 503 {object} web.errorResponse
// @Router /api/v1/stats/user/{userId} [GET]
func (h *statsHandler) GetStatsByUserId() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		userId := ctx.Param("userId")
		pageSize, err := strconv.Atoi(ctx.Query("pageSize"))
		if err != nil {
			log.Printf("ERROR: unable to convert pageSize to int: %v", err.Error())
			web.BadResponse(ctx, http.StatusBadRequest, "error", "invalid pageSize value")
			return
		}
		pageNumber, err := strconv.Atoi(ctx.Query("pageNumber"))
		if err != nil {
			log.Printf("ERROR: unable to convert pageNumber to int: %v", err.Error())
			web.BadResponse(ctx, http.StatusBadRequest, "error", "invalid pageNumber value")
			return
		}
		pageSort := ctx.Query("sort")
		if strings.ContainsAny(pageSort, ";") {
			log.Printf("ERROR: invalid sort value: %v", pageSort)
			web.BadResponse(ctx, http.StatusBadRequest, "error", "invalid sort value")
			return
		}
		pagination := web.Pagination{
			PageSize:   pageSize,
			PageNumber: pageNumber,
			Sort:       pageSort,
		}
		response, err := h.s.GetStatsByUserId(pagination, userId)
		if err != nil {
			web.BadResponse(ctx, http.StatusInternalServerError, "error", err.Error())
			return
		}
		web.ResponseOK(ctx, http.StatusOK, response)
	}
}

// TODO: Refactor to use only one endpoint /:id/
// to get stats by link or page and use a query param to
// define the type of stats to be returned:
// link or page, paginate or not.

// GetLinkStats returns all stats for a link.
// @BasePath /api/v1
// GetLinkStats godoc
// @Summary Returns all stats for a link in a pageable object.
// @Schemes
// @Description Returns all stats for a link in a pageable object.
// @Tags Stats
// @Accept json
// @Produce json
// @Param linkId path string true "Link ID"
// @Param pageSize query int true "Page Size"
// @Param pageNumber query int true "Page Number"
// @Param sort query string false "Sort"
// @Success 200 {object} web.Pagination
// @Failure 401 {object} web.errorResponse
// @Failure 503 {object} web.errorResponse
// @Router /api/v1/stats/link/{linkId} [GET]
func (h *statsHandler) GetLinkStats() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		linkID := ctx.Param("linkId")
		pageSize, err := strconv.Atoi(ctx.Query("pageSize"))
		if err != nil {
			log.Printf("ERROR: unable to convert pageSize to int: %v", err.Error())
			web.BadResponse(ctx, http.StatusBadRequest, "error", "invalid pageSize value")
			return
		}
		pageNumber, err := strconv.Atoi(ctx.Query("pageNumber"))
		if err != nil {
			log.Printf("ERROR: unable to convert pageNumber to int: %v", err.Error())
			web.BadResponse(ctx, http.StatusBadRequest, "error", "invalid pageNumber value")
			return
		}
		pageSort := ctx.Query("sort")
		if strings.ContainsAny(pageSort, ";") {
			log.Printf("ERROR: invalid sort value: %v", pageSort)
			web.BadResponse(ctx, http.StatusBadRequest, "error", "invalid sort value")
			return
		}
		pagination := web.Pagination{
			PageSize:   pageSize,
			PageNumber: pageNumber,
			Sort:       pageSort,
		}
		response, err := h.s.GetLinkStats(pagination, linkID)
		if err != nil {
			web.BadResponse(ctx, http.StatusInternalServerError, "error", err.Error())
			return
		}
		web.ResponseOK(ctx, http.StatusOK, response)
	}
}

// GetPageStats returns all stats for a page in a pageable object.
// @BasePath /api/v1
// GetPageStats godoc
// @Summary Returns all stats for a page in a pageable object.
// @Schemes
// @Description Returns all stats for a page.
// @Tags Stats
// @Accept json
// @Produce json
// @Param pageId path string true "Page ID"
// @Param pageSize query int true "Page Size"
// @Param pageNumber query int true "Page Number"
// @Param sort query string false "Sort"
// @Success 200 {object} web.Pagination
// @Failure 401 {object} web.errorResponse
// @Failure 503 {object} web.errorResponse
// @Router /api/v1/stats/page/{pageId} [GET]
func (h *statsHandler) GetPageStats() gin.HandlerFunc {
	return func(c *gin.Context) {
		pageId := c.Param("pageId")
		pageSize, err := strconv.Atoi(c.Query("pageSize"))
		if err != nil {
			log.Printf("ERROR: unable to convert pageSize to int: %v", err.Error())
			web.BadResponse(c, http.StatusBadRequest, "error", "invalid pageSize value")
			return
		}
		pageNumber, err := strconv.Atoi(c.Query("pageNumber"))
		if err != nil {
			log.Printf("ERROR: unable to convert pageNumber to int: %v", err.Error())
			web.BadResponse(c, http.StatusBadRequest, "error", "invalid pageNumber value")
			return
		}
		pageSort := c.Query("sort")
		if strings.ContainsAny(pageSort, ";") {
			log.Printf("ERROR: invalid sort value: %v", pageSort)
			web.BadResponse(c, http.StatusBadRequest, "error", "invalid sort value")
			return
		}
		pagination := web.Pagination{
			PageSize:   pageSize,
			PageNumber: pageNumber,
			Sort:       pageSort,
		}
		response, err := h.s.GetPageStats(pagination, pageId)
		if err != nil {
			web.BadResponse(c, http.StatusInternalServerError, "error", err.Error())
			return
		}

		web.ResponseOK(c, http.StatusOK, response)
	}
}

// GetLinkStatsByDate returns all stats for a link grouped by date, by default the last 30 days.
// @BasePath /api/v1
// GetLinkStatsByDate godoc
// @Summary Returns all stats for a link grouped by date, by default the last 30 days.
// @Schemes
// @Description Returns all stats for a link grouped by date, by default the last 30 days.
// @Tags Stats
// @Accept json
// @Produce json
// @Param linkId path string true "Link ID"
// @Param startDate query string false "Start Date"
// @Param endDate query string false "End Date"
// @Success 200 {object} []web.StatsByDate
// @Failure 400 {object} web.errorResponse
// @Failure 401 {object} web.errorResponse
// @Failure 503 {object} web.errorResponse
// @Router /api/v1/stats/link/{linkId}/date [GET]
func (h *statsHandler) GetLinkStatsByDate() gin.HandlerFunc {
	return func(c *gin.Context) {
		linkId, err := uuid.Parse(c.Param("linkId"))
		if err != nil {
			log.Printf("ERROR: unable to convert linkId to uuid: %v", err.Error())
			web.BadResponse(c, http.StatusBadRequest, "error", "invalid link ID provided")
			return
		}
		if c.Query("startDate") == "" && c.Query("endDate") == "" {
			endDate := time.Now()
			startDate := endDate.AddDate(0, 0, -30)
			response, err := h.s.GetLinkStatsByDate(linkId, startDate.Format(time.DateOnly), endDate.Format(time.DateOnly))
			if err != nil {
				log.Printf("ERROR: unable to get stats by date: %v", err.Error())
				web.BadResponse(c, http.StatusInternalServerError, "error", err.Error())
				return
			}
			web.ResponseOK(c, http.StatusOK, response)
			return
		}

		startDate, err := time.Parse(time.DateOnly, c.Query("startDate"))
		if err != nil {
			log.Printf("ERROR: unable to convert startDate to time: %v", err.Error())
			web.BadResponse(c, http.StatusBadRequest, "error", "invalid startDate value")
			return
		}

		endDate, err := time.Parse(time.DateOnly, c.Query("endDate"))
		if err != nil {
			log.Printf("ERROR: unable to convert endDate to time: %v", err.Error())
			web.BadResponse(c, http.StatusBadRequest, "error", "invalid endDate value")
			return
		}

		response, err := h.s.GetLinkStatsByDate(linkId, startDate.Format(time.DateOnly), endDate.Format(time.DateOnly))
		if err != nil {
			web.BadResponse(c, http.StatusInternalServerError, "error", err.Error())
			return
		}
		web.ResponseOK(c, http.StatusOK, response)
	}
}

// GetPageStatsByDate returns all stats for a page grouped by date, by default the last 30 days.
// @BasePath /api/v1
// GetPageStatsByDate godoc
// @Summary Returns all stats for a page grouped by date, by default the last 30 days.
// @Schemes
// @Description Returns all stats for a page grouped by date, by default the last 30 days.
// @Tags Stats
// @Accept json
// @Produce json
// @Param linkId path string true "Link ID"
// @Param startDate query string false "Start Date"
// @Param endDate query string false "End Date"
// @Success 200 {object} []web.StatsByDate
// @Failure 400 {object} web.errorResponse
// @Failure 401 {object} web.errorResponse
// @Failure 503 {object} web.errorResponse
// @Router /api/v1/stats/page/{pageId}/date [GET]
func (h *statsHandler) GetPageStatsByDate() gin.HandlerFunc {
	return func(c *gin.Context) {
		linkId, err := uuid.Parse(c.Param("pageId"))
		if err != nil {
			log.Printf("ERROR: unable to convert pageId to uuid: %v", err.Error())
			web.BadResponse(c, http.StatusBadRequest, "error", "invalid page ID provided")
			return
		}
		if c.Query("startDate") == "" && c.Query("endDate") == "" {
			endDate := time.Now()
			startDate := endDate.AddDate(0, 0, -30)
			response, err := h.s.GetPageStatsByDate(linkId, startDate.Format(time.DateOnly), endDate.Format(time.DateOnly))
			if err != nil {
				log.Printf("ERROR: unable to get stats by date: %v", err.Error())
				web.BadResponse(c, http.StatusInternalServerError, "error", err.Error())
				return
			}
			web.ResponseOK(c, http.StatusOK, response)
			return
		}

		startDate, err := time.Parse(time.DateOnly, c.Query("startDate"))
		if err != nil {
			log.Printf("ERROR: unable to convert startDate to time: %v", err.Error())
			web.BadResponse(c, http.StatusBadRequest, "error", "invalid startDate value")
			return
		}

		endDate, err := time.Parse(time.DateOnly, c.Query("endDate"))
		if err != nil {
			log.Printf("ERROR: unable to convert endDate to time: %v", err.Error())
			web.BadResponse(c, http.StatusBadRequest, "error", "invalid endDate value")
			return
		}

		response, err := h.s.GetPageStatsByDate(linkId, startDate.Format(time.DateOnly), endDate.Format(time.DateOnly))
		if err != nil {
			web.BadResponse(c, http.StatusInternalServerError, "error", err.Error())
			return
		}
		web.ResponseOK(c, http.StatusOK, response)
	}
}

// GetLinkStatsByUserIdAndDate returns all stats from users' links grouped by date, by default the last 30 days.
// @BasePath /api/v1
// GetLinkStatsByUserIdAndDate godoc
// @Summary Returns all stats from users' links grouped by date, by default the last 30 days.
// @Schemes
// @Description Returns all stats from users' links grouped by date, by default the last 30 days.
// @Tags Stats
// @Accept json
// @Produce json
// @Param userId path string true "User ID"
// @Param startDate query string false "Start Date"
// @Param endDate query string false "End Date"
// @Success 200 {object} []web.StatsByDate
// @Failure 400 {object} web.errorResponse
// @Failure 401 {object} web.errorResponse
// @Failure 503 {object} web.errorResponse
// @Router /api/v1/stats/link/user/{userId}/links [GET]
func (h *statsHandler) GetLinkStatsByUserIdAndDate() gin.HandlerFunc {
	return func(c *gin.Context) {
		userId := c.Param("userId")
		if c.Query("startDate") == "" && c.Query("endDate") == "" {
			endDate := time.Now()
			startDate := endDate.AddDate(0, 0, -30)
			response, err := h.s.GetLinkStatsByUserIdAndDate(userId, startDate.Format(time.DateOnly), endDate.Format(time.DateOnly))
			if err != nil {
				log.Printf("ERROR: unable to get stats by date: %v", err.Error())
				web.BadResponse(c, http.StatusInternalServerError, "error", err.Error())
				return
			}
			web.ResponseOK(c, http.StatusOK, response)
			return
		}

		startDate, err := time.Parse(time.DateOnly, c.Query("startDate"))
		if err != nil {
			log.Printf("ERROR: unable to convert startDate to time: %v", err.Error())
			web.BadResponse(c, http.StatusBadRequest, "error", "invalid startDate value")
			return
		}

		endDate, err := time.Parse(time.DateOnly, c.Query("endDate"))
		if err != nil {
			log.Printf("ERROR: unable to convert endDate to time: %v", err.Error())
			web.BadResponse(c, http.StatusBadRequest, "error", "invalid endDate value")
			return
		}

		response, err := h.s.GetLinkStatsByUserIdAndDate(userId, startDate.Format(time.DateOnly), endDate.Format(time.DateOnly))
		if err != nil {
			web.BadResponse(c, http.StatusInternalServerError, "error", err.Error())
			return
		}
		web.ResponseOK(c, http.StatusOK, response)
	}
}

// GetPageStatsByUserIdAndDate returns all stats from user pages grouped by date, by default the last 30 days.
// @BasePath /api/v1
// GetLinkStatsByUserIdAndDate godoc
// @Summary Returns all stats from user pages grouped by date, by default the last 30 days.
// @Schemes
// @Description Returns all stats from user pages grouped by date, by default the last 30 days.
// @Tags Stats
// @Accept json
// @Produce json
// @Param userId path string true "User ID"
// @Param startDate query string false "Start Date"
// @Param endDate query string false "End Date"
// @Success 200 {object} []web.StatsByDate
// @Failure 400 {object} web.errorResponse
// @Failure 401 {object} web.errorResponse
// @Failure 503 {object} web.errorResponse
// @Router /api/v1/stats/user/{userId}/pages [GET]
func (h *statsHandler) GetPageStatsByUserIdAndDate() gin.HandlerFunc {
	return func(c *gin.Context) {
		userId := c.Param("userId")
		if c.Query("startDate") == "" && c.Query("endDate") == "" {
			endDate := time.Now()
			startDate := endDate.AddDate(0, 0, -30)
			response, err := h.s.GetPageStatsByUserIdAndDate(userId, startDate.Format(time.DateOnly), endDate.Format(time.DateOnly))
			if err != nil {
				log.Printf("ERROR: unable to get stats by date: %v", err.Error())
				web.BadResponse(c, http.StatusInternalServerError, "error", err.Error())
				return
			}
			web.ResponseOK(c, http.StatusOK, response)
			return
		}

		startDate, err := time.Parse(time.DateOnly, c.Query("startDate"))
		if err != nil {
			log.Printf("ERROR: unable to convert startDate to time: %v", err.Error())
			web.BadResponse(c, http.StatusBadRequest, "error", "invalid startDate value")
			return
		}

		endDate, err := time.Parse(time.DateOnly, c.Query("endDate"))
		if err != nil {
			log.Printf("ERROR: unable to convert endDate to time: %v", err.Error())
			web.BadResponse(c, http.StatusBadRequest, "error", "invalid endDate value")
			return
		}

		response, err := h.s.GetPageStatsByUserIdAndDate(userId, startDate.Format(time.DateOnly), endDate.Format(time.DateOnly))
		if err != nil {
			web.BadResponse(c, http.StatusInternalServerError, "error", err.Error())
			return
		}
		web.ResponseOK(c, http.StatusOK, response)
	}
}
