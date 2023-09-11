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
// @version 1.0
// @description This API provide endpoints to link shortening.
// @termsOfService https://github.com/ronilsonalves/5lnk/blog/main/LICENSE.md
// @contact.name Ronilson Alves
// @contact.url https://www.linkedin.com/in/ronilsonalves
// @license.name MIT
// @license.url https://github.com/ronilsonalves/5lnk/blob/main/LICENSE.md
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
	s := link.NewLinkService(l)
	aS := apikey.NewApiKeyService(app)
	h := handler.NewLinkHandler(s)
	aH := handler.NewAPIKeyHandler(aS)

	// Cache Init
	store := persistence.NewRedisCache(os.Getenv("REDIS_HOST"), os.Getenv("REDIS_PASS"), time.Minute)
	inMemory := persistence.NewInMemoryStore(time.Minute * 5)

	r := gin.New()
	r.Use(gin.Recovery(), gin.Logger(), cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:3000", "http://localhost:8080", "https://5lnk.live", "https://www.5lnk.live"},
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
		cache.CachePage(store, time.Minute*10, func(c *gin.Context) {
			c.Redirect(http.StatusMovedPermanently, "https://www.5lnk.live/?source=api")
		}))

	// Redirect to the original URL
	r.GET(":shortened",
		cache.CachePage(inMemory, time.Minute*5, h.RedirectShortenedURL()))

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
				//cache.CachePage(store, time.Minute, h.GetAllByUser()))
				h.GetAllByUser())
			links.GET("/user/:userId/count",
				cache.CachePage(store, time.Minute, h.CountLinksByUser()))
			links.GET("/user/:userId/clicks",
				//cache.CachePage(store, time.Minute, h.CountLinkClicksByUser()))
				h.CountLinkClicksByUser())
		}
	}

	// Start the HTTP server
	if err := r.Run(":8080"); err != nil {
		log.Fatalln("Error in Gin server: ", err.Error())
	}
}
