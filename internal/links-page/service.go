package links_page

import (
	"fmt"
	"github.com/ronilsonalves/5lnk/internal/domain"
	"github.com/ronilsonalves/5lnk/internal/link"
	"github.com/ronilsonalves/5lnk/internal/utils"
	"github.com/ronilsonalves/5lnk/pkg/web"
	"log"
	"os"
	"time"
)

type Service interface {
	Create(request web.CreateLinksPage) (domain.LinksPage, error)
	GetLinksPageByAddress(address string) (*domain.LinksPage, error)
	GetAllByUser(userId string) (*[]domain.LinksPage, error)
	Update(request domain.LinksPage) (domain.LinksPage, error)
	Delete(request domain.LinksPage) error
}

type linksPageService struct {
	r  Repository
	ls link.Service
}

// NewLinksPageService creates a new linksPage service
func NewLinksPageService(r Repository, ls link.Service) Service {
	return &linksPageService{r: r, ls: ls}
}

// GetLinksPageByAddress returns a linksPage by the address
func (s *linksPageService) GetLinksPageByAddress(address string) (*domain.LinksPage, error) {
	return s.r.FindByAddress(address)
}

// GetAllByUser finds all linksPage by user
func (s *linksPageService) GetAllByUser(userId string) (*[]domain.LinksPage, error) {
	return s.r.FindAllByUser(userId)
}

// Create creates a new linksPage
func (s *linksPageService) Create(request web.CreateLinksPage) (domain.LinksPage, error) {
	log.Printf("INFO: validating data for linksPage: %v", request.Alias)
	// Before create a new linksPage, check if the address already exists
	if _, err := s.r.FindByAddress(request.Alias); err == nil {
		log.Printf("ERROR: the alias address `%s` already exists.", request.Alias)
		return domain.LinksPage{}, fmt.Errorf("the address `%s` already exists", request.Alias)
	}

	// Also, check if the links page alias already been used as a shortened URL
	_, err := s.ls.GetOriginalURL(request.Alias)
	if err != nil {
		if err.Error() != "record not found" {
			log.Printf("ERROR: the alias address `%s` already exists and being used as a shortened URL.", request.Alias)
			return domain.LinksPage{}, fmt.Errorf("the address `%s` already been used by a shortened URL", request.Alias)
		}
	}

	// Create short URLs for each link
	var links []domain.Link
	for _, lnkReq := range request.Links {
		shortURL := utils.GenerateRandomAlias("")
		lnk := domain.Link{
			Original:  lnkReq.URL,
			Title:     lnkReq.Title,
			Shortened: shortURL,
			FinalURL:  "https://" + request.Domain + "/" + shortURL,
			UserId:    request.UserId,
			CreatedAt: time.Now(),
		}
		links = append(links, lnk)
	}

	// Create a new linksPage object
	linkPage := &domain.LinksPage{
		Alias:       request.Alias,
		Domain:      request.Domain,
		FinalURL:    "https://" + request.Domain + "/" + request.Alias,
		Links:       links,
		UserId:      request.UserId,
		Title:       request.Title,
		Description: request.Description,
		ImageURL:    request.ImageURL,
		CreatedAt:   time.Now(),
	}

	log.Printf("INFO: inserting the linksPage `%v` into db...", linkPage.Alias)
	// Insert the new linksPage in the database
	if err := s.r.Create(linkPage); err != nil {
		log.Printf("ERROR: unable to create the linksPage due to  %v", err.Error())
		return domain.LinksPage{}, fmt.Errorf("unable to create the linksPage %v", err.Error())
	}

	// Create the shortened URL for the linksPage
	log.Printf("INFO: creating the shortened URL for the linksPage: %v", linkPage.Alias)
	if _, err := s.ls.ShortenURL(web.CreateShortenURL{
		URL:         os.Getenv("URL_SVC") + "/" + linkPage.Alias,
		ShortDomain: request.Domain,
		UserId:      "CREATED_BY_SYSTEM_" + linkPage.ID.String(),
		Alias:       linkPage.Alias,
	}); err != nil {
		log.Printf("ERROR: unable to create the shortened URL for the linksPage: %v", err.Error())
		_ = s.r.Delete(linkPage)
		return domain.LinksPage{}, fmt.Errorf("unable to create the shortened URL for the linksPage due to %v", err.Error())
	}

	log.Printf("INFO: the linksPage `%s` created", linkPage.Alias)

	return *linkPage, nil
}

