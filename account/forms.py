from django.contrib.auth.hashers import make_password 
from tudutul.models import User

class RegisterForm:

    def __init__(self, register_form):
        self.email = register_form["email"]
        self.login = register_form["login"]
        self.password = register_form["pass"]
        self.repeated_password = register_form["repeated_pass"]
        self.alert = ''


    def is_valid(self):
        if self.email == '' or self.login == '' or self.password == '' or self.repeated_password == '':
            self.alert = 'Form field is empty'
        elif len(self.password) < 5:
            self.alert = 'Password too short'
        elif len(self.login) < 5:
            self.alert = 'Login too short'
        elif self.password != self.repeated_password:
            self.alert = 'Passwords are diffrent'
        elif User.objects.filter(email = self.email).count() > 0:
            self.alert = 'Email is already used by another user'
        elif User.objects.filter(login = self.login).count() > 0:
            self.alert = 'Login is already used by another user'
        
        return True if self.alert == '' else False
        

    def save(self):
        db_save = User(login = self.login, email = self.email, password = make_password(self.password))
        db_save.save()


    def reason(self):
        return self.alert
