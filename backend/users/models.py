from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    username = models.CharField(
        _('username'),
        max_length=150,
        unique=True,
        error_messages={
            'unique': _("A user with that username already exists."),
        },
        blank=False
    )
    full_name = models.CharField(
        _('full name'),
        max_length=100,
        blank=False,
        help_text=_('Full name of the user.')
    )
    email = models.EmailField(
        _('email address'),
        unique=True,
        error_messages={
            'unique': _("A user with that email address already exists."),
        }
    )
    age = models.PositiveIntegerField(
        _('age'),
        help_text=_('Age of the user.'),
        null=True,
        blank=True
    )
    phone_number = models.CharField(
        _('phone number'),
        max_length=15,  
        blank=True,
        null=True,
        help_text=_('Phone number of the user.')
    )
    address = models.TextField(
        _('address'),
        blank=True,
        null=True,
        help_text=_('Address of the user.')
    )
    is_admin = models.BooleanField(
        _('is admin'),
        default=False,
        help_text=_('Designates whether the user has admin privileges.')
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text=_('Timestamp when the user was created.')
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text=_('Timestamp when the user was last updated.')
    )

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')

    def __str__(self):
        return self.username

class Family(models.Model):
    name = models.CharField(
        _('family name'),
        max_length=100,
        unique=True,
        help_text=_('Name of the family.')
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_families',
        help_text=_('User who created this family.')
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text=_('Timestamp when the family was created.')
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text=_('Timestamp when the family was last updated.')
    )

    class Meta:
        verbose_name = _('family')
        verbose_name_plural = _('families')

    def __str__(self):
        return self.name

class FamilyMember(models.Model):
    family = models.ForeignKey(
        Family,
        on_delete=models.CASCADE,
        null = True, 
        blank = True,
        related_name='members',
        help_text=_('Family this member belongs to.')
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='family_members',
        help_text=_('User who declared this relationship.')
    )
    related_to = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null = True,
        blank = True,
        related_name='related_family_members',
        help_text=_('User to whom the relationship is declared.')
    )
    relationship = models.CharField(
        _('relationship'),
        max_length=50,
        help_text=_('Relationship from the user to the related user.')
    )

    class Meta:
        verbose_name = _('family member')
        verbose_name_plural = _('family members')
        unique_together = ('family', 'user', 'related_to')  # Mỗi cặp user và related_to chỉ xuất hiện một lần trong một Family

    def __str__(self):
        return f"{self.user.full_name} calls {self.related_to.full_name} ({self.relationship}) in {self.family.name}"