from django.contrib import admin
from django.urls import include, path
from rest_framework.authtoken import views
from doc import urls as doc_urls
from project import urls as project_urls
from entity import urls as entity_urls


urlpatterns = [
    path("admin/", admin.site.urls),
    path("login/", views.obtain_auth_token),
    path("doc/", include(doc_urls)),
    path("project/", include(project_urls)),
    path("entity/", include(entity_urls)),
]

