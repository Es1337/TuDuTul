from tudutul.models import Note

class NoteForm:

    def __init__(self, note_form, login):
        self.creator = login
        self.name = note_form.get('table_name')
        self.content = note_form.get('content')
        self.creation_date = note_form.get('creation_date')
        self.completion_date = note_form.get('completion_date')
        self.priority = note_form.get('priority')
        self.is_done = note_form.get('is_done')
        self.repetition = note_form.get('repetition')
        self.category = note_form.get('category')
        self.owning_table_id = note_form.get('owning_table_id')
