from django.urls import path, re_path
from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('login', views.login, name="login"),
    path('register', views.register, name="register"),
    # re_path('offline/(?P<year>[0-9]{4})-(?P<month>[0-9]{2})-(?P<day>[0-9]{2})',
    #     views.offline, name="offline"),
    path('offline', views.offline, name="offline"),
    # re_path('offline/(?P<year>[0-9]{4})-(?P<month>[0-9]{2})-(?P<day>[0-9]{2})/add',
    #     views.add_note_offline, name="add_note_offline"),
    path('offline/add', views.add_note_offline, name="add_note_offline")
]
