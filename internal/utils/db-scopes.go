package utils

import (
	"github.com/ronilsonalves/5lnk/pkg/web"
	"gorm.io/gorm"
	"math"
)

// Paginate returns a function that can be used to paginate a query.
func Paginate(value interface{}, pagination *web.Pagination, db *gorm.DB) func(db *gorm.DB) *gorm.DB {
	var totalItems int64
	db.Model(value).Count(&totalItems)
	pagination.Items = totalItems
	pagination.TotalPages = int64(math.Ceil(float64(totalItems) / float64(pagination.PageSize)))
	return func(db *gorm.DB) *gorm.DB {
		return db.Offset(pagination.GetOffset()).Limit(pagination.GetLimit()).Order(pagination.GetSort())
	}
}

// PaginateStatsByPageRef returns a function that can be used to paginate a query to retrieve stats data from a page.
func PaginateStatsByPageRef(pageId string, value interface{}, pagination *web.Pagination, db *gorm.DB) func(db *gorm.DB) *gorm.DB {
	var totalItems int64
	db.Model(value).Where("page_refer = ?", pageId).Count(&totalItems)
	pagination.Items = totalItems
	pagination.TotalPages = int64(math.Ceil(float64(totalItems) / float64(pagination.PageSize)))
	return func(db *gorm.DB) *gorm.DB {
		return db.Offset(pagination.GetOffset()).Limit(pagination.GetLimit()).Order(pagination.GetSort()).Where("page_refer = ?", pageId)
	}
}

// PaginateStatsByLinkRef returns a function that can be used to paginate a query to retrieve stats data from a link.
func PaginateStatsByLinkRef(linkId string, value interface{}, pagination *web.Pagination, db *gorm.DB) func(db *gorm.DB) *gorm.DB {
	var totalItems int64
	db.Model(value).Where("link_refer = ?", linkId).Count(&totalItems)
	pagination.Items = totalItems
	pagination.TotalPages = int64(math.Ceil(float64(totalItems) / float64(pagination.PageSize)))
	return func(db *gorm.DB) *gorm.DB {
		return db.Offset(pagination.GetOffset()).Limit(pagination.GetLimit()).Order(pagination.GetSort()).Where("link_refer = ?", linkId)
	}
}
