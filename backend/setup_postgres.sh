#!/bin/bash
# Klynaa PostgreSQL Setup Script

echo "🚀 Setting up Klynaa with PostgreSQL..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL not found. Please install PostgreSQL first."
    echo "Visit: https://www.postgresql.org/download/"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "manage.py" ]; then
    echo "❌ Please run this script from the backend directory"
    exit 1
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database Configuration
DJANGO_DB_ENGINE=postgresql
DJANGO_DB_NAME=klynaa
DJANGO_DB_USER=klynaa
DJANGO_DB_PASSWORD=klynaa_password_123
DJANGO_DB_HOST=localhost
DJANGO_DB_PORT=5432

# Django Settings
DJANGO_SECRET_KEY=your_super_secret_key_change_in_production
DJANGO_DEBUG=1
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
EOF
    echo "✅ Created .env file with default settings"
else
    echo "✅ .env file already exists"
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Create database (you might need to run this as postgres user)
echo "🗄️  Setting up PostgreSQL database..."
echo "You may need to enter PostgreSQL password..."

psql -U postgres -c "CREATE DATABASE klynaa;" 2>/dev/null || echo "Database might already exist"
psql -U postgres -c "CREATE USER klynaa WITH PASSWORD 'klynaa_password_123';" 2>/dev/null || echo "User might already exist"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE klynaa TO klynaa;" 2>/dev/null
psql -U postgres -c "ALTER USER klynaa CREATEDB;" 2>/dev/null

# Run migrations
echo "🔄 Running database migrations..."
python manage.py makemigrations
python manage.py migrate

# Create test users
echo "👥 Creating test users..."
python manage.py create_test_users

# Create superuser if it doesn't exist
echo "👑 Creating superuser..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@klynaa.com', 'admin123')
    print('Superuser created: admin / admin123')
else:
    print('Superuser already exists')
"

# Start development server
echo "🎉 Setup complete!"
echo ""
echo "Test Accounts:"
echo "  Admin: admin@klynaa.test / Admin123!"
echo "  Worker: worker@klynaa.test / Worker123!"
echo "  Customer: binowner@klynaa.test / BinOwner123!"
echo ""
echo "Django Admin: http://localhost:8000/admin/"
echo "API Root: http://localhost:8000/api/"
echo ""
echo "Starting development server..."
python manage.py runserver