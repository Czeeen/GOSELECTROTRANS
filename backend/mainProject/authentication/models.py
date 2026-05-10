from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.contrib.auth.models import BaseUserManager


class UserManager(BaseUserManager):
    def create_user(self, login, password=None, **extra_fields):
        if not login:
            raise ValueError('Логин обязателен')
        user = self.model(login=login, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, login, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', Role.ADMIN)
        return self.create_user(login, password, **extra_fields)


class Role(models.TextChoices):
    ADMIN = 'admin', 'Администратор'
    TEACHER = 'teacher', 'Преподаватель'
    CURATOR = 'curator', 'Куратор'
    STUDENT = 'student', 'Студент'


class User(AbstractBaseUser, PermissionsMixin):
    objects = UserManager()
    
    login = models.CharField(max_length=100, unique=True, verbose_name='Логин')
    name = models.CharField(max_length=100, verbose_name='Имя')
    surname = models.CharField(max_length=100, verbose_name='Фамилия')
    role = models.CharField(choices=Role.choices, default=Role.STUDENT, max_length=20, verbose_name='Роль')

    # ==========================================
    # 🆕 НОВЫЕ ПОЛЯ СВЯЗЕЙ (Группы и Предметы)
    # ==========================================

    # 1. Для СТУДЕНТА: в какой группе учится
    group = models.ForeignKey(
        'mainPage.Group', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        verbose_name='Группа (для студента)',
        related_name='students_users' # Уникальное имя, чтобы не конфликтовать
    )

    # 2. Для УЧИТЕЛЯ: какие группы ведет
    assigned_groups = models.ManyToManyField(
        'mainPage.Group',
        related_name='teachers',
        blank=True,
        verbose_name='Ведет группы'
    )

    # 3. Для УЧИТЕЛЯ: какие предметы ведет
    assigned_subjects = models.ManyToManyField(
        'mainPage.Subject',
        related_name='teachers',
        blank=True,
        verbose_name='Ведет предметы'
    )

    # 4. Для КУРАТОРА (учителя): какие группы курирует
    curated_groups = models.ManyToManyField(
        'mainPage.Group',
        related_name='curators',
        blank=True,
        verbose_name='Курируемые группы'
    )

    # ==========================================
    # СТАНДАРТНЫЕ ПОЛЯ AUTH
    # ==========================================
    is_active = models.BooleanField(default=True, verbose_name='Вход на сайт')
    is_staff = models.BooleanField(default=False, verbose_name='Вход в админку')
    is_superuser = models.BooleanField(default=False, verbose_name='Все права')

    USERNAME_FIELD = 'login'
    REQUIRED_FIELDS = ['name', 'surname']

    def save(self, *args, **kwargs):
        # Автоматически устанавливаем права для админа
        if self.role == Role.ADMIN:
            self.is_staff = True
            self.is_superuser = True
        else:
            # Для других ролей сбрасываем права доступа в админку
            if not self.is_superuser:
                self.is_staff = False
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.surname} {self.name} ({self.login})"

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'