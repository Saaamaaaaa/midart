# social/api_urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api_views

router = DefaultRouter()
router.register(r'profiles', api_views.ProfileViewSet, basename='profile')
router.register(r'posts', api_views.PostViewSet, basename='post')
router.register(r'verbalise', api_views.VerbalPostViewSet, basename='verbalise')
router.register(r'projects', api_views.ProjectViewSet, basename='project')

urlpatterns = [
    # Auth
    path('auth/register/', api_views.RegisterView.as_view(), name='api_register'),
    path('auth/login/', api_views.LoginView.as_view(), name='api_login'),
    path('auth/logout/', api_views.LogoutView.as_view(), name='api_logout'),
    path('auth/me/', api_views.CurrentUserView.as_view(), name='api_current_user'),

    # Profile update (current user)
    path('profile/update/', api_views.ProfileUpdateView.as_view(), name='api_profile_update'),

    # Feed
    path('feed/', api_views.FeedView.as_view(), name='api_feed'),

    # Messages
    path('messages/inbox/', api_views.InboxView.as_view(), name='api_inbox'),
    path('messages/outbox/', api_views.OutboxView.as_view(), name='api_outbox'),
    path('messages/send/', api_views.SendMessageView.as_view(), name='api_send_message'),

    # Search
    path('search/', api_views.SearchView.as_view(), name='api_search'),

    # Router URLs
    path('', include(router.urls)),
]
