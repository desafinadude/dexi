from django.contrib import admin
from django.urls import include, path
from rest_framework.authtoken import views
from dexi import urls as dexi_urls

urlpatterns = [
    path("admin/", admin.site.urls),
    path("login/", views.obtain_auth_token),
    path("dexi/", include(dexi_urls)),
]