from django.shortcuts import render
from django.http import HttpResponse


def index(request, *args, **kwargs):
    return render(request, 'tudutul-webapp/index.html')
# Create your views here.


def login(request, *args, **kwargs):
    return render(request, 'tudutul-webapp/login.html')


def register(request, *args, **kwargs):
    return render(request, 'tudutul-webapp/register.html')


def offline(request, *args, **kwargs):
    return render(request, 'tudutul-webapp/offline-notes.html')