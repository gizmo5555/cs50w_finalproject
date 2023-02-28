# Generated by Django 4.0.6 on 2022-07-24 09:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('loan_equipment_manager', '0011_remove_user_last_logon'),
    ]

    operations = [
        migrations.AlterField(
            model_name='loan_item',
            name='category',
            field=models.CharField(choices=[('...', '...'), ('Pheripherals', 'Pheripherals'), ('Laptops', 'Laptops'), ('Audio', 'Audio'), ('Mobile devices', 'Mobile devices')], max_length=128),
        ),
        migrations.AlterField(
            model_name='loan_item',
            name='loan_end_date',
            field=models.CharField(max_length=128, null=True),
        ),
        migrations.AlterField(
            model_name='loan_item',
            name='loan_start_date',
            field=models.CharField(max_length=128, null=True),
        ),
    ]
