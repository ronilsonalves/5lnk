package handler

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ronilsonalves/5lnk/internal/domain"
	linkspage "github.com/ronilsonalves/5lnk/internal/links-page"
	"github.com/ronilsonalves/5lnk/internal/stats"
	"github.com/ronilsonalves/5lnk/pkg/middleware"
	"github.com/ronilsonalves/5lnk/pkg/web"
	"log"
	"net/http"
	"time"
)

type linksPageHandler struct {
	s  linkspage.Service
	st stats.Service
}

func NewLinksPageHandler(s linkspage.Service, st stats.Service) *linksPageHandler {
	return &linksPageHandler{
		s:  s,
		st: st,
	}
}

// PostPage create and return a new linksPage.
// @BasePath /api/v1
// PostPage godoc
// @Summary Create a new linksPage
// @Schemes
// @Description Create a new linksPage.
// @Tags Pages
// @Accept json
// @Produce json
// @Param body body web.CreateLinksPage true "Body"
// @Success 201 {object} domain.LinksPage
// @Failure 400 {object} web.errorResponse
// @Failure 401 {object} web.errorResponse
// @Router /api/v1/pages [POST]
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

// GetPageByAlias returns a linksPage by alias.
// @BasePath /api/v1
// GetPageByAlias godoc
// @Summary Get a linksPage
// @Schemes
// @Description Get a linksPage by alias.
// @Tags Pages
// @Accept json
// @Produce json
// @Param address path string true "Page alias"
// @Success 200 {object} domain.LinksPage
// @Failure 400 {object} web.errorResponse
// @Failure 404 {object} web.errorResponse
// @Router /api/v1/pages/{alias} [GET]
func (h *linksPageHandler) GetPageByAlias() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		alias := ctx.Param("alias")
		response, err := h.s.GetLinksPageByAlias(alias)
		if err != nil {
			if err.Error() == "record not found" {
				web.BadResponse(ctx, http.StatusNotFound, "error", fmt.Errorf("the alias address `%s` not found", alias).Error())
				return
			}
			web.BadResponse(ctx, http.StatusBadRequest, "error", err.Error())
			return
		}

		ua := middleware.GetFormattedUserAgent(ctx)
		stat := domain.Stats{
			PageRefer: response.ID.String(),
			Timestamp: time.Now(),
			Os:        ua.OS,
			Browser:   ua.Browser,
		}

		go func() {
			err := h.st.RegisterPageView(stat)
			if err != nil {
				log.Printf("ERROR: unable to register page view due to %v", err.Error())
			}
		}()

		web.ResponseOK(ctx, http.StatusOK, response)
	}
}

// GetPageByID returns a linksPage by ID.
// @BasePath /api/v1
// GetPageByID godoc
// @Summary Get a linksPage
// @Schemes
// @Description Get a linksPage by ID.
// @Tags Pages
// @Accept json
// @Produce json
// @Param id path string true "Page ID"
// @Success 200 {object} domain.LinksPage
// @Failure 400 {object} web.errorResponse
// @Failure 401 {object} web.errorResponse
// @Failure 404 {object} web.errorResponse
// @Failure 500 {object} web.errorResponse
// @Router /api/v1/pages/id/{id} [GET]
func (h *linksPageHandler) GetPageByID() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id, err := uuid.Parse(ctx.Param("id"))
		if err != nil {
			log.Printf("error while parsing uuid: %v", err.Error())
			web.BadResponse(ctx, http.StatusBadRequest, "error", "invalid UUID provided")
			return
		}
		response, err := h.s.GetLinksPageByID(id)
		if err != nil {
			if err.Error() == "record not found" {
				web.BadResponse(ctx, http.StatusNotFound, "error", fmt.Errorf("the linksPage `%s` not found", id).Error())
				return
			}
			web.BadResponse(ctx, http.StatusInternalServerError, "error", err.Error())
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
// @Tags Pages
// @Accept json
// @Produce json
// @Param userId path string true "User ID"
// @Success 200 {object} []domain.LinksPage
// @Failure 400 {object} web.errorResponse
// @Failure 404 {object} web.errorResponse
// @Router /api/v1/pages/user/{userId} [GET]
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
// @Tags Pages
// @Accept json
// @Produce json
// @Param body body domain.LinksPage true "Body"
// @Success 200 {object} domain.LinksPage
// @Failure 400 {object} web.errorResponse
// @Failure 401 {object} web.errorResponse
// @Failure 404 {object} web.errorResponse
// @Router /api/v1/pages [PUT]
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
// @Tags Pages
// @Accept json
// @Produce json
// @Param body body domain.LinksPage true "Body"
// @Success 204
// @Failure 400 {object} web.errorResponse
// @Failure 401 {object} web.errorResponse
// @Failure 404 {object} web.errorResponse
// @Router /api/v1/pages [DELETE]
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
