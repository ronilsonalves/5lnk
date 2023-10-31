package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/ronilsonalves/5lnk/internal/stats"
	"github.com/ronilsonalves/5lnk/pkg/web"
	"net/http"
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
// @Success 200 {object} web.Stats
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
