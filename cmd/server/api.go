package main

import (
	"context"
	"github.com/gin-contrib/cache"
	"github.com/gin-contrib/cache/persistence"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/ronilsonalves/5lnk/cmd/server/handler"
	"github.com/ronilsonalves/5lnk/config/auth"
	"github.com/ronilsonalves/5lnk/config/db"
	"github.com/ronilsonalves/5lnk/docs"
	"github.com/ronilsonalves/5lnk/internal/apikey"
	"github.com/ronilsonalves/5lnk/internal/domain"
	"github.com/ronilsonalves/5lnk/internal/link"
	links_page "github.com/ronilsonalves/5lnk/internal/links-page"
	"github.com/ronilsonalves/5lnk/internal/stats"
	"github.com/ronilsonalves/5lnk/pkg/middleware"
	"github.com/swaggo/files"       // swagger embed files
	"github.com/swaggo/gin-swagger" // gin-swagger middleware
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"
)

// @title 5lnk API
// @version 1.0.0
// @description This API provide endpoints to link shortening.
// @termsOfService https://github.com/ronilsonalves/5lnk/blog/main/LICENSE.md
// @contact.name Ronilson Alves
// @contact.url https://www.linkedin.com/in/ronilsonalves
// @license.name UNLICENSED
// @license.url https://github.com/ronilsonalves/5lnk/
func main() {

	err := godotenv.Load()
	if err != nil {
		log.Fatalln("Error loading .env file", err.Error())
	}

	// Connect to the PostgreSQL db
	db, err := db.GetDB()
	if err != nil {
		log.Fatalln("Error connecting to db: ", err.Error())
	}

	// Auto migrate the Link model
	if err := db.AutoMigrate(&domain.Link{}); err != nil {
		log.Fatalln("Error while migrating the Link model")
	}

	// Auto migrate the LinksPage model
	if err := db.AutoMigrate(&domain.LinksPage{}); err != nil {
		log.Fatalln("Error while migrating the LinksPage model")
	}

	// Auto migrate the Stats model
	if err := db.AutoMigrate(&domain.Stats{}); err != nil {
		log.Fatalln("Error while migrating the Stats model")
	}

	// Initialize the random number generator
	rand.Seed(time.Now().UnixNano())

	// Firebase Auth
	ctx := context.Background()
	app, err := auth.InitializeFirebase(ctx)
	if err != nil {
		log.Fatalf("error initializing app: %v\n\n", err)
	}

	// Handlers Init
	l := link.NewLinkRepository(db)
	lpr := links_page.NewLinksPageRepository(db)
	sr := stats.NewStatsRepository(db)
	s := link.NewLinkService(l)
	lps := links_page.NewLinksPageService(lpr, s)
	ss := stats.NewStatsService(sr)
	lp := handler.NewLinksPageHandler(lps, ss)
	aS := apikey.NewApiKeyService(app)
	h := handler.NewLinkHandler(s, ss)
	aH := handler.NewAPIKeyHandler(aS)
	sh := handler.NewStatsHandler(ss)

	// Cache Init
	store := persistence.NewRedisCache(os.Getenv("REDIS_HOST"), os.Getenv("REDIS_PASS"), time.Minute)
	inMemory := persistence.NewInMemoryStore(time.Minute * 5)

	r := gin.New()
	r.Use(gin.Recovery(), gin.Logger(), cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:3000", "http://localhost:8080", "https://*.5lnk.live", "https://www.5lnk.live", "https://*.vercel.app"},
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type", "Authorization"},
	}))

	// Swagger
	docs.SwaggerInfo.Host = os.Getenv("URL_API")
	docs.SwaggerInfo.BasePath = "/"
	r.GET("/swagger/*any",
		ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Health check endpoint
	r.GET("/health",
		cache.CachePage(store, time.Minute*10, func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"message": "Everything is okay here",
			})
		}))

	//
	r.GET("/",
		cache.CachePage(store, time.Minute*360, func(c *gin.Context) {
			c.Redirect(http.StatusMovedPermanently, "https://5lnk.live/?source=api_endpoint")
		}))

	// Redirect to the original URL
	r.GET(":shortened",
		cache.CachePage(store, time.Minute*1, h.RedirectShortenedURL()))

	// User authentication
	r.Use(middleware.Authenticate(ctx, app))
	// API v1
	api := r.Group("/api/v1")
	{
		apiKeys := api.Group("/apikeys")
		{
			apiKeys.POST("", aH.PostAPIKey())
			apiKeys.GET(":userId", aH.RetrieveAPIKey())
			apiKeys.DELETE(":userId", aH.DeleteAPIKey())
		}

		links := api.Group("/links")
		{
			links.POST("", h.PostURL())
			links.PUT("", h.Update())
			links.GET(":id",
				cache.CachePage(inMemory, time.Minute, h.GetLink()))
			links.DELETE("", h.Delete())
			links.GET("/user/:userId",
				cache.CachePage(store, time.Minute, h.GetAllByUser()))
		}

		linksPage := api.Group("/pages")
		{
			linksPage.POST("", lp.PostPage())
			linksPage.GET(":alias", lp.GetPageByAlias())
			linksPage.GET("/user/:userId", lp.GetAllPagesByUser())
			linksPage.PUT("", lp.Update())
			linksPage.DELETE("", lp.Delete())
		}

		st := api.Group("/stats")
		{
			st.GET("/link/:linkId",
				cache.CachePage(store, time.Minute, sh.GetLinkStats()))
		}
		{
			st.GET("/link/:linkId/stats",
				cache.CachePage(store, time.Minute, sh.GetLinkStatsByDate()))
		}
		{
			st.GET("/page/:pageId",
				cache.CachePage(store, time.Minute, sh.GetPageStats()))
		}
		{
			st.GET("/page/:pageId/stats",
				cache.CachePage(store, time.Minute, sh.GetPageStatsByDate()))
		}
		{
			st.GET("/user/:userId",
				cache.CachePage(store, time.Minute, sh.GetStatsByUserId()))
		}
		{
			st.GET("/user/:userId/overview",
				cache.CachePage(store, time.Minute, sh.GetUserStatsOverview()))
		}
		{
			st.GET("/user/:userId/links",
				cache.CachePage(store, time.Minute, sh.GetLinkStatsByUserIdAndDate()))
		}
		{
			st.GET("/user/:userId/pages",
				cache.CachePage(store, time.Minute, sh.GetPageStatsByUserIdAndDate()))
		}
	}

	// Start the HTTP server
	if err := r.Run(":8080"); err != nil {
		gin.SetMode(gin.ReleaseMode)
		log.Fatalln("Error in Gin server: ", err.Error())
	}
}
