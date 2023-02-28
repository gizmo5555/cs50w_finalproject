from tracemalloc import start
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
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

def index(request):
    
    if request.user.is_authenticated:
        reqs = Request.objects.filter(end_user_id = request.user, req_approved="Yes")
        today = datetime.today().strftime('%Y-%m-%d')
        overDueCount = 0
        for req in reqs:
            if today > req.req_end_date:
                overDueCount += 1
        return render(request, "loan_equipment_manager/index.html", {
        'loans':Loan.objects.filter(end_user_id = request.user.id, active_loan="Yes").count(),
        'overdue':overDueCount
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
        return render(request, "loan_equipment_manager/register.html")

@login_required
@restricted_view
def manage_equipment(request):
    return render(request, "loan_equipment_manager/manage_equipment.html", {
        "equipment": Loan_item.objects.all(),
        "loan":Loan.objects.all(),
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

    loanObj = []
    userLoans = []
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
            else:
                status = "Ended"
            loanObj = {"status": status, "start_date":start_date, "end_date":end_date, "make":make, "model":model}
            userLoans.append(loanObj)

    return render(request, "loan_equipment_manager/my_loans.html", {
        "loans": userLoans
    })

@login_required
def my_requests(request):
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
    print(userReqs)

    return render(request, "loan_equipment_manager/my_requests.html", {
        'requests' : userReqs
    })

@login_required
def loan_request(request):
    return render(request, "loan_equipment_manager/loan_request.html")

@login_required
def create_request(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        item = request.POST.get('item_id')
        loanItem = Loan_item.objects.get(id=item)
        if loanItem.on_loan == "Pending":
            return JsonResponse({'created':"requested"})
        else:
            start_date = request.POST.get('start_date')
            end_date = request.POST.get('end_date')
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
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':

        itemId = request.GET.get('item_id')
        last_item = Loan.objects.all().last()
        conv_num = ""

        if(not last_item):
            conv_num = "LN1"
        else:
            loan_number_full = last_item.loan_number
            loan_num = loan_number_full.split("LN",1)[1]
            conv_num = int(loan_num)
            conv_num += 1
            conv_num = "LN" + str(conv_num)    

        reqItem = Request.objects.filter(id=id).update(req_approved = "Approved")
        userId = Request.objects.filter(id=id).values("end_user_id")
        loanItem = Loan_item.objects.filter(id=itemId).update(on_loan="Yes")
        Loan.objects.create(loan_number = conv_num, items_count = 1, active_loan = "Yes", req_number_id = id, end_user_id = userId[0]['end_user_id'], loan_item_id =  itemId)
        return JsonResponse({'approved':True})
    return JsonResponse({'approved':False})

@login_required
@restricted_view
def reject_request(request, id):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        print("REACHED")
        itemId = request.GET.get('item_id') 

        Request.objects.filter(id=id).update(req_approved = "Rejected")
        Loan_item.objects.filter(id=itemId).update(on_loan="No")
        return JsonResponse({'rejected':True})
    return JsonResponse({'approved':False})

@login_required
def loan_categories(request):
    cat_list = list(Loan_item.CATEGORY)
    return JsonResponse({'data': cat_list})
    
@login_required
def loan_items(request, *args, **kwargs):
    selected_cat = kwargs.get('cat')
    item_list = list(Loan_item.objects.filter(category=selected_cat, on_loan="No").values().exclude(on_loan="Pending"))
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
                currentLoanItem.notes = notes
                currentLoanItem.save()

                return render(request, "loan_equipment_manager/manage_equipment.html", {
                })
    else:
        return render(request, "loan_equipment_manager/index.html", {
    })

@login_required
@restricted_view
def create_loan_item(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        loan_items = Loan_item.objects.all().order_by('asset_number').values()
        print(loan_items)
        return JsonResponse({'data': 'test'})

@login_required
@restricted_view
def manage_user(request, id):
    user = User.objects.filter(id=id)
    return render(request, "loan_equipment_manager/manage_user.html", {
        "user": user
    })

@login_required
@restricted_view
def manage_loans(request):   

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
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        loanNum = request.POST.get('loan_num')
        loan = Loan.objects.get(loan_number = loanNum)

        if loan:
            loan.active_loan = "No"
            loan.save()
            return  JsonResponse({'closed':True})
        else:
            return JsonResponse({'closed': None})
    else:
        return JsonResponse({'closed' : 'Unauthorized'})

@login_required
@restricted_view
def manage_requests(request):
    return render(request, "loan_equipment_manager/manage_requests.html", {
        "requests": Request.objects.filter(req_approved="Pending"),
        "items": Loan_item.objects.filter(on_loan="Pending"), 
        "users": User.objects.all()
    })
    