from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)  # Tên danh mục duy nhất

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"

class Food(models.Model):
    COMPARTMENT_CHOICES = [
        ('cooler', 'Ngăn mát'),
        ('freezer', 'Tủ đông'),
    ]

    name = models.CharField(max_length=100)  # Tên thực phẩm có thể trùng
    category = models.ForeignKey(Category, on_delete=models.CASCADE)  # Liên kết với thể loại
    compartment = models.CharField(max_length=10, choices=COMPARTMENT_CHOICES)  # Ngăn mát hoặc tủ đông
    location = models.CharField(max_length=50)  # Vị trí cất
    quantity = models.PositiveIntegerField()  # Số lượng
    registered_date = models.DateField(auto_now_add=True)  # Thời gian đăng ký
    expiry_date = models.DateField()  # Thời gian hết hạn
    note = models.TextField(blank=True)  # Ghi chú, có thể để trống

    def __str__(self):
        return f"{self.name} ({self.compartment})"

    class Meta:
        verbose_name = "Food"
        verbose_name_plural = "Foods"