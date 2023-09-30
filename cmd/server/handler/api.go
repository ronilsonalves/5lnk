package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/ronilsonalves/5lnk/internal/apikey"
	"github.com/ronilsonalves/5lnk/pkg/web"
	"net/http"
)

type apikeyHandler struct {
	s apikey.Service
}

func NewAPIKeyHandler(s apikey.Service) *apikeyHandler {
	return &apikeyHandler{
		s: s,
	}
}

// PostAPIKey create and return a new API Key.
// @BasePath /api/v1
// PostAPIKey godoc
// @Summary Create a new API Key
// @Schemes
// @Description Create a new API Key. If the user already has an API Key, it will be revoked.
// @Tags API Keys
// @Accept json
// @Produce json
// @Param body body web.APIKey true "Body"
// @Success 201 {object} string
// @Failure 400 {object} web.errorResponse
// @Failure 500 {object} web.errorResponse
// @Router /api/v1/apikeys [POST]
func (h *apikeyHandler) PostAPIKey() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var request web.APIKey
		err := ctx.ShouldBindJSON(&request)
		if err != nil {
			web.BadResponse(ctx, http.StatusBadRequest, "error", "invalid userId provided")
			return
		}
		response, err := h.s.GenerateApiKey(request.UserId)
		if err != nil {
			web.BadResponse(ctx, http.StatusInternalServerError, "error", "an error occurred while generating the api key")
			return
		}

		web.ResponseOK(ctx, http.StatusCreated, response)
	}
}

// RetrieveAPIKey returns an API Key.
// @BasePath /api/v1
// RetrieveAPIKey godoc
// @Summary Retrieve an API Key
// @Schemes
// @Description Retrieve an API Key.
// @Tags API Keys
// @Accept json
// @Produce json
// @Param userId path string true "User ID"
// @Success 200 {object} string
// @Failure 404 {object} web.errorResponse
// @Router /api/v1/apikeys/{userId} [GET]
func (h *apikeyHandler) RetrieveAPIKey() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		userId := ctx.Param("userId")
		response, err := h.s.RetrieveApiKey(userId)
		if err != nil {
			web.BadResponse(ctx, http.StatusNotFound, "error", "api key not found for userID")
			return
		}

		web.ResponseOK(ctx, http.StatusOK, response)
	}
}

// DeleteAPIKey delete an API Key by an userId.
// @BasePath /api/v1
// DeleteAPIKey godoc
// @Summary Delete an API Key
// @Schemes
// @Description Delete an API Key.
// @Tags API Keys
// @Accept json
// @Produce json
// @Param userId path string true "User ID"
// @Success 204
// @Failure 400 {object} web.errorResponse
// @Failure 404 {object} web.errorResponse
// @Failure 500 {object} web.errorResponse
// @Router /api/v1/apikeys/{userId} [DELETE]
func (h *apikeyHandler) DeleteAPIKey() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		userId := ctx.Param("userId")
		if userId == "" {
			web.BadResponse(ctx, http.StatusBadRequest, "error", "invalid userId provided")
			return
		}
		_, err := h.s.RetrieveApiKey(userId)
		if err != nil {
			web.BadResponse(ctx, http.StatusNotFound, "error", "api key not found for userID")
			return
		}
		err = h.s.RevokesApiKey(userId)
		if err != nil {
			web.BadResponse(ctx, http.StatusInternalServerError, "error", err.Error())
			return
		}

		web.ResponseOK(ctx, http.StatusNoContent, nil)
	}
}
