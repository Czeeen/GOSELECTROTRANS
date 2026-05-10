В папке mainProject/authentication/templates/authentication хранится html шаблон для регистрации пользователя

В папке mainProject/mainPage/templates/mainPage хранятся: mainPage.html главная страница после аутентификации (список групп), listOfSubjects.html список предметов для данной группы, table.html шаблон для таблиц, grade_cell.html htmx объект для обновления оценок и посещаемости

В папке /authentication/static/authentication храниncя статичекий контент. Все новые статические объекты должны быть созданы подобным образом nameOfApp/static/nameOfApp/nameStaticType/. Пример: /mainPage/static/mainPage/css/mainPage.css

Для подключения в html шаблон static файлов, пользуемся {% load static %}

Логин/пароль админа: lol/lol
