from rest_framework import serializers
from .models import Recipes, MealPlan

class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipes
        fields = ['id', 'title', 'ingredients', 'instructions', 'img_url']  # img_url giờ là ImageField

class MealPlanSerializer(serializers.ModelSerializer):
    recipe = RecipeSerializer(read_only=True)
    recipe_id = serializers.PrimaryKeyRelatedField(
        queryset=Recipes.objects.all(), source='recipe', write_only=True
    )

    class Meta:
        model = MealPlan
        fields = ['id', 'date', 'day_of_week', 'meal_type', 'recipe', 'recipe_id']
