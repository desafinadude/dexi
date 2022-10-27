from rest_framework import serializers
from .models import Entity
from .models import Extraction
from doc.serializers import DocSerializer

class EntitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Entity
        doc = DocSerializer()
        fields = "__all__"
        depth = 2

class ExtractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Extraction
        fields = "__all__"