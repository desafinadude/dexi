from django.db import models
import uuid

from django.contrib.auth.models import User


# UUID Filename generator
def get_file_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f'{uuid.uuid4()}.{ext}'
    return filename


class BaseModel(models.Model):

    class Meta:
        abstract = True  
        app_label = 'dexi'    

# PROJECT

class Project(BaseModel):
    name = models.CharField(max_length = 180)
    description = models.TextField(null = True, blank = True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add = True)

    def __str__(self):
        return self.name

class Permission(BaseModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.project

# DOCUMENTS

class Doc(BaseModel):
    uuid = models.UUIDField(default = uuid.uuid4(), editable=False)
    name = models.CharField(max_length = 180, null = True)
    file = models.FileField(null = True, upload_to=get_file_path)
    project = models.ForeignKey('Project', on_delete=models.CASCADE, null = False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.IntegerField(null = False)
    type = models.CharField(max_length = 180, null = True)
    created_at = models.DateTimeField(auto_now_add = True)

    def __str__(self):
        return self.name

# ENTITIES

class Extraction(BaseModel):
    name = models.CharField(max_length = 180)
    description = models.TextField(null = True, blank = True)
    project = models.ForeignKey('Project', on_delete=models.CASCADE, null = False)
    reference = models.ForeignKey('Reference', on_delete=models.CASCADE, null = True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add = True)

    def __str__(self):
        return self.name

class Entity(BaseModel):
    entity = models.CharField(max_length = 180)
    schema = models.CharField(max_length = 180, null = True)
    extraction = models.ForeignKey(Extraction, on_delete=models.CASCADE, null = True)

    def __str__(self):
        return self.entity

class EntityFound(BaseModel):
    entity = models.ForeignKey(Entity, on_delete=models.CASCADE)
    doc = models.ForeignKey(Doc, on_delete=models.CASCADE)
    page = models.IntegerField()
    pos = models.IntegerField()



# REFERENCE

class Reference(BaseModel):
    uuid = models.UUIDField(default = uuid.uuid4(), editable=False)
    name = models.CharField(max_length = 180, null = True)
    file = models.FileField(null = True, upload_to=get_file_path)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add = True)

    def __str__(self):
        return self.name