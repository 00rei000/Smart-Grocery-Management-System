from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import ShoppingList, ShoppingListItem
from .serializers import ShoppingListSerializer, ShoppingListItemSerializer

class ShoppingListViewSet(viewsets.ModelViewSet):
    queryset = ShoppingList.objects.all()
    serializer_class = ShoppingListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'week', 'date']
    ordering_fields = ['date', 'week', 'created_at']

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        # Trả về danh sách của family hoặc được chia sẻ với user
        return queryset.filter(
            models.Q(family__members__user=user) | models.Q(shared_with=user)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class ShoppingListItemViewSet(viewsets.ModelViewSet):
    queryset = ShoppingListItem.objects.all()
    serializer_class = ShoppingListItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['item', 'category', 'status']
    ordering_fields = ['category', 'status', 'created_at']

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        # Chỉ trả về item thuộc family của user
        return queryset.filter(shopping_list__family__members__user=user).distinct()
