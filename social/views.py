# Create your views here.
from django.contrib import messages
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import HttpResponseForbidden
from django.contrib.contenttypes.models import ContentType
from itertools import chain
from operator import attrgetter
from django.urls import reverse
import calendar
from datetime import date
from django.utils import timezone
from django.db.models import Q

from .forms import (
    SignupForm, PostForm, VerbalPostForm, ProjectForm,
    CustomUserCreationForm, CommentForm, MessageForm, ProfileForm, ProjectPhotoForm, ProjectStatusForm, AddCollaboratorForm, AddManifestationForm
)
from .models import (
    Profile, Post, VerbalPost, Comment, Like, Project, Message, Follow, ProjectPhoto, Manifestation, ProjectCalendarEntry
)

# ---------- SIGNUP ----------
def signup_view(request):
    if request.method == "POST":
        form = SignupForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.email = form.cleaned_data["email"]
            user.save()

            # Create profile (or update if somehow exists)
            Profile.objects.update_or_create(
                user=user,
                defaults={"user_type": form.cleaned_data["user_type"]}
            )

            login(request, user)
            return redirect("home")
    else:
        form = SignupForm()

    return render(request, "social/signup.html", {"form": form})

# ---------- COMBINE POSTS + COMMENTS ----------
def get_combined_posts_with_comments(user=None):
    image_posts = Post.objects.filter(user=user) if user else Post.objects.all()
    verbal_posts = VerbalPost.objects.filter(user=user) if user else VerbalPost.objects.all()
    combined = sorted(chain(image_posts, verbal_posts), key=attrgetter('created_at'), reverse=True)

    comment_dict = {}
    for comment in Comment.objects.all():
        key = (comment.content_type.model, comment.object_id)
        comment_dict.setdefault(key, []).append(comment)

    post_comment_map = {
        post: comment_dict.get((post.__class__.__name__.lower(), post.id), [])
        for post in combined
    }

    comment_count_map = {post: len(comments) for post, comments in post_comment_map.items()}
    return combined, post_comment_map, comment_count_map

# ---------- HOMEPAGE FEED ----------
@login_required
def homepage_feed(request):
    combined_posts, post_comment_map, comment_count_map = get_combined_posts_with_comments()
    comment_form = CommentForm()
    return render(request, 'social/feed.html', {
        'combined_posts': combined_posts,
        'comment_form': comment_form,
        'comment_dict': post_comment_map,
        'comment_count_dict': comment_count_map,
    })


# ---------- USER PROFILE ----------
def profile_view(request, username):
    user = get_object_or_404(User, username=username)

    combined_posts, post_comment_map, comment_count_map = get_combined_posts_with_comments(user)
    comment_form = CommentForm()
    projects = Project.objects.filter(creator=user)

    # ✅ FOLLOW COUNTS (ADD THIS)
    follower_count = Follow.objects.filter(following=user).count()
    following_count = Follow.objects.filter(follower=user).count()

    follows_you = False
    is_following = False

    if request.user.is_authenticated and request.user != user:
        follows_you = Follow.objects.filter(
            follower=user,
            following=request.user
        ).exists()

        is_following = Follow.objects.filter(
            follower=request.user,
            following=user
        ).exists()

    return render(request, 'social/profile.html', {
        'profile_user': user,
        'combined_posts': combined_posts,
        'comment_form': comment_form,
        'comment_dict': post_comment_map,
        'comment_count_dict': comment_count_map,
        'projects': projects,

        # ✅ PASS TO TEMPLATE (ADD THESE)
        'follower_count': follower_count,
        'following_count': following_count,

        'follows_you': follows_you,
        'is_following': is_following,
    })

# ------------- EDIT PROFILE ---------------------------
@login_required
def edit_profile(request):
    profile, _ = Profile.objects.get_or_create(user=request.user)

    if request.method == 'POST':
        form = ProfileForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()
            return redirect('profile', username=request.user.username)
    else:
        form = ProfileForm(instance=profile)

    return render(request, 'social/edit_profile.html', {'form': form})






# ---------- CREATE POSTS ----------
@login_required
def create_image_post(request):
    if request.method == 'POST':
        form = PostForm(request.POST, request.FILES)
        if form.is_valid():
            post = form.save(commit=False)
            post.user = request.user
            post.save()
            return redirect('profile', username=request.user.username)
    else:
        form = PostForm()
    return render(request, 'social/create_image_post.html', {'post_form': form})

