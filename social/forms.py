from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Post, VerbalPost, Project, Comment, Message, Profile, ProjectPhoto, Manifestation


#--------- CUSTOM SIGN UP FORM ------------
class SignupForm(UserCreationForm):
    email = forms.EmailField(required=True)

    user_type = forms.ChoiceField(
        choices=Profile.USER_TYPES,
        required=True
    )

    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2", "user_type")


# ------------ PROFILE EDIT FORM ----------

class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['profile_image', 'bio']


# ------------ IMAGE POST FORM ------------
class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['image', 'caption']


# ------------ VERBAL POST FORM (like a tweet) ------------
class VerbalPostForm(forms.ModelForm):
    class Meta:
        model = VerbalPost
        fields = ['content']


# ------------ EDIT PROFILE FORM ------------
class ProfileForm(forms.ModelForm):
    bio = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={
            'maxlength': 1500,
            'rows': 5,
            'placeholder': 'Tell us about yourself (max 1500 characters)'
        })
    )

    class Meta:
        model = Profile
        fields = ['profile_image', 'bio']
 # ----------- DEFINE PROJECT FORM ----------
class ProjectForm(forms.ModelForm):
    class Meta:
        model = Project
        fields = [
            'title',
            'description',
            'project_type',
            'collaborators',
            'status',
            'budget_type',
            'cover_photo',
            'manifestations',
            'start_date',
            'end_date',
        ]
        widgets = {
            "start_date": forms.DateInput(attrs={"type": "date"}),
            "end_date": forms.DateInput(attrs={"type": "date"}),
        }


# ------------ SIGNUP FORM WITH USER TYPE (Artist or Collector) ------------
class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True)
    USER_TYPES = [('artist', 'Artist'), ('collector', 'Collector')]
    user_type = forms.ChoiceField(choices=USER_TYPES)

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']


# ------------ COMMENT FORM ------------
class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['content']
        widgets = {
            'content': forms.Textarea(attrs={
                'rows': 2,
                'placeholder': 'Write a comment...',
                'style': 'width: 100%;',
            }),
        }


# ------------ MESSAGE FORM ------------
class MessageForm(forms.ModelForm):
    class Meta:
        model = Message
        fields = ['recipient', 'subject', 'body']
        widgets = {
            'recipient': forms.Select(attrs={'class': 'form-control'}),
            'subject': forms.TextInput(attrs={'class': 'form-control'}),
            'body': forms.Textarea(attrs={'class': 'form-control'}),
        }

# ------------- UPLOAD PROJECT PHOTOS FORM -----------

class ProjectPhotoForm(forms.ModelForm):
    class Meta:
        model = ProjectPhoto
        fields = ['image', 'caption']

# --------------- PROJECT STATUS, COLLABORATOR, DISCPLINE FORM FOR EXSITING PROJECTS ----------------------------------

class ProjectStatusForm(forms.ModelForm):
    class Meta:
        model = Project
        fields = ["status"]

class AddCollaboratorForm(forms.Form):
    username = forms.CharField(max_length=150)

from django import forms
from .models import Manifestation

class AddManifestationForm(forms.Form):
    manifestation = forms.ModelChoiceField(
        queryset=Manifestation.objects.all(),
        required=True,
        empty_label="Select a manifestation..."
    )

