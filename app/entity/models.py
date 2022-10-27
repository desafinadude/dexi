from django.db import models

from doc.models import Doc
from reference.models import Reference
from django.contrib.auth.models import User


class Extraction(models.Model):
    name = models.CharField(max_length = 180)
    description = models.TextField(null = True, blank = True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add = True)

    def __str__(self):
        return self.name

class Entity(models.Model):
    entity = models.CharField(max_length = 180)
    schema = models.CharField(max_length = 180, null = True)
    doc = models.ForeignKey(Doc, on_delete=models.CASCADE)
    reference = models.ForeignKey(Reference, on_delete=models.CASCADE, null = True)
    extraction = models.ForeignKey(Extraction, on_delete=models.CASCADE, null = True)

    def __str__(self):
        return self.entity

class EntityFound(models.Model):
    entity = models.ForeignKey(Entity, on_delete=models.CASCADE)
    page = models.IntegerField()
    pos = models.IntegerField()