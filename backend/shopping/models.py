from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from users.models import User, Family

class ShoppingList(models.Model):
    family = models.ForeignKey(
        Family,
        on_delete=models.CASCADE,
        related_name='shopping_lists',
        help_text=_('Family associated with this shopping list.'),
        null=True,
        blank=True
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_shopping_lists',
        help_text=_('The user who created this shopping list.')
    )
    name = models.CharField(
        _('name'),
        max_length=100,
        help_text=_('Name of the shopping list.'),
        default='My Shopping List'
    )
    date = models.DateField(
        _('date'),
        null=True, blank=True,
        help_text=_('Ngày áp dụng danh sách mua sắm (nếu theo ngày)')
    )
    week = models.CharField(
        _('week'),
        max_length=10,
        null=True, blank=True,
        help_text=_('Tuần áp dụng danh sách mua sắm (ví dụ: 2024-W21)')
    )
    shared_with = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        blank=True,
        related_name='shared_shopping_lists',
        help_text='Các thành viên được chia sẻ danh sách này'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text=_('Timestamp when the shopping list was created.')
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text=_('Timestamp when the shopping list was last updated.')
    )

    class Meta:
        verbose_name = _('shopping list')
        verbose_name_plural = _('shopping lists')

    def __str__(self):
        return f"{self.name} for {self.family.name}"
    
    
class ShoppingListItem(models.Model):
    shopping_list = models.ForeignKey(
        ShoppingList,
        on_delete=models.CASCADE,
        related_name='items',
        help_text=_('Shopping list this item belongs to.')
    )
    item = models.CharField(
        _('item'),
        max_length=100,
        help_text=_('Name of the item to buy.')
    )
    quantity = models.DecimalField(
        _('quantity'),
        max_digits=10,
        decimal_places=2,
        help_text=_('Quantity of the item.')
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text=_('Timestamp when the item was added.')
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text=_('Timestamp when the item was last updated.')
    )

    category = models.CharField(
        _('category'),
        max_length=50,
        null=True, blank=True,
        help_text=_('Danh mục thực phẩm (rau củ, thịt cá, đồ khô, gia vị, v.v.)')
    )
    
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=[('pending', 'Chưa mua'), ('bought', 'Đã mua')],
        default='pending',
        help_text=_('Trạng thái mua sắm')
    )
    class Meta:
        verbose_name = _('shopping list item')
        verbose_name_plural = _('shopping list items')

    def __str__(self):
        return f"{self.item} ({self.quantity}) in {self.shopping_list.name}"