import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from pymongo import MongoClient
from django.conf import settings
from datetime import datetime

client = MongoClient(settings.MONGODB_URI)
db = client.get_database()
sessions_col = db['sessions']
alerts_col = db['alerts']

# In-memory participant registry per session
# { session_code: { channel_name: { name, role } } }
_participants = {}


class SignalingConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.session_code = self.scope['url_route']['kwargs']['code']
        self.room_group = f'session_{self.session_code}'
        self.participant_info = {}

        # Verify session exists
        session = await self._get_session(self.session_code)
        if not session:
            await self.close(code=4004)
            return

        await self.channel_layer.group_add(self.room_group, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if self.participant_info:
            # Remove from in-memory registry
            if self.session_code in _participants:
                _participants[self.session_code].pop(self.channel_name, None)

            # Notify others
            await self.channel_layer.group_send(self.room_group, {
                'type': 'signaling_message',
                'message_type': 'peer_left',
                'payload': {'name': self.participant_info.get('name', '')},
                'sender': self.channel_name,
            })

            # Update participant list in DB
            await self._sync_participants_to_db()

        await self.channel_layer.group_discard(self.room_group, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        message_type = data.get('type')
        payload = data.get('payload', {})

        if message_type == 'join':
            name = payload.get('name', 'Unknown')
            role = payload.get('role', 'candidate')
            self.participant_info = {'name': name, 'role': role}

            # Register in memory
            if self.session_code not in _participants:
                _participants[self.session_code] = {}
            _participants[self.session_code][self.channel_name] = self.participant_info

            # Update session status to active + sync participants
            await self._update_session_active()
            await self._sync_participants_to_db()

            # Broadcast peer_joined to others
            await self.channel_layer.group_send(self.room_group, {
                'type': 'signaling_message',
                'message_type': 'peer_joined',
                'payload': {'name': name, 'role': role},
                'sender': self.channel_name,
            })

            # Send current participant list back to the joiner
            participants = list(_participants.get(self.session_code, {}).values())
            await self.send(text_data=json.dumps({
                'type': 'participants_update',
                'payload': {'participants': participants},
            }))

        elif message_type == 'leave':
            await self.disconnect(1000)

        elif message_type == 'alert':
            # Save alert to DB and broadcast to host
            alert_type = payload.get('alertType', 'unknown')
            risk_delta = payload.get('riskDelta', 5)
            await self._save_alert(alert_type, risk_delta, payload.get('metadata', {}))

            await self.channel_layer.group_send(self.room_group, {
                'type': 'signaling_message',
                'message_type': 'alert_update',
                'payload': {
                    'alertType': alert_type,
                    'riskDelta': risk_delta,
                    'participantName': self.participant_info.get('name', ''),
                },
                'sender': self.channel_name,
            })

        else:
            # WebRTC signaling: offer, answer, ice — relay to others
            await self.channel_layer.group_send(self.room_group, {
                'type': 'signaling_message',
                'message_type': message_type,
                'payload': payload,
                'sender': self.channel_name,
            })

    async def signaling_message(self, event):
        # Don't echo back to sender
        if event['sender'] != self.channel_name:
            await self.send(text_data=json.dumps({
                'type': event['message_type'],
                'payload': event['payload'],
            }))

    # ── DB helpers ──────────────────────────────────────────────

    @database_sync_to_async
    def _get_session(self, code):
        return sessions_col.find_one({'code': code})

    @database_sync_to_async
    def _update_session_active(self):
        sessions_col.update_one(
            {'code': self.session_code, 'status': 'waiting'},
            {'$set': {'status': 'active', 'startedAt': datetime.utcnow()}},
        )

    @database_sync_to_async
    def _sync_participants_to_db(self):
        participants = list(_participants.get(self.session_code, {}).values())
        sessions_col.update_one(
            {'code': self.session_code},
            {'$set': {'participants': participants}},
        )

    @database_sync_to_async
    def _save_alert(self, alert_type, risk_delta, metadata):
        alerts_col.insert_one({
            'sessionCode': self.session_code,
            'participantId': self.participant_info.get('name', ''),
            'alertType': alert_type,
            'riskDelta': risk_delta,
            'metadata': metadata,
            'timestamp': datetime.utcnow(),
        })
