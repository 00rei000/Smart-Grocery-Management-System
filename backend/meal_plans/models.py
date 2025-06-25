from django.db import models

class Recipes(models.Model):
    id = models.AutoField(primary_key=True)  # THÊM DÒNG NÀY để đồng bộ với bảng thật
    title = models.CharField(max_length=255, default="")  # Đồng bộ với nvarchar(255)
    ingredients = models.TextField(default="")
    instructions = models.TextField(default="")
    image_name = models.CharField(max_length=255, blank=True, null=True)  # Đồng bộ với nvarchar(255)
    cleaned_ingredients = models.TextField(blank=True, null=True)
    img_url = models.CharField(max_length=255, blank=True, null=True)  # CharField cho đường dẫn tĩnh

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'Recipes'  # Đồng bộ với tên bảng dbo.Recipes
        verbose_name = "Recipe"
        verbose_name_plural = "Recipes"
        ordering = ['id']

class MealPlan(models.Model):
    date = models.DateField()
    day_of_week = models.CharField(max_length=10, default="Monday")
    meal_type = models.CharField(max_length=50)
    recipe = models.ForeignKey(Recipes, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.meal_type} on {self.date}"

    class Meta:
        db_table = 'meal_plans'
        verbose_name = "Meal Plan"
        verbose_name_plural = "Meal Plans"
        ordering = ['date']
