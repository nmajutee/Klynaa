"""Management command to create initial test users for development."""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from decimal import Decimal

User = get_user_model()


class Command(BaseCommand):
    """Create initial test users for development and UI/UX testing."""

    help = 'Creates initial test users for Klynaa development'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing test users first',
        )

    def handle(self, *args, **options):
        """Create test users."""

        if options['clear']:
            self.stdout.write('Clearing existing test users...')
            User.objects.filter(email__endswith='@klynaa.test').delete()

        test_users = [
            # 1 Admin Account with full control
            {
                'email': 'nmajutee@gmail.com',
                'username': 'nmaju',
                'password': '#!BigT33',
                'first_name': 'Nmaju',
                'last_name': 'Terence',
                'role': User.UserRole.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'phone_number': '+1234567800',
                'is_verified': True,
                'wallet_balance': Decimal('10000.00'),
            },
            # 3 Worker Accounts
            {
                'email': 'worker1@klynaa.test',
                'password': 'Worker123!',
                'first_name': 'John',
                'last_name': 'Collector',
                'role': User.UserRole.WORKER,
                'phone_number': '+1234567801',
                'latitude': Decimal('40.7128'),
                'longitude': Decimal('-74.0060'),
                'is_available': True,
                'service_radius_km': 15,
                'is_verified': True,
                'rating_average': Decimal('4.8'),
                'rating_count': 32,
                'wallet_balance': Decimal('450.75'),
            },
            {
                'email': 'worker2@klynaa.test',
                'password': 'Worker123!',
                'first_name': 'Mike',
                'last_name': 'GreenHandler',
                'role': User.UserRole.WORKER,
                'phone_number': '+1234567802',
                'latitude': Decimal('40.7505'),
                'longitude': Decimal('-73.9934'),
                'is_available': True,
                'pending_pickups_count': 2,
                'service_radius_km': 12,
                'is_verified': True,
                'rating_average': Decimal('4.6'),
                'rating_count': 28,
                'wallet_balance': Decimal('325.50'),
            },
            {
                'email': 'worker3@klynaa.test',
                'password': 'Worker123!',
                'first_name': 'Sarah',
                'last_name': 'WasteExpert',
                'role': User.UserRole.WORKER,
                'phone_number': '+1234567803',
                'latitude': Decimal('40.7589'),
                'longitude': Decimal('-73.9851'),
                'is_available': False,
                'pending_pickups_count': 5,
                'service_radius_km': 10,
                'is_verified': True,
                'rating_average': Decimal('4.9'),
                'rating_count': 45,
                'wallet_balance': Decimal('678.90'),
            },
            # 3 BinOwner (Customer) Accounts
            {
                'email': 'binowner1@klynaa.test',
                'password': 'BinOwner123!',
                'first_name': 'Jane',
                'last_name': 'Smith',
                'role': User.UserRole.CUSTOMER,
                'phone_number': '+1234567804',
                'latitude': Decimal('40.7282'),
                'longitude': Decimal('-73.9942'),
                'is_verified': True,
                'rating_average': Decimal('4.3'),
                'rating_count': 18,
                'wallet_balance': Decimal('125.25'),
            },
            {
                'email': 'binowner2@klynaa.test',
                'password': 'BinOwner123!',
                'first_name': 'Robert',
                'last_name': 'Johnson',
                'role': User.UserRole.CUSTOMER,
                'phone_number': '+1234567805',
                'latitude': Decimal('40.7614'),
                'longitude': Decimal('-73.9776'),
                'is_verified': True,
                'rating_average': Decimal('4.7'),
                'rating_count': 25,
                'wallet_balance': Decimal('200.50'),
            },
            {
                'email': 'binowner3@klynaa.test',
                'password': 'BinOwner123!',
                'first_name': 'Emily',
                'last_name': 'Davis',
                'role': User.UserRole.CUSTOMER,
                'phone_number': '+1234567806',
                'latitude': Decimal('40.7309'),
                'longitude': Decimal('-73.9973'),
                'is_verified': True,
                'rating_average': Decimal('4.1'),
                'rating_count': 12,
                'wallet_balance': Decimal('89.75'),
            }
        ]

        created_count = 0
        for user_data in test_users:
            email = user_data['email']

            if User.objects.filter(email=email).exists():
                self.stdout.write(
                    self.style.WARNING(f'User {email} already exists, skipping...')
                )
                continue

            # Set username to email if not specified
            if 'username' not in user_data:
                user_data['username'] = email
            password = user_data.pop('password')

            user = User.objects.create_user(password=password, **user_data)
            created_count += 1

            self.stdout.write(
                self.style.SUCCESS(f'Created {user.role} user: {email}')
            )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nSuccessfully created {created_count} test users!'
            )
        )

        if created_count > 0:
            self.stdout.write('\nTest account credentials:')

            # Admin account
            self.stdout.write(self.style.SUCCESS('  ADMIN ACCOUNT:'))
            self.stdout.write('    nmajutee@gmail.com (username: nmaju) / #!BigT33')

            # Worker accounts
            self.stdout.write(self.style.SUCCESS('  WORKER ACCOUNTS:'))
            self.stdout.write('    worker1@klynaa.test / Worker123!')
            self.stdout.write('    worker2@klynaa.test / Worker123!')
            self.stdout.write('    worker3@klynaa.test / Worker123!')

            # BinOwner accounts
            self.stdout.write(self.style.SUCCESS('  BINOWNER ACCOUNTS:'))
            self.stdout.write('    binowner1@klynaa.test / BinOwner123!')
            self.stdout.write('    binowner2@klynaa.test / BinOwner123!')
            self.stdout.write('    binowner3@klynaa.test / BinOwner123!')

            self.stdout.write(
                self.style.SUCCESS(
                    '\nAll accounts are verified and ready for use!'
                )
            )
            self.stdout.write(
                self.style.SUCCESS(
                    'Admin has full control over all other accounts via Django admin.'
                )
            )