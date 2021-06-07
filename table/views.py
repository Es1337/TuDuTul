import coreapi
from django.forms.models import model_to_dict
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.schemas import AutoSchema
from rest_framework.views import APIView

from table.forms import TableForm
from tudutul.models import Table, Note


# TODO add "share" view with friends and add-by-login

def get_all_tables_for_user(user_id):
    users_boards = Table.objects.filter(owner=user_id)
    boards_shared_with_user = Table.objects.filter(shared_with=user_id)
    return boards_shared_with_user.values() | users_boards.values()


class TableViewSchema(AutoSchema):

    def get_manual_fields(self, path, method):
        extra_fields = []

        if method.lower() in ['post', 'put']:
            extra_fields = [
                coreapi.Field('name'),
                coreapi.Field('is_shared')
            ]

        return super().get_manual_fields(path, method) + extra_fields


class TableView(APIView):
    renderer_classes = [JSONRenderer]
    schema = TableViewSchema()

    def get(self, request):
        """
        Response

            - ans - array of table objects for currently logged user, error message is user not logged in

            Table objects are in the following format:
            - 'id' int
            - 'name' string
            - 'is_shared' bool
            - 'owner' string
            - ‘shared_with' array of strings
        """
        if 'userLogin' not in request.session:
            return Response(data={"ans": "User is not logged in"})

        user_id = request.session['userLogin']
        query = get_all_tables_for_user(user_id)

        tables = []
        for i, item in enumerate(query):
            tables.append({})
            for key in item:
                tables[i][key] = item[key]

            tables[i]['shared_with'] = []
            t = Table.objects.get(id=item['id'])
            for user in t.shared_with.all():
                tables[i]['shared_with'].append(user.login)

        return Response(data={"ans": tables})

    def post(self, request):
        """
        Parameters (Fields are not obligatory)

            - 'name' string
            - 'is_shared' bool
        Response

            - 'ans' string
        """

        if 'userLogin' not in request.session:
            return Response(data={'ans': 'User is not logged in'})

        form = TableForm(request.data, request.session.get('userLogin'))
        if form.is_valid():
            form.save()
            answer = 'Table saved successfully'
        else:
            answer = form.reason()

        return Response(data={"ans": answer})


class TableDetailView(APIView):
    renderer_classes = [JSONRenderer]
    schema = TableViewSchema()

    def get(self, request, table_id):
        """
        Parameters

            - id
        Response

            - ans - table objects for currently logged user, error message is user not logged in

            Table objects are in the following format:
            - 'id' int
            - 'name' string
            - 'is_shared' bool
            - 'owner' string
            - ‘shared_with' array of strings
        """
        if 'userLogin' not in request.session:
            return Response(data={"ans": "User is not logged in"})

        user_id = request.session['userLogin']

        try:
            table = Table.objects.get(pk=table_id)
        except Table.DoesNotExist:
            return Response(data={"ans": "Table does not exist"})

        users_tables = get_all_tables_for_user(user_id)

        if not users_tables.filter(pk=table_id):
            return Response(data={"ans": "Unauthorized"})

        table = model_to_dict(table)
        table['shared_with'] = [user.login for user in table['shared_with']]
        return Response(data={"ans": table})
    
    def put(self, request, table_id):
        """
        Parameters (Fields are not obligatory)

            - 'name' string
            - 'is_shared' bool
        Response

            - 'ans' string
        """
        if 'userLogin' not in request.session:
            return Response(data={"ans": "User is not logged in"})

        form = TableForm(request.data, request.session.get('userLogin'))
        if form.is_valid():
            try:
                edited_table = Table.objects.get(pk=table_id)
            except Table.DoesNotExist:
                return Response(data={"ans": "Table does not exist"})

            if edited_table.owner != request.session.get('userLogin'):
                return Response(data={"ans": "Unauthorized"})

            if form.name:
                edited_table.name = form.name
            if form.is_shared:
                edited_table.is_shared = form.is_shared

            edited_table.save()
            answer = 'Table updated successfully'

        else:
            answer = form.reason()

        return Response(data={"ans": answer})
        

    def delete(self, request, table_id):
        """
        Parameters

            - id
        Response

            - ans - table has been deleted or error message is if user not logged in
        """
        if 'userLogin' not in request.session:
            return Response(data={"ans": "User is not logged in"})
        
        try:
            delete_table = Table.objects.get(pk=table_id)
        except Table.DoesNotExist:
            return Response(data={"ans": "Table does not exist"})
        
        if delete_table.owner != request.session['userLogin']:
            return Response(data={"ans": "Unauthorized"})
        
        try:
            notes_to_delete = Note.objects.get(owning_table_id=table_id)
            notes_to_delete.delete()
        except:
            pass

        try:
            delete_table.delete()
        except:
            return Response(data={"ans": "Error occured during deleting"})
        
        return Response(data={"ans": "Table deleted successfully"})
