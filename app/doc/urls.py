# todo/todo_api/urls.py : API urls.py
from django.urls import path, include
from .views import (
    DocListApiView,
    DocDetailApiView,
    ProcessDoc
)

urlpatterns = [
    path('api', DocListApiView.as_view()),
    path('api/<int:doc_id>/', DocDetailApiView.as_view()),
]