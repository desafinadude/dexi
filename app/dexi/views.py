import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, authentication
from django.contrib.auth.models import User
from django.contrib import messages
from django.views.generic import ListView
from django.views.generic.edit import FormView
from django.shortcuts import redirect
from django.core import serializers
from django.utils import timezone
from django.db.models.functions import Lower
from django.core.paginator import Paginator
from django.db.models import Count, OuterRef, Subquery, Q
from django.db import connection

from .models import Project, Doc, Extraction, Entity, EntityFound, Reference
from .serializers import ProjectSerializer, ProjectPermissionSerializer, DocSerializer, DocRawQuerySerializer, ExtractionSerializer, EntitySerializer, EntityRawQuerySerializer, EntityFoundSerializer, EntityFoundRawQuerySerializer, ReferenceSerializer

from .tasks_ocr import doc_ocr
from .tasks_extract_nlp import doc_extract_nlp
from .tasks_extract_reference import doc_extract_reference
from .tasks_extract_quick import url_extract_quick
        
# DOCS

class DocListApiView(APIView):
    
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [authentication.TokenAuthentication]

    def get(self, request, *args, **kwargs):

        


        cursor = connection.cursor()
        cursor.execute('select q3.did, q3.name, q3.type, q3.status, q3.created_at, q3.project_id, count(distinct q3.extraction_id) as extraction_count from (select q1.did, q1.name, q1.type, q1.status, q1.created_at, q1.project_id, de.extraction_id from (select dd.id as did, dd.name, dd.type, dd.status, dd.project_id, dd.created_at, def.entity_id from dexi_doc as dd left join dexi_entityfound as def ON def.doc_id = dd.id where dd.project_id = %s) as q1 left join dexi_entity as de on de.id = q1.entity_id group by de.extraction_id, q1.did, q1.name, q1.type, q1.status, q1.created_at, q1.project_id) as q3 group by q3.did, q3.name, q3.type, q3.status, q3.created_at, q3.project_id',  [kwargs['project_id']])
        res = cursor.fetchall()
        serializer = DocRawQuerySerializer(res, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, *args, **kwargs):

        if request.data.get('action') == 'upload':

            files = request.data.getlist('file')
            
            for file in files:
                serializer = DocSerializer(data={ 
                    'file': file,
                    'name': file.name,
                    'type': file.content_type if file.content_type else None,
                    'project': kwargs.get('project_id'), 
                    'status': 1, 
                    'user': request.user.id
                })
                if serializer.is_valid():
                    serializer.save()
                else:
                    # What if one file bombs? 
                    # continue ?
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                    
            return Response('Done', status=status.HTTP_201_CREATED)
        
        elif request.data.get('action') == 'convert':

            # Convert
            field_name_list = ['id','name','file','type','project','status','user']

            selected_docs = request.data.getlist('docs')
            docs = Doc.objects.filter(id__in=selected_docs[0].split(','))
            docs = docs.values(*field_name_list)
            
            for doc in docs:
                ocr = doc_ocr(doc['id'])

            return Response('Sent to worker for conversion', status=status.HTTP_200_OK)

        elif request.data.get('action') == 'new':

            print(request.data)

            data = {
                'name': request.data.get('name'),
                'description': request.data.get('description'),
                'project': kwargs.get('project_id'),
                'reference': request.data.get('extractor') if request.data.get('extractor') != 'nlp' else None,
                'user': request.user.id
            }

            serializer = ExtractionSerializer(data=data)
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


        elif request.data.get('action') == 'extract':
            

            # Extract
            field_name_list = ['id','name','file','type','project','status','user']

            selected_docs = request.data.getlist('docs')
            extraction_id = request.data.get('extraction_id')
            docs = Doc.objects.filter(id__in=selected_docs[0].split(','))
            docs = docs.values(*field_name_list)

            for doc in docs:
                if(request.data.get('extractor') == 'nlp'):
                    extract = doc_extract_nlp(doc['id'], extraction_id, doc['type'])
                else:
                    extract = doc_extract_reference(doc['id'], extraction_id, doc['type'])
    
            return Response('Extraction Done - Maybe', status=status.HTTP_200_OK)

        elif request.data.get('action') == 'move':
                
            # Move
            field_name_list = ['id','name','file','type','project','status','user']

            selected_docs = request.data.getlist('docs')
            docs = Doc.objects.filter(id__in=selected_docs[0].split(','))
            docs = docs.values(*field_name_list)

            for doc in docs:
                Doc.objects.filter(id=doc['id']).update(project=request.data.get('project'))

            return Response('Moved', status=status.HTTP_200_OK)

        elif request.data.get('action') == 'delete':
                
            # Delete
            field_name_list = ['id','name','file','type','project','status','user']

            selected_docs = request.data.getlist('docs')
            docs = Doc.objects.filter(id__in=selected_docs[0].split(','))
            docs = docs.values(*field_name_list)

            for doc in docs:
                Doc.objects.filter(id=doc['id']).delete()

            return Response('Deleted', status=status.HTTP_200_OK)

        else:
            # No Action
            return Response('Invalid Action', status=status.HTTP_400_BAD_REQUEST)

