from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    cmd = models.TextField(blank=True, null=True)
    expect_output = models.TextField(blank=True, null=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, related_name='children', blank=True, null=True)

    def get_root(self):
        # Traverse up the parent chain to find the root category
        category = self
        while category.parent is not None:
            category = category.parent
        return category
    def get_descendants(self, include_self=True):
        """
        Lấy tất cả các con (children) và con cháu (descendants) của category này.
        """
        descendants = []
        if include_self:
            descendants.append(self)
        for child in self.children.all():
            descendants.extend(child.get_descendants(include_self=True))
        return descendants
    def __str__(self):
        return self.name
    

class Task(models.Model):
    category = models.ForeignKey(Category, related_name='tasks', on_delete=models.CASCADE)
    combine = models.CharField(max_length=3, choices=[('AND', 'And'), ('OR', 'Or')])
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    scored = models.BooleanField(default=False)
    remediation = models.TextField(blank=True, null=True)
    note = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Command(models.Model):
    task = models.ForeignKey(Task, related_name='commands', on_delete=models.CASCADE)
    operator = models.CharField(max_length=255, choices=[
        ('Equal', 'Equal'),
        ('Contain', 'Contain'),
        ('Not contain', 'Notcontain'),
        ('Includeoneof', 'Include one of'),
        ('Allin', 'All in'),
        ('Notequal', 'Not equal'),
        ('Permissionlowerorequal', 'Permission lower or equal'),
        ('Regex', 'Regex'),
        ('Greater Than', 'GreaterThan'),
        ('GreaterThanOrEqual', 'Greater Than Or Equal'),
        ('LessThan', 'Less Than'),
        ('LessThanOrEqual', 'Less Than Or Equal'),
        ('Between', 'Between'),
    ])
    cmd = models.TextField()
    expect = models.TextField()
    parser = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.cmd
