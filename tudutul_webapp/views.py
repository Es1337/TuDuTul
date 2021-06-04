from django.shortcuts import render
from django.http import HttpResponse
import requests
from urllib.parse import urlparse

def is_logged(request):
    if 'userLogin' in request.session.keys():
        return [True, request.session['userLogin'], request.session['userEmail']]

    return [False, None, None]

def index(request, *args, **kwargs):
    logged, userLogin, userEmail = is_logged(request)
    return render(request, 'index.html', {
        'logged' : logged,
        'userLogin' : userLogin,
        'userEmail' : userEmail
        })

def login(request, *args, **kwargs):
    return render(request, 'login/login.html')

def register(request, *args, **kwargs):
    return render(request, 'register/register.html')

def offline(request, *args, **kwargs):
    return render(request, 'note-app/offline-notes.html')

def add_note_offline(request, *args, **kwargs):
    return render(request, 'note-app/offline-addform.html')

def online(request, *args, **kwargs):
    logged, userLogin, userEmail = is_logged(request)
    return render(request, 'account/account.html', {
        'logged' : logged,
        'userLogin' : userLogin,
        'userEmail' : userEmail
        })