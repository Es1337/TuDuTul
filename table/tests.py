from django.test import TestCase
from django.test import Client
from django.db.models import Q
from rest_framework.test import APITestCase

from rest_framework import status
from tudutul.models import Note, Table, User
from notes.views import NoteView, NoteDetailView
from table.views import TableView, TableDetailView
from table.views import get_all_tables_for_user


class TestTables(TestCase):
    def setUp(self):
        self.user1 = User.objects.create(
            login='TestUser1',
            email='test@user1.com',
            password='pass'
        )
        self.user2 = User.objects.create(
            login='TestUser2',
            email='test@user2.com',
            password='pass'
        )

        self.table1 = Table.objects.create(
            name='TestTable1',
            is_shared=False,
            owner='TestUser1'
        )
        self.table2 = Table.objects.create(
            name='SharedTest',
            is_shared=True,
            owner='TestUser2'
        )
        self.table2.shared_with.add(self.user1)

        self.note1 = Note.objects.create(
            name='TestNote',
            creator='TestCreator',
            content='TestContent',
            completion_date='2021-12-21',
            priority=5,
            owning_table_id=self.table1.id
        )

    def test_table_created(self):
        self.assertEqual(self.table1.name, 'TestTable1')

    def test_get_all_tables_helper_returns_correctly(self):
        f = Q(name__exact='TestTable1') | Q(name__exact='SharedTest')
        expected = [el['id'] for el in Table.objects.filter(f).values()]
        tested = [el['id'] for el in get_all_tables_for_user(self.user1.login)]
        self.assertListEqual(expected, tested)
    
class TestAPITables(APITestCase):
    def setUp(self):
        self.client = Client()
        session = self.client.session
        session['userLogin'] = 'TestUser'
        session.save()

        self.user = User.objects.create(
            login='TestUser',
            email='test@user.com',
            password='pass'
        )
        self.user.save()

        self.table = Table.objects.create(
            name='TestTable',
            is_shared=False,
            owner='TestUser'
        )
        self.table.save()

        self.note = Note.objects.create(
            name='TestNote',
            creator='TestCreator',
            content='TestContent',
            completion_date='2021-12-21',
            priority=5,
            owning_table_id=self.table.id
        )     
        self.note.save()

    def test_table_get(self):
        response = self.client.get('/table/', {})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_table_get_id(self):
        response = self.client.get('/table/' + str(self.table.id), {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_table_put_id(self):
        response = self.client.put('/table/' + str(self.table.id), {"name": "NewTestTableName", "is_shared": False}, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["ans"], 'Table updated successfully')
        
    def test_table_delete_id(self):
        response = self.client.delete('/table/' + str(self.table.id), {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["ans"], 'Table deleted successfully')

