# Generated by Django 4.0.6 on 2022-09-19 11:34

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('loan_equipment_manager', '0019_alter_request_req_approved'),
    ]

    operations = [
        migrations.AddField(
            model_name='loan',
            name='end_user',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='loaner_id', to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
    ]
