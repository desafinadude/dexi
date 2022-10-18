# todo/todo_api/urls.py : API urls.py
from django.urls import path, include
from .views import (
    EntityListApiView
)

urlpatterns = [
    path('api', EntityListApiView.as_view()),
    path('api/doc/<int:doc_id>/', EntityListApiView.as_view()),
]