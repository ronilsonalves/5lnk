package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/mileusna/useragent"
)

type FormattedUserAgent struct {
	OS      string `json:"os"`
	Browser string `json:"browser"`
}

// GetFormattedUserAgent returns the user agent compounding the OS and Browser.
func GetFormattedUserAgent(ctx *gin.Context) FormattedUserAgent {
	rawUserAgent := ctx.Request.UserAgent()
	ua := useragent.Parse(rawUserAgent)
	return FormattedUserAgent{
		OS:      ua.OS + " " + ua.OSVersion,
		Browser: ua.Name + " " + ua.Version,
	}
}
