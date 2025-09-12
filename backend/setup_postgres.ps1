# Klynaa PostgreSQL Setup Script (PowerShell)

Write-Host "🚀 Setting up Klynaa with PostgreSQL..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "manage.py")) {
    Write-Host "❌ Please run this script from the backend directory" -ForegroundColor Red
    exit 1
}

# Check for .env file
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    @"
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
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Created .env file with default settings" -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Install Python dependencies
Write-Host "📦 Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Database setup instructions
Write-Host "🗄️  PostgreSQL Database Setup Instructions:" -ForegroundColor Cyan
Write-Host "1. Make sure PostgreSQL is installed and running"
Write-Host "2. Open PostgreSQL command line (psql) as postgres user"
Write-Host "3. Run these commands:"
Write-Host "   CREATE DATABASE klynaa;"
Write-Host "   CREATE USER klynaa WITH PASSWORD 'klynaa_password_123';"
Write-Host "   GRANT ALL PRIVILEGES ON DATABASE klynaa TO klynaa;"
Write-Host "   ALTER USER klynaa CREATEDB;"
Write-Host ""

# Wait for user confirmation
Write-Host "Press Enter when database setup is complete..." -ForegroundColor Yellow
Read-Host

# Run migrations
Write-Host "🔄 Running database migrations..." -ForegroundColor Yellow
python manage.py makemigrations
python manage.py migrate

# Create test users
Write-Host "👥 Creating test users..." -ForegroundColor Yellow
python manage.py create_test_users

# Create superuser
Write-Host "👑 Creating superuser..." -ForegroundColor Yellow
python manage.py shell -c @"
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@klynaa.com', 'admin123')
    print('Superuser created: admin / admin123')
else:
    print('Superuser already exists')
"@

# Setup complete
Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Test Accounts:" -ForegroundColor Cyan
Write-Host "  Admin: admin@klynaa.test / Admin123!" -ForegroundColor White
Write-Host "  Worker: worker@klynaa.test / Worker123!" -ForegroundColor White
Write-Host "  Customer: binowner@klynaa.test / BinOwner123!" -ForegroundColor White
Write-Host ""
Write-Host "URLs:" -ForegroundColor Cyan
Write-Host "  Django Admin: http://localhost:8000/admin/" -ForegroundColor White
Write-Host "  API Root: http://localhost:8000/api/" -ForegroundColor White
Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Green
python manage.py runserver