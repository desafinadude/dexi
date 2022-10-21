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
from django.utils import timezone


from .tasks_ocr import doc_ocr
from .tasks_extract import doc_extract
        

class DocListApiView(APIView):
    
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [authentication.TokenAuthentication]

    def get(self, request, *args, **kwargs):
        if(kwargs.get('folder_id')):
            docs = Doc.objects.filter(folder_id=kwargs.get('folder_id'), user_id=request.user.id).order_by('id')
        else:
            docs = Doc.objects.filter(user_id = request.user.id).order_by('id')
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

            return Response('Sent to worker for conversion', status=status.HTTP_200_OK)

        
        elif request.data.get('action') == 'extract':
            
            # Extract
            field_name_list = ['id','name','file','type','folder','status','user']

            selected_docs = request.data.getlist('docs')
            docs = Doc.objects.filter(id__in=selected_docs[0].split(','))
            docs = docs.values(*field_name_list)

            for doc in docs:
                extract = doc_extract(doc['id'])
    
            return Response('Extraction Done - Maybe', status=status.HTTP_200_OK)

        elif request.data.get('action') == 'move':
                
                # Move
                field_name_list = ['id','name','file','type','folder','status','user']
    
                selected_docs = request.data.getlist('docs')
                docs = Doc.objects.filter(id__in=selected_docs[0].split(','))
                docs = docs.values(*field_name_list)
    
                for doc in docs:
                    Doc.objects.filter(id=doc['id']).update(folder=request.data.get('folder'))
    
                return Response('Moved', status=status.HTTP_200_OK)

        elif request.data.get('action') == 'delete':
                
                # Delete
                field_name_list = ['id','name','file','type','folder','status','user']
    
                selected_docs = request.data.getlist('docs')
                docs = Doc.objects.filter(id__in=selected_docs[0].split(','))
                docs = docs.values(*field_name_list)
    
                for doc in docs:
                    Doc.objects.filter(id=doc['id']).delete()
    
                return Response('Deleted', status=status.HTTP_200_OK)

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
        
        serializer = DocSerializer(doc_instance)
        return Response(serializer.data, status=status.HTTP_200_OK)


    
   