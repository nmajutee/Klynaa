"""Admin configuration for Klynaa User management."""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Enhanced admin interface for User model."""

    # List view configuration
    list_display = [
        'email', 'full_name', 'role', 'is_active', 'rating_display',
        'wallet_balance', 'date_joined', 'last_active'
    ]
    list_filter = [
        'role', 'is_active', 'is_staff', 'date_joined', 'last_active'
    ]
    search_fields = ['email', 'first_name', 'last_name', 'phone_number']
    ordering = ['-date_joined']

    # Detail view configuration
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Klynaa Profile', {
            'fields': (
                'role', 'phone_number', 'latitude', 'longitude'
            )
        }),
        ('Ratings & Reputation', {
            'fields': ('rating_average', 'rating_count'),
            'classes': ('collapse',)
        }),
        ('Financial', {
            'fields': ('wallet_balance',),
            'classes': ('collapse',)
        }),
        ('Worker Settings', {
            'fields': (
                'is_available', 'pending_pickups_count', 'service_radius_km'
            ),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_active'),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = [
        'created_at', 'updated_at', 'last_active', 'rating_average',
        'rating_count', 'pending_pickups_count'
    ]

    # Custom display methods
    def full_name(self, obj):
        """Display full name."""
        return f"{obj.first_name} {obj.last_name}".strip() or obj.email
    full_name.short_description = 'Name'

    def rating_display(self, obj):
        """Display rating with stars."""
        if obj.rating_count > 0:
            stars = '⭐' * int(obj.rating_average)
            return format_html(
                '<span title="{} ({} reviews)">{} {:.1f}</span>',
                obj.rating_average, obj.rating_count, stars, obj.rating_average
            )
        return format_html('<span class="text-muted">No ratings</span>')
    rating_display.short_description = 'Rating'

    # Custom actions
    def make_worker(self, request, queryset):
        """Convert selected users to workers."""
        queryset.update(role=User.UserRole.WORKER)
        self.message_user(request, f"Updated {queryset.count()} users to worker role.")
    make_worker.short_description = "Change role to Worker"

    def make_customer(self, request, queryset):
        """Convert selected users to customers."""
        queryset.update(role=User.UserRole.CUSTOMER)
        self.message_user(request, f"Updated {queryset.count()} users to customer role.")
    make_customer.short_description = "Change role to Customer"

    actions = ['make_worker', 'make_customer']


# Customize admin site headers
admin.site.site_header = "Klynaa Administration"
admin.site.site_title = "Klynaa Admin"
admin.site.index_title = "Welcome to Klynaa Administration"
