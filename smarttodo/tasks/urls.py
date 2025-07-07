from django.urls import path
from .views import (
    TaskListView,
    TaskCreateView,
    TaskUpdateView,
    CategoryListView,
    CategoryCreateView,
    AISuggestionView,
    TaskDeleteView,
    NextBestTaskView,
    AITaskRecommendationView,
)

urlpatterns = [
    path("tasks", TaskListView.as_view(), name="task-list"),
    path("tasks/create", TaskCreateView.as_view(), name="task-create"),
    path("categories", CategoryListView.as_view(), name="category-list"),
    path("tasks/<int:pk>/update", TaskUpdateView.as_view(), name="task-update"),
    path("categories/create", CategoryCreateView.as_view(), name="category-create"),
    path("ai/suggestions", AISuggestionView.as_view(), name="ai-suggestions"),
    path("tasks/<int:pk>/delete", TaskDeleteView.as_view(), name="task-delete"),
    path("tasks/next-best", NextBestTaskView.as_view(), name="next-best-task"),
    path("tasks/recommend", AITaskRecommendationView.as_view(), name="recommend-task"),
]
