from django.urls import path
from . import views

urlpatterns = [
    path('planner/<int:planner_id>/', views.get_planner, name="get_planner"),
    path('planner/create/', views.create_planner, name="create_planner"),
    path('planner/update/<int:planner_id>/', views.update_planner, name="update_planner"),
    path('planner/delete/<int:planner_id>/', views.delete_planner, name="delete_planner"),
    path('task/create/<int:planner_id>/', views.create_task, name="create_task"),
    path('task/update/<int:task_id>/', views.update_task, name="update_task"),
    path('task/delete/<int:task_id>/', views.delete_task, name="delete_task"),
    path('planner/export/<int:planner_id>/', views.export_planner_to_drive, name="export_planner_to_drive"),
    path('planner/import/', views.import_planner_from_drive, name="import_planner_from_drive"),
]
