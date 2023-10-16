package utils

import "math/rand"

// GenerateRandomAlias Creates a random alias of 6-character alphanumeric string for the shortened URL if the alias is empty
func GenerateRandomAlias(alias string) string {
	if alias != "" {
		return alias
	}
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	shortened := make([]byte, 6)
	for i := range shortened {
		shortened[i] = chars[rand.Intn(len(chars))]
	}
	return string(shortened)
}
