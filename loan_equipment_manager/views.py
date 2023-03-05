from tracemalloc import start
from django.contrib.auth import authenticate, login, logout
from django.db import Error, IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import Group
from django.contrib.auth.decorators import user_passes_test
from datetime import datetime
from .models import User, Loan, Loan_item, Request
from .decorators import allowed_users, restricted_view
from django.http import Http404, JsonResponse
import logging
import json
from datetime import datetime
from django.contrib import auth
from django.db.models.functions import Cast, Substr
from django.db.models import IntegerField, F
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.hashers import check_password
from django.shortcuts import redirect

from .helpers import getEquipmentList


def index(request):    
    if request.user.is_authenticated:
        reqs = Request.objects.filter(end_user_id = request.user, req_approved="Yes")
        today = datetime.today().strftime('%Y-%m-%d')
        overDueCount = 0
        for req in reqs:
            if today > req.req_end_date:
                overDueCount += 1

        return render(request, "loan_equipment_manager/index.html", {
        'loansUser':Loan.objects.filter(end_user_id = request.user.id, active_loan="Yes").count(),
        'overdueUser':overDueCount,
        'totalStock': Loan_item.objects.count()
        })
    else:
        return render(request, "loan_equipment_manager/index.html")

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = auth.authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "loan_equipment_manager/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "loan_equipment_manager/login.html")

@login_required
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

@login_required
def my_account(request):
    return render(request, "loan_equipment_manager/my_account.html", {
            "user":User.objects.get(id=request.user.id)
            })

