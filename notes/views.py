import coreapi

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.schemas import AutoSchema
from django.db.models import Q
from django.forms.models import model_to_dict
from datetime import datetime
from dateutil.relativedelta import relativedelta

from .forms import NoteForm
from tudutul.models import Note
from tudutul.models import Table


def get_all_notes_for_user(user_id):
    # TODO add notes from tables shared by logged user
    # users_boards = Table.objects.filter(owner=user_id)
    boards_shared_with_user = Table.objects.filter(shared_with=user_id)
    filter_args = Q(creator__exact=user_id) | Q(owning_table_id__in=boards_shared_with_user)
    return Note.objects.filter(filter_args).values()


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
        if method.lower() == 'get':
            extra_fields = [
                coreapi.Field('completion_date'),
                coreapi.Field('table_id')
            ]

        return super().get_manual_fields(path, method) + extra_fields


class NoteView(APIView):
    renderer_classes = [JSONRenderer]
    schema = NoteViewSchema()

    def get(self, request):
        """
        Parameters (optional)

            - 'table_id' int
            - 'completion_date' date (YYYY-MM-DD)
        Response

            - ans - array of note objects for currently logged user, error message is user not logged in

            Note objects are in the following format:
            - 'id' int
            - 'name' string
            - 'creator' string
            - ‘content’ string
            - ‘creation_date’ date (YYYY-MM-DD HH:MM format)
            - ‘completion_date’ date (YYYY-MM-DD HH:MM format)
            - ‘priority’ int (1-10)
            - 'owning_table_id' int
            - ‘is_done’ bool
            - ‘repetition’ string
            - ‘category’ string
        """

        user_id = ""

        # dwa sposoby uwierzytelniania do wyboru
        if 'Authorization' in request.headers:
            user_id = request.headers['Authorization']
        elif 'userLogin' not in request.session:
            return Response(data={"ans": "User is not logged in"})
        else:
            user_id = request.session['userLogin']

        query = get_all_notes_for_user(user_id)

        if 'table_id' in request.query_params.keys():
            filter_table_id = request.query_params['table_id']
            query = query.filter(owning_table_id=filter_table_id)
        if 'completion_date' in request.query_params.keys():
            filter_date = request.query_params['completion_date']
            query = query.filter(completion_date__range=[filter_date + ' 00:00', filter_date + ' 23:59'])
            res = query

            daily_notes = query.filter(repetition='D', completion_date__lt=filter_date)
            res |= daily_notes

            weekly_notes = query.filter(repetition='W', completion_date__lt=filter_date)
            for note in weekly_notes:
                min_date = note['completion_date']
                max_date = datetime.strptime(filter_date, '%Y-%m-%d')
                while min_date <= max_date:
                    min_date += relativedelta(days=7)
                if min_date.day == max_date.day:
                    res |= Note.objects.filter(id=note['id']).values()

            monthly_notes = query.filter(repetition='M', completion_date__lt=filter_date)
            for note in monthly_notes:
                min_date = note['completion_date']
                max_date = datetime.strptime(filter_date, '%Y-%m-%d')
                while min_date <= max_date:
                    min_date += relativedelta(months=1)
                if min_date.day == max_date.day:
                    res |= Note.objects.filter(id=note['id']).values()

            yearly_notes = query.filter(repetition='Y', completion_date__lt=filter_date)
            for note in yearly_notes:
                min_date = note['completion_date']
                max_date = datetime.strptime(filter_date, '%Y-%m-%d')
                while min_date <= max_date:
                    min_date += relativedelta(years=1)
                if min_date.day == max_date.day and min_date.month == max_date.month:
                    res |= Note.objects.filter(id=note['id']).values()

            query = res

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
            - 'creation_date' date (YYYY-MM-DD [HH:MM] format)
            - 'completion_date' date (YYYY-MM-DD [HH:MM] format)
            - 'priority' int (1-10)
            - 'is_done' bool
            - 'repetition' NOTE_REPETITION_CHOICES = (('D', 'Daily'), ('W', 'Weekly'), ('M', 'Monthly'), ('Y', 'Yearly'), ('N', 'No repetition'))
            - 'category' NOTE_CATEGORY_CHOICES = (('P', 'Personal'), ('W', 'Work'), ('F', 'Family'))
            - 'owning_table_id' int

        Response

            - 'ans' string
        """

        user_id = ""

        if 'Authorization' in request.headers:
            user_id = request.headers['Authorization']
        elif 'userLogin' not in request.session:
            return Response(data={"ans": "User is not logged in"})
        else:
            user_id = request.session['userLogin']

        answer = ""
        form = NoteForm(request.data, user_id)
        if form.is_valid():
            form.save()
            answer = 'Note saved successfully'
        else:
            answer = form.reason()

        return Response(data={"ans": answer})


class NoteDetailView(APIView):
    renderer_classes = [JSONRenderer]
    schema = NoteViewSchema()

    def get(self, request, note_id):
        """
        Response

            - 'name' string
            - 'creator' string
            - ‘content’ string
            - ‘creation_date’ date (YYYY-MM-DD HH:MM format)
            - ‘completion_date’ date (YYYY-MM-DD HH:MM format)
            - ‘priority’ int (1-10)
            - 'owning_table_id' int
            - ‘is_done’ bool
            - ‘repetition’ string
            - ‘category’ string
        """
        user_id = ""

        if 'Authorization' in request.headers:
            user_id = request.headers['Authorization']
        elif 'userLogin' not in request.session:
            return Response(data={"ans": "User is not logged in"})
        else:
            user_id = request.session['userLogin']

        users_notes = get_all_notes_for_user(user_id)

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
            - ‘creation_date’ date (YYYY-MM-DD [HH:MM] format)
            - ‘completion_date’ date (YYYY-MM-DD [HH:MM] format)
            - ‘priority’ int (1-10)
            - 'owning_table_id' int
            - ‘is_done’ bool
            - ‘repetition’ string
            - ‘category’ string

        Response

            - 'ans' string
        """

        user_id = ""

        if 'Authorization' in request.headers:
            user_id = request.headers['Authorization']
        elif 'userLogin' not in request.session:
            return Response(data={"ans": "User is not logged in"})
        else:
            user_id = request.session['userLogin']

        users_notes = get_all_notes_for_user(user_id)
        if not users_notes.filter(pk=note_id).exists():
            return Response(data={"ans": "Unauthorized"})

        form = NoteForm(request.data, user_id)
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

    def delete(self, request, note_id):
        response = Response()

        user_login = ""

        if 'Authorization' in request.headers:
            user_login = request.headers['Authorization']
        elif 'userLogin' not in request.session:
            response = Response(data={"ans": "User is not logged in"})
        else:
            user_login = request.session['userLogin']

        filter_args = Q(creator__exact=user_login) & Q(id=note_id)

        try:
            note_to_delete = Note.objects.get(filter_args)
            response = Response(data={"ans": f'Note with id: {note_to_delete.id} and name: {note_to_delete.name} '
                                                 f'shall be successfully deleted'})
            # delete per se:
            note_to_delete.delete()

        except Note.DoesNotExist:
            response = Response(data={"ans": f'Note with id: {note_id} was not found or user have '
                                                 f'no access to delete this note.'})

        return response

