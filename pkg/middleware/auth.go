package middleware

import (
	"context"
	firebase "firebase.google.com/go/v4"
	"github.com/gin-gonic/gin"
	"github.com/ronilsonalves/5lnk/config/auth"
	"github.com/ronilsonalves/5lnk/internal/apikey"
	"log"
	"strings"
)

// Authenticate is a middleware that checks if the user is authenticated.
func Authenticate(c context.Context, app *firebase.App) gin.HandlerFunc {
	app, err := auth.InitializeFirebase(c)
	if err != nil {
		log.Fatalf("error initializing app: %v\n\n", err)
	}

	return func(ctx *gin.Context) {
		rawAccessToken := strings.Replace(ctx.GetHeader("Authorization"), "Bearer ", "", 1)

		if len(rawAccessToken) == 0 {
			log.Println("token not provided")
			ctx.AbortWithStatusJSON(401, gin.H{"message": "unauthorized"})
			return
		}

		// If the token is an API Key, we need to check if it is valid.
		if len(rawAccessToken) == 64 {
			s := apikey.NewApiKeyService(app)
			_, err := s.RetrieveUserId(rawAccessToken)
			if err != nil {
				log.Printf("error retrieving userId: %v\n\n", err)
				ctx.AbortWithStatusJSON(401, gin.H{"message": "unauthorized"})

			}
			ctx.Next()
			return
		}

		client, err := app.Auth(c)
		if err != nil {
			log.Printf("error getting Auth client: %v\n", err)
			ctx.AbortWithStatusJSON(503, gin.H{"message": "internal server error"})
			return
		}

		_, err = client.VerifyIDToken(c, rawAccessToken)
		if err != nil {
			log.Printf("error verifying ID token: %v\n\n", err)
			ctx.AbortWithStatusJSON(401, gin.H{"message": "unauthorized"})
			return
		}
		ctx.Next()
	}
}
