from django.contrib import admin
from .models import Subject, Group, Student, Lesson, Grade

admin.site.register(Subject)
admin.site.register(Group)
admin.site.register(Student)
admin.site.register(Lesson)
admin.site.register(Grade)