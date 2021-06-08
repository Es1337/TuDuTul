from tudutul.models import Note
from datetime import date, datetime


class NoteForm:

    def __init__(self, note_form, login):
        self.creator = login
        self.name = note_form.get('name')
        self.content = note_form.get('content')
        
        today = date.today()
        self.creation_date = self.__check_none(note_form.get('creation_date'), today.strftime('%Y-%m-%d'))
        self.completion_date = self.__check_none(note_form.get('completion_date'), today.strftime('%Y-%m-%d'))
        self.priority = self.__check_none(note_form.get('priority'), 5)
        self.is_done = self.__check_none(note_form.get('is_done'), False)
        self.repetition = self.__check_none(note_form.get('repetition'), 'N')
        self.category = self.__check_none(note_form.get('category'), 'P')
        self.owning_table_id = self.__check_none(note_form.get('owning_table_id'), 1)

        self.alert = ''

    def is_valid(self):
        creation_time = self.creation_date
        completion_time = self.completion_date
        try:
            self.creation_date = datetime.strptime(creation_time, '%Y-%m-%d %H:%M')
        except ValueError:
            try:
                self.creation_date = datetime.strptime(creation_time, '%Y-%m-%d')
            except ValueError:
                self.alert = 'Wrong creation date format'
        
        try:
            self.completion_date = datetime.strptime(completion_time, '%Y-%m-%d %H:%M')
        except ValueError:
            try:
                self.completion_date = datetime.strptime(completion_time, '%Y-%m-%d')
            except ValueError:
                self.alert = 'Wrong creation date format'

        if type(self.priority) is not int or self.priority > 10 or self.priority < 1:
            self.alert = 'Wrong priority'
        elif type(self.owning_table_id) is not int:
            self.alert = 'Wrong id type'
        elif type(self.is_done) is not bool:
            self.alert = 'is_done should be bool'
        elif self.repetition not in ['D', 'W', 'M', 'Y', 'N']:
            self.alert = 'Wrong repetition format'
        elif self.category not in ['P', 'W', 'F']:
            self.alert = 'Wrong category format'
        
        return True if self.alert == '' else False
    
    def save(self):
        db_save = Note(name = self.name,
                       creator = self.creator,
                       content = self.content,
                       creation_date = self.creation_date,
                       completion_date = self.completion_date,
                       priority = self.priority,
                       is_done = self.is_done,
                       repetition = self.repetition,
                       category = self.category,
                       owning_table_id = self.owning_table_id)
        db_save.save()

    def reason(self):
        return self.alert
    
    def __check_none(self, parameter, default_value):
        if type(parameter) is type(None):
            return default_value
        else:
            return parameter
