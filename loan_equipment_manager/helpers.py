from .models import Loan_item, Loan, User
from django.core.exceptions import ObjectDoesNotExist
from django.db.models.functions import Cast, Substr
from django.db.models import IntegerField, F
import json

def getEquipmentList():
    equipmentList = []
    username = ""

    equipment = Loan_item.objects.annotate(
    asset_number_int=Cast(
    Substr(F('asset_number'), 4),
    IntegerField(),
    ),
    ).order_by('asset_number_int')


    for eq in equipment:
        
        try:
            loan = Loan.objects.get(active_loan="Yes", loan_item_id=eq.id)
            if loan:
                
                user = User.objects.get(id=loan.end_user.id)
                username = user.first_name + " " + user.last_name
            else:
                
                username = ""
        except ObjectDoesNotExist as e:
            print(e)
        
        equipmentList.append({"asset_number":eq.asset_number, "make":eq.make, "model":eq.model, "on_loan":eq.on_loan, "notes":eq.notes, "user":username})
        username = ""
        
    eqList = json.dumps(equipmentList)
    return eqList