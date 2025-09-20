from django.urls import path
from apps.chat import consumers
from apps.bins import websocket_consumers
from apps.users import websocket_consumers as users_consumers

websocket_urlpatterns = [
    path("ws/chat/<uuid:room_id>/", consumers.ChatConsumer.as_asgi()),
    path("ws/pickup/<str:pickup_id>/", websocket_consumers.PickupConsumer.as_asgi()),
    path("ws/worker/<int:worker_id>/", users_consumers.WorkerConsumer.as_asgi()),
    path("ws/customer/<int:customer_id>/", websocket_consumers.CustomerConsumer.as_asgi()),
]
