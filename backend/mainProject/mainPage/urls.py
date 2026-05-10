from django.urls import path
from . import views
from django.contrib.auth.views import LogoutView

urlpatterns = [
    # ==========================================
    # 🔌 API маршруты для React (АВТОРИЗАЦИЯ И ПОЛЬЗОВАТЕЛИ)
    # ==========================================
    path('auth/login/', views.api_login, name='api_login'),
    path('auth/logout/', views.api_logout, name='api_logout'),
    path('auth/register/', views.api_register, name='api_register'),
    path('auth/update-teacher-assignments/', views.api_update_teacher_assignments, name='api_update_teacher_assignments'),
    path('teachers/me/', views.api_get_current_teacher, name='api_current_teacher'),
    
    # ==========================================
    # 🔌 API маршруты для React (ДАННЫЕ)
    # ==========================================
    path('groups/', views.api_manage_groups, name='api_groups'),
    path('groups/<int:pk>/subjects/', views.api_get_subjects, name='api_subjects'),
    path('groups/<int:pk>/subjects/<str:name>/table/', views.api_get_table_data, name='api_table_data'),
    path('groups/<int:pk>/payout/', views.api_get_payout_data, name='api_payout_data'),
    
    path('grades/update/', views.api_update_grade, name='api_update_grade'),
    
    path('teachers/', views.api_get_teachers, name='api_teachers'),
    path('students/', views.api_get_students, name='api_students'),
    path('subjects/all/', views.api_get_all_subjects, name='api_all_subjects'),
    
    # ==========================================
    # 📄 Обычные маршруты для Django Templates / HTMX
    # ==========================================
    path('payout/<int:pk>/', views.listOfPayout, name='listOfPayout'),
    path('update-grade/', views.update_grade, name='update_grade'),
    path('<int:pk>/', views.listOfSubjects, name='group_detail'),
    path('<int:pk>/<str:name>/', views.table, name='table'),
    path('', views.mainPage, name='mainPage'),
    path('logout/', LogoutView.as_view(next_page='login'), name='logout'),
]