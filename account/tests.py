from django.test import Client
from rest_framework.test import APITestCase

from rest_framework import status
from tudutul.models import User

class AccountAPITests(APITestCase):
    def setUp(self):
        self.client = Client()
        session = self.client.session
        session['userLogin'] = 'TestUser'
        session.save()

        self.user = User(
            login='TestUser',
            email='test@user.com',
            password='password'
        )
        self.user.save()

        self.user_data = {"email": "test@user.com", 
                          "login": "TestUser",  
                          "pass": "password", 
                          "repeated_pass": "password"}
        
    def test_account_register_post_existing_user(self):
        response = self.client.post('/account/register/', self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"registered": False, "ans": "Email is already used by another user"})

    def test_account_register_post_new_user(self):
        new_user = self.user_data
        new_user["email"] += "123"
        new_user["login"] += "123"
        response = self.client.post('/account/register/', new_user, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"registered": True, "ans": "User successfully registered"})

    def test_account_login_get(self):
        response = self.client.get('/account/login/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"logged": True, "userLogin": "TestUser", "userEmail:": "test@user.com"})
    
    def test_account_login_post_wrong_password(self):
        response = self.client.post('/account/login/', {"login": "TestUser", "pass": "pass"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"logged": False, "ans": "Incorrect password for user: TestUser. Please try again."})
    
    def test_account_show_get(self):
        response = self.client.get('/account/show/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"userLogin": "TestUser"})

    def test_logout_get(self):
        response = self.client.get('/account/logout/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"userLogin": "Logged out"})

