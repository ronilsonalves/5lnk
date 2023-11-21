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

// PaginateStatsByUserID returns a function that can be used to paginate a query to retrieve stats data from a user.
func PaginateStatsByUserID(userId string, value interface{}, pagination *web.Pagination, db *gorm.DB) func(db *gorm.DB) *gorm.DB {
	var totalItems int64
	selectQuery := "SELECT s.id, s.link_refer, s.page_refer, s.timestamp, s.os, s.browser FROM stats s INNER JOIN links l ON s.link_refer = l.id::text WHERE l.user_id = ? UNION SELECT s2.id, s2.link_refer, s2.page_refer, s2.timestamp, s2.os, s2.browser FROM stats s2 INNER JOIN links_pages p ON s2.page_refer = p.id::text WHERE p.user_id = ?"
	db.Raw(selectQuery, userId, userId).Count(&totalItems)
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
