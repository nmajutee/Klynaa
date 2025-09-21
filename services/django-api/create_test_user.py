from apps.users.models import User

# Create test user
user = User.objects.create_user(
    email='test@klynaa.com',
    username='testuser',
    password='testpass123',
    first_name='Test',
    last_name='User',
    role='customer'
)
print(f'Created test user: {user.email} with role {user.role}')