from django.urls import path
from .views import NoteView
from .views import NoteDetailView

urlpatterns = [
    path('', NoteView.as_view()),
    path('<note_id>', NoteDetailView.as_view())
]
