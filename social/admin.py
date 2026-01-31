# Register your models here.

from django.contrib import admin
from .models import Profile, Post, VerbalPost, Comment, Like, Project, Message, Follow, Manifestation


class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'user_type', 'date_joined')
    list_filter = ('user_type',)
    search_fields = ('user__username', 'user__email')
    ordering = ('-date_joined',)
    readonly_fields = ('date_joined',)
    fieldsets = (
        (None, {
            'fields': ('user', 'user_type', 'bio', 'profile_image')
        }),
        ('Meta Info', {
            'fields': ('date_joined',),
        }),
    )

admin.site.register(Profile, ProfileAdmin)
admin.site.register(Post)
admin.site.register(VerbalPost)
admin.site.register(Comment)
admin.site.register(Like)
admin.site.register(Project)
admin.site.register(Message)
admin.site.register(Follow)
admin.site.register(Manifestation)
