package main

import (
	"github.com/gin-contrib/cache"
	"github.com/gin-contrib/cache/persistence"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/ronilsonalves/5lnk/cmd/server/handler"
	"github.com/ronilsonalves/5lnk/config/db"
	"github.com/ronilsonalves/5lnk/docs"
	"github.com/ronilsonalves/5lnk/internal/domain"
	"github.com/ronilsonalves/5lnk/internal/link"
	"github.com/swaggo/files"       // swagger embed files
	"github.com/swaggo/gin-swagger" // gin-swagger middleware
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"
)

// @title Go lnk API
// @version 1.0
// @description This API provide endpoints to link shortning.
// @termsOfService https://github.com/ronilsonalves/go-lnk/blog/main/LICENSE.md
// @contact.name Ronilson Alves
// @contact.url https://www.linkedin.com/in/ronilsonalves
// @license.name MIT
// @license.url https://github.com/ronilsonalves/go-lnk/blob/main/LICENSE.md
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

	// Handlers Init
	l := link.NewLinkRepository(db)
	s := link.NewLinkService(l)
	h := handler.NewLinkHandler(s)

	// Cahce Init
	store := persistence.NewRedisCache(os.Getenv("REDIS_HOST"), os.Getenv("REDIS_PASSWORD"), time.Minute)

	r := gin.New()
	r.Use(gin.Recovery(), gin.Logger(), cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:3000", "http://localhost:8080", "https://5link.live", "https://www.5link.live"},
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type"},
	}))

	docs.SwaggerInfo.Host = os.Getenv("URL_API")
	docs.SwaggerInfo.BasePath = "/"
	r.GET("/swagger/*any",
		ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Health check endpoint
	r.GET("/",
		cache.CachePageWithoutQuery(store, time.Minute, func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"message": "Everything is okay here",
			})
		}))

	api := r.Group("/api/v1")
	{
		links := api.Group("/links")
		{
			links.POST("",
				cache.CachePageWithoutQuery(store, time.Minute, h.PostURL()))
		}
	}

	r.GET(":shortened",
		cache.CachePageWithoutQuery(store, time.Minute, h.RedirectShortenedURL()))

	// Start the HTTP server
	if err := r.Run(":8080"); err != nil {
		log.Fatalln("Error in Gin server: ", err.Error())
	}

}
