# Klynaa PostgreSQL Setup

## Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Database Configuration
DJANGO_DB_ENGINE=postgresql
DJANGO_DB_NAME=klynaa
DJANGO_DB_USER=klynaa
DJANGO_DB_PASSWORD=your_secure_password
DJANGO_DB_HOST=localhost
DJANGO_DB_PORT=5432

# Django Settings
DJANGO_SECRET_KEY=your_super_secret_key_here
DJANGO_DEBUG=1
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# CORS Settings (for frontend)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## PostgreSQL Installation & Setup

### Windows (using PostgreSQL installer)
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password for the `postgres` user

### Create Klynaa Database
```sql
-- Connect to PostgreSQL as postgres user
CREATE DATABASE klynaa;
CREATE USER klynaa WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE klynaa TO klynaa;
ALTER USER klynaa CREATEDB;  -- Allow creating test databases
```

## Migration Steps

1. **Install Python PostgreSQL adapter:**
   ```bash
   cd backend
   pip install psycopg2-binary
   ```

2. **Create initial migrations:**
   ```bash
   python manage.py makemigrations
   ```

3. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

4. **Create superuser for admin access:**
   ```bash
   python manage.py createsuperuser
   ```

5. **Load initial data (optional):**
   ```bash
   python manage.py loaddata initial_data.json
   ```

## Test Accounts for UI/UX Team

After running migrations, create these test accounts via Django Admin or registration:

### Admin Account
- Email: admin@klynaa.com
- Password: Admin123!
- Role: admin

### Worker Account
- Email: worker@klynaa.com
- Password: Worker123!
- Role: worker

### Bin Owner Account
- Email: binowner@klynaa.com
- Password: BinOwner123!
- Role: customer

## Verification Steps

1. **Backend API Test:**
   ```bash
   curl http://localhost:8000/api/
   ```

2. **Registration Test:**
   ```bash
   curl -X POST http://localhost:8000/api/users/register/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "testpass123",
       "password_confirm": "testpass123",
       "first_name": "Test",
       "last_name": "User",
       "role": "customer"
     }'
   ```

3. **Login Test:**
   ```bash
   curl -X POST http://localhost:8000/api/users/token/ \
     -H "Content-Type: application/json" \
     -d '{
       "username": "test@example.com",
       "password": "testpass123"
     }'
   ```

## Django Admin Access

After creating a superuser, access the admin at:
- URL: http://localhost:8000/admin/
- Login with superuser credentials
- Manage users, view registration data, system settings

## Troubleshooting

### Connection Issues
- Ensure PostgreSQL service is running
- Check firewall settings
- Verify database credentials in .env

### Migration Issues
- Reset migrations if needed: `python manage.py migrate --fake-initial`
- Check for conflicting migrations: `python manage.py showmigrations`

### Permission Issues
- Ensure database user has proper permissions
- Check database exists: `\l` in psql
- Verify user permissions: `\du` in psql