from rest_framework import serializers
from .models import ShoppingList, ShoppingListItem
from users.serializers import FamilySerializer, CustomUserSerializer
from users.models import Family
from django.utils.translation import gettext_lazy as _
from users.serializers import CustomUserSerializer
from django.contrib.auth import get_user_model
User = get_user_model()

class ShoppingListSerializer(serializers.ModelSerializer):
    family = FamilySerializer(read_only=True)
    created_by = CustomUserSerializer(read_only=True)
    shared_with = CustomUserSerializer(many=True, read_only=True)
    shared_with_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        write_only=True,
        required=False
    )
    family_id = serializers.PrimaryKeyRelatedField(
        queryset=Family.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = ShoppingList
        fields = [
            'id', 'family', 'family_id', 'name', 'created_by',
            'date', 'week', 'created_at', 'updated_at',
            'shared_with', 'shared_with_ids'
        ]

    def create(self, validated_data):
        shared_with_ids = validated_data.pop('shared_with_ids', [])
        shopping_list = super().create(validated_data)
        if shared_with_ids:
            shopping_list.shared_with.set(shared_with_ids)
        return shopping_list

    def update(self, instance, validated_data):
        shared_with_ids = validated_data.pop('shared_with_ids', None)
        instance = super().update(instance, validated_data)
        if shared_with_ids is not None:
            instance.shared_with.set(shared_with_ids)
        return instance

class ShoppingListItemSerializer(serializers.ModelSerializer):
    shopping_list = ShoppingListSerializer(read_only=True)
    shopping_list_id = serializers.PrimaryKeyRelatedField(
        queryset=ShoppingList.objects.all(), source='shopping_list', write_only=True
    )

    class Meta:
        model = ShoppingListItem
        fields = (
            'id', 'shopping_list', 'shopping_list_id', 'item', 'quantity',
            'category', 'status', 'created_at', 'updated_at'
        )
