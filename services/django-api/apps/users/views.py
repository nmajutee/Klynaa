from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q
from .serializers import UserSerializer, UserRegistrationSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """User registration endpoint."""
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens for immediate login
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token

        # Return user data with tokens
        user_serializer = UserSerializer(user)
        return Response({
            'user': user_serializer.data,
            'access': str(access_token),
            'refresh': str(refresh),
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(APIView):
    """Custom JWT token view that accepts email or username for login."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username_or_email = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')

        if not username_or_email or not password:
            return Response({
                'error': 'Both username/email and password are required.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Use our custom authentication backend
        user = authenticate(
            request=request,
            username=username_or_email,
            password=password
        )

        if user and user.is_active:
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token

            # Return user data with tokens
            user_serializer = UserSerializer(user)
            return Response({
                'user': user_serializer.data,
                'access': str(access_token),
                'refresh': str(refresh),
                'message': 'Login successful'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'No active account found with the given credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
