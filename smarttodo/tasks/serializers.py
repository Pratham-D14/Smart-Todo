from rest_framework import serializers
from .models import Task, Category, ChecklistItem, Tag


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class ChecklistItemSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)

    class Meta:
        model = ChecklistItem
        fields = ["id", "text", "completed"]


class TaskSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="category", write_only=True
    )
    category_name = serializers.CharField(write_only=True, required=False)
    priority = serializers.CharField(
        write_only=True, required=False
    )  # Ignored unless needed
    aiScore = serializers.IntegerField(write_only=True, required=False)
    createdAt = serializers.DateTimeField(write_only=True, required=False)
    updatedAt = serializers.DateTimeField(write_only=True, required=False)
    checklist_items = ChecklistItemSerializer(many=True, required=False)
    tags = serializers.SlugRelatedField(
        many=True, slug_field="name", queryset=Tag.objects.all()
    )

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "category",
            "category_id",
            "category_name",
            "priority",
            "aiScore",
            "createdAt",
            "updatedAt",
            "priority_score",
            "deadline",
            "status",
            "tags",
            "checklist_items",
        ]

    def create(self, validated_data):
        tags_data = validated_data.pop("tags", [])
        checklist_data = validated_data.pop("checklist_items", [])
        validated_data.pop("checklist_items", None)  # ✅ Prevent reverse side error

        # Optional fields from frontend
        validated_data.pop("priority", None)
        validated_data.pop("aiScore", None)
        validated_data.pop("createdAt", None)
        validated_data.pop("updatedAt", None)

        task = Task.objects.create(**validated_data)

        for tag_name in tags_data:
            tag, _ = Tag.objects.get_or_create(name=tag_name)
            task.tags.add(tag)

        for item in checklist_data:
            ChecklistItem.objects.create(task=task, **item)

        return task

    def update(self, instance, validated_data):
        tags_data = validated_data.pop("tags", None)

        checklist_data = validated_data.pop(
            "checklist_items", None
        )  # 👈 if using source

        # Remove frontend-only fields
        validated_data.pop("priority", None)
        validated_data.pop("category_name", None)
        validated_data.pop("aiScore", None)
        validated_data.pop("createdAt", None)
        validated_data.pop("updatedAt", None)

        # ✅ Avoid setting reverse fields like checklist_items
        for attr, value in validated_data.items():
            if attr != "checklist_items":  # prevent TypeError
                setattr(instance, attr, value)
        instance.save()

        # ✅ Update tags
        if tags_data is not None:
            instance.tags.clear()
            for tag_name in tags_data:
                tag, _ = Tag.objects.get_or_create(name=tag_name)
                instance.tags.add(tag)

        # ✅ Update checklist items
        if checklist_data is not None:
            existing_items = {
                str(item.id): item for item in instance.checklist_items.all()
            }
            incoming_ids = set()

            for item_data in checklist_data:
                item_id = str(item_data.get("id", ""))
                if item_id and item_id in existing_items:
                    # Update existing item
                    item = existing_items[item_id]
                    item.text = item_data.get("text", item.text)
                    item.completed = item_data.get("completed", item.completed)
                    item.save()
                    incoming_ids.add(item_id)
                else:
                    # Create new item
                    item_data.pop("id", None)
                    new_item = ChecklistItem.objects.create(task=instance, **item_data)
                    incoming_ids.add(str(new_item.id))

            # Delete removed items
            for item_id, item in existing_items.items():
                if item_id not in incoming_ids:
                    item.delete()

        return instance
