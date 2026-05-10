from django.forms import ModelForm, TextInput, SelectMultiple, DateTimeInput
from .models import Group, Student, Lesson


class GroupForm(ModelForm):
    class Meta:
        model = Group
        fields = ['name', 'subjects']
        widgets = {'name': TextInput(attrs={ 'placeholder': 'Имя группы'}),
                   'subjects': SelectMultiple(attrs={ 'size': 5}),}

class StudentForm(ModelForm):
    class Meta:
        model = Student
        fields = ['first_name', 'last_name']
        widgets = {'first_name': TextInput(attrs={ 'placeholder': 'Имя'}),
                   'last_name': TextInput(attrs={ 'placeholder': 'Фамилия'})}

class LessonForm(ModelForm):
    class Meta:
        model = Lesson
        fields = ['date', 'topic']
        widgets = {'date': DateTimeInput(attrs={'class': 'form-control','placeholder': 'Дата'}),
                   'topic': TextInput(attrs={'placeholder': 'Тема'})}