@login_required
def create_verbal_post(request):
    if request.method == 'POST':
        form = VerbalPostForm(request.POST)
        if form.is_valid():
            post = form.save(commit=False)
            post.user = request.user
            post.save()
            return redirect('profile', username=request.user.username)
    else:
        form = VerbalPostForm()
    return render(request, 'social/create_verbal_post.html', {'form': form})

# ---------- CREATE PROJECT ----------
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from .forms import ProjectForm

@login_required
def create_project(request):
    if request.method == 'POST':
        form = ProjectForm(request.POST, request.FILES)
        if form.is_valid():
            project = form.save(commit=False)
            project.creator = request.user
            project.save()

            # ✅ This saves any ManyToMany fields that are included in the form
            # (e.g. collaborators, manifestations)
            form.instance = project
            form.save_m2m()

            # ✅ Better UX: go to the project page you just created
            return redirect('project_detail', pk=project.pk)
    else:
        form = ProjectForm()

    return render(request, 'social/create_project.html', {'form': form})

# ---------- PROJECT DETAIL ----------
def project_detail(request, pk):
    project = get_object_or_404(Project, pk=pk)
    photo_form = ProjectPhotoForm()

    # ---- Calendar month/year (from URL params) ----
    today = timezone.localdate()
    year = int(request.GET.get("year", today.year))
    month = int(request.GET.get("month", today.month))

    # Progress Bar
    today = timezone.localdate()

    progress_percent = None

    if project.start_date and project.end_date:
        total_days = (project.end_date - project.start_date).days
        if total_days > 0:
            elapsed_days = (today - project.start_date).days
            ratio = elapsed_days / total_days
            ratio = max(0, min(1, ratio))  # clamp 0..1
            progress_percent = int(ratio * 100)
        else:
            progress_percent = 100

    #progress bar markers according to calendar entries
    markers = []

    if project.start_date and project.end_date and project.end_date > project.start_date:
        total_days = (project.end_date - project.start_date).days

        # Pull entries for this project (you can keep your existing "entries" query for the grid)
        all_entries = ProjectCalendarEntry.objects.filter(
            project=project
        ).exclude(content="")

        for e in all_entries:
            # only place markers that fall within the timeline
            if project.start_date <= e.date <= project.end_date:
                offset_days = (e.date - project.start_date).days
                pos = (offset_days / total_days) * 100  # 0..100
                markers.append({
                    "pos": pos,
                    "date": e.date.strftime("%Y-%m-%d"),
                    "label": (e.content[:60] + "…") if len(e.content) > 60 else e.content,
                })

    # Build calendar grid (weeks is a list of weeks, each week is 7 date objects)
    cal = calendar.Calendar(firstweekday=0)  # Monday
    weeks = cal.monthdatescalendar(year, month)

    # Work out prev/next month for navigation
    if month == 1:
        prev_month, prev_year = 12, year - 1
    else:
        prev_month, prev_year = month - 1, year

    if month == 12:
        next_month, next_year = 1, year + 1
    else:
        next_month, next_year = month + 1, year

    month_name = calendar.month_name[month]

    # Pull entries for the visible calendar range (includes greyed prev/next month days)
    start_date = weeks[0][0]
    end_date = weeks[-1][-1]
    entries = ProjectCalendarEntry.objects.filter(
        project=project,
        date__range=(start_date, end_date),
    )

    can_edit_calendar = request.user.is_authenticated and request.user == project.creator

    return render(request, "social/project_detail.html", {
        "project": project,
        "photo_form": photo_form,
        #progress bar
        "progress_percent": progress_percent,
        "markers": markers,

        # calendar context
        "weeks": weeks,
        "year": year,
        "month": month,
        "month_name": month_name,
        "prev_year": prev_year,
        "prev_month": prev_month,
        "next_year": next_year,
        "next_month": next_month,
        "entries": entries,
        "can_edit_calendar": can_edit_calendar,
    })

