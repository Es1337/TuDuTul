from django.test import TestCase

from tudutul.models import Note, User, Table
from notes.views import get_all_notes_for_user


class TestNotes(TestCase):
    def setUp(self):
        self.user1 = User.objects.create(
            login='TestUser',
            email='test@user.com',
            password='pass'
        )

        self.table1 = Table.objects.create(
            name='TestTable',
            is_shared=False,
            owner='TestUser'
        )

        self.note1 = Note.objects.create(
            name='TestNote',
            creator='TestUser',
            content='TestContent',
            completion_date='2021-12-21',
            priority=5,
            owning_table_id=self.table1.id
        )

    def test_note_created(self):
        self.assertEqual(self.note1.name, 'TestNote')

    def test_get_all_notes_helper_returns_user_created_notes(self):
        expected = [self.note1.id]
        tested = [el['id'] for el in get_all_notes_for_user(self.user1.login)]
        self.assertListEqual(expected, tested)

    def test_get_all_notes_helper_returns_from_users_tables(self):
        note2 = Note.objects.create(
            name='TestTableNote',
            creator='TestTableUser',
            content='TestContent',
            completion_date='2021-12-21',
            priority=5,
            owning_table_id=self.table1.id
        )

        expected = [self.note1.id, note2.id]
        tested = [el['id'] for el in get_all_notes_for_user(self.user1.login)]
        self.assertListEqual(expected, tested)

    def test_get_all_notes_helper_returns_from_shared_tables(self):
        table2 = Table.objects.create(
            name='TestSharedTable',
            is_shared=True,
            owner='TestSharedUser'
        )
        note2 = Note.objects.create(
            name='TestSharedNote',
            creator='TestSharedUser',
            content='TestContent',
            completion_date='2021-12-21',
            priority=5,
            owning_table_id=table2.id
        )
        table2.shared_with.add(self.user1)

        expected = [self.note1.id, note2.id]
        tested = [el['id'] for el in get_all_notes_for_user(self.user1.login)]
        self.assertListEqual(expected, tested)
