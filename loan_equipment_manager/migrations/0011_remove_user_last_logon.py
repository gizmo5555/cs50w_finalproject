# Generated by Django 4.0.6 on 2022-07-23 13:04

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('loan_equipment_manager', '0010_user_standard'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='last_logon',
        ),
    ]
