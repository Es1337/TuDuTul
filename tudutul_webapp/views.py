from django.shortcuts import render, redirect
from django.http import HttpResponse
from tudutul.models import Table
import django.core.exceptions as ex

def is_logged(request):
    if 'userLogin' in request.session.keys() and 'userEmail' in request.session.keys():
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
    return render(request, 'offline-app/offline-notes.html')

def add_note_offline(request, *args, **kwargs):
    return render(request, 'offline-app/offline-addform.html')
      
def calendar_offline(request, *args, **kwargs):
    return render(request, 'offline-app/offline-calendar.html')

def tables(request, *args, **kwargs):
    logged, userLogin, userEmail = is_logged(request)
    return render(request, 'online-app/online-tables.html', {
        'logged' : logged,
        'userLogin' : userLogin,
        'userEmail' : userEmail
        })

def account(request, *args, **kwargs):
    logged, userLogin, userEmail = is_logged(request)
    return render(request, 'account/account.html', {
        'logged' : logged,
        'userLogin' : userLogin,
        'userEmail' : userEmail
        })

def app(request):
    logged, userLogin, userEmail = is_logged(request)
    try:
        activeTable = Table.objects.get(pk=request.GET.get('table_id', 0))
    
        if logged:
            return render(request, 'online-app/online-notes.html', {
                'logged': logged,
                'userLogin': userLogin,
                'userEmail': userEmail,
                'activeTable': activeTable.name
            })
        else:
            # TODO: Create a Unauthorized page and link it
            return redirect('/')
    except ex.ObjectDoesNotExist:
        return redirect('/app/tables')

# TODO: Create a 404 page