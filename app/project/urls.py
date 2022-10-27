# todo/todo_api/urls.py : API urls.py
from django.urls import path, include
from .views import (
    ProjectListApiView,
    ProjectDetailApiView
)

urlpatterns = [
    path('api', ProjectListApiView.as_view()),
    path('api/<int:project_id>/', ProjectDetailApiView.as_view()),
]