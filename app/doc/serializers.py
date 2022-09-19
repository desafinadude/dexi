from rest_framework import serializers
from .models import Doc
class DocSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doc
        fields = ["id", "name", "file", "type", "folder", "status", "user", "created_at"]