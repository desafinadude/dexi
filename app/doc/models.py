from django.db import models
import uuid

from django.contrib.auth.models import User
from project.models import Project

# The filename needs to be unique here. Use UUID
def get_file_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f'{uuid.uuid4()}.{ext}'
    return filename

class Doc(models.Model):
    uuid = models.UUIDField(default = uuid.uuid4(), editable=False)
    name = models.CharField(max_length = 180, null = True)
    file = models.FileField(null = True, upload_to=get_file_path)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null = False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.IntegerField(null = False)
    type = models.CharField(max_length = 180, null = True)
    created_at = models.DateTimeField(auto_now_add = True)

    def __str__(self):
        return self.name