@login_required
def change_password(request):

    if request.method == "POST":
        if not request.user.is_authenticated:
        # Return to index if unathenticated user tries to change password
            return render(request, 'index.html')
        else:
        # Attempt to update details
            username = request.POST["username"]
            email = request.POST["email"]
            first_name = request.POST["fname"]
            last_name = request.POST["lname"]

            current_pass = request.POST["curPassword"]
            password = request.POST["newPassword"]
            confirmation = request.POST["confirmation"]

            if not current_pass and not password and not confirmation:
                try:
                    user = User.objects.get(id=request.user.id)
                    user.first_name = first_name
                    user.last_name = last_name
                    user.email = email
                    user.username = username
                    user.save()
                    login(request, user)
                    return redirect(reverse("my_account") + "?success=1&msg=Account+updated+succesfully.")
                except IntegrityError:
                    return redirect(reverse("my_account") + "?message=1&msg=Username+already+taken.")

            elif current_pass and password and confirmation:
                # Check if the plain text password matches the user's current password
                if check_password(current_pass, request.user.password):
                # Do something if the passwords match
                    if password != confirmation:
                        return redirect(reverse("my_account") + "?message=1&msg=Passwords+must+match.")

                    try:
                        user = User.objects.get(id=request.user.id)
                        user.first_name = first_name
                        user.last_name = last_name
                        user.email = email
                        user.username = username
                        user.set_password(password)
                        user.save()
                        login(request, user)
                        return redirect(reverse("my_account") + "?success=1&msg=Account+updated+succesfully.")
                    except IntegrityError:
                        return redirect(reverse("my_account") + "?message=1&msg=Username+already+taken.")
                else:
                # Do something else if the passwords don't match
                    return redirect(reverse("my_account") + "?message=1&msg=Incorrect+current+password.+Try+Again.")
            else:
                if not current_pass:
                    return redirect(reverse("my_account") + "?message=1&msg=Current+password+cannot+be+empty")
                elif not password:
                    return redirect(reverse("my_account") + "?message=1&msg=New+password+cannot+be+empty")
                else:
                    return redirect(reverse("my_account") + "?message=1&msg=Password+confirmation+cannot+be+empty")
            
    else:
        return render(request, "loan_equipment_manager/my_account.html")

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        first_name = request.POST["fname"]
        last_name = request.POST["lname"]
        standard = True

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "loan_equipment_manager/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username = username, password = password, email = email)
            user.first_name = first_name
            user.last_name = last_name
            user.email = email
            user.standard = True
            user.save()
            group = Group.objects.get(name='standard')
            user.groups.add(group)

        except IntegrityError:
            return render(request, "loan_equipment_manager/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        if not request.user.is_authenticated:
            return render(request, "loan_equipment_manager/register.html")
        else:
            return render(request, "loan_equipment_manager/index.html")

@login_required
@restricted_view
def manage_equipment(request):
    """
    This view returns all items in Loan_item model
    which is used to populate items table in manage_equipment template

    Args:
        request: The HTTP request.

    Returns:
        Json or render
    
    """
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':

        eqList = getEquipmentList()
        return JsonResponse(eqList, safe=False)
    
    else:
        equipment = Loan_item.objects.annotate(
        asset_number_int=Cast(
        Substr(F('asset_number'), 4),
        IntegerField(),
        ),
        ).order_by('asset_number_int')
        
        return render(request, "loan_equipment_manager/manage_equipment.html", {
            #"equipment": Loan_item.objects.all().order_by(F('asset_number').asc()),
            "equipment": equipment,
            "loan":Loan.objects.filter(active_loan="Yes"),
            "users":User.objects.all()
        })

@login_required
@restricted_view
def manage_users(request):
    return render(request, "loan_equipment_manager/manage_users.html", {
        "users": User.objects.all()
    })

@login_required
def my_loans(request):
    """
    This view returns all loans for current user
    which is used to populate active loans and closed loans tables in my_loans template

    Args:
        request: The HTTP request.

    Returns:
        render
    
    """
    loanObj = []
    userLoans = []
    userClosedLoans = []
    loans = Loan.objects.filter(end_user_id = request.user.id)

    if loans:
        for loan in loans:
            req = Request.objects.get(req_approved="Approved", end_user_id=request.user.id, id=loan.req_number_id)
            start_date = req.req_start_date
            end_date = req.req_end_date
            item = Loan_item.objects.get(id=req.req_item_id)
            make = item.make
            model = item.model
            status = ""
            if loan.active_loan == "Yes":
                status = "Active"
                loanObj = {"status": status, "start_date":start_date, "end_date":end_date, "make":make, "model":model}
                userLoans.append(loanObj)
            else:
                status = "Ended"
                loanObj = {"status": status, "start_date":start_date, "end_date":end_date, "make":make, "model":model}
                userClosedLoans.append(loanObj)

    return render(request, "loan_equipment_manager/my_loans.html", {
        "loans": userLoans, 
        "userClosedLoans": userClosedLoans
    })

@login_required
def my_requests(request):
    """
    This view returns all requests for current user
    which is used to populate my requests table in my_requests template

    Args:
        request: The HTTP request.

    Returns:
        render
    
    """
    reqPending = Request.objects.filter(end_user_id = request.user.id)
    userReqs = []
    loanPenObj = []

    if reqPending:
        for req in reqPending:
            loanItm = Loan_item.objects.get(id = req.req_item_id)
            make = loanItm.make
            model = loanItm.model
            start_date = req.req_start_date
            end_date = req.req_end_date
            loanPenObj = {"status": req.req_approved, "start_date":start_date, "end_date":end_date, "make":make, "model":model}
            userReqs.append(loanPenObj)

    return render(request, "loan_equipment_manager/my_requests.html", {
        'requests' : userReqs
    })

@login_required
def loan_request(request):
    """
    Renders loan_requst template which contains a request form

    Args:
        request: The HTTP request.

    Returns:
        render
    
    """
    return render(request, "loan_equipment_manager/loan_request.html")

@login_required
def create_request(request):
    """
    This view creates a new request for current user based on form data send via Ajax call to this view

    Args:
        request: The HTTP request.

    Returns:
        JsonResponse
    
    """
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        item = request.POST.get('item_id')
        loanItem = Loan_item.objects.get(id=item)
        if loanItem.on_loan == "Pending":
            return JsonResponse({'created':"requested"})
        else:
            start_date = request.POST.get('start_date')
            end_date = request.POST.get('end_date')
            print(start_date, end_date)
            if start_date > end_date:
                return JsonResponse({'created':"dates"})
            user_id = request.user.id
            last_item = Request.objects.all().last()
            conv_num = ""
            if(not last_item):
                conv_num = "REQ1"
            else:
                loan_number_full = last_item.req_number
                loan_num = loan_number_full.split("REQ",1)[1]
                conv_num = int(loan_num)
                conv_num += 1
                conv_num = "REQ" + str(conv_num)        

            Request.objects.create(req_number = conv_num, end_user_id = user_id, req_item_id = item, req_start_date = start_date, req_end_date = end_date)
            Loan_item.objects.filter(id=item).update(on_loan = "Pending")
            return JsonResponse({'created':True})
    return JsonResponse({'created':False})

@login_required
@restricted_view
def accept_request(request, id):
    """
    This view set current request as Accepted and returns updated requests data to the Ajax call.
    Function that calls this view populates the request table with updated data.

    Args:
        request: The HTTP request.
        id: unique number for current request
    Returns:
        JsonResponse
    
    """
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':

        itemId = request.GET.get('item_id')
        last_item = Loan.objects.all().last()
        conv_num = ""
        requestsList = []
        if(not last_item):
            conv_num = "LN1"
        else:
            loan_number_full = last_item.loan_number
            loan_num = loan_number_full.split("LN",1)[1]
            conv_num = int(loan_num)
            conv_num += 1
            conv_num = "LN" + str(conv_num)    
        
        Request.objects.filter(id=id).update(req_approved = "Approved")
        uid = Request.objects.get(id=id)
        Loan_item.objects.filter(id=uid.req_item.id).update(on_loan="Yes")

        Loan.objects.create(loan_number = conv_num, items_count = 1, active_loan = "Yes", req_number_id = id, end_user_id = uid.end_user.id, loan_item_id =  uid.req_item.id)       
        
        reqs = Request.objects.filter(req_approved = "Pending").all()
        for req in reqs:
            item = Loan_item.objects.get(id=uid.req_item_id)
            user = User.objects.get(id=uid.end_user_id)
            requestsList.append({"req_id":uid.id, "req_num":uid.req_number, "item_id":uid.req_item_id, "make":item.make, "model":item.model, "start_date":uid.req_start_date, "end_date":uid.req_end_date, "username":user.first_name + " " + user.last_name})
        
        return JsonResponse({'approved':True, 'requests':requestsList})
    return JsonResponse({'approved':False})

@login_required
@restricted_view
def reject_request(request, id):
    """
    This view set current request as Rejected and returns updated requests data to the Ajax call.
    Function that calls this view populates the request table with updated data.

    Args:
        request: The HTTP request.
        id: unique number for current request
    Returns:
        JsonResponse
    
    """
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':

        itemId = request.GET.get('item_id') 
        requestsList = []   

        Request.objects.filter(id=id).update(req_approved = "Rejected")

        reqObj = Request.objects.get(id=id)
        
        Loan_item.objects.filter(id=reqObj.req_item_id).update(on_loan="No")

        reqs = Request.objects.filter(req_approved = "Pending").all()
        for req in reqs:
            item = Loan_item.objects.get(id=req.req_item_id)
            user = User.objects.get(id=req.end_user_id)
            requestsList.append({"req_id":req.id, "req_num":req.req_number, "item_id":req.req_item_id, "make":item.make, "model":item.model, "start_date":req.req_start_date, "end_date":req.req_end_date, "username":user.first_name + " " + user.last_name})

        return JsonResponse({'rejected':True,'requests':requestsList})
    return JsonResponse({'approved':False})

@login_required
def loan_categories(request):
    """
    Returns a list of categories from Loan_item model.
    Used to populate category select element on request form and add loan item form.

    Args:
        request: The HTTP request.
    Returns:
        JsonResponse
    
    """
    cat_list = list(Loan_item.CATEGORY)

    return JsonResponse({'data': cat_list})
    
@login_required
def loan_items(request, *args, **kwargs):
    """
    Returns all loan items that are not on loan or pending, and which belong to specified category.
    Called by Ajax.

    Args:
        request: The HTTP request.
        kwargs: selected category
    Returns:
        JsonResponse
    
    """
    selected_cat = kwargs.get('cat')
    item_list = list(Loan_item.objects.filter(category=selected_cat, on_loan="No").values().exclude(on_loan="Pending").order_by("make"))

    return JsonResponse({'data': item_list})

@login_required
@restricted_view
def manage_item(request, id):
    item = Loan_item.objects.filter(id=id)
    return render(request, "loan_equipment_manager/manage_item.html", {
        "item": item
    })


@login_required
@restricted_view
def edit_item(request):
    """
    Updates current item with new details specified in edit_item form

    Args:
        request: The HTTP request.
    Returns:
        Render
    
    """
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        assetNum = request.POST.get('asset_num_new')
        assetNumOld = request.POST.get('asset_num_old')
        make = request.POST.get('make')
        model = request.POST.get('model')
        notes = request.POST.get('notes')
        currentLoanItem = Loan_item.objects.get(asset_number = assetNumOld)

        if assetNum == assetNumOld:
            currentLoanItem.asset_number = assetNum
            currentLoanItem.make = make
            currentLoanItem.model = model
            currentLoanItem.notes = notes
            currentLoanItem.save()
            
            return render(request, "loan_equipment_manager/manage_equipment.html", {
            })

        else:
            try:
                loanItem = Loan_item.objects.get(asset_number = assetNum)
            except:
                loanItem = None

            if loanItem:
                return JsonResponse({'exists' : True})
            else:
                currentLoanItem.asset_number = assetNum
                currentLoanItem.make = make
                currentLoanItem.model = model
                currentLoanItem.notes = notescreate_loan
                currentLoanItem.save()

                return render(request, "loan_equipment_manager/manage_equipment.html", {
                })
    else:
        return render(request, "loan_equipment_manager/index.html", {
    })

@login_required
@restricted_view
def create_loan_item(request):
    """
    Creates a new loan item based on values specified in request_form

    Args:
        request: The HTTP request.

    Returns:
        JsonResponse
    
    """
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        make = request.POST.get('make')
        model = request.POST.get('model')
        notes = request.POST.get('notes')
        assetNum = request.POST.get('assetNum')
        cat = request.POST.get('category')
        result = False
        newLoanItem = Loan_item(asset_number = assetNum, make = make, model = model, notes = notes, category = cat, qr_code = None, on_loan = "No")

        try:
            newLoanItem.save()
            result = True
        except Error: 
            result = False

        return JsonResponse({'success': result})

@login_required
@restricted_view
def delete_item(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':

        asset = request.POST.get('asset_num')
        item = Loan_item.objects.get(asset_number=asset)
        req = True
        loan = True

        try:
            Request.objects.filter(req_approved="Pending").get(req_item_id=item.id)
        except ObjectDoesNotExist:
            req = False
        
        try:
            Loan.objects.filter(active_loan="Yes").get(loan_item_id=item.id)
        except ObjectDoesNotExist:
            loan = False
        
        if req:
            return JsonResponse({'deleted':False, 'response':'has a request pending. Reject the request first'})
        elif loan:
            return JsonResponse({'deleted':False, 'response':'is currently on loan. Close the loan first'})
        else:
            item.delete()
           
            eqList = getEquipmentList()

            return JsonResponse({'deleted':True, 'json':eqList})
    else:
         return render(request, "loan_equipment_manager/index.html", {
        })



@login_required
@restricted_view
def get_asset_number(request):
    """
    This view returns next available asset number.
    This view is called by populateAssetNumber() JS function in main.js

    Args:
        request: The HTTP request.

    Returns:
        JsonResponse
    
    """
    loan_items = Loan_item.objects.annotate(asset_number_int=Cast(Substr('asset_number', 4),output_field=IntegerField())).order_by('asset_number_int')
    prev_num = None
    gap = ""
    # Look for a gap between asset numbers. If found, use it to create new asset number. If not, use next number available.
    for loan_item in loan_items:
        if prev_num is not None and loan_item.asset_number_int != prev_num + 1:
            gap = prev_num + 1
            break
        prev_num = loan_item.asset_number_int
    else:
        # If no gap was found, set gap to the next number after the last record
        gap = prev_num + 1 if prev_num is not None else 1
    return JsonResponse({'data': "LEM" + str(gap)})
"""
@login_required
@restricted_view
def manage_user(request, id):
    user = User.objects.filter(id=id)
    return render(request, "loan_equipment_manager/manage_user.html", {
        "user": user
    })
"""
@login_required
@restricted_view
def manage_loans(request):   
    """
    Renders manage_loan template with loan data based on their active_loan value

    Args:
        request: The HTTP request.
    Returns:
        Render
    
    """
    loanObj = []
    iLoanObj = []
    activeLoans = []
    inactiveLoans = []
    aLoans = Loan.objects.filter(active_loan = "Yes")
    iLoans = Loan.objects.filter(active_loan = "No")

    for loan in aLoans:
        req = Request.objects.get(req_approved="Approved", id=loan.req_number_id)
        user = User.objects.get(id = loan.end_user_id)
        start_date = req.req_start_date
        end_date = req.req_end_date
        first_name = user.first_name
        last_name = user.last_name
        item = Loan_item.objects.get(id=req.req_item_id)
        make = item.make
        model = item.model
        loanNum = loan.loan_number
        loanObj = {"loan_number":loanNum, "first_name":first_name, "last_name":last_name,"start_date":start_date, "end_date":end_date, "make":make, "model":model}
        activeLoans.append(loanObj)

    for loan in iLoans:
        req = Request.objects.get(req_approved="Approved", id=loan.req_number_id)
        user = User.objects.get(id = loan.end_user_id)
        start_date = req.req_start_date
        end_date = req.req_end_date
        first_name = user.first_name
        last_name = user.last_name
        item = Loan_item.objects.get(id=req.req_item_id)
        make = item.make
        model = item.model
        loanNum = loan.loan_number
        loanObj = {"loan_number":loanNum, "first_name":first_name, "last_name":last_name,"start_date":start_date, "end_date":end_date, "make":make, "model":model}
        inactiveLoans.append(loanObj)


    return render(request, "loan_equipment_manager/manage_loans.html", {
        "activeloans":activeLoans,
        "closedloans":inactiveLoans
    })

@login_required
@restricted_view
def close_loan(request):
    """
    Sets current loan as not active and returns updated data back to Ajax.
    activeLoansTable and closedLoansTable is populated with updated data

    Args:
        request: The HTTP request.

    Returns:
        JsonResponse
    
    """
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        loanNum = request.POST.get('loan_num')
        loan = Loan.objects.get(loan_number = loanNum)
        loanItem = Loan_item.objects.get(id = loan.loan_item.id)

        if loan:
            loan.active_loan = "No"
            loan.save()
            loanItem.on_loan = "No"
            loanItem.save()
        else:
            return JsonResponse({'closed': None})
        
        loans = Loan.objects.all()
        closedLoansList = []
        loansList = []
        
        for ln in loans:
            item = Loan_item.objects.get(id=ln.loan_item_id)
            user = User.objects.get(id=ln.end_user_id)
            req = Request.objects.get(id=ln.req_number_id)
            if ln.active_loan == "Yes":      
                loansList.append({"loan_num":ln.loan_number, "item": item.make + " " + item.model, "user":user.first_name + " " + user.last_name, "start_date": req.req_start_date, "end_date":req.req_end_date})
            else:
                closedLoansList.append({"loan_num":ln.loan_number, "item": item.make + " " + item.model, "user":user.first_name + " " + user.last_name, "start_date": req.req_start_date, "end_date":req.req_end_date})

        return  JsonResponse({'closed':True, 'loans':loansList, 'closedLoans':closedLoansList})
    else:
        return JsonResponse({'closed' : 'Unauthorized'})

@login_required
@restricted_view
def manage_requests(request):
    """
    Renders manage_requests template with requests data

    Args:
        request: The HTTP request.

    Returns:
        Render
    
    """
    return render(request, "loan_equipment_manager/manage_requests.html", {
        "requests": Request.objects.filter(req_approved="Pending"),
        "items": Loan_item.objects.filter(on_loan="Pending"), 
        "users": User.objects.all()
    })
    