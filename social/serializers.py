# social/serializers.py
from decimal import Decimal
from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from .models import (
    Profile, Post, VerbalPost, Comment, Like, Project,
    Message, Follow, ProjectPhoto, ProjectCalendarEntry, Manifestation,
    ProjectFunding, ProjectBudgetItem, ProjectSupporter
)


# ========== USER & PROFILE ==========

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    follower_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            'id', 'user', 'username', 'user_type', 'bio',
            'profile_image', 'date_joined',
            'follower_count', 'following_count', 'is_following'
        ]

    def get_follower_count(self, obj):
        return Follow.objects.filter(following=obj.user).count()

    def get_following_count(self, obj):
        return Follow.objects.filter(follower=obj.user).count()

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Follow.objects.filter(
                follower=request.user,
                following=obj.user
            ).exists()
        return False


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['bio', 'profile_image', 'user_type']


# ========== POSTS ==========

class PostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    profile_image = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    post_type = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'user', 'username', 'profile_image',
            'image', 'caption', 'created_at',
            'like_count', 'comment_count', 'is_liked', 'post_type'
        ]

    def get_profile_image(self, obj):
        if hasattr(obj.user, 'profile') and obj.user.profile.profile_image:
            return obj.user.profile.profile_image.url
        return None

    def get_like_count(self, obj):
        ct = ContentType.objects.get_for_model(Post)
        return Like.objects.filter(content_type=ct, object_id=obj.id).count()

    def get_comment_count(self, obj):
        ct = ContentType.objects.get_for_model(Post)
        return Comment.objects.filter(content_type=ct, object_id=obj.id).count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            ct = ContentType.objects.get_for_model(Post)
            return Like.objects.filter(
                user=request.user, content_type=ct, object_id=obj.id
            ).exists()
        return False

    def get_post_type(self, obj):
        return 'image'


class PostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['image', 'caption']


# ========== VERBAL POSTS (Verbalise) ==========

class VerbalPostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    profile_image = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    post_type = serializers.SerializerMethodField()

    class Meta:
        model = VerbalPost
        fields = [
            'id', 'user', 'username', 'profile_image',
            'content', 'created_at',
            'like_count', 'comment_count', 'is_liked', 'post_type'
        ]

    def get_profile_image(self, obj):
        if hasattr(obj.user, 'profile') and obj.user.profile.profile_image:
            return obj.user.profile.profile_image.url
        return None

    def get_like_count(self, obj):
        ct = ContentType.objects.get_for_model(VerbalPost)
        return Like.objects.filter(content_type=ct, object_id=obj.id).count()

    def get_comment_count(self, obj):
        ct = ContentType.objects.get_for_model(VerbalPost)
        return Comment.objects.filter(content_type=ct, object_id=obj.id).count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            ct = ContentType.objects.get_for_model(VerbalPost)
            return Like.objects.filter(
                user=request.user, content_type=ct, object_id=obj.id
            ).exists()
        return False

    def get_post_type(self, obj):
        return 'verbalise'


class VerbalPostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerbalPost
        fields = ['content']


# ========== COMMENTS ==========

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'username', 'content', 'created_at']


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['content']


# ========== PROJECT FUNDING ==========

class ProjectBudgetItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectBudgetItem
        fields = ['id', 'category', 'amount', 'description']


class ProjectSupporterSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = ProjectSupporter
        fields = ['id', 'display_name', 'amount', 'message', 'created_at']

    def get_display_name(self, obj):
        if obj.is_anonymous:
            return 'Anonymous'
        if obj.user:
            return obj.user.username
        return obj.name or 'Anonymous'


class ProjectFundingSerializer(serializers.ModelSerializer):
    budget_items = ProjectBudgetItemSerializer(many=True, read_only=True)
    recent_supporters = serializers.SerializerMethodField()
    percentage = serializers.SerializerMethodField()
    is_funded = serializers.SerializerMethodField()

    class Meta:
        model = ProjectFunding
        fields = [
            'id', 'goal', 'raised', 'supporter_count',
            'budget_items', 'recent_supporters',
            'percentage', 'is_funded'
        ]

    def get_recent_supporters(self, obj):
        supporters = obj.supporters.order_by('-created_at')[:5]
        return ProjectSupporterSerializer(supporters, many=True).data

    def get_percentage(self, obj):
        if obj.goal > 0:
            return min(round((obj.raised / obj.goal) * 100), 100)
        return 0

    def get_is_funded(self, obj):
        return obj.raised >= obj.goal


class ProjectSupportCreateSerializer(serializers.Serializer):
    amount = serializers.DecimalField(
        max_digits=10, decimal_places=2,
        min_value=Decimal('0.01')  # Must be at least $0.01 - prevents negative donations
    )
    message = serializers.CharField(required=False, allow_blank=True)
    is_anonymous = serializers.BooleanField(default=False)


# ========== PROJECT PHOTOS ==========

class ProjectPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectPhoto
        fields = ['id', 'image', 'caption', 'uploaded_at']


# ========== PROJECT CALENDAR ==========

class ProjectCalendarEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectCalendarEntry
        fields = ['id', 'date', 'content', 'created_at']


# ========== PROJECTS ==========

class ProjectListSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    progress_percent = serializers.SerializerMethodField()
    funding = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'cover_photo',
            'project_type', 'status', 'budget_type',
            'start_date', 'end_date', 'creator',
            'progress_percent', 'funding'
        ]

    def get_progress_percent(self, obj):
        if obj.start_date and obj.end_date:
            from django.utils import timezone
            today = timezone.localdate()
            total_days = (obj.end_date - obj.start_date).days
            if total_days > 0:
                elapsed = (today - obj.start_date).days
                return max(0, min(100, int((elapsed / total_days) * 100)))
        return None

    def get_funding(self, obj):
        # ProjectFunding is OneToOne; if it doesn't exist yet, accessing obj.funding can crash.
        try:
            funding = obj.funding
        except ProjectFunding.DoesNotExist:
            funding = None

        if not funding:
            return {"enabled": False}

        goal = funding.goal or 0
        raised = funding.raised or 0
        percentage = min(round((raised / goal) * 100), 100) if goal > 0 else 0

        return {
            "enabled": True,
            "goal": goal,
            "raised": raised,
            "percentage": percentage,
            "is_funded": raised >= goal,
        }


class ProjectDetailSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    collaborators = UserSerializer(many=True, read_only=True)
    photos = ProjectPhotoSerializer(many=True, read_only=True)
    calendar_entries = ProjectCalendarEntrySerializer(many=True, read_only=True)
    manifestations = serializers.StringRelatedField(many=True)
    progress_percent = serializers.SerializerMethodField()
    funding = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'cover_photo',
            'project_type', 'status', 'budget_type',
            'start_date', 'end_date',
            'creator', 'collaborators', 'manifestations',
            'photos', 'calendar_entries',
            'progress_percent', 'days_remaining', 'funding'
        ]

    def get_progress_percent(self, obj):
        if obj.start_date and obj.end_date:
            from django.utils import timezone
            today = timezone.localdate()
            total_days = (obj.end_date - obj.start_date).days
            if total_days > 0:
                elapsed = (today - obj.start_date).days
                return max(0, min(100, int((elapsed / total_days) * 100)))
        return None

    def get_days_remaining(self, obj):
        if obj.end_date:
            from django.utils import timezone
            today = timezone.localdate()
            return (obj.end_date - today).days
        return None

    def get_funding(self, obj):
        try:
            funding = obj.funding
        except ProjectFunding.DoesNotExist:
            funding = None

        if not funding:
            return {'enabled': False}

        goal = funding.goal or 0
        raised = funding.raised or 0
        percentage = min(round((raised / goal) * 100), 100) if goal > 0 else 0

        return {
            'enabled': True,
            'goal': goal,
            'raised': raised,
            'percentage': percentage,
            'is_funded': raised >= goal
        }


class ProjectCreateSerializer(serializers.ModelSerializer):
    enable_funding = serializers.BooleanField(write_only=True, required=False, default=False)
    funding_goal = serializers.DecimalField(
        max_digits=10, decimal_places=2,
        write_only=True, required=False
    )

    class Meta:
        model = Project
        fields = [
            'id',  # ✅ so React can redirect to /projects/<id>
            'title', 'description', 'cover_photo',
            'project_type', 'status', 'budget_type',
            'start_date', 'end_date',
            'enable_funding', 'funding_goal'
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        enable_funding = validated_data.pop('enable_funding', False)
        funding_goal = validated_data.pop('funding_goal', None)

        project = super().create(validated_data)

        if enable_funding and funding_goal:
            ProjectFunding.objects.create(
                project=project,
                goal=funding_goal
            )

        return project


# ========== FOLLOW ==========

class FollowSerializer(serializers.ModelSerializer):
    follower = UserSerializer(read_only=True)
    following = UserSerializer(read_only=True)

    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'created_at']


# ========== MESSAGES ==========

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'recipient', 'subject', 'body',
            'is_read', 'parent', 'created_at'
        ]


class MessageCreateSerializer(serializers.ModelSerializer):
    recipient_username = serializers.CharField(write_only=True)

    class Meta:
        model = Message
        fields = ['recipient_username', 'subject', 'body', 'parent']

    def create(self, validated_data):
        recipient_username = validated_data.pop('recipient_username')
        try:
            recipient = User.objects.get(username=recipient_username)
        except User.DoesNotExist:
            raise serializers.ValidationError({'recipient_username': 'User not found'})
        validated_data['recipient'] = recipient
        return super().create(validated_data)


# ========== FEED (Combined Posts) ==========

class FeedItemSerializer(serializers.Serializer):
    """Unified serializer for feed items (both Post and VerbalPost)"""
    id = serializers.IntegerField()
    post_type = serializers.CharField()
    user = UserSerializer()
    username = serializers.CharField()
    profile_image = serializers.CharField(allow_null=True)
    created_at = serializers.DateTimeField()
    like_count = serializers.IntegerField()
    comment_count = serializers.IntegerField()
    is_liked = serializers.BooleanField()

    # Image post fields
    image = serializers.CharField(allow_null=True)
    caption = serializers.CharField(allow_null=True)

    # Verbal post fields
    content = serializers.CharField(allow_null=True)
