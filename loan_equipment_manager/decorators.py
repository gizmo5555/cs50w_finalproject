from django.http import HttpResponse
from django.shortcuts import redirect
import logging

from django.http import Http404
logging.basicConfig(level=logging.NOTSET) # Here

def allowed_users(allowed_roles=[]):
    def decorator(view_func):
        def wrapper_func(request, *args, **kwargs):
            
            user_groups = request.user.groups.all()
            group_matched = False
            for group in user_groups:
                if group in allowed_roles:
                    group_matched = True

            if group_matched:
                return view_func(request, *args, **kwargs)
            else:
                return HttpResponse('You are not authorized to view this page')
        return wrapper_func
    return decorator

def restricted_view(function):
    def wrapper(request, *args, **kwargs):
        if request.user.groups.filter(name="admin").exists() or request.user.groups.filter(name="sd admin").exists():
            return function(request, *args, **kwargs)
        raise Http404
    return wrapper

def standard_user(function):
    def wrapper(request, *args, **kwargs):
        if request.user.groups.filter(name="standard").exists():
            return function(request, *args, **kwargs)
        raise Http404
    return wrapper
