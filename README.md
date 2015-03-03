# Rosie
A lightweight RESTful API Management system.

##### /api_manager/api (POST)
Request body must contain:
```json
{
  “name”: “SomeApp”,
  “origin_url”: “http://somerandomdomain.io/api”,
  “publish_path”: “/someApp”,
  “endpoints”: [
    {
      “verbs”: “GET PUT POST DELETE”,
      “origin”: “/clients”,
      “publish”: “/users”,
      “before”: [
			  { “service”: “auth_service”, “priority”: 100 },
			  { “service”: “query_parser”, “priority”: 25 }
      ],
		  “after”: [
			  { “service”: “logger”, “priority”: 50 }
      ]
	  },	
    {
		  “verbs”: “GET”,
		  “origin”: “/media/movies”,
		  “publish”: “/movies”,
		  “before”: [ ],
		  “after”: [
			  { “service”: “logger”, “priority”: 50 }
      ]
	  }
	]
}
```
