from django.shortcuts import render
from django.http import HttpResponse


def index(request, *args, **kwargs):
    return render(request, 'index.html')
# Create your views here.


def login(request, *args, **kwargs):
    return render(request, 'login/login.html')


def register(request, *args, **kwargs):
    return render(request, 'register/register.html')


def offline(request, *args, **kwargs):
    return render(request, 'note-app/offline-notes.html')


def add_note_offline(request, *args, **kwargs):
    return render(request, 'note-app/offline-addform.html')


def calendar_offline(request, *args, **kwargs):
    return render(request, 'note-app/offline-calendar.html')

def online(request, *args, **kwargs):
    userLogin = request.session['userLogin']
    # TODO
    userEmail = 'userEmail'
    return render(request, 'account/account.html', {
        'userLogin' : userLogin,
        'userEmail' : userEmail
        })