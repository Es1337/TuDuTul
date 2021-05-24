from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.schemas import AutoSchema
from .forms import NoteForm
import coreapi

class NoteViewSchema(AutoSchema):

    def get_manual_fields(self, path, method):
        extra_fields = []

        if method.lower() in ['post', 'put']:
            extra_fields = [
                coreapi.Field('table_name'),
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
        (in progress)
        """
        pass #Piotr

    def post(self, request):
        """
        Parameters (Fields are not obligatory)
            - 'table_name' string
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
            anwser = ""
            form = NoteForm(request.data, request.session.get('userLogin'))
            if form.is_valid():
                form.save()
                anwser = 'Note saved successfully'
            else:
                anwser = form.reason()

            return Response(data = {"ans": anwser})

        return Response(data = {"ans": "User is not logged in"}) 

    def put(self, request):
        """
        (in progress)
        """
        pass #Piotr
    
    def delete(self, request):
        """
        (in progress)
        """
        pass #Wojtek

