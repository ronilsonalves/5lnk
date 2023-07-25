package handler

import (
	"github.com/gin-gonic/gin"
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
// @Param body body web.ShortenURL true "Body"
// @Success 201 {object} domain.Link
// @Failure 400 {object} web.errorResponse
// @Router /api/v1/links [POST]
func (h *linkHandler) PostURL() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var request web.ShortenURL
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