# ---------- LIKE TOGGLE ----------
@login_required
def toggle_like(request, post_type, post_id):
    model = Post if post_type == 'post' else VerbalPost
    post = get_object_or_404(model, id=post_id)
    content_type = ContentType.objects.get_for_model(model)

    like, created = Like.objects.get_or_create(
        user=request.user,
        content_type=content_type,
        object_id=post_id
    )
    if not created:
        like.delete()

    return redirect(request.META.get('HTTP_REFERER', 'home'))

# ---------- ADD COMMENT ----------
@login_required
def add_comment(request, post_type, post_id):
    model = Post if post_type == 'post' else VerbalPost
    post = get_object_or_404(model, id=post_id)
    content_type = ContentType.objects.get_for_model(model)

    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.user = request.user
            comment.content_type = content_type
            comment.object_id = post_id
            comment.save()
    return redirect(request.META.get('HTTP_REFERER', 'home'))

# ---------- DELETE COMMENT ----------
@login_required
def delete_comment(request, comment_id):
    comment = get_object_or_404(Comment, id=comment_id)
    if comment.user != request.user:
        return HttpResponseForbidden("You can't delete this comment.")
    comment.delete()
    return redirect(request.META.get('HTTP_REFERER', reverse('home')))

#------ MESSAGING VIEWS ---------------------------------------------------------------------------------------------

#------- Send a message -----------
@login_required
def send_message(request, username=None, reply_to_id=None):
    recipient = None
    initial_subject = ''
    parent_message = None

    if username:
        recipient = get_object_or_404(User, username=username)

    if reply_to_id:
        parent_message = get_object_or_404(Message, id=reply_to_id)
        if not username:
            recipient = parent_message.sender
        initial_subject = f"Re: {parent_message.subject}"

    if request.method == 'POST':
        form = MessageForm(request.POST)
        if form.is_valid():
            message = form.save(commit=False)
            message.sender = request.user
            if recipient:
                message.recipient = recipient
            if parent_message:
                message.parent = parent_message
            message.save()
            return redirect('inbox')
    else:
        initial_data = {}
        if recipient:
            initial_data['recipient'] = recipient
        if initial_subject:
            initial_data['subject'] = initial_subject
        form = MessageForm(initial=initial_data)

    return render(request, 'social/send_message.html', {'form': form})


# --------Inbox view -------
@login_required
def inbox(request):
    messages = Message.objects.filter(recipient=request.user)
    return render(request, 'social/inbox.html', {'messages': messages})

# ------- Outbox view ------
@login_required
def outbox(request):
    messages = Message.objects.filter(sender=request.user)
    return render(request, 'social/outbox.html', {'messages': messages})

#------ FOLLOW/UNFOLLOW VIEWS ------
@login_required
def follow_user(request, username):
    user_to_follow = get_object_or_404(User, username=username)
    if user_to_follow != request.user:
        Follow.objects.get_or_create(follower=request.user, following=user_to_follow)
    return redirect('profile', username=username)

@login_required
def unfollow_user(request, username):
    user_to_unfollow = get_object_or_404(User, username=username)
    Follow.objects.filter(follower=request.user, following=user_to_unfollow).delete()
    return redirect('profile', username=username)

