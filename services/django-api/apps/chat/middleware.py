from urllib.parse import parse_qs
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async

User = get_user_model()

class JWTAuthMiddleware:
    """Populate scope['user'] from JWT token passed as query param (?token=) or header subprotocol.
    This is a lightweight approach for WebSocket auth.
    """
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope.get('query_string', b'').decode()
        params = parse_qs(query_string)
        token = None
        if 'token' in params:
            token = params['token'][0]
        else:
            # Try headers
            for header_name, header_value in scope.get('headers', []):
                if header_name == b'sec-websocket-protocol':
                    # Some clients might send token as subprotocol
                    token = header_value.decode()
        scope['user'] = await self._get_user(token)
        return await self.inner(scope, receive, send)

    @database_sync_to_async
    def _get_user(self, token):
        if not token:
            from django.contrib.auth.models import AnonymousUser
            return AnonymousUser()
        try:
            access = AccessToken(token)
            user_id = access.get('user_id')
            return User.objects.get(id=user_id)
        except Exception:
            from django.contrib.auth.models import AnonymousUser
            return AnonymousUser()


def JWTAuthMiddlewareStack(inner):  # Optional helper
    return JWTAuthMiddleware(AuthMiddlewareStack(inner))
