from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Subject(models.Model):
    name = models.CharField(max_length=50,unique=True, verbose_name='Предмет (английское название)', default='default')
    nameRussian =models.CharField(max_length=50, unique=True, verbose_name='Предмет')

    def __str__(self):
        return self.nameRussian

    class Meta:
        verbose_name = 'Предмет'  # название модели в единственном числе
        verbose_name_plural = 'Предметы'  # во множественном числе

class Group(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name='Имя группы')
    subjects= models.ManyToManyField(Subject, related_name='groups', verbose_name='Предметы')#позволяет связать один объект с несколькими объектами того же типа
    is_distance = models.BooleanField(default=False, verbose_name='Дистанционное обучение')
    class Meta:
        verbose_name = 'Группа'
        verbose_name_plural = 'Группы'

    def __str__(self):
        return self.name

class Student(models.Model):
    first_name = models.CharField(max_length=50, verbose_name='Имя')
    last_name = models.CharField(max_length=50, verbose_name='Фамилия')
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='students', verbose_name='Группа')
    class Meta:
        verbose_name = 'Студент'
        verbose_name_plural = 'Студенты'
    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Lesson(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='lessons', verbose_name='Имя группы')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='lessons', verbose_name='Предмет')
    date = models.DateField(verbose_name='Дата')
    topic = models.CharField(max_length=200, blank=True, verbose_name='Тема')  # тема урока

    class Meta:
        unique_together = ('group', 'subject', 'date')  # один урок на группу-предмет-дату
        verbose_name = 'Урок'
        verbose_name_plural = 'Уроки'

    def __str__(self):
        return f"{self.group} - {self.subject} - {self.date}"

class Attendance(models.TextChoices):
    PRESENT = 'present', 'Явка'
    ABSENT = 'absent', 'Не был'
    SICK = 'sick', 'Больничный'
    DO = 'do', 'ДО'

class Grade(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='grades', verbose_name='Урок')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='grades', verbose_name='Студент')
    value = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(2), MaxValueValidator(5)],
        null=True, blank=True   # оценка может отсутствовать
        , verbose_name='Оценка'
    )
    attendance = models.CharField(
        max_length=20,
        choices=Attendance.choices,
        default=Attendance.PRESENT,
        verbose_name='Посещаемость'
    )

    def __str__(self):
        return f"{self.lesson} - {self.student}"
    class Meta:
        unique_together = ('lesson', 'student')  # у одного ученика на уроке может быть только одна оценка
        verbose_name = 'Оценка'
        verbose_name_plural = 'Оценки'