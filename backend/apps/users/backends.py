"""Custom authentication backends for Klynaa."""

from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()


class EmailOrUsernameModelBackend(ModelBackend):
    """
    Authentication backend that allows users to authenticate using either
    email or username along with their password.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        """
        Authenticate user with email or username.

        Args:
            request: The request object
            username: Can be either username or email
            password: User's password
            **kwargs: Additional keyword arguments

        Returns:
            User instance if authentication successful, None otherwise
        """
        if username is None or password is None:
            return None

        try:
            # Try to find user by email or username
            user = User.objects.get(
                Q(username__iexact=username) | Q(email__iexact=username)
            )

            # Check password and ensure user is active
            if user.check_password(password) and self.user_can_authenticate(user):
                return user

        except User.DoesNotExist:
            # Run the default password hasher once to reduce the timing
            # difference between an existing and a nonexistent user
            User().set_password(password)

        return None

    def get_user(self, user_id):
        """
        Get user by ID.

        Args:
            user_id: The user's primary key

        Returns:
            User instance if found, None otherwise
        """
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

        return user if self.user_can_authenticate(user) else None