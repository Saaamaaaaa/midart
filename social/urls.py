# social/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('', views.homepage_feed, name='home'),
    path('signup/', views.signup_view, name='signup'),
    path('users/<str:username>/', views.profile_view, name='profile'),
    path('edit-profile/', views.edit_profile, name='edit_profile'),


    path('post/image/', views.create_image_post, name='create_image_post'),
    path('post/verbal/', views.create_verbal_post, name='create_verbal_post'),

    path('create-project/', views.create_project, name='create_project'),
    path('project/<int:pk>/', views.project_detail, name='project_detail'),

    # Comments
    path('comment/delete/<int:comment_id>/', views.delete_comment, name='delete_comment'),
    path('comment/<str:post_type>/<int:post_id>/', views.add_comment, name='add_comment'),

    # Likes
    path('like/<str:post_type>/<int:post_id>/', views.toggle_like, name='toggle_like'),

    # Messaging
    path('inbox/', views.inbox, name='inbox'),
    path('outbox/', views.outbox, name='outbox'),
    path('message/compose/', views.compose_message, name='compose_message'),
    path('message/', views.send_message, name='send_message'),
    path('message/<str:username>/', views.send_message, name='send_message_to_user'),

    # Follow system
    path('follow/<str:username>/', views.follow_user, name='follow_user'),
    path('unfollow/<str:username>/', views.unfollow_user, name='unfollow_user'),

    # Delete posts
    path('delete/image/<int:post_id>/', views.delete_image_post, name='delete_image_post'),
    path('delete/verbal/<int:post_id>/', views.delete_verbal_post, name='delete_verbal_post'),

    # Followers/following pages
    path('users/<str:username>/followers/', views.followers_list, name='followers_list'),
    path('users/<str:username>/following/', views.following_list, name='following_list'),

    # Project edit options
    path('project/<int:pk>/upload-photo/', views.upload_project_photo, name='upload_project_photo'),
    path('project/<int:pk>/update-status/', views.update_project_status, name='update_project_status'),
    path('project/<int:pk>/add-collaborator/', views.add_project_collaborator, name='add_project_collaborator'),
    path('project/<int:pk>/add-manifestation/', views.add_project_manifestation, name='add_project_manifestation'),
    path('project/<int:pk>/calendar/save/', views.save_project_calendar_entry, name='save_project_calendar_entry'),


    # Project delete
    path('projects/<int:pk>/delete/', views.delete_project, name='delete_project'),

]
