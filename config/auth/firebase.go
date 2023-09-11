package auth

import (
	"context"
	firebase "firebase.google.com/go/v4"
	"google.golang.org/api/option"
	"log"
)

// InitializeFirebase initializes the firebase app with Admin SDK.
func InitializeFirebase(c context.Context) (*firebase.App, error) {
	opt := option.WithCredentialsFile("env/firebase.json")
	app, err := firebase.NewApp(c, nil, opt)
	if err != nil {
		log.Fatalf("error initializing app: %v\n\n", err)
	}
	return app, nil
}