// Update updates a linksPage
func (s *linksPageService) Update(request domain.LinksPage) (domain.LinksPage, error) {
	pageUpdate, err := s.r.FindById(request.ID)
	if err != nil {
		log.Printf("ERROR: the linksPage `%s` not found", request.Alias)
		return domain.LinksPage{}, err
	}

	// pageShortened get the original shortened URL for the linksPage to be updated later
	pageShortened, err := s.ls.GetShortenedByOriginal(os.Getenv("URL_SVC") + "/" + pageUpdate.Alias)
	if err != nil {
		log.Printf("ERROR: the shortened URL for links page `%s` not found... %v", request.Alias, err.Error())
		return domain.LinksPage{}, err
	}

	var linksToSave []domain.Link
	for _, lnkReq := range request.Links {
		if lnkReq.ID.String() == "00000000-0000-0000-0000-000000000000" || lnkReq.ID.String() == "" {
			shortURL := utils.GenerateRandomAlias("")
			lnk := domain.Link{
				Original:  lnkReq.Original,
				Title:     lnkReq.Title,
				Shortened: shortURL,
				FinalURL:  "https://" + request.Domain + "/" + shortURL,
				UserId:    request.UserId,
				PageRefer: request.ID.String(),
				CreatedAt: time.Now(),
			}
			linksToSave = append(linksToSave, lnk)
		}
	}

	for _, lnk := range request.Links {
		if lnk.ID.String() != "00000000-0000-0000-0000-000000000000" || lnk.ID.String() != "" {
			if _, err := s.ls.Update(lnk); err != nil {
				log.Printf("ERROR: unable to update all links from links page `%s` due to %v", request.Alias, err.Error())
				return domain.LinksPage{}, err
			}
		}
	}

	request.Links = linksToSave
	if err := s.r.Update(&request); err != nil {
		log.Printf("ERROR: unable to update the linksPage due to %v", err.Error())
		return domain.LinksPage{}, err
	}
	pageShortened.Shortened = request.Alias
	pageShortened.Original = os.Getenv("URL_SVC") + "/" + request.Alias
	pageShortened.Title = request.Title
	pageShortened.FinalURL = "https://" + request.Domain + "/" + request.Alias
	_, err = s.ls.Update(*pageShortened)
	if err != nil {
		log.Printf("ERROR: unable to update the shortened URL for the linksPage: %v", err.Error())
	}

	if err := s.r.Update(&request); err == nil {
		log.Printf("INFO: the linksPage `%s` updated successfully", request.Alias)
		return s.r.FindById(request.ID)
	}
	log.Printf("ERROR: unable to update the linksPage `%s`", request.Alias)
	return domain.LinksPage{}, fmt.Errorf("unable to update the linksPage %v", request.Alias)
}

// Delete deletes a linksPage
func (s *linksPageService) Delete(request domain.LinksPage) error {
	if err := s.r.Delete(&request); err == nil {
		log.Printf("INFO: the linksPage `%s` deleted", request.Alias)
		shortened, err := s.ls.GetShortenedByOriginal(os.Getenv("URL_SVC") + "/" + request.Alias)
		if err != nil {
			log.Printf("WARNING: the links page was deleted successfully but their shortened URL `%s` not found", request.Alias)
			return nil
		}
		log.Printf("INFO: deleting the shortened URL for the linksPage: %v", request.Alias)
		err = s.ls.Delete(*shortened)
		if err != nil {
			log.Printf("WARNING: the shortened URL for links page `%s` not found", request.Alias)
			return nil
		}
		log.Printf("INFO: the shortened URL for the linksPage `%s` deleted", request.Alias)
		return nil
	}
	log.Printf("ERROR: unable to delete the linksPage `%s`", request.Alias)
	return fmt.Errorf("unable to delete the linksPage %v", request.Alias)
}