from django.db import models
import uuid

from django.contrib.auth.models import User
from folder.models import Folder

the_uuid = uuid.uuid4()

# The filename needs to be unique here. Use UUID
def get_file_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f'{the_uuid}.{ext}'
    return filename

class Status(models.Model):
    status = models.CharField(max_length = 180)

    def __str__(self):
        return self.status


class Doc(models.Model):
    uuid = models.UUIDField(default = the_uuid, editable=False)
    name = models.CharField(max_length = 180, null = True)
    file = models.FileField(null = True, upload_to=get_file_path)
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.ForeignKey(Status, on_delete=models.DO_NOTHING, null = True)
    type = models.CharField(max_length = 180, null = True)
    created_at = models.DateTimeField(auto_now_add = True)
    deleted_at = models.DateTimeField(null = True, blank = True)

    def __str__(self):
        return self.name

