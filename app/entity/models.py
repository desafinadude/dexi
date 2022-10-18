from django.db import models

from doc.models import Doc
from reference.models import Reference
from django.contrib.auth.models import User


class Entity(models.Model):
    entity = models.CharField(max_length = 180)
    schema = models.CharField(max_length = 180, null = True)
    doc = models.ForeignKey(Doc, on_delete=models.CASCADE)
    page = models.IntegerField(null = True)
    pos = models.IntegerField(null = True)
    reference = models.ForeignKey(Reference, on_delete=models.CASCADE, null = True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null = True)

    def __str__(self):
        return self.entity