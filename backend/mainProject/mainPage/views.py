import json
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_POST, require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import PermissionDenied
from django.db.models import Q, Avg
from datetime import datetime

from .models import *
from .forms import *
from authentication.models import User, Role

# ==========================================================
# СУЩЕСТВУЮЩИЕ VIEW (Django Templates + HTMX)
# ==========================================================

@login_required
def mainPage(request):
    if request.method == 'POST' and request.user.role != 'admin':
        raise PermissionDenied("У вас нет прав на создание группы.")
    groups = Group.objects.all()
    error = None
    if request.method == 'POST':
        form = GroupForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('mainPage')
        else:
            error = 'Ошибка'
    else:
        form = GroupForm()

    return render(request, 'mainPage/mainPage.html', {'form':form,'groups': groups, 'error':error})

@login_required
def listOfSubjects(request, pk):
    group = get_object_or_404(Group, id=pk)
    form = StudentForm()
    error = None
    if request.method == 'POST':
        form = StudentForm(request.POST)
        if form.is_valid():
            student = form.save(commit=False)
            student.group = group
            student.save()
            return redirect('group_detail', pk)
        else:
            error = 'Ошибка'
    return render(request, 'mainPage/listOfSubjects.html', {'group': group, 'form': form, 'error': error})

@login_required
def table(request, pk, name):
    group = get_object_or_404(Group, id=pk)
    subject = get_object_or_404(Subject, name=name)
    lessons = Lesson.objects.filter(group=group, subject=subject).order_by('date')
    students = Student.objects.filter(group=group).order_by('last_name', 'first_name')

    for student in students:
        student.grades_list = []
        for lesson in lessons:
            grade = Grade.objects.filter(lesson=lesson, student=student).first()
            student.grades_list.append({'grade': grade, 'lesson': lesson})

    form = LessonForm()
    error = None
    if request.method == 'POST':
        form = LessonForm(request.POST)
        if form.is_valid():
            lesson = form.save(commit=False)
            lesson.subject = subject
            lesson.group = group
            lesson.save()
            for student in students:
                Grade.objects.get_or_create(
                    lesson=lesson,
                    student=student,
                    defaults={'attendance': Attendance.PRESENT}
                )
            return redirect('table', pk, name)
        else:
            error = 'Ошибка сохранения'

    context = {
        'group': group,
        'subject': subject,
        'lessons': lessons,
        'students': students,
        'form': form,
        'error': error,
    }
    return render(request, 'mainPage/table.html', context)

@require_POST
@login_required
def update_grade(request):
    if request.user.role not in ('admin', 'teacher'):
        return HttpResponse("Forbidden", status=403)

    lesson_id = request.POST.get('lesson_id')
    student_id = request.POST.get('student_id')
    new_value = request.POST.get('value')
    new_attendance = request.POST.get('attendance')

    lesson = get_object_or_404(Lesson, id=lesson_id)
    student = get_object_or_404(Student, id=student_id)

    grade, created = Grade.objects.get_or_create(
        lesson=lesson,
        student=student,
        defaults={'attendance': new_attendance, 'value': int(new_value) if new_value else None}
    )
    if not created:
        grade.value = int(new_value) if new_value else None
        grade.attendance = new_attendance
        grade.save()

    return render(request, 'mainPage/grade_cell.html', {
        'grade': grade,
        'lesson': lesson,
        'student': student,
    })

