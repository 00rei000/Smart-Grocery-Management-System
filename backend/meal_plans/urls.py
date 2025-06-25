from django.urls import path
from .views import (
    recipe_list, recipe_detail, recipe_delete, recipe_create, recipe_update,
    meal_plan_list, meal_plan_detail, meal_plan_create, meal_plan_update, meal_plan_delete
)

urlpatterns = [
    # URLs cho Recipes
    # Ví dụ: GET /meal-plans/recipes/list/ để lấy danh sách công thức
    path('recipes/list/', recipe_list, name='recipe-list'),
    path('recipes/<int:pk>/', recipe_detail, name='recipe-detail'),
    path('recipes/delete/<int:pk>/', recipe_delete, name='recipe-delete'),
    path('recipes/create/', recipe_create, name='recipe-create'),
    path('recipes/update/<int:pk>/', recipe_update, name='recipe-update'),
    
    # URLs cho MealPlan
    # Ví dụ: POST /meal-plans/meal-plans/create/ để tạo kế hoạch bữa ăn
    path('plans/list/', meal_plan_list, name='meal-plan-list'),
    path('plans/<int:pk>/', meal_plan_detail, name='meal-plan-detail'),
    path('plans/create/', meal_plan_create, name='meal-plan-create'),
    path('plans/update/<int:pk>/', meal_plan_update, name='meal-plan-update'),
    path('plans/delete/<int:pk>/', meal_plan_delete, name='meal-plan-delete'),
]