from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.renderers import TemplateHTMLRenderer
from rest_framework.decorators import api_view
from .forms import RegisterForm


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

    def get(self, request):
        pass

    def post(self, request):
        pass


class AccountView(APIView):

    def get(self, request):
        pass