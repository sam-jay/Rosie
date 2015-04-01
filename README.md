# Rosie
A lightweight RESTful API Management system.

----
##### /api_manager/resources/:id (GET)
On success, responds 200 with body:
```json
{
	"prefix": "resource_prefix",
	"origin_url": "resource_origin_url",
	"verbs": [ "http_verb" ],
	"middleware": {
		"before": [ { "url": "middleware_url", "priority": "0-100" } ],
		"after": [ { "url": "middleware_url", "priority": "0-100" } ]
	},
	"url": "/api_manager/resources/xxxx"
}
```
On failure, responds 404.

----
##### /api_manager/resources (POST)
Request body must contain:
```json
{
	"prefix": "resource_prefix",
	"origin_url": "resource_origin_url",
	"verbs": [ "http_verb" ],
	"middleware": {
		"before": [ { "name": "middleware_name", "priority": "0-100" } ],
		"after": [ { "name": "middleware_name", "priority": "0-100" } ]
	},
	"url": "/api_manager/resources/xxxx"
}
```
