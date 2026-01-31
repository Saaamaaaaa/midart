from django import template
from django.contrib.contenttypes.models import ContentType
from ..models import Like

register = template.Library()

@register.simple_tag
def get_likes_count(post):
    content_type = ContentType.objects.get_for_model(post.__class__)
    return Like.objects.filter(content_type=content_type, object_id=post.id).count()

@register.filter
def model_name(obj):
    return obj.__class__.__name__.lower()

@register.filter
def get_item(dictionary, key):
    return dictionary.get(key)

