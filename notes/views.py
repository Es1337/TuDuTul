import coreapi

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.schemas import AutoSchema
from django.db.models import Q
from django.forms.models import model_to_dict

from .forms import NoteForm
from tudutul.models import Note
from tudutul.models import Table


class NoteViewSchema(AutoSchema):

    def get_manual_fields(self, path, method):
        extra_fields = []

        if method.lower() in ['post', 'put']:
            extra_fields = [
                coreapi.Field('name'),
                coreapi.Field('content'),
                coreapi.Field('creation_date'),
                coreapi.Field('completion_date'),
                coreapi.Field('priority'),
                coreapi.Field('is_done'),
                coreapi.Field('repetition'),
                coreapi.Field('category'),
                coreapi.Field('owning_table_id')
            ]

        return super().get_manual_fields(path, method) + extra_fields


class NoteView(APIView):
    renderer_classes = [JSONRenderer]
    schema = NoteViewSchema()

    def get(self, request):
        """
        Parameters

        Response

            - ans - array of note objects for currently logged user, error message is user not logged in

            Note objects are in the following format:
            - 'id' int
            - 'name' string
            - 'creator' string
            - ‘content’ string
            - ‘creation_date’ date (YYYY-MM-DD format)
            - ‘completion_date’ date (YYYY-MM-DD format)
            - ‘priority’ int (1-10)
            - 'owning_table_id' int
            - ‘is_done’ bool
            - ‘repetition’ string
            - ‘category’ string
        """
        if 'userLogin' not in request.session:
            return Response(data={"ans": "User is not logged in"})

        user_id = request.session['userLogin']
        boards_shared_with_user = Table.objects.filter(shared_with=user_id)
        filter_args = Q(creator__exact=user_id) | Q(owning_table_id__in=boards_shared_with_user)
        query = Note.objects.filter(filter_args).values()
        notes = []
        for i, item in enumerate(query):
            notes.append({})
            for key in item:
                notes[i][key] = item[key]

        return Response(data={"ans": notes})

    def post(self, request):
        """
        Parameters (Fields are not obligatory)
            - 'name' string
            - 'content' string
            - 'creation_date' date (YYYY-MM-DD format)
            - 'completion_date' date (YYYY-MM-DD format)
            - 'priority' int (1-10)
            - 'is_done' bool
            - 'repetition' NOTE_REPETITION_CHOICES = (('W', 'Weekly'), ('M', 'Monthly'), ('Y', 'Yearly'), ('N', 'No repetition'))
            - 'category' NOTE_CATEGORY_CHOICES = (('P', 'Personal'), ('W', 'Work'), ('F', 'Family'))
            - 'owning_table_id' int

        Response
            - 'ans' string
        """
        if 'userLogin' in request.session:
            answer = ""
            form = NoteForm(request.data, request.session.get('userLogin'))
            if form.is_valid():
                form.save()
                answer = 'Note saved successfully'
            else:
                answer = form.reason()

            return Response(data={"ans": answer})

        return Response(data={"ans": "User is not logged in"})

    def delete(self, request):
        """
        (in progress)
        """
        pass  # Wojtek


class NoteDetailView(APIView):
    renderer_classes = [JSONRenderer]
    schema = NoteViewSchema()

    def get(self, request, note_id):
        """
        Parameters

        Response

            - 'name' string
            - 'creator' string
            - ‘content’ string
            - ‘creation_date’ date (YYYY-MM-DD format)
            - ‘completion_date’ date (YYYY-MM-DD format)
            - ‘priority’ int (1-10)
            - 'owning_table_id' int
            - ‘is_done’ bool
            - ‘repetition’ string
            - ‘category’ string
        """
        if 'userLogin' not in request.session:
            return Response(data={"ans": "User is not logged in"})

        user_id = request.session['userLogin']
        boards_shared_with_user = Table.objects.filter(shared_with=user_id)
        filter_args = Q(creator__exact=user_id) | Q(owning_table_id__in=boards_shared_with_user)
        users_notes = Note.objects.filter(filter_args)

        if not users_notes.filter(pk=note_id).exists():
            return Response(data={"ans": "Unauthorized"})

        note = model_to_dict(Note.objects.get(pk=note_id))
        return Response(data={"ans": note})

    def put(self, request, note_id):
        """
        Parameters

            - 'name' string
            - 'creator' string
            - ‘content’ string
            - ‘creation_date’ date (YYYY-MM-DD format)
            - ‘completion_date’ date (YYYY-MM-DD format)
            - ‘priority’ int (1-10)
            - 'owning_table_id' int
            - ‘is_done’ bool
            - ‘repetition’ string
            - ‘category’ string

        Response

            - 'ans' string
        """
        if 'userLogin' not in request.session:
            return Response(data={"ans": "User is not logged in"})

        user_id = request.session['userLogin']
        boards_shared_with_user = Table.objects.filter(shared_with=user_id)
        filter_args = Q(creator__exact=user_id) | Q(owning_table_id__in=boards_shared_with_user)
        users_notes = Note.objects.filter(filter_args)

        if not users_notes.filter(pk=note_id).exists():
            return Response(data={"ans": "Unauthorized"})

        form = NoteForm(request.data, request.session['userLogin'])
        if form.is_valid():
            edited_note = Note.objects.get(pk=note_id)
            if form.name:
                edited_note.name = form.name
            if form.content:
                edited_note.content = form.content
            if form.creation_date:
                edited_note.creation_date = form.creation_date
            if form.completion_date:
                edited_note.completion_date = form.completion_date
            if form.priority:
                edited_note.priority = form.priority
            if form.is_done:
                edited_note.is_done = form.is_done
            if form.repetition:
                edited_note.repetition = form.repetition
            if form.category:
                edited_note.category = form.category
            if form.owning_table_id:
                edited_note.owning_table_id = form.owning_table_id
            edited_note.save()

            return Response(data={"ans": "Note updated successfully"})
        else:
            return Response(data={"ans": form.reason()})
