"""Minimal CORS support for the separate Vercel and Django deployments."""

from django.http import HttpResponse


class CorsHeadersMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method == "OPTIONS":
            response = HttpResponse(status=204)
        else:
            response = self.get_response(request)
        response["Access-Control-Allow-Origin"] = request.headers.get("Origin", "*")
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response["Access-Control-Allow-Methods"] = "GET, POST, PATCH, OPTIONS"
        response["Access-Control-Max-Age"] = "86400"
        return response
