import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import ChatRoom, Message, MessageReadReceipt
from django.utils import timezone
import uuid

User = get_user_model()


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.group_name = f"chat_{self.room_id}"

        # Ensure authenticated
        if not self.scope.get('user') or not self.scope['user'].is_authenticated:
            await self.close()
            return

        # Validate room membership
        is_member = await self._user_in_room(self.scope['user'].id, self.room_id)
        if not is_member:
            await self.close()
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'presence.update',
                'event': 'presence',
                'user_id': self.scope['user'].id,
                'status': 'online'
            }
        )

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'presence.update',
                'event': 'presence',
                'user_id': self.scope['user'].id,
                'status': 'offline'
            }
        )

    async def receive_json(self, content, **kwargs):
        action = content.get('action')

        if action == 'send_message':
            text = content.get('message', '').strip()
            client_id = content.get('client_message_id') or str(uuid.uuid4())
            image_url = None  # (Future: handle base64 or upload reference)
            if not text and not image_url:
                return
            message_obj = await self._create_message(
                self.room_id,
                self.scope['user'].id,
                text,
                client_id
            )
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'message.new',
                    'event': 'message',
                    'message': await self._serialize_message(message_obj)
                }
            )

        elif action == 'read':
            message_ids = content.get('message_ids', [])
            await self._mark_read(self.scope['user'].id, message_ids)
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'message.read',
                    'event': 'read',
                    'message_ids': message_ids,
                    'user_id': self.scope['user'].id
                }
            )

        elif action == 'typing':
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'typing.update',
                    'event': 'typing',
                    'user_id': self.scope['user'].id,
                    'is_typing': bool(content.get('is_typing'))
                }
            )

    async def message_new(self, event):
        await self.send_json(event)

    async def message_read(self, event):
        await self.send_json(event)

    async def typing_update(self, event):
        await self.send_json(event)

    async def presence_update(self, event):
        await self.send_json(event)

    # DB helpers
    @database_sync_to_async
    def _user_in_room(self, user_id, room_id):
        try:
            return ChatRoom.objects.filter(room_id=room_id, is_active=True).filter(
                models.Q(owner_id=user_id) | models.Q(worker_id=user_id)
            ).exists()
        except Exception:
            return False

    @database_sync_to_async
    def _create_message(self, room_id, user_id, content, client_id):
        room = ChatRoom.objects.get(room_id=room_id)
        return Message.objects.create(
            chat_room=room,
            sender_id=user_id,
            content=content,
            client_message_id=client_id
        )

    @database_sync_to_async
    def _serialize_message(self, message_obj):
        return {
            'id': str(message_obj.message_id),
            'content': message_obj.content,
            'sender_id': message_obj.sender_id,
            'created_at': message_obj.created_at.isoformat(),
            'is_read': message_obj.is_read,
        }

    @database_sync_to_async
    def _mark_read(self, user_id, message_ids):
        qs = Message.objects.filter(message_id__in=message_ids)
        for msg in qs:
            if not msg.is_read:  # simple global flag
                msg.is_read = True
                msg.read_at = timezone.now()
                msg.save(update_fields=['is_read', 'read_at'])
            MessageReadReceipt.objects.get_or_create(message=msg, user_id=user_id)
