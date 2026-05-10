from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', include('authentication.urls')),
    
    # ✅ API маршруты для React (с префиксом 'api/')
    path('api/', include('mainPage.urls')),
    
    # ✅ Обычные маршруты для Django шаблонов (с префиксом 'main/')
    path('main/', include('mainPage.urls')),
    
    path('', RedirectView.as_view(url='/login/', permanent=False), name='root')
]