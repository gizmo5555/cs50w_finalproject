# CS50W Final Project

**Title: Django Web Application to manage loan equipment in an enterprise**

**Author: Tomasz A. Merkel**
___

***Versions:***

![PyPI - Python Version](https://img.shields.io/pypi/pyversions/Django?color=g&logo=python&logoColor=green&style=plastic)


# Distinctiveness and Complexity

**Distinctiveness:**

1. This project does not copy any web app we have build during this course in totality. There could be similarities to certain parts of previous projects but this is unavoidable in software development. 
2. This project allows 2 types of users (admins and end users) to interact with the system in different ways. End users being dependant on the admins actions.
3. This project contains many actions that admins can perform to manage loans, requests and devices. 

***Complexity:***
1. This project uses 4 models to define the structure of the database. 2 models contain Foreign Keys that define relationships between the models.Loan_item model contains a nested tuple with item categories which are used when creating Loan_item or requestes.
2. This project's urls.py contains 15 routes and 9 API routes and 24 corresponding views in views.py.
3. API routes return json objects that are then used by various JavaScript functions to populate data tables
4. JavaScript functions are split into multiple files to make maintenance easier. Modules are used to allow interaction between the files.
5. 


___
 
 
 ***Description:***

This Django project serves as a management system for loan devices that staff members can borrow for a given time period.

___
 
