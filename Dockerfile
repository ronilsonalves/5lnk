FROM golang:1.20.6-alpine3.18 AS build
WORKDIR /app
COPY go.mod ./
COPY go.sum ./
RUN go mod download
COPY . ./
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o 5lnk cmd/server/api.go

# Final stage
FROM gcr.io/distroless/static-debian10
COPY --from=build /app/5lnk /5lnk
COPY .env /
USER nonroot:nonroot
EXPOSE 8080
ENTRYPOINT ["/5lnk"]
LABEL org.opencontainers.image.source=https://github.com/ronilsonalves/5lnk