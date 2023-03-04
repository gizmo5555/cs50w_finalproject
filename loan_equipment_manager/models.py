from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class User(AbstractUser):
    sd_admin = models.BooleanField(default=False, null=True)
    standard = models.BooleanField(default=False, null=True)
    def __str__(self):
        return f"{self.username}"

class Loan_item(models.Model):
    CATEGORY = (
        ('...', '...'),
        ('Audio', 'Audio'),
        ('Laptops', 'Laptops'),
        ('Mobile devices', 'Mobile devices'),
        ('Pheripherals', 'Pheripherals')        
    )
    asset_number = models.CharField(max_length=128, )
    make = models.CharField(max_length=128, null=False)
    model = models.CharField(max_length=128, null=False)
    category = models.CharField(max_length=128, null=False, choices=CATEGORY)
    on_loan = models.CharField(max_length=3, null=False)
    qr_code = models.CharField(max_length=128, null=True)
    notes = models.CharField(max_length=256, null=False, default="Note")

class Request(models.Model):
    req_number = models.CharField(max_length=128, null=False)
    end_user = models.ForeignKey(User, related_name="requestor_id", on_delete=models.CASCADE)
    req_item = models.ForeignKey(Loan_item, related_name="item_id", on_delete=models.CASCADE)
    req_start_date = models.CharField(max_length=128, null=True)
    req_end_date = models.CharField(max_length=128, null=True)
    req_approved = models.CharField(max_length=3, null=False, default="Pending")

class Loan(models.Model):
    loan_number = models.CharField(max_length=128, null=False)
    end_user = models.ForeignKey(User, related_name="loaner_id", on_delete=models.CASCADE)
    loan_item = models.ForeignKey(Loan_item, related_name="ln_item_id", on_delete=models.CASCADE)
    items_count = models.CharField(max_length=128, null=False)
    active_loan = models.CharField(max_length=3, null=False, default="Yes")
    req_number = models.ForeignKey(Request, related_name="request_id", on_delete=models.DO_NOTHING)

