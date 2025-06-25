from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserInfoView, UserRegistrationView, LoginView, UserUpdateView,
    CookieTokenRefreshView, LogoutAPIView, FamilyMemberViewSet, FamilyViewSet, UserManagementView
)

router = DefaultRouter()
router.register(r'family-members', FamilyMemberViewSet)
router.register(r'families', FamilyViewSet, basename='family')

urlpatterns = [
    path('user-manage/', UserManagementView.as_view(), name='user-manage'),
    path('user-info/', UserInfoView.as_view(), name='user-info'),
    path('user-update/', UserUpdateView.as_view(), name='user-update'),
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutAPIView.as_view(), name='logout'),
    path('', include(router.urls)),
]