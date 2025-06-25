from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError
from .serializers import CustomUserSerializer, UserRegistrationSerializer, LoginSerializer, LogoutSerializer, FamilySerializer, FamilyMemberSerializer, UserUpdateSerializer
from .models import User, Family, FamilyMember
from django.utils.translation import gettext_lazy as _
from rest_framework.exceptions import ValidationError
from django.db import models

class UserInfoView(APIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = CustomUserSerializer

    def get(self, request):
        user = request.user
        serializer = self.serializer_class(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserUpdateView(generics.UpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserUpdateSerializer

    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object(), data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    serializer_class = LoginSerializer
    authentication_classes = []
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            access_token = serializer.validated_data['access']
            refresh_token = serializer.validated_data['refresh']
            response = Response({
                "user": CustomUserSerializer(user).data,
                "access": access_token,
                "refresh": refresh_token
            }, status=status.HTTP_200_OK)
            response.set_cookie(
                key='access_token',
                value=access_token,
                max_age=60 * 60,
                httponly=True,
                secure=True,
                samesite='None',
            )
            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                max_age=24 * 60 * 60,
                httponly=True,
                secure=True,
                samesite='None',
            )
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CookieTokenRefreshView(TokenRefreshView):
    authentication_classes = []
    permission_classes = (AllowAny,)

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({"detail": _("No refresh token provided")}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            response = Response({"access": access_token}, status=status.HTTP_200_OK)
            response.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=True,
                samesite='None',
            )
            return response
        except TokenError:
            return Response({"detail": _("Invalid refresh token")}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutAPIView(generics.GenericAPIView):
    serializer_class = LogoutSerializer
    permission_classes = (AllowAny,)
    authentication_classes = []

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            response = Response({"message": _("Logout successful")}, status=status.HTTP_205_RESET_CONTENT)
            response.set_cookie(
                key='access_token',
                value='',
                path='/',
                secure=True,
                httponly=True,
                samesite='None',
            )
            response.set_cookie(
                key='refresh_token',
                value='',
                path='/',
                secure=True,
                httponly=True,
                samesite='None',
            )
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FamilyViewSet(viewsets.ModelViewSet):
    serializer_class = FamilySerializer
    permission_classes = (IsAuthenticated,)
    queryset = Family.objects.all()

    def get_queryset(self):
        # Trả về Family mà user hiện tại là người tạo hoặc là thành viên (user hoặc related_to)
        return self.queryset.filter(
            models.Q(members__user=self.request.user) |
            models.Q(members__related_to=self.request.user) |
            models.Q(created_by=self.request.user)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class FamilyMemberViewSet(viewsets.ModelViewSet):
    serializer_class = FamilyMemberSerializer
    permission_classes = (IsAuthenticated,)
    queryset = FamilyMember.objects.all()

    def get_queryset(self):
        # Chỉ trả về FamilyMember mà user hiện tại là chủ thể (người khai báo)
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        family_id = serializer.validated_data.get('familyId') or self.request.data.get('familyId')
        if not family_id:
            raise ValidationError({'familyId': 'Family ID is required.'})
        try:
            family = Family.objects.get(pk=family_id)
        except Family.DoesNotExist:
            raise ValidationError({'familyId': 'Family does not exist.'})

        email = self.request.data.get('email')
        relationship = serializer.validated_data.get('relationship', '')

        # Tìm user theo email
        try:
            related_to = User.objects.get(email=email)
        except User.DoesNotExist:
            raise ValidationError({'email': 'User with this email does not exist.'})

        # Kiểm tra quyền như cũ
        if not family.members.filter(user=self.request.user).exists() and family.created_by != self.request.user:
            raise ValidationError(_('You are not a member or creator of this family.'))

        # Không cho phép thêm trùng
        if FamilyMember.objects.filter(family=family, user=self.request.user, related_to=related_to).exists():
            raise ValidationError(_('User is already a member of this family.'))

        # Tạo bản ghi chiều A -> B
        serializer.save(user=self.request.user, related_to=related_to, family=family, relationship=relationship)

        # Nếu chưa có bản ghi chiều B -> A thì tạo thêm với relationship mặc định "người quen"
        if not FamilyMember.objects.filter(family=family, user=related_to, related_to=self.request.user).exists():
            FamilyMember.objects.create(
                user=related_to,
                related_to=self.request.user,
                family=family,
                relationship="người quen"
            )

    def perform_destroy(self, instance):
        # Xóa cả hai chiều quan hệ trong cùng một family
        FamilyMember.objects.filter(
            family=instance.family,
            user__in=[instance.user, instance.related_to],
            related_to__in=[instance.user, instance.related_to]
        ).delete()
        
class UserManagementView(APIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = CustomUserSerializer

    def get(self, request):
        """Retrieve all users in the database."""
        users = User.objects.all()
        serializer = self.serializer_class(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        """Update a specific user's information by ID."""
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"detail": _("User ID is required")}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(id=user_id)
            if user == request.user:
                return Response({"detail": _("Cannot update your own account through this endpoint")}, status=status.HTTP_400_BAD_REQUEST)
            serializer = UserUpdateSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                response_serializer = self.serializer_class(user)
                return Response(response_serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"detail": _("User not found")}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        """Create a new user (admin only)."""
        from .serializers import UserRegistrationSerializer
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            response_serializer = self.serializer_class(user)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        """Delete a specific user by ID."""
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"detail": _("User ID is required")}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(id=user_id)
            if user == request.user:
                return Response({"detail": _("Cannot delete your own account")}, status=status.HTTP_400_BAD_REQUEST)
            user.delete()
            return Response({"message": _("User deleted successfully")}, status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({"detail": _("User not found")}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
