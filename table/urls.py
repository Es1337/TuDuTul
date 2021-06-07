from django.urls import path
from table.views import TableView, TableDetailView

urlpatterns = [
    path('', TableView.as_view()),
    path('<table_id>', TableDetailView.as_view())
]
