from rest_framework import serializers

class SessionSerializer(serializers.Serializer):
    code = serializers.CharField()
    title = serializers.CharField()
    mode = serializers.CharField()
    hostId = serializers.CharField()
    participants = serializers.ListField(default=[])
    config = serializers.DictField(default={})
    status = serializers.CharField()
    startedAt = serializers.DateTimeField(allow_null=True)
    endedAt = serializers.DateTimeField(allow_null=True)
    createdAt = serializers.DateTimeField()
