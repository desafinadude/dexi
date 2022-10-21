from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, authentication
from .models import Folder
from .models import Permission
from .serializers import FolderSerializer
from .serializers import FolderPermissionSerializer

class FolderListApiView(APIView):
    
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [authentication.TokenAuthentication]

    
    def get(self, request, *args, **kwargs):
        
        folders = Folder.objects.filter(user_id = request.user.id)
        serializer = FolderSerializer(folders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    
    def post(self, request, *args, **kwargs):

        if request.data.get('action') == 'new':
        
            data = {
                'name': request.data.get('name'),
                'user': request.user.id
            }

            serializer = FolderSerializer(data=data)
            
            if serializer.is_valid():
                folder = serializer.save()
                print(folder.id)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        elif request.data.get('action') == 'permissions':
            

            print('hello')

                # data = {
                #     'folder_id': request.data.get('name'),
                #     'user_id': request.user.id
                # }
                
                # serializer = FolderPermissionSerializer(data=request.data)
                
                # if serializer.is_valid():
                #     serializer.save()
                #     return Response('Done', status=status.HTTP_201_CREATED)
    
                # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            return Response({"res": "Permission"}, status=status.HTTP_200_OK)


class FolderDetailApiView(APIView):
    
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, folder_id, user_id):
        
        try:
            return Folder.objects.get(id=folder_id, user = user_id)
        except Folder.DoesNotExist:
            return None

    
    def get(self, request, folder_id, *args, **kwargs):
        
        folder_instance = self.get_object(folder_id, request.user.id)
        if not folder_instance:
            return Response(
                {"res": "Object with folder id does not exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = FolderSerializer(folder_instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    
    def put(self, request, folder_id, *args, **kwargs):
        
        folder_instance = self.get_object(folder_id, request.user.id)
        if not folder_instance:
            return Response(
                {"res": "Object with folder id does not exists"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        data = {
            'name': request.data.get('name'),
            'parent': request.data.get('parent'),
            'user': request.user.id
        }
        serializer = FolderSerializer(instance = folder_instance, data=data, partial = True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
    def delete(self, request, folder_id, *args, **kwargs):
        
        folder_instance = self.get_object(folder_id, request.user.id)
        if not folder_instance:
            return Response(
                {"res": "Object with folder id does not exists"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        folder_instance.delete()
        return Response(
            {"res": "Object deleted!"},
            status=status.HTTP_200_OK
        )