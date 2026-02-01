# social/api_views.py
from rest_framework import viewsets, status, generics
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.contenttypes.models import ContentType
from django.shortcuts import get_object_or_404
from django.db.models import Q
from itertools import chain
from operator import attrgetter

from .models import (
    Profile, Post, VerbalPost, Comment, Like, Project,
    Message, Follow, ProjectPhoto, ProjectCalendarEntry,
    ProjectFunding, ProjectBudgetItem, ProjectSupporter
)
from .serializers import (
    UserSerializer, ProfileSerializer, ProfileUpdateSerializer,
    PostSerializer, PostCreateSerializer,
    VerbalPostSerializer, VerbalPostCreateSerializer,
    CommentSerializer, CommentCreateSerializer,
    ProjectListSerializer, ProjectDetailSerializer, ProjectCreateSerializer,
    ProjectPhotoSerializer, ProjectCalendarEntrySerializer,
    ProjectFundingSerializer, ProjectBudgetItemSerializer,
    ProjectSupporterSerializer, ProjectSupportCreateSerializer,
    FollowSerializer, MessageSerializer, MessageCreateSerializer,
    FeedItemSerializer
)


# ========== AUTH VIEWS ==========

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        user_type = request.data.get('user_type', 'artist')

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=400)

        user = User.objects.create_user(username=username, email=email, password=password)
        Profile.objects.create(user=user, user_type=user_type)

        return Response(UserSerializer(user).data, status=201)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return Response({
                'user': UserSerializer(user).data,
                'profile': ProfileSerializer(user.profile, context={'request': request}).data
            })
        return Response({'error': 'Invalid credentials'}, status=401)


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({'message': 'Logged out'})


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'user': UserSerializer(request.user).data,
            'profile': ProfileSerializer(request.user.profile, context={'request': request}).data
        })


# ========== PROFILE VIEWS ==========

class ProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'user__username'
    lookup_url_kwarg = 'username'

    def get_queryset(self):
        return Profile.objects.select_related('user')

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def follow(self, request, username=None):
        profile = self.get_object()
        if profile.user == request.user:
            return Response({'error': 'Cannot follow yourself'}, status=400)

        Follow.objects.get_or_create(follower=request.user, following=profile.user)
        return Response({'status': 'following'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def unfollow(self, request, username=None):
        profile = self.get_object()
        Follow.objects.filter(follower=request.user, following=profile.user).delete()
        return Response({'status': 'unfollowed'})

    @action(detail=True, methods=['get'])
    def posts(self, request, username=None):
        profile = self.get_object()
        # Use select_related to prevent N+1 queries when serializing user data
        posts = Post.objects.filter(user=profile.user).select_related('user', 'user__profile')
        verbal_posts = VerbalPost.objects.filter(user=profile.user).select_related('user', 'user__profile')

        # Combine and sort
        combined = sorted(
            chain(posts, verbal_posts),
            key=attrgetter('created_at'),
            reverse=True
        )

        # Serialize each item with the appropriate serializer
        result = []
        for item in combined:
            if isinstance(item, Post):
                result.append(PostSerializer(item, context={'request': request}).data)
            else:
                result.append(VerbalPostSerializer(item, context={'request': request}).data)

        return Response(result)

    @action(detail=True, methods=['get'])
    def projects(self, request, username=None):
        profile = self.get_object()
        # Use select_related and prefetch_related to prevent N+1 queries
        projects = Project.objects.filter(
            Q(creator=profile.user) | Q(collaborators=profile.user)
        ).select_related('creator').prefetch_related('collaborators', 'manifestations').distinct()
        serializer = ProjectListSerializer(projects, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def followers(self, request, username=None):
        profile = self.get_object()
        followers = Follow.objects.filter(following=profile.user).select_related('follower')
        users = [f.follower for f in followers]
        return Response(UserSerializer(users, many=True).data)

    @action(detail=True, methods=['get'])
    def following(self, request, username=None):
        profile = self.get_object()
        following = Follow.objects.filter(follower=profile.user).select_related('following')
        users = [f.following for f in following]
        return Response(UserSerializer(users, many=True).data)


class ProfileUpdateView(generics.UpdateAPIView):
    serializer_class = ProfileUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.profile


# ========== FEED VIEW ==========

class FeedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get posts from users the current user follows
        following_users = Follow.objects.filter(
            follower=request.user
        ).values_list('following', flat=True)

        # Include user's own posts in feed
        user_ids = list(following_users) + [request.user.id]

        # Use select_related to prevent N+1 queries when serializing user data
        posts = Post.objects.filter(user__in=user_ids).select_related('user', 'user__profile')
        verbal_posts = VerbalPost.objects.filter(user__in=user_ids).select_related('user', 'user__profile')

        # Combine and sort by created_at
        combined = sorted(
            chain(posts, verbal_posts),
            key=attrgetter('created_at'),
            reverse=True
        )[:50]  # Limit to 50 items

        # Serialize
        result = []
        for item in combined:
            if isinstance(item, Post):
                result.append(PostSerializer(item, context={'request': request}).data)
            else:
                result.append(VerbalPostSerializer(item, context={'request': request}).data)

        return Response(result)


# ========== POST VIEWS ==========

class PostViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Use select_related to prevent N+1 queries
        return Post.objects.all().select_related('user', 'user__profile')

    def get_serializer_class(self):
        if self.action == 'create':
            return PostCreateSerializer
        return PostSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        """Only allow users to update their own posts"""
        if serializer.instance.user != self.request.user:
            raise PermissionDenied("You can only edit your own posts")
        serializer.save()

    def perform_destroy(self, instance):
        """Only allow users to delete their own posts"""
        if instance.user != self.request.user:
            raise PermissionDenied("You can only delete your own posts")
        instance.delete()

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        post = self.get_object()
        ct = ContentType.objects.get_for_model(Post)
        like, created = Like.objects.get_or_create(
            user=request.user, content_type=ct, object_id=post.id
        )
        if not created:
            like.delete()
            return Response({'status': 'unliked'})
        return Response({'status': 'liked'})

    @action(detail=True, methods=['get', 'post'])
    def comments(self, request, pk=None):
        post = self.get_object()
        ct = ContentType.objects.get_for_model(Post)

        if request.method == 'POST':
            serializer = CommentCreateSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    user=request.user,
                    content_type=ct,
                    object_id=post.id
                )
                return Response(serializer.data, status=201)
            return Response(serializer.errors, status=400)

        comments = Comment.objects.filter(content_type=ct, object_id=post.id)
        return Response(CommentSerializer(comments, many=True).data)


class VerbalPostViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Use select_related to prevent N+1 queries
        return VerbalPost.objects.all().select_related('user', 'user__profile')

    def get_serializer_class(self):
        if self.action == 'create':
            return VerbalPostCreateSerializer
        return VerbalPostSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        """Only allow users to update their own verbal posts"""
        if serializer.instance.user != self.request.user:
            raise PermissionDenied("You can only edit your own posts")
        serializer.save()

    def perform_destroy(self, instance):
        """Only allow users to delete their own verbal posts"""
        if instance.user != self.request.user:
            raise PermissionDenied("You can only delete your own posts")
        instance.delete()

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        post = self.get_object()
        ct = ContentType.objects.get_for_model(VerbalPost)
        like, created = Like.objects.get_or_create(
            user=request.user, content_type=ct, object_id=post.id
        )
        if not created:
            like.delete()
            return Response({'status': 'unliked'})
        return Response({'status': 'liked'})

    @action(detail=True, methods=['get', 'post'])
    def comments(self, request, pk=None):
        post = self.get_object()
        ct = ContentType.objects.get_for_model(VerbalPost)

        if request.method == 'POST':
            serializer = CommentCreateSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    user=request.user,
                    content_type=ct,
                    object_id=post.id
                )
                return Response(serializer.data, status=201)
            return Response(serializer.errors, status=400)

        comments = Comment.objects.filter(content_type=ct, object_id=post.id)
        return Response(CommentSerializer(comments, many=True).data)


# ========== PROJECT VIEWS ==========

class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Use select_related and prefetch_related to prevent N+1 queries
        return Project.objects.all().select_related(
            'creator'
        ).prefetch_related(
            'collaborators', 'photos', 'calendar_entries', 'manifestations'
        )

    def get_serializer_class(self):
        if self.action == 'create':
            return ProjectCreateSerializer
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectListSerializer

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def upload_photo(self, request, pk=None):
        project = self.get_object()
        if request.user != project.creator:
            return Response({'error': 'Not allowed'}, status=403)

        serializer = ProjectPhotoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(project=project)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def calendar_entry(self, request, pk=None):
        project = self.get_object()
        if request.user != project.creator:
            return Response({'error': 'Not allowed'}, status=403)

        date = request.data.get('date')
        content = request.data.get('content', '').strip()

        if content:
            entry, _ = ProjectCalendarEntry.objects.update_or_create(
                project=project, date=date,
                defaults={'content': content}
            )
            return Response(ProjectCalendarEntrySerializer(entry).data)
        else:
            ProjectCalendarEntry.objects.filter(project=project, date=date).delete()
            return Response({'status': 'deleted'})

    @action(detail=True, methods=['get'])
    def funding(self, request, pk=None):
        project = self.get_object()
        if hasattr(project, 'funding'):
            return Response(ProjectFundingSerializer(project.funding).data)
        return Response({'enabled': False})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def support(self, request, pk=None):
        project = self.get_object()

        if not hasattr(project, 'funding'):
            return Response({'error': 'Funding not enabled for this project'}, status=400)

        serializer = ProjectSupportCreateSerializer(data=request.data)
        if serializer.is_valid():
            ProjectSupporter.objects.create(
                funding=project.funding,
                user=request.user,
                amount=serializer.validated_data['amount'],
                message=serializer.validated_data.get('message', ''),
                is_anonymous=serializer.validated_data.get('is_anonymous', False)
            )
            return Response({'status': 'supported'}, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_budget_item(self, request, pk=None):
        project = self.get_object()
        if request.user != project.creator:
            return Response({'error': 'Not allowed'}, status=403)

        if not hasattr(project, 'funding'):
            ProjectFunding.objects.create(project=project, goal=0)

        serializer = ProjectBudgetItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(funding=project.funding)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


# ========== MESSAGE VIEWS ==========

class InboxView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(recipient=self.request.user).order_by('-created_at')


class OutboxView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(sender=self.request.user).order_by('-created_at')


class SendMessageView(generics.CreateAPIView):
    serializer_class = MessageCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)


# ========== SEARCH VIEW ==========

class SearchView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        query = request.query_params.get('q', '')
        if len(query) < 2:
            return Response({'users': [], 'projects': []})

        users = User.objects.filter(
            Q(username__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query)
        )[:10]

        projects = Project.objects.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query)
        )[:10]

        return Response({
            'users': UserSerializer(users, many=True).data,
            'projects': ProjectListSerializer(projects, many=True).data
        })
