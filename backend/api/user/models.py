import string
import random
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    crypto_key = models.CharField(max_length=6, unique=True, blank=True, null=True)

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='customuser_set',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )

    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='customuser_set_permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    def save(self, *args, **kwargs):
        if not self.crypto_key:
            print("Crypto key is not set. Generating new key...")
            while True:
                new_key = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
                if not CustomUser.objects.filter(crypto_key=new_key).exists():
                    self.crypto_key = new_key
                    print(f"Generated crypto key: {self.crypto_key}")
                    break
        else:
            print(f"Existing crypto key: {self.crypto_key}")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username
