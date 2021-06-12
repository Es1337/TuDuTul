from tudutul.models import Table


class TableForm:

    def __init__(self, table_form, login):
        self.owner = login
        self.name = table_form.get('name')
        self.is_shared = table_form.get('is_shared')

        self.alert = ''

    def is_valid(self):
        return True if self.alert == '' else False

    def save(self):
        db_save = Table(name=self.name,
                        owner=self.owner,
                        is_shared=self.is_shared,
                        )
        db_save.save()
        return db_save

    def reason(self):
        return self.alert

    def __check_none(self, parameter, default_value):
        if type(parameter) is type(None):
            return default_value
        else:
            return parameter
