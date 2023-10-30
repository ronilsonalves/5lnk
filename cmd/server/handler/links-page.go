package handler

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/ronilsonalves/5lnk/internal/domain"
	linkspage "github.com/ronilsonalves/5lnk/internal/links-page"
	"github.com/ronilsonalves/5lnk/pkg/web"
	"log"
	"net/http"
)

type linksPageHandler struct {
	s linkspage.Service
}

func NewLinksPageHandler(s linkspage.Service) *linksPageHandler {
	return &linksPageHandler{
		s: s,
	}
}

// PostPage create and return a new linksPage.
// @BasePath /api/v1
// PostPage godoc
// @Summary Create a new linksPage
// @Schemes
// @Description Create a new linksPage.
// @Tags LinksPage
// @Accept json
// @Produce json
// @Param body body web.CreateLinksPage true "Body"
// @Success 201 {object} domain.LinksPage
// @Failure 400 {object} web.errorResponse
// @Failure 401 {object} web.errorResponse
// @Router /api/v1/links-page [POST]
func (h *linksPageHandler) PostPage() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var request web.CreateLinksPage
		err := ctx.ShouldBindJSON(&request)
		if err != nil {
			log.Printf("error while binding json: %v", err.Error())
			web.BadResponse(ctx, http.StatusBadRequest, "error", "invalid url provided")
			return
		}
		response, err := h.s.Create(request)
		if err != nil {
			log.Printf("error while creating a new linksPage: %v", err.Error())
			web.BadResponse(ctx, http.StatusBadRequest, "error", err.Error())
			return
		}

		web.ResponseOK(ctx, http.StatusCreated, response)
	}
}

// GetPageByAddress returns a linksPage by address.
// @BasePath /api/v1
// GetPageByAddress godoc
// @Summary Get a linksPage
// @Schemes
// @Description Get a linksPage by address.
// @Tags LinksPage
// @Accept json
// @Produce json
// @Param address path string true "Page address"
// @Success 200 {object} domain.LinksPage
// @Failure 400 {object} web.errorResponse
// @Failure 404 {object} web.errorResponse
// @Router /api/v1/links-page/{address} [GET]
func (h *linksPageHandler) GetPageByAddress() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		address := ctx.Param("alias")
		response, err := h.s.GetLinksPageByAlias(address)
		if err != nil {
			if err.Error() == "record not found" {
				web.BadResponse(ctx, http.StatusNotFound, "error", fmt.Errorf("the alias address `%s` not found", address).Error())
				return
			}
			web.BadResponse(ctx, http.StatusBadRequest, "error", err.Error())
			return
		}

		web.ResponseOK(ctx, http.StatusOK, response)
	}
}

// GetAllPagesByUser returns all linksPage by user.
// @BasePath /api/v1
// GetAllPagesByUser godoc
// @Summary Get all linksPage by user
// @Schemes
// @Description Get all linksPage by user.
// @Tags LinksPage
// @Accept json
// @Produce json
// @Param userId path string true "User ID"
// @Success 200 {object} []domain.LinksPage
// @Failure 400 {object} web.errorResponse
// @Failure 404 {object} web.errorResponse
// @Router /api/v1/links-page/user/{userId} [GET]
func (h *linksPageHandler) GetAllPagesByUser() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		userId := ctx.Param("userId")
		response, err := h.s.GetAllByUser(userId)
		if err != nil {
			if err.Error() == "record not found" {
				web.BadResponse(ctx, http.StatusNotFound, "error", fmt.Errorf("the user `%s` not found", userId).Error())
				return
			}
			web.BadResponse(ctx, http.StatusBadRequest, "error", err.Error())
			return
		}

		web.ResponseOK(ctx, http.StatusOK, response)
	}
}

// Update updates a linksPage.
// @BasePath /api/v1
// Update godoc
// @Summary Update a linksPage
// @Schemes
// @Description Update a linksPage.
// @Tags LinksPage
// @Accept json
// @Produce json
// @Param body body domain.LinksPage true "Body"
// @Success 200 {object} domain.LinksPage
// @Failure 400 {object} web.errorResponse
// @Failure 401 {object} web.errorResponse
// @Failure 404 {object} web.errorResponse
// @Router /api/v1/links-page [PUT]
func (h *linksPageHandler) Update() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var request domain.LinksPage
		err := ctx.ShouldBindJSON(&request)
		if err != nil {
			log.Printf("error while binding json: %v", err.Error())
			web.BadResponse(ctx, http.StatusBadRequest, "error", "invalid request body provided")
			return
		}
		response, err := h.s.Update(request)
		if err != nil {
			if err.Error() == "record not found" {
				log.Printf("the linksPage `%s` not found", request.Alias)
				web.BadResponse(ctx, http.StatusNotFound, "error", fmt.Errorf("the linksPage `%s` not found", request.Alias).Error())
				return
			}
			log.Printf("error while updating the linksPage: %v", err.Error())
			web.BadResponse(ctx, http.StatusInternalServerError, "error", err.Error())
			return
		}
		web.ResponseOK(ctx, http.StatusOK, response)
	}
}

// Delete deletes a linksPage.
// @BasePath /api/v1
// Delete godoc
// @Summary Delete a linksPage
// @Schemes
// @Description Delete a linksPage.
// @Tags LinksPage
// @Accept json
// @Produce json
// @Param body body domain.LinksPage true "Body"
// @Success 204
// @Failure 400 {object} web.errorResponse
// @Failure 401 {object} web.errorResponse
// @Failure 404 {object} web.errorResponse
// @Router /api/v1/links-page [DELETE]
func (h *linksPageHandler) Delete() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var request domain.LinksPage
		err := ctx.ShouldBindJSON(&request)
		if err != nil {
			log.Printf("error while binding json: %v", err.Error())
			web.BadResponse(ctx, http.StatusBadRequest, "error", "invalid request body provided")
			return
		}
		if err := h.s.Delete(request); err != nil {
			if err.Error() == "record not found" {
				log.Printf("the linksPage `%s` not found", request.Alias)
				web.BadResponse(ctx, http.StatusNotFound, "error", fmt.Errorf("the linksPage `%s` not found", request.Alias).Error())
				return
			}
			log.Printf("error while deleting the linksPage: %v", err.Error())
			web.BadResponse(ctx, http.StatusInternalServerError, "error", err.Error())
			return
		}
		web.ResponseOK(ctx, http.StatusNoContent, nil)
	}
}
