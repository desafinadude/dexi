# todo/todo_api/urls.py : API urls.py
from django.urls import path, include
from .views import (
    FolderListApiView,
    FolderDetailApiView
)

urlpatterns = [
    path('api', FolderListApiView.as_view()),
    path('api/<int:folder_id>/', FolderDetailApiView.as_view()),
]