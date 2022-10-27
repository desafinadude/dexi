from rest_framework import serializers
from .models import Project
from .models import Permission
class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"

class ProjectPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = "__all__"