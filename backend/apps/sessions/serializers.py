from rest_framework import serializers


class SessionSerializer(serializers.Serializer):
    code = serializers.CharField()
    title = serializers.CharField()
    mode = serializers.CharField()
    hostId = serializers.CharField()
    participants = serializers.ListField(default=[])
    config = serializers.DictField(default={})
    status = serializers.CharField()
    startedAt = serializers.SerializerMethodField()
    endedAt = serializers.SerializerMethodField()
    createdAt = serializers.SerializerMethodField()

    def get_startedAt(self, obj):
        v = obj.get('startedAt')
        return v.isoformat() if v else None

    def get_endedAt(self, obj):
        v = obj.get('endedAt')
        return v.isoformat() if v else None

    def get_createdAt(self, obj):
        v = obj.get('createdAt')
        return v.isoformat() if v else None
