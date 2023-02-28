from django.urls import path

from . import views
from .views import loan_categories, loan_items, create_request, accept_request, reject_request, manage_item #,create_loan,

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("manage_equipment", views.manage_equipment, name="manage_equipment"),
    path("manage_users", views.manage_users, name="manage_users"),
    path('manage_item/<int:id>', views.manage_item, name="manage_item"),
    path('manage_user/<int:id>', views.manage_user, name="manage_user"),
    path('manage_loans', views.manage_loans, name="manage_loans"),
    path('manage_requests', views.manage_requests, name="manage_requests"),
    path("my_loans", views.my_loans, name="my_loans"),
    path('my_requests', views.my_requests, name='my_requests'),
    path('close_loan/', views.close_loan, name="close_loan"),
    path('edit_item/', views.edit_item, name="edit_item"),
    path("loan_request", views.loan_request, name="loan_request"),
    path("categories-json/", loan_categories, name="categories-json"),
    path("items-json/<str:cat>/", loan_items, name="items-json"),
    path('create_request/', create_request, name="create_request"),
    path('create_loan_item/', views.create_loan_item, name='create_loan_item'),
    path('accept_request/<int:id>', accept_request, name="accept_request"),
    path('reject_request/<int:id>', reject_request, name="reject_request")


]