"""Management command to populate quick reply templates for workers."""

from django.core.management.base import BaseCommand
from apps.chat.models import QuickReply


class Command(BaseCommand):
    """Create initial quick reply templates for worker chat."""

    help = 'Creates quick reply templates for worker communication'

    def handle(self, *args, **options):
        """Create quick reply templates."""

        quick_replies = [
            # Arrival and navigation
            {'text': "I'm on my way! ETA 10 minutes.", 'category': 'navigation'},
            {'text': "Running 5 minutes late, traffic is heavy.", 'category': 'navigation'},
            {'text': "Arrived at your location. Looking for the bin.", 'category': 'navigation'},
            {'text': "Having trouble finding your address. Can you help?", 'category': 'navigation'},

            # Pickup status
            {'text': "Bin collected successfully! Heading to disposal site.", 'category': 'status'},
            {'text': "Bin is ready for pickup. Thank you!", 'category': 'status'},
            {'text': "Small delay - will be there in 15 minutes.", 'category': 'status'},
            {'text': "Pickup completed. Payment will be processed shortly.", 'category': 'status'},

            # Issues and questions
            {'text': "Bin seems to be locked. Can you unlock it?", 'category': 'issues'},
            {'text': "Bin is heavier than expected. May need additional fee.", 'category': 'issues'},
            {'text': "Access to bin is blocked. Can you move the obstacle?", 'category': 'issues'},
            {'text': "Weather conditions may cause slight delay.", 'category': 'issues'},

            # Courtesy
            {'text': "Thank you for using Klynaa! Have a great day!", 'category': 'courtesy'},
            {'text': "Please rate your experience when you get a chance.", 'category': 'courtesy'},
            {'text': "Thank you for keeping your area clean! 🌱", 'category': 'courtesy'},
            {'text': "Pleasure working with you. See you next time!", 'category': 'courtesy'},

            # Instructions
            {'text': "Please ensure the bin is accessible when I arrive.", 'category': 'instructions'},
            {'text': "I'll send a photo when pickup is complete.", 'category': 'instructions'},
            {'text': "Payment receipt will be sent via SMS.", 'category': 'instructions'},
            {'text': "Please keep your phone nearby for updates.", 'category': 'instructions'},
        ]

        created_count = 0
        for reply_data in quick_replies:
            quick_reply, created = QuickReply.objects.get_or_create(
                text=reply_data['text'],
                defaults={'category': reply_data['category']}
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created quick reply: {reply_data["text"][:50]}...')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nSuccessfully created {created_count} quick reply templates!'
            )
        )

        # Show summary by category
        categories = QuickReply.objects.values('category').distinct()
        self.stdout.write('\nQuick replies by category:')
        for cat in categories:
            count = QuickReply.objects.filter(category=cat['category']).count()
            self.stdout.write(f'  {cat["category"].title()}: {count} templates')