package apikey

import (
	"cloud.google.com/go/firestore"
	"context"
	"crypto/rand"
	"encoding/hex"
	firebase "firebase.google.com/go/v4"
	"fmt"
	"log"
)

type Service interface {
	GenerateApiKey(userId string) (string, error)
	RetrieveApiKey(userId string) (string, error)
	RetrieveUserId(apiKey string) (string, error)
	RevokesApiKey(userId string) error
}

type apiKeyService struct {
	app *firebase.App
}

// NewApiKeyService creates a new api key service
func NewApiKeyService(app *firebase.App) Service {
	return &apiKeyService{app: app}
}

// GenerateApiKey generates a new api key for the user
func (s *apiKeyService) GenerateApiKey(userId string) (string, error) {
	key := make([]byte, 32)
	_, err := rand.Read(key)
	if err != nil {
		return "", fmt.Errorf("error generating api key: %v", err)
	}

	apiKey := hex.EncodeToString(key)

	var apiKeyDoc = map[string]interface{}{
		"userId":    userId,
		"key":       apiKey,
		"createdAt": firestore.ServerTimestamp,
	}

	client, err := s.app.Firestore(context.Background())
	if err != nil {
		return "", fmt.Errorf("error getting Firestore client: %v", err)
	}
	defer func(client *firestore.Client) {
		err := client.Close()
		if err != nil {
			log.Printf("error closing Firestore client: %v", err)
		}
	}(client)
	_, err = client.Collection("apiKeys").Doc(userId).Set(context.Background(), apiKeyDoc)
	if err != nil {
		return "", fmt.Errorf("error saving api key: %v", err)
	}
	return apiKey, nil
}

// RetrieveApiKey retrieves the api key from the database
func (s *apiKeyService) RetrieveApiKey(userId string) (string, error) {
	client, err := s.app.Firestore(context.Background())
	if err != nil {
		return "", fmt.Errorf("error getting Firestore client: %v", err)
	}
	defer func(client *firestore.Client) {
		err := client.Close()
		if err != nil {
			log.Printf("error closing Firestore client: %v", err)
		}
	}(client)
	apiKeyDoc, err := client.Collection("apiKeys").Doc(userId).Get(context.Background())
	if err != nil {
		return "", fmt.Errorf("error retrieving api key: %v", err)
	}
	return apiKeyDoc.Data()["key"].(string), nil
}

// RetrieveUserId retrieves the user id from the api key
func (s *apiKeyService) RetrieveUserId(apiKey string) (string, error) {
	client, err := s.app.Firestore(context.Background())
	if err != nil {
		return "", fmt.Errorf("error getting Firestore client: %v", err)
	}
	defer func(client *firestore.Client) {
		err := client.Close()
		if err != nil {
			log.Printf("error closing Firestore client: %v", err)
		}
	}(client)
	apiKeyDoc, err := client.Collection("apiKeys").Where("key", "==", apiKey).Documents(context.Background()).Next()
	if err != nil {
		return "", fmt.Errorf("error retrieving api key: %v", err)
	}
	return apiKeyDoc.Data()["userId"].(string), nil
}

// RevokesApiKey revokes the api key
func (s *apiKeyService) RevokesApiKey(userId string) error {
	client, err := s.app.Firestore(context.Background())
	if err != nil {
		return fmt.Errorf("error getting Firestore client: %v", err)
	}
	defer func(client *firestore.Client) {
		err := client.Close()
		if err != nil {
			log.Printf("error closing Firestore client: %v", err)
		}
	}(client)
	_, err = client.Collection("apiKeys").Doc(userId).Delete(context.Background())
	return err
}