@login_required
def listOfPayout(request, pk):
    if request.user.role != 'admin':
        return HttpResponse("Forbidden", status=403)

    group = get_object_or_404(Group, id=pk)
    now = datetime.now()
    month = int(request.GET.get('month', now.month))
    year = int(request.GET.get('year', now.year))

    MROT = 27093
    DISTANCE_SCHOLARSHIP = 22440

    lessons_dates = Lesson.objects.filter(
        group=group,
        date__year=year,
        date__month=month
    ).dates('date', 'day')
    work_days_count = lessons_dates.count()
    work_days_list = list(lessons_dates)

    students = Student.objects.filter(group=group).order_by('last_name', 'first_name')

    results = []
    for student in students:
        grades_qs = Grade.objects.filter(
            student=student,
            lesson__group=group,
            lesson__date__year=year,
            lesson__date__month=month,
            value__isnull=False
        )
        avg_grade = grades_qs.aggregate(Avg('value'))['value__avg'] or 0

        if group.is_distance:
            base_scholarship = DISTANCE_SCHOLARSHIP
        else:
            if avg_grade < 3.0:
                base_scholarship = MROT
            elif avg_grade <= 3.79:
                base_scholarship = 31250
            elif avg_grade <= 4.79:
                base_scholarship = 33750
            else:
                base_scholarship = 35000

        day_status = {}
        for date in work_days_list:
            grades_day = Grade.objects.filter(
                student=student,
                lesson__group=group,
                lesson__date=date
            )
            statuses = []
            for g in grades_day:
                if g.value is not None:
                    statuses.append('present')
                else:
                    statuses.append(g.attendance)

            if 'absent' in statuses:
                day_status[date] = 'absent'
            elif 'sick' in statuses:
                day_status[date] = 'sick'
            elif 'do' in statuses:
                day_status[date] = 'do'
            elif 'present' in statuses:
                day_status[date] = 'present'
            else:
                day_status[date] = 'absent'

        present_days = sum(1 for st in day_status.values() if st == 'present')
        sick_days    = sum(1 for st in day_status.values() if st == 'sick')
        absent_days  = sum(1 for st in day_status.values() if st == 'absent')
        do_days      = sum(1 for st in day_status.values() if st == 'do')

        if absent_days > 0 and not group.is_distance:
            base_scholarship = MROT

        if work_days_count > 0:
            scholarship = (
                (base_scholarship / work_days_count) * present_days +
                (MROT / work_days_count) * sick_days +
                (MROT / work_days_count) * absent_days
            )
        else:
            scholarship = 0

        results.append({
            'student': student,
            'avg_grade': round(avg_grade, 2),
            'present_days': present_days,
            'sick_days': sick_days,
            'absent_days': absent_days,
            'do_days': do_days,
            'scholarship': round(scholarship, 2),
            'work_days_count': work_days_count,
        })

    context = {
        'group': group,
        'results': results,
        'month': month,
        'year': year,
        'work_days_count': work_days_count,
        'is_distance': group.is_distance,
    }
    return render(request, 'mainPage/payout_list.html', context)


# ==========================================================
# 🔌 JSON API ДЛЯ REACT (ПОЛНЫЙ НАБОР С НОВЫМИ СВЯЗЯМИ)
# ==========================================================

@csrf_exempt
@require_http_methods(["POST"])
def api_login(request):
    """Вход для React."""
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
                'username': user.login
            })
        return JsonResponse({'status': 'error', 'message': 'Неверный логин или пароль.'}, status=401)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@require_http_methods(["POST"])
@login_required
def api_logout(request):
    """Выход для React."""
    logout(request)
    return JsonResponse({'status': 'success'})

@csrf_exempt
@require_http_methods(["POST"])
@login_required
def api_register(request):
    """Создание пользователя с привязкой к группам/предметам"""
    if request.user.role != 'admin':
        return JsonResponse({'status': 'error', 'message': 'Только администратор может создавать пользователей.'}, status=403)
    try:
        data = json.loads(request.body)
        login_str = data.get('login')
        password = data.get('password')
        name = data.get('name')
        surname = data.get('surname')
        role = data.get('role', 'student')

        if not all([login_str, password, name, surname]):
            return JsonResponse({'status': 'error', 'message': 'Заполните все обязательные поля.'}, status=400)
        if User.objects.filter(login=login_str).exists():
            return JsonResponse({'status': 'error', 'message': 'Пользователь с таким логином уже существует.'}, status=400)

        user = User.objects.create_user(login=login_str, password=password, name=name, surname=surname, role=role)

        # Привязка студента к группе
        if role == 'student' and data.get('group_id'):
            user.group_id = data['group_id']
        # Привязка учителя к группам и предметам
        elif role == 'teacher':
            if data.get('assigned_group_ids'):
                user.assigned_groups.set(data['assigned_group_ids'])
            if data.get('assigned_subject_ids'):
                user.assigned_subjects.set(data['assigned_subject_ids'])
        # Привязка куратора к группам
        elif role == 'curator':
            if data.get('curated_group_ids'):
                user.curated_groups.set(data['curated_group_ids'])

        user.save()
        return JsonResponse({'status': 'success', 'message': 'Пользователь создан', 'user_id': user.id, 'role': user.role})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@login_required
