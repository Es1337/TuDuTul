from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from .forms import RegisterForm, LoginForm
from rest_framework.schemas import AutoSchema
import coreapi

class RegistrationViewSchema(AutoSchema):

    def get_manual_fields(self, path, method):
        extra_fields = []

        if method.lower() == 'post':
            extra_fields = [
                coreapi.Field('email'),
                coreapi.Field('login'),
                coreapi.Field('pass'),
                coreapi.Field('repeated_pass')
            ]

        return super().get_manual_fields(path, method) + extra_fields
    
class LoginViewSchema(AutoSchema):

    def get_manual_fields(self, path, method):
        extra_fields = []

        if method.lower() == 'post':
            extra_fields = [
                coreapi.Field('login'),
                coreapi.Field('password'),
            ]

        return super().get_manual_fields(path, method) + extra_fields

class LogoutViewSchema(AutoSchema):

    def get_manual_fields(self, path, method):
        extra_fields = []

        if method.lower() == 'get':
            extra_fields = [
                coreapi.Field('login'),
            ]

        return super().get_manual_fields(path, method) + extra_fields

class RegistrationView(APIView):
    
    renderer_classes = [JSONRenderer]
    schema = RegistrationViewSchema()

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
        form = RegisterForm(request.data)
        answer = ""
        registered = False

        if form.is_valid():
            form.save()
            registered = True
            answer = "User successfully registered"
        else:
            answer = form.reason()
        
        return Response(data = {"registered": registered, "ans": answer})


class LoginView(APIView):

    renderer_classes = [JSONRenderer]
    schema = LoginViewSchema()

    def get(self, request):
        """
        Response
            - 'logged' bool 
            - 'userLogin' string
        """
        user_session_key = 'userLogin'

        if user_session_key in request.session: 
            return Response(data = {"logged": True, "userLogin": request.session.get(user_session_key)})

        return Response(data = {"logged": False})

    def post(self, request):
        """
        Parameters
            - 'login' string
            - 'password' string
        Response
            - 'logged' bool
            - 'ans' string
        """
        user_session_key = 'userLogin'
        logged = False

        form = LoginForm(request.data)
        if form.is_valid():
            # set session
            request.session['userLogin'] = form.login
            logged = True
            answer = "User successfully logged in"
        else:
            answer = form.reason()

        return Response(data = {"logged": logged, "ans": answer})


class AccountView(APIView):

    renderer_classes = [JSONRenderer]

    def get(self, request):
        """
        (in progress)
        Response
            - 'logged' bool
            - 'ans' string
        """
        return Response(data = {"userLogin": request.session.get('userLogin')})


class LogoutView(APIView):

    renderer_classes = [JSONRenderer]
    schema = LogoutViewSchema()

    def get(self, request):
        """
        Parameters
            - 'login' string
        Response
            - 'userLogin' string
        """
        if request.session.get('userLogin') == request.GET.get('login'):
            request.session.pop(key = 'userLogin')
            anwser = 'Logged out'
        else:
            anwser = 'User ' + request.GET.get('login') + ' is not logged in'
        
        return Response({'userLogin': anwser})
