from rest_framework import serializers
from .models import Doc
from folder.serializers import FolderSerializer
class DocSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doc
        folder = FolderSerializer()
        fields = "__all__"
        depth: 1