package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/ronilsonalves/5lnk/internal/stats"
	"github.com/ronilsonalves/5lnk/pkg/web"
	"log"
	"net/http"
	"strconv"
	"strings"
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
// @Router /api/v1/stats/user/{userId} [GET]
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
		pagination := web.Pagination{
			PageSize:   pageSize,
			PageNumber: pageNumber,
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