# ---------- DELETE IMAGE POST ----------
@login_required
def delete_image_post(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    if post.user != request.user:
        return HttpResponseForbidden("You can't delete this post.")
    post.delete()
    return redirect('profile', username=request.user.username)

# ---------- DELETE VERBAL POST ----------
@login_required
def delete_verbal_post(request, post_id):
    post = get_object_or_404(VerbalPost, id=post_id)
    if post.user != request.user:
        return HttpResponseForbidden("You can't delete this post.")
    post.delete()
    return redirect('profile', username=request.user.username)

# ---------- FOLLOWERS LIST ----------
def followers_list(request, username):
    user = get_object_or_404(User, username=username)
    followers = Follow.objects.filter(following=user)
    return render(request, 'social/followers_following.html', {
        'title': f"{user.username}'s Followers",
        'users': [f.follower for f in followers],
    })

# ---------- FOLLOWING LIST ----------
def following_list(request, username):
    user = get_object_or_404(User, username=username)
    following = Follow.objects.filter(follower=user)
    return render(request, 'social/followers_following.html', {
        'title': f"{user.username} is Following",
        'users': [f.following for f in following],
    })

#------- COMPOSE MESSAGE -------
@login_required
def compose_message(request):
    search_query = request.GET.get('q', '')
    search_results = []
    followers = []

    if search_query:
        search_results = User.objects.filter(username__istartswith=search_query).exclude(id=request.user.id)
    else:
        followers = Follow.objects.filter(following=request.user)

    return render(request, 'social/compose_message.html', {
        'search_query': search_query,
        'search_results': search_results,
        'followers': [f.follower for f in followers],
    })

# ------------- UPLOAD PHOTOS ON PROJECT PORTAL (CREATOR ONLY) -------------------

@login_required
def upload_project_photo(request, pk):
    project = get_object_or_404(Project, pk=pk)

    # ✅ Only the creator can upload
    if request.user != project.creator:
        return HttpResponseForbidden("You are not allowed to upload photos to this project.")

    if request.method == "POST":
        form = ProjectPhotoForm(request.POST, request.FILES)
        if form.is_valid():
            photo = form.save(commit=False)
            photo.project = project
            photo.save()
    return redirect('project_detail', pk=project.pk)

#------------ EDIT EXISTING PROJECT VIEW (DISCIPLINE, COLLABORATORS, STATUS) ----------------------------------

def _creator_only(request, project):
    if request.user != project.creator:
        return False
    return True


@login_required
def update_project_status(request, pk):
    project = get_object_or_404(Project, pk=pk)
    if not _creator_only(request, project):
        return HttpResponseForbidden("Not allowed.")

    if request.method == "POST":
        form = ProjectStatusForm(request.POST, instance=project)
        if form.is_valid():
            form.save()

    return redirect("project_detail", pk=pk)


@login_required
def add_project_collaborator(request, pk):
    project = get_object_or_404(Project, pk=pk)
    if not _creator_only(request, project):
        return HttpResponseForbidden("Not allowed.")

    if request.method == "POST":
        form = AddCollaboratorForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data["username"].strip()
            try:
                user_to_add = User.objects.get(username=username)
                if user_to_add == project.creator:
                    messages.error(request, "Creator is already a participant.")
                else:
                    project.collaborators.add(user_to_add)
                    messages.success(request, f"Added collaborator: {username}")
            except User.DoesNotExist:
                messages.error(request, f'No user found with username "{username}".')

    return redirect("project_detail", pk=pk)


@login_required
def add_project_manifestation(request, pk):
    project = get_object_or_404(Project, pk=pk)
    if request.user != project.creator:
        return HttpResponseForbidden("Not allowed.")

    if request.method == "POST":
        form = AddManifestationForm(request.POST)
        if form.is_valid():
            manifestation = form.cleaned_data["manifestation"]
            project.manifestations.add(manifestation)
            messages.success(request, f"Added manifestation: {manifestation.name}")

    return redirect("project_detail", pk=pk)

#---------- DELETE PROJECT VIEW -------------
@login_required
def delete_project(request, pk):
    project = get_object_or_404(Project, pk=pk)

    # Only the creator can delete the project
    if request.user != project.creator:
        return HttpResponseForbidden("You are not allowed to delete this project.")

    if request.method == "POST":
        project.delete()
        messages.success(request, "Project deleted.")
        return redirect("home")  # or redirect("profile", username=request.user.username)

    return render(request, "social/project_confirm_delete.html", {"project": project})


#--------------- CALENDAR ------------------------------
@login_required
def save_project_calendar_entry(request, pk):
    project = get_object_or_404(Project, pk=pk)

    # Only creator can edit calendar
    if request.user != project.creator:
        return HttpResponseForbidden("Not allowed to edit this calendar.")

    if request.method == "POST":
        date_str = request.POST.get("date")
        content = request.POST.get("content", "").strip()  # ✅ match textarea name

        if date_str:
            entry_date = timezone.datetime.strptime(date_str, "%Y-%m-%d").date()

            if content:
                # Create or update entry
                ProjectCalendarEntry.objects.update_or_create(
                    project=project,
                    date=entry_date,
                    defaults={"content": content}  # ✅ match model field
                )
            else:
                # Delete entry if content is empty
                ProjectCalendarEntry.objects.filter(
                    project=project,
                    date=entry_date
                ).delete()

    # Redirect back to calendar view with same month/year
    year = request.POST.get("year", timezone.localdate().year)
    month = request.POST.get("month", timezone.localdate().month)
    return redirect(f"{reverse('project_detail', args=[pk])}?year={year}&month={month}")

