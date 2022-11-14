from rest_framework import serializers
from django.db import models
from .models import Project, Permission, Doc, Extraction, Entity, EntityFound, Reference

class ProjectSerializer(serializers.ModelSerializer):
    extraction_count = serializers.SerializerMethodField()
    doc_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = "__all__"

    def get_extraction_count(self, project):
        extractions = Extraction.objects.filter(project=project)
        return extractions.count()
    
    def get_doc_count(self, project):
        docs = Doc.objects.filter(project=project)
        return docs.count()

class ProjectPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = "__all__"

class DocSerializer(serializers.ModelSerializer):
    extraction_count = serializers.SerializerMethodField()

    class Meta:
        model = Doc
        project = ProjectSerializer()
        fields = "__all__"
        depth: 1

    def get_extraction_count(self, doc):
        entityFound = EntityFound.objects.filter(doc=doc)
        entities = []
        for e in entityFound:
            if e.entity_id not in entities:
                entities.append(e.entity_id)

        extractions = Entity.objects.filter(id__in=entities).distinct('extraction_id')
        return extractions.count()
        

class ExtractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Extraction
        fields = "__all__"




class EntitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Entity
        # doc = DocSerializer()
        fields = "__all__"
        depth = 1
    

class EntityRawQuerySerializer(serializers.Serializer):
    id = serializers.SerializerMethodField()
    entity = serializers.SerializerMethodField()
    schema = serializers.SerializerMethodField()
    extraction = serializers.SerializerMethodField()
    entity_count = serializers.SerializerMethodField()
    doc_count = serializers.SerializerMethodField()

    def get_id(self, obj):
        return obj[0]

    def get_entity(self, obj):
        return obj[1]

    def get_schema(self, obj):
        return obj[2]

    def get_extraction(self, obj):
        return obj[3]

    def get_entity_count(self, obj):
        return obj[4]

    def get_doc_count(self, obj):
        return obj[5]




class EntityFoundSerializer(serializers.ModelSerializer):

    class Meta:
        model = EntityFound
        entity = EntitySerializer()
        fields = "__all__"
        depth = 1

        indexes = [
            models.Index(fields=['entity', 'doc']),
        ]

class EntityFoundRawQuerySerializer(serializers.Serializer):
    entity_id = serializers.SerializerMethodField()
    entity = serializers.SerializerMethodField()
    schema = serializers.SerializerMethodField()
    entity_count = serializers.SerializerMethodField()

    def get_entity_id(self, obj):
        return obj[0]

    def get_entity(self, obj):
        return obj[1]

    def get_schema(self, obj):
        return obj[2]

    def get_entity_count(self, obj):
        return obj[3]

class ReferenceSerializer(serializers.ModelSerializer):

    class Meta:
        model = Reference
        fields = "__all__"