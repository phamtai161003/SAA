# Generated by Django 4.1.13 on 2024-11-16 11:08

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('project', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Result',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('ip', models.CharField(blank=True, max_length=100, null=True)),
                ('os', models.CharField(blank=True, max_length=100, null=True)),
                ('result', models.BooleanField(default=False)),
                ('pass_num', models.IntegerField(default=0)),
                ('total_num', models.IntegerField(default=0)),
                ('is_hidden', models.BooleanField(default=False)),
                ('creator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='created_results', to=settings.AUTH_USER_MODEL)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='results', to='project.project')),
            ],
        ),
    ]