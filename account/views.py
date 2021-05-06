from django.shortcuts import render, redirect
from .forms import RegisterForm

def register(request):
    answer = ''

    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('/')
        else:
            answer = form.reason()
    
    return render(request, "register/register.html", {"ans": answer})


def login(request):
    pass
