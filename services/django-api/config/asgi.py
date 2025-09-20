import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from . import routing  # noqa: E402
from apps.chat.middleware import JWTAuthMiddleware

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
	"http": django_asgi_app,
	"websocket": JWTAuthMiddleware(
		AuthMiddlewareStack(
			URLRouter(routing.websocket_urlpatterns)
		)
	),
})
