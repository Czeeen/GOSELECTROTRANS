from .models import User
from django.forms import ModelForm, TextInput, PasswordInput
from .models import User

class ModelUser(ModelForm):
    class Meta:
        model = User
        fields = ['login', 'password']

        widgets = {'login': TextInput(attrs={'class': 'form-control', 'placeholder': 'Login'}), #bootstrap
                'password': PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Password'}),}