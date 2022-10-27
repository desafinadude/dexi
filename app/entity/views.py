import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, authentication
from django.contrib.auth.models import User
from django.contrib import messages
from django.views.generic import ListView
from django.views.generic.edit import FormView
from django.shortcuts import redirect
from django.db.models.functions import Lower
from django.core.paginator import Paginator
from .models import Entity
from .models import Extraction
from .serializers import EntitySerializer
from .serializers import ExtractionSerializer


class EntityListApiView(APIView):

    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [authentication.TokenAuthentication]
    
    def get(self, request, *args, **kwargs):

        
        if(kwargs.get('doc_id')):
            entities = Entity.objects.filter(doc_id=kwargs.get('doc_id')).order_by(Lower('entity'))

        elif(kwargs.get('project_id')):
            entities = Entity.objects.filter(doc__project_id=kwargs.get('project_id')).order_by(Lower('entity'))
        
        else:
            entities = Entity.objects.select_related('doc').order_by(Lower('entity'))

        # paginator = Paginator(entities, 100)
        # page_number = request.GET.get('page')
        # page_obj = paginator.get_page(page_number)

        serializer = EntitySerializer(entities, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):

        if request.data.get('action') == 'new':
        
            data = {
                'name': request.data.get('name'),
                'description': request.data.get('description'),
                'user': request.user.id
            }

            serializer = ExtractionSerializer(data=data)
            
            if serializer.is_valid():
                extraction = serializer.save()

                return Response(serializer.data, status=status.HTTP_201_CREATED)

        else:

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

