from rest_framework import generics
from rest_framework.views import APIView
from .models import Task, Category, ContextEntry
from .serializers import TaskSerializer, CategorySerializer
from rest_framework.response import Response
from rest_framework import status
import openai  # Or adapt for LM Studio
import os
from django.utils import timezone


# GET: Retrieve all tasks
class TaskListView(generics.ListAPIView):
    queryset = Task.objects.all().order_by("-created_at")
    serializer_class = TaskSerializer


# POST: Create new task
class TaskCreateView(generics.CreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer


# PUT || PATCH: Update the task
class TaskUpdateView(APIView):
    def put(self, request, pk):
        try:
            task = Task.objects.get(pk=pk)
        except Task.DoesNotExist:
            return Response(
                {"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = TaskSerializer(task, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        try:
            task = Task.objects.get(pk=pk)
        except Task.DoesNotExist:
            return Response(
                {"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# GET: Retrieve categories/tags
class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class CategoryCreateView(generics.CreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


# Delete TASK
class TaskDeleteView(APIView):
    def delete(self, request, pk):
        try:
            task = Task.objects.get(pk=pk)
            task.delete()
            return Response(
                {"message": "Task deleted successfully."},
                status=status.HTTP_204_NO_CONTENT,
            )
        except Task.DoesNotExist:
            return Response(
                {"error": "Task not found."}, status=status.HTTP_404_NOT_FOUND
            )


# AI Suggestion
openai.api_key = os.getenv("OPENAI_API_KEY")  # Or set directly


class AISuggestionView(APIView):
    def post(self, request):
        task = request.data.get("task", {})
        context = request.data.get("context", [])

        if not task:
            return Response({"error": "Task details are required"}, status=400)

        prompt = self.construct_prompt(task, context)

        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",  # or "gpt-4" if you have access
                messages=[
                    {
                        "role": "system",
                        "content": "You are a smart task management assistant.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_tokens=500,
            )

            ai_message = response.choices[0].message["content"]
            suggestions = self.parse_response(ai_message)

            return Response(suggestions, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def construct_prompt(self, task, context):
        task_desc = (
            f"Title: {task.get('title')}\nDescription: {task.get('description')}\n"
        )
        context_str = "\n".join([f"- {c}" for c in context]) if context else "None"
        return (
            f"{task_desc}\nContext:\n{context_str}\n\n"
            "Based on the above, suggest:\n"
            "1. A priority score (0 to 1)\n"
            "2. A realistic deadline (in ISO format)\n"
            "3. An enhanced task description\n"
            "4. Suggested categories or tags\n"
            "Reply in JSON format."
        )

    def parse_response(self, ai_text):
        import json, re

        try:
            return json.loads(ai_text)
        except json.JSONDecodeError:
            # Try extracting JSON from messy output
            match = re.search(r"\{.*\}", ai_text, re.DOTALL)
            if match:
                return json.loads(match.group())
            else:
                return {"error": "AI response not in valid JSON format"}


class NextBestTaskView(APIView):
    def get(self, request):
        # 1. Filter only pending or in-progress tasks
        tasks = Task.objects.filter(status__in=["pending", "in_progress"])

        # 2. Score each task based on deadline and priority_score
        ranked = sorted(
            tasks,
            key=lambda t: (
                -t.priority_score,  # higher score = more important
                (
                    t.deadline if t.deadline else now() + timedelta(days=9999)
                ),  # sooner = better
            ),
        )

        if not ranked:
            return Response({"message": "No pending tasks found."}, status=404)

        best_task = ranked[0]
        serializer = TaskSerializer(best_task)
        return Response(serializer.data, status=200)


# views.py
class AITaskRecommendationView(APIView):
    def get(self, request):
        tasks = Task.objects.filter(status__in=["pending", "in_progress"])
        if not tasks.exists():
            return Response({"detail": "No tasks available"}, status=204)

        def task_score(task):
            score = task.priority_score or 0
            if task.deadline:
                days_left = (task.deadline.date() - timezone.now().date()).days
                if days_left < 0:
                    score -= abs(days_left)  # penalty for being overdue
                else:
                    score += max(0, 10 - days_left)
            return score

        best_task = max(tasks, key=task_score)
        return Response(TaskSerializer(best_task).data)
