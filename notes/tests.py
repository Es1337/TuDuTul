from django.test import TestCase
from datetime import date
from django.db.models import Q

from tudutul.models import Note, User, Table
from notes.views import get_all_notes_for_user


class TestNotes(TestCase):
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

        self.note1 = Note.objects.create(
            name='TestNote',
            creator='TestUser1',
            content='TestContent',
            completion_date='2021-12-21',
            priority=5,
            owning_table_id=self.table1.id
        )
        self.note1 = Note.objects.create(
            name='TestNote',
            creator='TestUser2',
            content='TestContent',
            completion_date='2021-12-21',
            priority=5,
            owning_table_id=self.table1.id
        )

    def test_note_created(self):
        self.assertEqual(self.note1.name, 'TestNote')

    def test_creation_date_is_today(self):
        self.assertEqual(self.note1.creation_date, date.today())

    def test_get_all_notes_helper_returns_correctly_from_users_tables(self):
        f = Q(name__exact='TestNote', creator__exact='TestUser1')
        expected = [el['id'] for el in Note.objects.filter(f).values()]
        tested = [el['id'] for el in get_all_notes_for_user(self.user1.login)]
        self.assertListEqual(expected, tested)

    def test_get_all_notes_helper_returns_correctly_from_shared_tables(self):
        pass
