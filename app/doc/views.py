import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, authentication
from django.contrib.auth.models import User
from django.contrib import messages
from django.views.generic import ListView
from django.views.generic.edit import FormView
from django.shortcuts import redirect
from .models import Doc
from .serializers import DocSerializer
from django.core import serializers


from .tasks_ocr import doc_ocr
from .tasks_extract import doc_extract
        

class DocListApiView(APIView):
    # add permission to check if user is authenticated
    # permission_classes = [permissions.IsAuthenticated]
    # authentication_classes = [authentication.TokenAuthentication]

    
    def get(self, request, *args, **kwargs):
       
        docs = Doc.objects.filter(user_id = request.user.id)
        serializer = DocSerializer(docs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    
    def post(self, request, *args, **kwargs):

        if request.data.get('action') == 'upload':

            files = request.data.getlist('file')
            
            for file in files:
                serializer = DocSerializer(data={ 
                    'file': file,
                    'name': file.name,
                    'type': file.content_type if file.content_type else None,
                    'folder': request.data.get('folder'), 
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
            field_name_list = ['id','name','file','type','folder','status','user']

            selected_docs = request.data.getlist('docs')
            docs = Doc.objects.filter(id__in=selected_docs[0].split(','))
            docs = docs.values(*field_name_list)
            
            for doc in docs:
                ocr = doc_ocr(doc['id'])

            return Response('Conversion Done - Maybe', status=status.HTTP_200_OK)

        
        elif request.data.get('action') == 'extract':
            
            # Extract
            field_name_list = ['id','name','file','type','folder','status','user']

            selected_docs = request.data.getlist('docs')
            docs = Doc.objects.filter(id__in=selected_docs[0].split(','))
            docs = docs.values(*field_name_list)
            
            for doc in docs:
                extract = doc_extract(doc['id'])

            return Response('Extraction Done - Maybe', status=status.HTTP_200_OK)

        else:
            # No Action
            return Response('Invalid Action', status=status.HTTP_400_BAD_REQUEST)
            

class DocDetailApiView(APIView):
    
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, doc_id, user_id):
       
        try:
            return Doc.objects.get(id=doc_id, user = user_id)
        except Doc.DoesNotExist:
            return None

    
    def get(self, request, doc_id, *args, **kwargs):
        
        doc_instance = self.get_object(doc_id, request.user.id)
        if not doc_instance:
            return Response(
                {"res": "Object with doc id does not exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = DocSerializer(doc_instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    
    def put(self, request, doc_id, *args, **kwargs):
        
        doc_instance = self.get_object(doc_id, request.user.id)
        if not doc_instance:
            return Response(
                {"res": "Object with doc id does not exists"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        data = {
            'name': request.data.get('name'),
            'file': request.data.get('file'),
            'folder': request.data.get('folder'),  
            'user': request.user.id
        }
        serializer = DocSerializer(instance = doc_instance, data=data, partial = True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
    def delete(self, request, doc_id, *args, **kwargs):
        
        doc_instance = self.get_object(doc_id, request.user.id)
        if not doc_instance:
            return Response(
                {"res": "Object with doc id does not exists"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        doc_instance.delete()
        return Response(
            {"res": "Object deleted!"},
            status=status.HTTP_200_OK
        )