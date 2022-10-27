from rest_framework import serializers
from .models import Doc
from project.serializers import ProjectSerializer
class DocSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doc
        project = ProjectSerializer()
        fields = "__all__"
        depth: 1