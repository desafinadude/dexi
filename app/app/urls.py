from django.contrib import admin
from django.urls import include, path
from rest_framework.authtoken import views
from dexi import urls as dexi_urls

urlpatterns = [
    path('admin/', admin.site.urls),
    path('dexi/', include(dexi_urls)),
    path('dj-rest-auth/', include('dj_rest_auth.urls')),
    path('dj-rest-auth/registration/', include('dj_rest_auth.registration.urls'))
]