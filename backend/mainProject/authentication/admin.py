from django.contrib import admin
from .models import User
# Register your models here.


from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from .models import User

#admin.site.register(User)

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('login', 'name', 'surname', 'role')

class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = '__all__'

class UserAdmin(BaseUserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = User
    list_display = ('login', 'name', 'surname', 'role', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')
    fieldsets = (
        (None, {'fields': ('login', 'password')}),
        ('Персональная информация', {'fields': ('name', 'surname', 'role')}),
        ('Права доступа', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('login', 'name', 'surname', 'role', 'password1', 'password2', 'is_active')}
        ),
    )
    search_fields = ('name',)
    ordering = ('name',)

admin.site.register(User, UserAdmin)