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
        
        return Response(data = {"ans": answer})


class LoginView(APIView):
    renderer_classes = [TemplateHTMLRenderer]
    template_name = 'login/login.html'

    def get(self, request):
        return Response()

    def post(self, request):
        form = LoginForm(request.POST)
        if form.is_valid():
            # set session
            request.session['user'] = form.login
            return redirect('/asd')
        else:
            answer = form.reason()

        return Response(data={"ans": answer, "sesja": request.session})


class AccountView(APIView):
    renderer_classes = [TemplateHTMLRenderer]
    template_name = 'login/login.html'

    def get(self, request):
        return Response()
