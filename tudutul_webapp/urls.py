from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('login', views.login, name="login"),
    path('register', views.register, name="register"),
    path('offline', views.offline, name="offline"),
    path('offline/add', views.add_note_offline, name="add_note_offline"),
    path('offline/calendar', views.calendar_offline, name="calendar_offline"),
    path('online', views.online, name="online"),
]
