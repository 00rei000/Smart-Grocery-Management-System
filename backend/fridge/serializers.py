from rest_framework import serializers
from .models import Food, Category
from django.core.exceptions import ObjectDoesNotExist
from datetime import datetime

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']
        read_only_fields = ['id']

    def validate_name(self, value):
        if Category.objects.filter(name=value).exists() and not self.instance:
            raise serializers.ValidationError("Tên danh mục đã tồn tại.")
        return value

class FoodSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='category.name', allow_null=False)

    class Meta:
        model = Food
        fields = [
            'id', 'name', 'category', 'compartment', 'location',
            'quantity', 'registered_date', 'expiry_date', 'note'
        ]
        read_only_fields = ['id', 'registered_date']

    def validate_expiry_date(self, value):
        if value < datetime.now().date():
            raise serializers.ValidationError("Ngày hết hạn không được nằm trong quá khứ.")
        return value

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Số lượng phải lớn hơn 0.")
        return value

    def validate(self, data):
        category_name = data.get('category', {}).get('name')
        if not category_name or not isinstance(category_name, str):
            raise serializers.ValidationError("Danh mục phải là tên danh mục hợp lệ (chuỗi).")
        return data

    def create(self, validated_data):
        category_name = validated_data.pop('category', {}).get('name')
        if not category_name:
            raise serializers.ValidationError("Danh mục không được để trống.")
        try:
            category = Category.objects.get(name__iexact=category_name)
        except ObjectDoesNotExist:
            raise serializers.ValidationError(f"Danh mục '{category_name}' không tồn tại.")
        validated_data['category'] = category
        return Food.objects.create(**validated_data)

    def update(self, instance, validated_data):
        category_name = validated_data.pop('category', {}).get('name')
        if category_name:
            try:
                category = Category.objects.get(name__iexact=category_name)
                validated_data['category'] = category
            except ObjectDoesNotExist:
                raise serializers.ValidationError(f"Danh mục '{category_name}' không tồn tại.")
        return super().update(instance, validated_data)