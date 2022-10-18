import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, authentication
from django.contrib.auth.models import User
from django.contrib import messages
from django.views.generic import ListView
from django.views.generic.edit import FormView
from django.shortcuts import redirect
from .models import Entity
from .serializers import EntitySerializer


class EntityListApiView(APIView):
    # add permission to check if user is authenticated
    # permission_classes = [permissions.IsAuthenticated]
    # authentication_classes = [authentication.TokenAuthentication]
    
    def get(self, request, *args, **kwargs):
        
        if(kwargs.get('doc_id')):
            entities = Entity.objects.filter(doc_id=kwargs.get('doc_id')).order_by('id')
        else:
            entities = Entity.objects.select_related('doc').order_by('entity')

        serializer = EntitySerializer(entities, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):

        return