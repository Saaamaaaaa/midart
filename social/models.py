# Create your models here.
from decimal import Decimal
from django.db import models
from django.db.models import F
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.urls import reverse
from django.utils import timezone
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError

# --------- BASE MODEL FOR TIMESTAMPING ----------
class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True

# --------- USER PROFILE ----------
class Profile(models.Model):
    USER_TYPES = [
        ('artist', 'Artist'),
        ('collector', 'Collector'),
        ('gallery', 'Gallery')
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='artist')
    bio = models.TextField(blank=True, max_length=1500)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    # Removed duplicate user_type field that was here

    def __str__(self):
        return f"{self.user.username}'s Profile"

    def get_absolute_url(self):
        return reverse("profile", kwargs={"username": self.user.username})

# --------- IMAGE POST ----------
class Post(TimestampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='post_images/')
    caption = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.username}'s Post"

    class Meta:
        ordering = ['-created_at']

# --------- VERBAL POST (text only) ----------
class VerbalPost(TimestampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.CharField(max_length=280)

    def __str__(self):
        return f"{self.user.username} Verbalised: {self.content[:30]}..."

    class Meta:
        ordering = ['-created_at']

# --------- LIKE (generic, for both post types) ----------
class Like(TimestampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    post = GenericForeignKey('content_type', 'object_id')

    class Meta:
        unique_together = ('user', 'content_type', 'object_id')

    def __str__(self):
        return f"{self.user.username} liked {self.content_type} #{self.object_id}"

# --------- COMMENT (generic) ----------
class Comment(TimestampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    post = GenericForeignKey('content_type', 'object_id')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} commented: {self.content[:30]}..."

# --------- ARTIST PROJECT ----------

class Project(models.Model):
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    PROJECT_TYPES = [
        ('solo', 'Solo'),
        ('collaborative', 'Collaborative'),
    ]

    STATUS_CHOICES = [
        ('ongoing', 'Ongoing'),
        ('development', 'In development'),
        ('completed', 'Completed'),
        ('paused', 'Paused'),
    ]

    BUDGET_CHOICES = [
        ('none', 'No budget'),
        ('self', 'Self-funded'),
        ('grant', 'Grant-funded'),
        ('seeking', 'Seeking funding'),
        ('commissioned', 'Commissioned'),
    ]

    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_projects')
    title = models.CharField(max_length=200)
    description = models.TextField()
    project_type = models.CharField(max_length=20, choices=PROJECT_TYPES, default='solo')
    collaborators = models.ManyToManyField(User, blank=True, related_name='collaborative_projects')
    cover_photo = models.ImageField(upload_to='project_covers/', blank=True, null=True)

    # ✅ new fields
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ongoing')
    manifestations = models.ManyToManyField('Manifestation', blank=True)
    budget_type = models.CharField(max_length=20, choices=BUDGET_CHOICES, default='none')

    def __str__(self):
        return self.title

    def clean(self):
        """Validate that end_date is after start_date"""
        super().clean()
        if self.start_date and self.end_date:
            if self.end_date < self.start_date:
                raise ValidationError({'end_date': 'End date must be after start date'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


#-------- MESSAGE MODEL --------
class Message(TimestampedModel):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    subject = models.CharField(max_length=255)
    body = models.TextField()
    is_read = models.BooleanField(default=False)
    parent = models.ForeignKey('self', null=True, blank=True, related_name='replies', on_delete=models.CASCADE)

    def __str__(self):
        return f'Message from {self.sender.username} to {self.recipient.username}: {self.subject}'


#------ FOLLOWING MODEL ------

class Follow(models.Model):
    follower = models.ForeignKey(User, related_name='following', on_delete=models.CASCADE)
    following = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')

    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"


# ----------- MANIFESTATIONS (PROJECT) ------- #
class Manifestation(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


# ----------- PROJECT PHOTOS --------------
class ProjectPhoto(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='project_photos/')
    caption = models.CharField(max_length=200, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo for {self.project.title}"

# ----------- PROJECT CALENDAR ENTRY --------------
class ProjectCalendarEntry(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="calendar_entries")
    date = models.DateField()
    content = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("project", "date")   # ✅ one entry per day per project
        ordering = ["date"]

    def __str__(self):
        return f"{self.project.title} - {self.date}"


# ----------- PROJECT FUNDING SYSTEM --------------

class ProjectFunding(models.Model):
    """Tracks funding goal and total raised for a project"""
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name='funding')
    goal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    raised = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    supporter_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Funding for {self.project.title}: ${self.raised}/${self.goal}"

    @property
    def percentage(self):
        if self.goal > 0:
            return min(round((self.raised / self.goal) * 100), 100)
        return 0

    @property
    def is_funded(self):
        return self.raised >= self.goal


class ProjectBudgetItem(models.Model):
    """Individual budget line items for a project"""
    funding = models.ForeignKey(ProjectFunding, on_delete=models.CASCADE, related_name='budget_items')
    category = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.category}: ${self.amount}"


class ProjectSupporter(models.Model):
    """Individual supporter/donation records"""
    funding = models.ForeignKey(ProjectFunding, on_delete=models.CASCADE, related_name='supporters')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=100, blank=True)  # For non-user supporters
    amount = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]  # Must be at least $0.01
    )
    message = models.TextField(blank=True)
    is_anonymous = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        display = 'Anonymous' if self.is_anonymous else (self.user.username if self.user else self.name)
        return f"{display} supported ${self.amount}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        # Update funding totals atomically when a new supporter is added
        # Using F() expressions prevents race conditions with concurrent updates
        if is_new:
            from .models import ProjectFunding
            ProjectFunding.objects.filter(pk=self.funding_id).update(
                raised=F('raised') + self.amount,
                supporter_count=F('supporter_count') + 1
            )

