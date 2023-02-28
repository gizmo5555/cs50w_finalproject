from django.contrib import admin
from .models import *
from django.contrib.auth.admin import UserAdmin

# Register your models here.

class UserAdmin(UserAdmin):
    list_display = ("id", "username", "first_name","last_name","email","is_staff", "sd_admin", "standard",  "is_active","date_joined","last_login")

class LoanItemAdmin(admin.ModelAdmin):
    list_display = ("id", "asset_number", "make", "model", "category",  "on_loan", "qr_code")

class LoanAdmin(admin.ModelAdmin):
    list_display = ("id", "loan_number","items_count", "active_loan")

admin.site.register(User, UserAdmin)
admin.site.register(Loan_item, LoanItemAdmin)
admin.site.register(Loan, LoanAdmin)
