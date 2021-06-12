from django.test import TestCase
from django.db.models import Q

from tudutul.models import Note, Table, User
from notes.views import NoteView, NoteDetailView
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
