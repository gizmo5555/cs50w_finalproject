# CS50W Final Project

**Title: Django Web Application to manage loan equipment in an enterprise**

**Author: Tomasz A. Merkel**
___

***Versions:***

![PyPI - Python Version](https://img.shields.io/pypi/pyversions/Django?color=g&logo=python&logoColor=green&style=plastic)


# Distinctiveness and Complexity

**Distinctiveness:**

1. This web application is a management system for hardware equipment. It allows users to created requests, but also gives admins multiple ways to interact with the requests, hardware and users.
1. This project does not copy any web app we have build during this course in totality. There could be similarities to certain parts of previous projects but this is unavoidable in software development. 
2. This project allows 2 types of users (admins and end users) to interact with the system in different ways. Some actions performed by end users require admins' decision.
3. This project contains many actions that admins can perform to manage loans, requests and devices. 

***Complexity:***
1. This project uses 4 models to define the structure of the database. 2 models contain Foreign Keys that define relationships between the models.Loan_item model contains a nested tuple with item categories which are used when creating Loan_item or requests.
2. This project's urls.py contains 15 routes and 9 API routes and 24 corresponding views in views.py.
3. API routes return json objects that are then used by various JavaScript functions to populate data tables
4. JavaScript functions are split into multiple files to make maintenance easier. Modules are used to allow interaction between the files.
5. This web app uses a custom decorator to check whether a user is in "standard" or "admin/sd admin" group to allow/decline access to certain parts of the application.
6. Most actions are run by JavaScript functions that contain Ajax calls to the backend. This improves the overall experience for end users.
7. 
___

***Files content***

**.\loan_equipment_manager\static\loan_equipment_manager**

note: all JavaScript functions are commented if more information is needed.

* dataTables.css - css file for styling the tables look of the pagination buttons, items number buttons and some general table styling.
* styles.css - css file for styling of the body, some additional table styling, forms, calendar picker, buttons, headings and @media queries for certain screen widths to adjust the navbar
* main.js - main JS file with wildcard import from other JS files present in the project. main.js has an event listener attached to DOMContentLoaded which runs a table sorting function first then other functions based on current path. Most of those functions add event listeners to various buttons and tables themselves.
* equipment.js - imports functions from helpers.js and tables.js that are used get item categories from the server, populate asset number field when editing or adding new item, and populate a modal window when add or edit button is clicked on manage_equipment page. 
* helpers.js - has 4 functions. They allow to set the date picker and minimum date for the loan request, get items categories, populate asset number field when in modal window when adding new item.
* loans.js - imports from tables.js (to sort tables and populate after loan is closed) has one function to close existing loans
* requests.js - imports from helpers.js and tables.js. Has functions to create requests, accept, and reject requests.
* tables.js - imports the getAssetNum from equipment.js which sets the oldAssetNum and itemRow_ variables - this is called in populateModalWindow() and then used in editLoanItem(). Has functions to sort tables and populate them after Ajax calls are made in other functions.

**.\loan_equipment_manager\templates\loan_equipment_manager**

* layout.html - layout template which all other templates extend from
* index.html - main page displayed to every user visiting the site
* loan_request.html - page where users can submit requests for loan items
* login.html - login page
* manage_equipment.html - page where admins can manage loan equipment either by editing, deleting or adding new items,
* manage_loans.html - page where admins can view closed loans and close existing loan when necessary.
* manage_requests.html - page where admins can accept or reject pending requests.
* manage_users.html - page where admin can view all users (users can be managed in the admin panel localhost:8000/admin)
* my_account.html - page where users can update their account details such as name, email, username and password.
* my_loans.html - page where users can check their loans (past and present)
* my_requests.html - page where users can check their requests (past and present)
* register.html - page where new users can register

**.\loan_equipment_manager\**

* decorators.py - contains restricted_view decorator which check if users is in admin or sd admin group. Used to restrict access to certain parts of the application.
* models.py - definition of database models. Has 4 models: User, Loan_item, Request and Loan. Request and Loan contain foreign keys to establish many-to-one relationship with other models.
* urls.py - contains all the routes for this project
* views.py - contains all views that make this project work. All views are commented.
* .gitignore - contains instructions for git to ignore certain parts of the project when committing to a repository.
* . README.md - a readme file with markdown syntax used to describe the project and give instructions how to run it.




___
 
 
 ***Description:***

This Django project serves as a management system for loan devices that staff members can borrow for a given time period.

___

