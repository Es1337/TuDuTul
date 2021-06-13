import coreapi

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.schemas import AutoSchema
from rest_framework import status
from django.db.models import Q
from django.forms.models import model_to_dict
from datetime import datetime
from dateutil.relativedelta import relativedelta
from itertools import chain

from .forms import NoteForm
from tudutul.models import Note
from tudutul.models import Table


def get_time_delta(repetition_type):
    if repetition_type == 'D':
        return relativedelta(days=1)
    if repetition_type == 'W':
        return relativedelta(weeks=1)
    if repetition_type == 'M':
        return relativedelta(months=1)
    if repetition_type == 'Y':
        return relativedelta(years=1)
    return None


def get_repeated_notes_for_repetition(query_to_filter, date, repetition):
    notes = query_to_filter.filter(repetition=repetition, creation_date__lt=date, completion_date__gte=date)
    res = None
    delta = get_time_delta(repetition)
    if not delta:
        raise ValueError('Incorrect type of repetition provided')
    for note in notes:
        min_date = note['creation_date']
        max_date = datetime.strptime(date, '%Y-%m-%d')
        while min_date < max_date:
            min_date += delta
        if min_date.day == max_date.day and min_date.month == max_date.month:
            if not res:
                res = Note.objects.filter(id=note['id']).values()
            else:
                res |= Note.objects.filter(id=note['id']).values()
    return res


def get_all_notes_for_user(user_id):
    user_owned_notes = Note.objects.filter(creator__exact=user_id).values()

    users_boards = Table.objects.filter(owner__exact=user_id)
    notes_from_user_boards = Note.objects.filter(owning_table_id__in=users_boards).values()

    boards_shared_with_user = Table.objects.filter(shared_with=user_id)
    notes_from_shared_boards = Note.objects.filter(owning_table_id__in=boards_shared_with_user).values()

    # for some reason django wont union three queries properly, so:
    ids = [v['id'] for v in list(chain(user_owned_notes, notes_from_user_boards, notes_from_shared_boards))]
    return Note.objects.filter(pk__in=ids).values()


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
                coreapi.Field('date'),
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
            - 'date' date (YYYY-MM-DD)  // tudus to be completed on specific day
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

        if 'date' in request.query_params.keys():
            filter_date = request.query_params['date']
            query = query.filter(creation_date__range=[filter_date + ' 00:00', filter_date + ' 23:59'])
            res = query.filter(repetition='N')

            daily_notes = get_repeated_notes_for_repetition(query, filter_date, 'D')
            if daily_notes:
                res |= daily_notes

            weekly_notes = get_repeated_notes_for_repetition(query, filter_date, 'W')
            if weekly_notes:
                res |= weekly_notes

            monthly_notes = get_repeated_notes_for_repetition(query, filter_date, 'M')
            if monthly_notes:
                res |= monthly_notes

            yearly_notes = get_repeated_notes_for_repetition(query, filter_date, 'Y')
            if yearly_notes:
                res |= yearly_notes
            query = res

        if 'table_id' in request.query_params.keys():
            filter_table_id = request.query_params['table_id']
            query = query.filter(owning_table_id=filter_table_id)

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

        print("NOTE CREATION DATE:", form.creation_date);
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
            return Response(data={"ans": "User is not logged in"}, status=status.HTTP_401_UNAUTHORIZED)
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
            response = Response(data={"ans": f'Note with id: {note_id} was not found or user has '
                                             f'no access to delete this note.'}, status=status.HTTP_401_UNAUTHORIZED)

        return response

