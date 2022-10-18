from rest_framework import serializers
from .models import Entity
from doc.serializers import DocSerializer

class EntitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Entity
        doc = DocSerializer()
        fields = "__all__"
        depth = 2