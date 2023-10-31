package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ronilsonalves/5lnk/internal/domain"
	"github.com/ronilsonalves/5lnk/internal/link"
	"github.com/ronilsonalves/5lnk/pkg/web"
	"net/http"
)

type linkHandler struct {
	s link.Service
}

func NewLinkHandler(s link.Service) *linkHandler {
	return &linkHandler{
		s: s,
	}
}

// PostURL create and return a shortened link.
// @BasePath /api/v1
// PostURL godoc
// @Summary Create a shortened link from a URL address and a provided alias
// @Schemes
// @Description Create a shortened link from a long URL.
// @Tags Links
// @Accept json
// @Produce json
// @Param body body web.CreateShortenURL true "Body"
// @Success 201 {object} domain.Link
// @Failure 400 {object} web.errorResponse
// @Failure 401 {object} web.errorResponse
// @Router /api/v1/links [POST]
func (h *linkHandler) PostURL() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var request web.CreateShortenURL
		err := ctx.ShouldBindJSON(&request)
		if err != nil {
			web.BadResponse(ctx, http.StatusBadRequest, "error", "invalid url provided")
			return
		}
		response, err := h.s.ShortenURL(request)
		if err != nil {
			web.BadResponse(ctx, http.StatusBadRequest, "error", err.Error())
			return
		}

		web.ResponseOK(ctx, http.StatusCreated, response)
	}
}

// GetLink returns a shortened link.
// @BasePath /api/v1
// GetURL godoc
// @Summary Get a shortened link from a URL address and a provided alias
// @Schemes
// @Description Get a shortened link from a long URL.
// @Tags Links
// @Accept json
// @Produce json
// @Param id path string true "Link ID"
// @Success 200 {object} domain.Link
// @Failure 400 {object} web.errorResponse
// @Failure 401 {object} web.errorResponse
// @Failure 404 {object} web.errorResponse
// @Router /api/v1/links/{id} [GET]
func (h *linkHandler) GetLink() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id := ctx.Param("id")
		parsedUUID, err := uuid.Parse(id)
		if err != nil {
			web.BadResponse(ctx, http.StatusBadRequest, "error", "invalid link ID provided")
			return
		}
		response, err := h.s.GetLink(parsedUUID)
		if err != nil {
			web.BadResponse(ctx, http.StatusBadRequest, "error", err.Error())
			return
		}

		web.ResponseOK(ctx, http.StatusOK, response)
	}
}

// Update update a shortened link.
// @BasePath /api/v1
// Update godoc
// @Summary Update a shortened link from a URL address and a provided alias
// @Schemes
// @Description Update a shortened link from a long URL.
// @Tags Links
// @Accept json
// @Produce json
// @Param body body domain.Link true "Body"
// @Success 200 {object} domain.Link
// @Failure 400 {object} web.errorResponse
// @Failure 401 {object} web.errorResponse
// @Failure 404 {object} web.errorResponse
// @Router /api/v1/links [PUT]
func (h *linkHandler) Update() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var request domain.Link
		err := ctx.ShouldBindJSON(&request)
		if err != nil {
			web.BadResponse(ctx, http.StatusBadRequest, "error", "invalid request body provided")
			return
		}
		response, err := h.s.Update(request)
		if err != nil {
			web.BadResponse(ctx, http.StatusNotFound, "error", err.Error())
			return
		}

		web.ResponseOK(ctx, http.StatusOK, response)
	}
}

// Delete delete a shortened link.
// @BasePath /api/v1
// Delete godoc
// @Summary Delete a shortened link from a URL address and a provided alias
// @Schemes
// @Description Delete a shortened link from a long URL.
// @Tags Links
// @Accept json
// @Produce json
// @Param body body domain.Link true "Body"
// @Success 204
// @Failure 400 {object} web.errorResponse
// @Failure 401 {object} web.errorResponse
// @Failure 404 {object} web.errorResponse
// @Router /api/v1/links [DELETE]
func (h *linkHandler) Delete() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var request domain.Link
		err := ctx.ShouldBindJSON(&request)
		if err != nil {
			web.BadResponse(ctx, http.StatusBadRequest, "error", "invalid request body provided")
			return
		}
		if err := h.s.Delete(request); err != nil {
			web.BadResponse(ctx, http.StatusNotFound, "error", err.Error())
			return
		}

		web.ResponseOK(ctx, http.StatusNoContent, nil)
	}
}

// GetAllByUser returns all shortened links by user.
// @BasePath /api/v1
// GetAllByUser godoc
// @Summary Get all shortened links by user
// @Schemes
// @Description Get all shortened links by user.
// @Tags Links
// @Accept json
// @Produce json
// @Param userId path string true "User ID"
// @Success 200 {object} []domain.Link
// @Failure 400 {object} web.errorResponse
// @Failure 401 {object} web.errorResponse
// @Router /api/v1/links/user/{userId} [GET]
func (h *linkHandler) GetAllByUser() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		userID := ctx.Param("userId")
		response, err := h.s.GetAllByUser(userID)
		if err != nil {
			web.BadResponse(ctx, http.StatusBadRequest, "error", err.Error())
			return
		}
		web.ResponseOK(ctx, http.StatusOK, response)
	}
}

// RedirectShortenedURL redirect to original URL from a shortened link.
// @BasePath /
// RedirectShortenedURL godoc
// @Summary Redirect to original URL
// @Schemes
// @Description Redirect to original URL
// @Tags Links
// @Accept json
// @Produce json
// @Param shortened path string true "Shortened URL"
// @Success 302 {string} redirected
// @Failure 404 {object} web.errorResponse
// @Router /{shortened} [GET]
func (h *linkHandler) RedirectShortenedURL() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		shortened := ctx.Param("shortened")
		original, err := h.s.GetOriginalURL(shortened)
		if err != nil {
			web.BadResponse(ctx, http.StatusNotFound, "error", "link not found")
			return
		}

		ctx.Redirect(http.StatusFound, original)
	}
}
