from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.renderers import TemplateHTMLRenderer, JSONRenderer
from rest_framework.decorators import api_view
from .forms import RegisterForm, LoginForm


class RegistrationView(APIView):
    renderer_classes = [TemplateHTMLRenderer]
    template_name = 'register/register.html'

    def get(self, request):
        return Response()

    def post(self, request):
        form = RegisterForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('/')
        else:
            answer = form.reason()
        
        return Response(data={"ans": answer})


class LoginView(APIView):
    renderer_classes = [TemplateHTMLRenderer]
    template_name = 'login/login.html'

    def get(self, request):
        user_session_key = 'userLogin'

        if user_session_key in request.session: # przekierujmy zalogowanego
            return redirect('/account/show', {'userLogin': request.session.get(user_session_key)})

        return Response()

    def post(self, request):
        user_session_key = 'userLogin'

        form = LoginForm(request.POST)
        for ex in form:
            print(ex, flush=True)
        if form.is_valid():
            # set session
            request.session['userLogin'] = form.login
            request.session['userEmail'] = form.email
            return redirect('/account/show', {'userLogin': request.session.get(user_session_key)})
        else:
            answer = form.reason()

        return Response(data={"ans": answer})


class AccountView(APIView):
    renderer_classes = [TemplateHTMLRenderer]
    template_name = 'account/account.html'

    def get(self, request):
        return Response(data={"userLogin": request.session.get('userLogin'), 
                            "userEmail": request.session.get('userEmail')})


class LogoutView(APIView):
    renderer_classes = [TemplateHTMLRenderer]

    def get(self, request):
        if request.session.get('userLogin') == request.GET.get('login'):
            request.session.pop(key='userLogin')
        return redirect('/account/login', {'userLogin': 'Logged out'})
