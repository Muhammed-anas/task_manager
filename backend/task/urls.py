from django.urls import path
from . import views

urlpatterns = [
    path('signup', views.signup, name='signup'),
    path('login', views.login, name='login'),
    path('tasks', views.TaskListCreateView.as_view(), name='task-list'),
    path('tasks/<int:pk>', views.TaskDetailView.as_view(), name='task-detail'),
]
