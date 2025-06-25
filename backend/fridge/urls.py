from django.urls import path
from . import views

urlpatterns = [
    path('foods/add_food/', views.add_food, name='add_food'),
    path('foods/compartment/<str:compartment>/', views.food_list, name='food_list'),
    path('foods/<int:food_id>/', views.update_food, name='update_food'),  
    path('foods/<int:food_id>/delete/', views.delete_food, name='delete_food'),
    path('categories/add/', views.add_category, name='add_category'),   
]