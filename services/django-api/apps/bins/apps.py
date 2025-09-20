from django.apps import AppConfig


class BinsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.bins'

    def ready(self):
        import apps.bins.websocket_signals  # noqa: F401
