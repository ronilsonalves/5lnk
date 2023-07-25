package web

import (
	"github.com/gin-gonic/gin"
	"time"
)

type errorResponse struct {
	StatusCode int    `json:"statusCode"`
	Status     string `json:"status"`
	Message    string `json:"message"`
	TimeStamp  string `json:"timeStamp"`
}

type response struct {
	Data interface{} `json:"data"`
}

func BadResponse(ctx *gin.Context, statusCode int, status, message string) {
	ctx.JSON(statusCode, errorResponse{
		StatusCode: statusCode,
		Status:     status,
		Message:    message,
		TimeStamp:  time.Now().String(),
	})
}

func ResponseOK(ctx *gin.Context, statusCode int, data interface{}) {
	ctx.JSON(statusCode, data)
}