def api_update_teacher_assignments(request):
    """Изменение назначений учителя (группы, предметы, кураторство)"""
    if request.user.role != 'admin':
        return JsonResponse({'status': 'error', 'message': 'Только администратор может менять назначения.'}, status=403)
    try:
        data = json.loads(request.body)
        teacher_id = data.get('teacher_id')
        teacher = get_object_or_404(User, id=teacher_id, role='teacher')

        if 'assigned_group_ids' in data:
            teacher.assigned_groups.set(data['assigned_group_ids'])
        if 'assigned_subject_ids' in data:
            teacher.assigned_subjects.set(data['assigned_subject_ids'])
        if 'curated_group_ids' in data:
            teacher.curated_groups.set(data['curated_group_ids'])
            
        return JsonResponse({'status': 'success', 'message': 'Назначения обновлены'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@login_required
def api_get_current_teacher(request):
    """Возвращает данные текущего учителя (назначения)"""
    if request.user.role != 'teacher':
        return JsonResponse({'status': 'error', 'message': 'Только для учителей'}, status=403)
    
    return JsonResponse({
        'id': request.user.id,
        'assigned_groups': list(request.user.assigned_groups.values('id', 'name', 'is_distance')),
        'assigned_subjects': list(request.user.assigned_subjects.values('id', 'name')),
        'curated_groups': list(request.user.curated_groups.values('id', 'name', 'is_distance')),
    })

@login_required
def api_manage_groups(request):
    """GET: список групп, POST: создание группы."""
    if request.method == 'GET':
        groups = Group.objects.all().values('id', 'name', 'is_distance')
        return JsonResponse(list(groups), safe=False)
    elif request.method == 'POST':
        if request.user.role != 'admin':
            return JsonResponse({'status': 'error', 'message': 'Только администратор может создавать группы.'}, status=403)
        try:
            data = json.loads(request.body)
            name = data.get('name')
            is_distance = data.get('is_distance', False)
            if not name:
                return JsonResponse({'status': 'error', 'message': 'Укажите название группы.'}, status=400)
            group = Group.objects.create(name=name, is_distance=is_distance)
            return JsonResponse({'status': 'success', 'group_id': group.id, 'name': group.name, 'is_distance': group.is_distance})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@login_required
def api_get_all_subjects(request):
    """Получить все предметы (для выбора админом при назначении учителю)"""
    try:
        subjects = Subject.objects.all().values('id', 'name')
        return JsonResponse(list(subjects), safe=False)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@login_required
def api_get_subjects(request, pk):
    """Предметы конкретной группы."""
    try:
        group = get_object_or_404(Group, id=pk)
        subjects = Subject.objects.filter(group=group).values('id', 'name')
        return JsonResponse(list(subjects), safe=False)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@login_required
def api_get_teachers(request):
    """Список преподавателей с их назначениями"""
    try:
        teachers = User.objects.filter(role='teacher').prefetch_related('assigned_groups', 'assigned_subjects', 'curated_groups')
        data = []
        for t in teachers:
            data.append({
                'id': t.id,
                'login': t.login,
                'name': t.name,
                'surname': t.surname,
                'assigned_groups': list(t.assigned_groups.values('id', 'name')),
                'assigned_subjects': list(t.assigned_subjects.values('id', 'name')),
                'curated_groups': list(t.curated_groups.values('id', 'name'))
            })
        return JsonResponse(data, safe=False)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@login_required
def api_get_students(request):
    """Список студентов с их группой"""
    try:
        students = User.objects.filter(role='student').select_related('group')
        data = []
        for s in students:
            data.append({
                'id': s.id,
                'login': s.login,
                'name': s.name,
                'surname': s.surname,
                'group': {'id': s.group.id, 'name': s.group.name} if s.group else None
            })
        return JsonResponse(data, safe=False)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@login_required
def api_get_table_data(request, pk, name):
    """Данные для таблицы журнала."""
    try:
        group = get_object_or_404(Group, id=pk)
        subject = get_object_or_404(Subject, name=name)
        
        lessons = Lesson.objects.filter(group=group, subject=subject).order_by('date').values('id', 'date', 'topic')
        students = Student.objects.filter(group=group).order_by('last_name', 'first_name').values('id', 'last_name', 'first_name')
        
        grades_qs = Grade.objects.filter(lesson__group=group, lesson__subject=subject)
        grades_dict = {}
        for g in grades_qs:
            key = f"{g.lesson_id}-{g.student_id}"
            grades_dict[key] = {'value': g.value, 'attendance': g.attendance}

        return JsonResponse({
            'lessons': list(lessons),
            'students': list(students),
            'grades': grades_dict
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@require_http_methods(["POST"])
@login_required
def api_update_grade(request):
    """Обновление оценки."""
    if request.user.role not in ('admin', 'teacher'):
        return JsonResponse({'status': 'error', 'message': 'Forbidden'}, status=403)
    try:
        data = json.loads(request.body)
        lesson = get_object_or_404(Lesson, id=data.get('lesson_id'))
        student = get_object_or_404(Student, id=data.get('student_id'))
        grade, created = Grade.objects.get_or_create(
            lesson=lesson, 
            student=student, 
            defaults={'attendance': data.get('attendance'), 'value': int(data.get('value')) if data.get('value') else None}
        )
        if not created:
            grade.value = int(data.get('value')) if data.get('value') else None
            grade.attendance = data.get('attendance')
            grade.save()
        return JsonResponse({'status': 'success', 'grade_id': grade.id})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@login_required
def api_get_payout_data(request, pk):
    """Данные для расчёта стипендий."""
    if request.user.role != 'admin':
        return JsonResponse({'status': 'error', 'message': 'Forbidden'}, status=403)
    try:
        group = get_object_or_404(Group, id=pk)
        now = datetime.now()
        month = int(request.GET.get('month', now.month))
        year = int(request.GET.get('year', now.year))
        MROT = 27093
        DISTANCE_SCHOLARSHIP = 22440
        lessons_dates = Lesson.objects.filter(group=group, date__year=year, date__month=month).dates('date', 'day')
        work_days_count = lessons_dates.count()
        work_days_list = list(lessons_dates)
        students = Student.objects.filter(group=group).order_by('last_name', 'first_name')
        results = []
        for student in students:
            grades_qs = Grade.objects.filter(student=student, lesson__group=group, lesson__date__year=year, lesson__date__month=month, value__isnull=False)
            avg_grade = grades_qs.aggregate(Avg('value'))['value__avg'] or 0
            base_scholarship = DISTANCE_SCHOLARSHIP if group.is_distance else (MROT if avg_grade < 3.0 else 31250 if avg_grade <= 3.79 else 33750 if avg_grade <= 4.79 else 35000)
            day_status = {}
            for date in work_days_list:
                grades_day = Grade.objects.filter(student=student, lesson__group=group, lesson__date=date)
                statuses = ['present' if g.value is not None else g.attendance for g in grades_day]
                if 'absent' in statuses: day_status[date] = 'absent'
                elif 'sick' in statuses: day_status[date] = 'sick'
                elif 'do' in statuses: day_status[date] = 'do'
                elif 'present' in statuses: day_status[date] = 'present'
                else: day_status[date] = 'absent'
            present_days = sum(1 for st in day_status.values() if st == 'present')
            sick_days = sum(1 for st in day_status.values() if st == 'sick')
            absent_days = sum(1 for st in day_status.values() if st == 'absent')
            if absent_days > 0 and not group.is_distance: base_scholarship = MROT
            scholarship = 0
            if work_days_count > 0: scholarship = ((base_scholarship / work_days_count) * present_days + (MROT / work_days_count) * sick_days + (MROT / work_days_count) * absent_days)
            results.append({'student_id': student.id, 'student_name': f"{student.last_name} {student.first_name}", 'avg_grade': round(avg_grade, 2), 'present_days': present_days, 'sick_days': sick_days, 'absent_days': absent_days, 'scholarship': round(scholarship, 2)})
        return JsonResponse({'group_name': group.name, 'month': month, 'year': year, 'results': results})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)