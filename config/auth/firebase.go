package auth

import (
	"context"
	firebase "firebase.google.com/go/v4"
	"log"
)

// InitializeFirebase initializes the firebase app with Admin SDK.
func InitializeFirebase(c context.Context) (*firebase.App, error) {
	app, err := firebase.NewApp(c, nil)
	if err != nil {
		log.Fatalf("error initializing app: %v\n\n", err)
	}
	return app, nil
}
