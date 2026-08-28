"""URL routes for the local camera debug UI."""

from django.urls import path

from app.debug_ui import views


urlpatterns = [
    path("", views.index, name="debug-ui"),
    path("debug-ui.css", views.stylesheet, name="debug-stylesheet"),
    path("debug-ui.js", views.script, name="debug-script"),
    path("api/health/", views.health, name="debug-health"),
    path("api/status/", views.status, name="debug-status"),
    path("api/camera/start/", views.start_camera, name="debug-start-camera"),
    path("api/camera/stop/", views.stop_camera, name="debug-stop-camera"),
    path("api/video/", views.video_stream, name="debug-video"),
]
