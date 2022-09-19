from django.db import models

from doc.models import Doc
from reference.models import Reference

class Entity(models.Model):
    entity = models.CharField(max_length = 180)
    type = models.CharField(max_length = 180, null = True)
    doc = models.ForeignKey(Doc, on_delete=models.CASCADE)
    page = models.IntegerField(),
    reference = models.ForeignKey(Reference, on_delete=models.CASCADE)

    def __str__(self):
        return self.entity