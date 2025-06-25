from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.utils.translation import gettext_lazy as _
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Family, FamilyMember

User = get_user_model()

# Các serializer hiện có của bạn
class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'full_name', 'email', 'age', 'phone_number', 'address','is_admin', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('username', 'full_name', 'email', 'age', 'phone_number', 'address', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data['full_name'],
            age=validated_data['age'],
            phone_number=validated_data.get('phone_number', ''),
            address=validated_data.get('address', ''),
            is_admin=validated_data.get('is_admin', False)
        )
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'full_name', 'email', 'age', 'phone_number', 'address')
        extra_kwargs = {
            'username': {'required': False},
            'full_name': {'required': True},
            'email': {'required': True},
            'age': {'required': True},
            'phone_number': {'required': False},
            'address': {'required': False},
        }

    def validate_email(self, value):
        if User.objects.exclude(pk=self.instance.pk).filter(email=value).exists():
            raise serializers.ValidationError(_('A user with that email address already exists.'))
        return value

    def validate_username(self, value):
        if User.objects.exclude(pk=self.instance.pk).filter(username=value).exists():
            raise serializers.ValidationError(_('A user with that username already exists.'))
        return value

class FamilySerializer(serializers.ModelSerializer):
    created_by = CustomUserSerializer(read_only=True)

    class Meta:
        model = Family
        fields = ('id', 'name', 'created_by', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at')

class FamilyMemberSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True, required=True)
    familyId = serializers.IntegerField(write_only=True, required=True)
    related_to_email = serializers.SerializerMethodField(read_only=True)  # Thêm dòng này
    email = serializers.EmailField(write_only=True, required=True)
    familyId = serializers.IntegerField(write_only=True, required=True)
    related_to_name = serializers.SerializerMethodField(read_only=True)  # Thêm dòng này

    class Meta:
        model = FamilyMember
        fields = [
            'id', 'family', 'familyId', 'relationship', 'email',
            'user', 'related_to', 'related_to_name', 'related_to_email' 
        ]
        extra_kwargs = {
            'user': {'read_only': True},
            'related_to': {'read_only': True},
            'family': {'read_only': True},
        }
    def get_related_to_email(self, obj):
        return obj.related_to.email
    
    def get_related_to_name(self, obj):
        # Trả về tên đầy đủ, nếu không có thì trả về username
        return obj.related_to.full_name or obj.related_to.username or obj.related_to.email

    def validate_familyId(self, value):
        try:
            family = Family.objects.get(pk=value)
        except Family.DoesNotExist:
            raise serializers.ValidationError("Family does not exist.")
        return value

    def create(self, validated_data):
        email = validated_data.pop('email')
        family_id = validated_data.pop('familyId')
        relationship = validated_data.get('relationship', '')
        user = self.context['request'].user

        # Lấy instance Family từ family_id
        family = Family.objects.get(pk=family_id)

        # Tìm user theo email
        User = get_user_model()
        try:
            related_to = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({'email': 'User with this email does not exist.'})

        # Không cho phép thêm trùng
        if FamilyMember.objects.filter(family=family, user=related_to).exists():
            raise serializers.ValidationError("User is already a member of this family.")

        return FamilyMember.objects.create(
            user=user,
            related_to=related_to,
            family=family,
            relationship=relationship
        )

# Serializer mới cho Đăng nhập
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(
                request=self.context.get('request'),
                username=username,
                password=password
            )
            if not user:
                raise serializers.ValidationError(
                    _('Unable to log in with provided credentials.'),
                    code='authentication'
                )
        else:
            raise serializers.ValidationError(
                _('Must include "username" and "password".'),
                code='authentication'
            )

        # Tạo token cho người dùng
        refresh = RefreshToken.for_user(user)
        attrs['user'] = user
        attrs['refresh'] = str(refresh)
        attrs['access'] = str(refresh.access_token)
        return attrs

# Serializer mới cho Đăng xuất
class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=True)

    def validate(self, attrs):
        try:
            refresh_token = attrs['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()  # Vô hiệu hóa refresh token
        except Exception as e:
            raise serializers.ValidationError(
                _('Invalid or expired refresh token.'),
                code='invalid_token'
            )
        return attrs