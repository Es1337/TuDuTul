from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.decorators import api_view
from .forms import RegisterForm, LoginForm


class RegistrationView(APIView):
    
    renderer_classes = [JSONRenderer]

    def post(self, request):
        """
        Parameters
            - 'email' string
            - 'login' string
            - 'pass' string
            - 'repeated_pass' string
            
        Response
            - 'registered' bool 
            - 'ans' string
        """
        form = RegisterForm(request.POST)
        registered = False
        if form.is_valid():
            form.save()
            registered = True
            anwser = "User successfully registered"
        else:
            answer = form.reason()

        return Response(data = {"registered": registered, "ans": answer})


class LoginView(APIView):
    renderer_classes = [JSONRenderer]

    def get(self, request):
        user_session_key = 'userLogin'

        if user_session_key in request.session: 
            return Response(data = {"logged": True, "userLogin": request.session.get(user_session_key)})

        return Response(data = {"logged": False})

    def post(self, request):
        user_session_key = 'userLogin'
        logged = False

        form = LoginForm(request.POST)
        if form.is_valid():
            # set session
            request.session['userLogin'] = form.login
            logged = True
            anwser = "User successfully logged in"
        else:
            answer = form.reason()

        return Response(data = {"logged": logged, "ans": answer})


class AccountView(APIView):
    renderer_classes = [JSONRenderer]

    def get(self, request):
        return Response(data = {"userLogin": request.session.get('userLogin')})


class LogoutView(APIView):
    renderer_classes = [JSONRenderer]

    def get(self, request):
        if request.session.get('userLogin') == request.GET.get('login'):
            request.session.pop(key = 'userLogin')
            
        return Response({'userLogin': 'Logged out'})
