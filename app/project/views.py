from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, authentication
from .models import Project
from .models import Permission
from .serializers import ProjectSerializer
from .serializers import ProjectPermissionSerializer

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
                print(project.id)
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