from django.urls import path
from .views import RegistrationView, LoginView, AccountView
from . import views

urlpatterns = [
    path('register/', RegistrationView.as_view()),
    path('login/', LoginView.as_view()),
    path('', AccountView.as_view())
]