class ExtractionListApiView(APIView):
    
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [authentication.TokenAuthentication]

    def get(self, request, *args, **kwargs):
        
        if 'doc_id' in kwargs:
            entitiesFound = EntityFound.objects.filter(doc=kwargs.get('doc_id'))
            entities = Entity.objects.filter(id__in=entitiesFound.values('entity_id'))
            extraction = Extraction.objects.filter(id__in=entities.values('extraction_id'))

            serializer = ExtractionSerializer(extraction, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        else:
            extraction = Extraction.objects.filter(project_id=kwargs.get('project_id'), user_id=request.user.id).order_by('id')
            serializer = ExtractionSerializer(extraction, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

class ExtractionDetailApiView(APIView):

    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [authentication.TokenAuthentication]

    def get(self, request, *args, **kwargs):
        extraction = Extraction.objects.get(id=kwargs.get('extraction_id'))
        serializer = ExtractionSerializer(extraction)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        extraction = Extraction.objects.get(id=kwargs.get('extraction_id'))
        extraction.delete()
        return Response('Deleted', status=status.HTTP_200_OK)


class EntityListApiView(APIView):
        
        permission_classes = [permissions.IsAuthenticated]
        authentication_classes = [authentication.TokenAuthentication]
    
        def get(self, request, *args, **kwargs):

            cursor = connection.cursor()
            cursor.execute('select dexi_entity.*, (select count(*) from dexi_entityfound where entity_id = dexi_entity.id) as entity_count, (select count(distinct doc_id) from dexi_entityfound where entity_id = dexi_entity.id) as doc_count from dexi_entity where extraction_id = %s', [kwargs.get('extraction_id')])
            res = cursor.fetchall()
            serializer = EntityRawQuerySerializer(res, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        def post(self, request, *args, **kwargs):
            if request.data.get('action') == 'delete':

                # Delete
                selected_entities = request.data.getlist('entities')

                entities = Entity.objects.filter(id__in=selected_entities[0].split(','))
    
                for entity in entities:
                    Entity.objects.filter(id=entity.id).delete()
    
                return Response('Deleted', status=status.HTTP_200_OK)

class EntityFoundListApiView(APIView):
        
        permission_classes = [permissions.IsAuthenticated]
        authentication_classes = [authentication.TokenAuthentication]
    
        def get(self, request, *args, **kwargs):

            if (kwargs.get('entity_id') != None):
                entitiesFound = EntityFound.objects.filter(entity=kwargs.get('entity_id')).order_by('id')
                serializer = EntityFoundSerializer(entitiesFound, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:

                cursor = connection.cursor()
                cursor.execute('select entity_id, dexi_entity.entity, dexi_entity.schema, dexi_entity.extraction_id, count(*) as entity_count from dexi_entityfound inner join dexi_entity on dexi_entityfound.entity_id = dexi_entity.id where doc_id = %s group by entity_id, dexi_entity.entity, dexi_entity.schema, dexi_entity.extraction_id', [kwargs.get('doc_id')])
                res = cursor.fetchall()
                serializer = EntityFoundRawQuerySerializer(res, many=True)

                return Response(serializer.data, status=status.HTTP_200_OK)
            

class DocDetailApiView(APIView):
    
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, doc_id, user_id):
       
        try:
            return Doc.objects.get(id=doc_id, user = user_id)
        except Doc.DoesNotExist:
            return None

    
    def get(self, request, doc_id, *args, **kwargs):
        
        doc_instance = self.get_object(doc_id, request.user.id)
        
        serializer = DocSerializer(doc_instance)
        return Response(serializer.data, status=status.HTTP_200_OK)


# PROJECT

class ProjectListApiView(APIView):
    
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [authentication.TokenAuthentication]

    
    def get(self, request, *args, **kwargs):
        
        projects = Project.objects.filter(user_id = request.user.id)
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    
    def post(self, request, *args, **kwargs):

        if request.data.get('action') == 'new':
        
            data = {
                'name': request.data.get('name'),
                'description': request.data.get('description'),
                'user': request.user.id
            }

            serializer = ProjectSerializer(data=data)
            
            if serializer.is_valid():
                project = serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        elif request.data.get('action') == 'permissions':

            print('Permissions')

            return Response({"res": "Permission"}, status=status.HTTP_200_OK)


class ProjectDetailApiView(APIView):
    
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, project_id, user_id):
        
        try:
            return Project.objects.get(id=project_id, user = user_id)
        except Project.DoesNotExist:
            return None

    
    def get(self, request, project_id, *args, **kwargs):
        
        project_instance = self.get_object(project_id, request.user.id)
        if not project_instance:
            return Response(
                {"res": "Project with id does not exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = ProjectSerializer(project_instance)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, project_id, *args, **kwargs):
        
        print('Project PUT')

        return Response({"res": "Project PUT"}, status=status.HTTP_200_OK)

    
    def delete(self, request, project_id, *args, **kwargs):
        
        project_instance = self.get_object(project_id, request.user.id)
        if not project_instance:
            return Response(
                {"res": "Project with id does not exists"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        project_instance.delete()
        return Response({"res": "Project deleted!"}, status=status.HTTP_200_OK)



#  References

class ReferenceListApiView(APIView):
    
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [authentication.TokenAuthentication]

    
    def get(self, request, *args, **kwargs):
        
        references = Reference.objects.filter(user_id = request.user.id)
        serializer = ReferenceSerializer(references, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    
    def post(self, request, *args, **kwargs):

        if request.data.get('action') == 'upload':

            files = request.data.getlist('file')
            
            for file in files:
                serializer = ReferenceSerializer(data={ 
                    'file': file,
                    'name': file.name,
                    'type': file.content_type if file.content_type else None,
                    'user': request.user.id
                })
                if serializer.is_valid():
                    serializer.save()
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                    
            return Response('Done', status=status.HTTP_201_CREATED)

        elif request.data.get('action') == 'delete':
                
            # Delete

            selected_references = request.data.getlist('references')
            references = Reference.objects.filter(id__in=selected_references[0].split(','))
            

            for reference in references:
                Reference.objects.filter(id=reference.id).delete()

            return Response('Deleted', status=status.HTTP_200_OK)

class QuickExtractApiView(APIView):
    
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [authentication.TokenAuthentication]

    def post(self, request, *args, **kwargs):

        extract = url_extract_quick(request.data.get('url'))

        return Response(extract, status=status.HTTP_200_OK)