from django.db import models
from django.utils import timezone


# Create your models here.
class User(models.Model):
    login = models.CharField(max_length=127, unique=True, primary_key=True)
    email = models.EmailField(max_length=127, unique=True)
    password = models.CharField(max_length=255)
    friends_list = models.ManyToManyField('self')
    # TODO default table
    # default_table = models.OneToOneField(Table, on_delete=models.CASCADE)


class Note(models.Model):
    name = models.CharField(max_length=30)
    creator = models.CharField(max_length=127)
    content = models.CharField(max_length=1023)
    creation_date = models.DateTimeField(default=timezone.now)
    completion_date = models.DateTimeField()
    priority = models.IntegerField()
    owning_table_id = models.IntegerField()
    is_done = models.BooleanField(default=False)

    NOTE_REPETITION_CHOICES = (('D', 'Daily'), ('W', 'Weekly'), ('M', 'Monthly'), ('Y', 'Yearly'), ('N', 'No repetition'))
    repetition = models.CharField(max_length=1, choices=NOTE_REPETITION_CHOICES)

    NOTE_CATEGORY_CHOICES = (('P', 'Personal'), ('W', 'Work'), ('F', 'Family'))
    category = models.CharField(max_length=1, choices=NOTE_CATEGORY_CHOICES)


class Table(models.Model):
    name = models.CharField(max_length=30)
    is_shared = models.BooleanField(default=False)
    owner = models.CharField(max_length=127)
    shared_with = models.ManyToManyField(User)
