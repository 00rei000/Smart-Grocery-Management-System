from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('meal_plans/', include('meal_plans.urls')),
    path('fridge/', include('fridge.urls')),
    path('shopping/', include('shopping.urls')),
    path('users/', include('users.urls')),
]