from django.urls import path, include
from .views import (
    DocListApiView,
    DocDetailApiView
)

urlpatterns = [
    path('api/', DocListApiView.as_view()),
    path('api/project/<int:project_id>/', DocListApiView.as_view()),
    path('api/<int:doc_id>/', DocDetailApiView.as_view()),
]