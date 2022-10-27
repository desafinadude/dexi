from django.db import models

from django.contrib.auth.models import User

class Reference(models.Model):
    uuid = models.UUIDField(null = True, editable=False)
    name = models.CharField(max_length = 180)
    file = models.FileField(null = True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add = True)

    def __str__(self):
        return self.name