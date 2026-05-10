from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json

# ==========================================================
# Django Template View (для /login/ страницы)
# ==========================================================
def user_login(request):
    """Обычный вход через Django шаблон (если используется)"""
    error = None
    if request.method == 'POST':
        login_input = request.POST.get('login')
        password = request.POST.get('password')

        user = authenticate(request, username=login_input, password=password)

        if user is not None:
            login(request, user)
            return redirect('mainPage')  # Перенаправление после успешного входа
        else:
            error = 'Неверный логин или пароль'
    
    return render(request, 'authentication/login.html', {'error': error})


# ==========================================================
# API Views для React (опционально, если нужно)
# ==========================================================

@csrf_exempt
@require_http_methods(["POST"])
def api_login(request):
    """Вход для React-фронтенда"""
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return JsonResponse({'status': 'error', 'message': 'Заполните логин и пароль.'}, status=400)
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            return JsonResponse({
                'status': 'success',
                'role': getattr(user, 'role', 'student'),
                'username': user.login if hasattr(user, 'login') else user.username
            })
        return JsonResponse({'status': 'error', 'message': 'Неверный логин или пароль.'}, status=401)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


@require_http_methods(["POST"])
@login_required
def api_logout(request):
    """Выход для React-фронтенда"""
    from django.contrib.auth import logout
    logout(request)
    return JsonResponse({'status': 'success'})