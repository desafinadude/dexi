from django.db import models

from django.contrib.auth.models import User

class Project(models.Model):
    name = models.CharField(max_length = 180)
    description = models.TextField(null = True, blank = True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add = True)

    def __str__(self):
        return self.name

class Permission(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.project
