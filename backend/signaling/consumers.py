import json
from channels.generic.websocket import AsyncWebsocketConsumer

class SignalingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.session_code = self.scope['url_route']['kwargs']['code']
        self.room_group_name = f'session_{self.session_code}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        payload = data.get('payload', {})

        # When someone joins, notify others as 'peer_joined'
        # When someone leaves, notify others as 'peer_left'
        if message_type == 'join':
            broadcast_type = 'peer_joined'
        elif message_type == 'leave':
            broadcast_type = 'peer_left'
        else:
            broadcast_type = message_type

        # Broadcast to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'signaling_message',
                'message_type': broadcast_type,
                'payload': payload,
                'sender': self.channel_name
            }
        )

    async def signaling_message(self, event):
        # Don't send message back to sender
        if event['sender'] != self.channel_name:
            await self.send(text_data=json.dumps({
                'type': event['message_type'],
                'payload': event['payload']
            }))
