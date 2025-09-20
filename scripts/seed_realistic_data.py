#!/usr/bin/env python3
"""
Realistic Data Seeding Script for Klynaa Waste Management
Creates authentic, interconnected data for dashboard analytics

Run: python manage.py shell < scripts/seed_realistic_data.py
"""

import os
import django
import sys
import random
from datetime import datetime, timedelta, date
from decimal import Decimal
from faker import Faker

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.bins.models import Bin, PickupRequest
from apps.reviews.models import Review
from apps.payments.models import PaymentTransaction, EscrowAccount

User = get_user_model()
fake = Faker()

# Configuration
WORKER_COUNT = 25
CUSTOMER_COUNT = 150
BINS_PER_CUSTOMER = 2
MONTHS_OF_HISTORY = 6
REVIEWS_PERCENTAGE = 0.75  # 75% of completed pickups get reviews

class KlynaaDataSeeder:
    def __init__(self):
        self.fake = fake
        self.workers = []
        self.customers = []
        self.bins = []
        self.pickup_requests = []

        # Nairobi coordinates for realistic locations
        self.nairobi_bounds = {
            'lat_min': -1.4440, 'lat_max': -1.1630,
            'lng_min': 36.6509, 'lng_max': 37.1058
        }

        # Waste types with realistic distributions
        self.waste_types = [
            ('organic', 0.40),      # 40% organic waste
            ('plastic', 0.25),      # 25% plastic
            ('paper', 0.15),        # 15% paper
            ('glass', 0.10),        # 10% glass
            ('metal', 0.05),        # 5% metal
            ('general', 0.05)       # 5% mixed
        ]

        # Worker performance tiers for realistic variation
        self.worker_tiers = {
            'high_performer': 0.15,    # Top 15% - excellent ratings, fast service
            'good_performer': 0.50,    # 50% - solid performance
            'average_performer': 0.30, # 30% - acceptable performance
            'poor_performer': 0.05     # 5% - needs improvement
        }

    def clear_existing_data(self):
        """Clear existing data to start fresh"""
        print("🗑️  Clearing existing data...")
        Review.objects.all().delete()
        PaymentTransaction.objects.all().delete()
        EscrowAccount.objects.all().delete()
        PickupRequest.objects.all().delete()
        Bin.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
        print("✅ Existing data cleared")

    def create_workers(self):
        """Create diverse worker profiles with varying performance levels"""
        print(f"👷 Creating {WORKER_COUNT} workers...")

        kenyan_names = [
            ('James', 'Mwangi'), ('Grace', 'Wanjiku'), ('Peter', 'Kariuki'),
            ('Mary', 'Njeri'), ('John', 'Kamau'), ('Faith', 'Nyambura'),
            ('Samuel', 'Macharia'), ('Ruth', 'Wambui'), ('David', 'Githinji'),
            ('Sarah', 'Wangari'), ('Michael', 'Njenga'), ('Jane', 'Wairimu'),
            ('Paul', 'Maina'), ('Lucy', 'Njoki'), ('Daniel', 'Kinyanjui'),
            ('Anne', 'Muthoni'), ('George', 'Wahome'), ('Monica', 'Wanjiru'),
            ('Francis', 'Mbugua'), ('Catherine', 'Nduta'), ('Simon', 'Kimani'),
            ('Esther', 'Nyawira'), ('Joseph', 'Muturi'), ('Rebecca', 'Wacuka'),
            ('Anthony', 'Ndungu')
        ]

        # Nairobi neighborhoods for workers
        nairobi_areas = [
            'Kibera', 'Eastleigh', 'Westlands', 'Kasarani', 'Embakasi',
            'Dagoretti', 'Langata', 'Makadara', 'Kamukunji', 'Starehe',
            'Mathare', 'Roysambu', 'Ruaraka', 'Githurai', 'Kahawa West'
        ]

        for i in range(WORKER_COUNT):
            first_name, last_name = random.choice(kenyan_names)
            area = random.choice(nairobi_areas)

            # Generate realistic coordinates within Nairobi
            lat = round(random.uniform(self.nairobi_bounds['lat_min'], self.nairobi_bounds['lat_max']), 6)
            lng = round(random.uniform(self.nairobi_bounds['lng_min'], self.nairobi_bounds['lng_max']), 6)

            # Assign performance tier
            tier_roll = random.random()
            if tier_roll <= 0.15:
                tier = 'high_performer'
                base_rating = random.uniform(4.6, 5.0)
                availability_rate = random.uniform(0.85, 0.95)
            elif tier_roll <= 0.65:
                tier = 'good_performer'
                base_rating = random.uniform(4.0, 4.6)
                availability_rate = random.uniform(0.70, 0.85)
            elif tier_roll <= 0.95:
                tier = 'average_performer'
                base_rating = random.uniform(3.2, 4.0)
                availability_rate = random.uniform(0.55, 0.70)
            else:
                tier = 'poor_performer'
                base_rating = random.uniform(2.5, 3.2)
                availability_rate = random.uniform(0.40, 0.55)

            worker = User.objects.create(
                username=f"worker_{i+1:03d}",
                email=f"{first_name.lower()}.{last_name.lower()}@klynaa.com",
                first_name=first_name,
                last_name=last_name,
                phone_number=f"+254{random.randint(700000000, 799999999)}",
                role=User.UserRole.WORKER,
                is_verified=True,
                latitude=Decimal(str(lat)),
                longitude=Decimal(str(lng)),
                rating_average=Decimal(str(round(base_rating, 2))),
                rating_count=random.randint(15, 150),  # Established workers have history
                wallet_balance=Decimal(str(random.randint(500, 15000))),  # KES
                is_available=random.random() < availability_rate,
                service_radius_km=random.choice([3, 5, 7, 10]),
                last_active=timezone.now() - timedelta(minutes=random.randint(5, 1440))
            )

            # Add performance metadata
            worker._performance_tier = tier
            self.workers.append(worker)

        print(f"✅ Created {len(self.workers)} workers with performance distribution")

    def create_customers(self):
        """Create diverse customer profiles"""
        print(f"🏠 Creating {CUSTOMER_COUNT} customers...")

        customer_types = [
            'residential', 'small_business', 'restaurant', 'office', 'retail'
        ]

        for i in range(CUSTOMER_COUNT):
            customer_type = random.choice(customer_types)

            if customer_type == 'residential':
                first_name = fake.first_name()
                last_name = fake.last_name()
                username_prefix = "customer"
            elif customer_type == 'small_business':
                first_name = fake.company()
                last_name = "Business"
                username_prefix = "business"
            elif customer_type == 'restaurant':
                first_name = fake.company()
                last_name = "Restaurant"
                username_prefix = "restaurant"
            elif customer_type == 'office':
                first_name = fake.company()
                last_name = "Office"
                username_prefix = "office"
            else:  # retail
                first_name = fake.company()
                last_name = "Store"
                username_prefix = "retail"

            # Generate coordinates within Nairobi
            lat = round(random.uniform(self.nairobi_bounds['lat_min'], self.nairobi_bounds['lat_max']), 6)
            lng = round(random.uniform(self.nairobi_bounds['lng_min'], self.nairobi_bounds['lng_max']), 6)

            customer = User.objects.create(
                username=f"{username_prefix}_{i+1:03d}",
                email=f"{username_prefix}{i+1}@example.com",
                first_name=first_name,
                last_name=last_name,
                phone_number=f"+254{random.randint(700000000, 799999999)}",
                role=User.UserRole.CUSTOMER,
                is_verified=random.choice([True, True, True, False]),  # 75% verified
                latitude=Decimal(str(lat)),
                longitude=Decimal(str(lng)),
                wallet_balance=Decimal(str(random.randint(0, 5000))),  # KES
                last_active=timezone.now() - timedelta(days=random.randint(0, 30))
            )

            customer._customer_type = customer_type
            self.customers.append(customer)

        print(f"✅ Created {len(self.customers)} customers")

    def create_bins(self):
        """Create bins for customers with realistic distribution"""
        print("🗂️  Creating bins...")

        bin_counter = 1
        for customer in self.customers:
            # Determine number of bins based on customer type
            if customer._customer_type == 'residential':
                bin_count = random.choices([1, 2], weights=[0.7, 0.3])[0]
            elif customer._customer_type in ['restaurant', 'office']:
                bin_count = random.choices([2, 3, 4], weights=[0.5, 0.3, 0.2])[0]
            else:  # small_business, retail
                bin_count = random.choices([1, 2, 3], weights=[0.4, 0.4, 0.2])[0]

            for _ in range(bin_count):
                # Generate nearby coordinates (within 50m of customer)
                lat_offset = random.uniform(-0.0005, 0.0005)  # ~50m variance
                lng_offset = random.uniform(-0.0005, 0.0005)

                bin_lat = float(customer.latitude) + lat_offset
                bin_lng = float(customer.longitude) + lng_offset

                # Generate realistic fill levels and status
                fill_level = random.randint(0, 100)
                if fill_level < 25:
                    status = Bin.BinStatus.EMPTY
                elif fill_level < 75:
                    status = Bin.BinStatus.PARTIAL
                elif fill_level < 90:
                    status = Bin.BinStatus.FULL
                else:
                    status = Bin.BinStatus.PENDING

                bin_obj = Bin.objects.create(
                    owner=customer,
                    bin_id=f"BIN{bin_counter:06d}",
                    label=f"{customer.first_name}'s {random.choice(['Kitchen', 'Office', 'Main', 'Outdoor'])} Bin",
                    latitude=Decimal(str(round(bin_lat, 6))),
                    longitude=Decimal(str(round(bin_lng, 6))),
                    address=f"{fake.street_address()}, Nairobi",
                    status=status,
                    fill_level=fill_level,
                    capacity_liters=random.choice([60, 120, 240, 360]),
                    last_pickup=timezone.now() - timedelta(days=random.randint(0, 21))
                )

                self.bins.append(bin_obj)
                bin_counter += 1

        print(f"✅ Created {len(self.bins)} bins")

    def create_pickup_requests(self):
        """Generate months of pickup history with realistic patterns"""
        print(f"📋 Creating {MONTHS_OF_HISTORY} months of pickup history...")

        # Generate pickup requests going back MONTHS_OF_HISTORY
        start_date = date.today() - timedelta(days=MONTHS_OF_HISTORY * 30)
        end_date = date.today()

        current_date = start_date
        pickup_counter = 1

        while current_date <= end_date:
            # Determine daily pickup volume (higher on weekends, lower on holidays)
            is_weekend = current_date.weekday() >= 5
            daily_multiplier = 1.3 if is_weekend else 1.0

            # Seasonal variations (more pickups in December, fewer in rainy season)
            seasonal_multiplier = 1.0
            if current_date.month == 12:  # Holiday season
                seasonal_multiplier = 1.4
            elif current_date.month in [4, 5]:  # Rainy season
                seasonal_multiplier = 0.8

            # Base pickups per day adjusted by factors
            base_daily_pickups = 15
            daily_pickups = int(base_daily_pickups * daily_multiplier * seasonal_multiplier)
            daily_pickups = max(5, daily_pickups)  # Minimum 5 per day

            for _ in range(daily_pickups):
                # Select random bin and worker
                bin_obj = random.choice(self.bins)

                # Find workers within service radius (simplified - just pick random for demo)
                worker = random.choice(self.workers)

                # Generate pickup request
                request_time = timezone.make_aware(
                    datetime.combine(current_date, fake.time())
                )

                # Determine status based on age and worker performance
                days_old = (date.today() - current_date).days

                if days_old > 2:  # Older requests are likely completed
                    if worker._performance_tier == 'high_performer':
                        status_choices = [
                            (PickupRequest.PickupStatus.COMPLETED, 0.90),
                            (PickupRequest.PickupStatus.CANCELLED, 0.05),
                            (PickupRequest.PickupStatus.DISPUTED, 0.05)
                        ]
                    elif worker._performance_tier == 'good_performer':
                        status_choices = [
                            (PickupRequest.PickupStatus.COMPLETED, 0.80),
                            (PickupRequest.PickupStatus.CANCELLED, 0.15),
                            (PickupRequest.PickupStatus.DISPUTED, 0.05)
                        ]
                    elif worker._performance_tier == 'average_performer':
                        status_choices = [
                            (PickupRequest.PickupStatus.COMPLETED, 0.65),
                            (PickupRequest.PickupStatus.CANCELLED, 0.25),
                            (PickupRequest.PickupStatus.DISPUTED, 0.10)
                        ]
                    else:  # poor_performer
                        status_choices = [
                            (PickupRequest.PickupStatus.COMPLETED, 0.45),
                            (PickupRequest.PickupStatus.CANCELLED, 0.35),
                            (PickupRequest.PickupStatus.DISPUTED, 0.20)
                        ]
                else:  # Recent requests might still be in progress
                    status_choices = [
                        (PickupRequest.PickupStatus.COMPLETED, 0.40),
                        (PickupRequest.PickupStatus.IN_PROGRESS, 0.30),
                        (PickupRequest.PickupStatus.ACCEPTED, 0.20),
                        (PickupRequest.PickupStatus.OPEN, 0.10)
                    ]

                # Select status
                statuses, weights = zip(*status_choices)
                status = random.choices(statuses, weights=weights)[0]

                # Generate waste type
                waste_types, waste_weights = zip(*self.waste_types)
                waste_type = random.choices(waste_types, weights=waste_weights)[0]

                # Calculate fees based on waste type and weight
                base_fee = Decimal('500')  # KES 500 base
                if waste_type == 'organic':
                    fee_multiplier = Decimal('0.8')  # Cheaper for organic
                elif waste_type in ['plastic', 'paper']:
                    fee_multiplier = Decimal('1.0')  # Standard rate
                else:  # glass, metal, general
                    fee_multiplier = Decimal('1.2')  # Premium for special handling

                expected_fee = base_fee * fee_multiplier
                actual_fee = expected_fee if status == PickupRequest.PickupStatus.COMPLETED else None

                # Create pickup request
                pickup_request = PickupRequest.objects.create(
                    bin=bin_obj,
                    owner=bin_obj.owner,
                    worker=worker,
                    status=status,
                    created_at=request_time,
                    expected_fee=expected_fee,
                    actual_fee=actual_fee,
                    waste_type=waste_type,
                    estimated_weight_kg=Decimal(str(random.uniform(5, 50))),
                    notes=fake.sentence() if random.random() < 0.3 else "",
                )

                # Set timestamps based on status
                if status != PickupRequest.PickupStatus.OPEN:
                    pickup_request.accepted_at = request_time + timedelta(minutes=random.randint(10, 180))

                if status in [PickupRequest.PickupStatus.IN_PROGRESS, PickupRequest.PickupStatus.DELIVERED, PickupRequest.PickupStatus.COMPLETED]:
                    pickup_request.picked_at = pickup_request.accepted_at + timedelta(minutes=random.randint(30, 240))

                if status in [PickupRequest.PickupStatus.DELIVERED, PickupRequest.PickupStatus.COMPLETED]:
                    pickup_request.completed_at = pickup_request.picked_at + timedelta(minutes=random.randint(15, 60))

                pickup_request.save()
                self.pickup_requests.append(pickup_request)
                pickup_counter += 1

            current_date += timedelta(days=1)

        print(f"✅ Created {len(self.pickup_requests)} pickup requests")

    def create_reviews(self):
        """Generate realistic reviews for completed pickups"""
        print("⭐ Creating customer reviews...")

        completed_pickups = [p for p in self.pickup_requests if p.status == PickupRequest.PickupStatus.COMPLETED]

        review_templates = {
            5: [
                "Excellent service! Very punctual and professional.",
                "Outstanding worker. Highly recommend!",
                "Perfect pickup. Clean and efficient.",
                "Amazing service. Will definitely use again!",
                "Very happy with the service. 5 stars!"
            ],
            4: [
                "Good service overall. Worker was professional.",
                "Satisfied with the pickup. Minor delay but good work.",
                "Nice job. Would recommend to others.",
                "Good experience. Worker was friendly and efficient."
            ],
            3: [
                "Average service. Got the job done.",
                "Okay experience. Nothing special but adequate.",
                "Service was fine. Could be better with timing.",
                "Acceptable work. Room for improvement."
            ],
            2: [
                "Service was below expectations. Late arrival.",
                "Not very satisfied. Poor communication.",
                "Had some issues with the pickup process.",
                "Disappointing service. Worker seemed rushed."
            ],
            1: [
                "Very poor service. Would not recommend.",
                "Terrible experience. Worker was unprofessional.",
                "Worst pickup service ever. Avoid this worker.",
                "Completely unsatisfied. Major issues."
            ]
        }

        reviews_created = 0
        for pickup in completed_pickups:
            if random.random() < REVIEWS_PERCENTAGE:
                # Generate rating based on worker performance tier
                if pickup.worker._performance_tier == 'high_performer':
                    rating_choices = [(5, 0.70), (4, 0.25), (3, 0.05)]
                elif pickup.worker._performance_tier == 'good_performer':
                    rating_choices = [(5, 0.35), (4, 0.40), (3, 0.20), (2, 0.05)]
                elif pickup.worker._performance_tier == 'average_performer':
                    rating_choices = [(4, 0.20), (3, 0.50), (2, 0.25), (1, 0.05)]
                else:  # poor_performer
                    rating_choices = [(3, 0.15), (2, 0.35), (1, 0.50)]

                ratings, weights = zip(*rating_choices)
                rating = random.choices(ratings, weights=weights)[0]

                comment = random.choice(review_templates[rating])

                review = Review.objects.create(
                    reviewer=pickup.owner,
                    reviewed_user=pickup.worker,
                    pickup_request=pickup,
                    rating=rating,
                    comment=comment,
                    review_type=Review.ReviewType.CUSTOMER_TO_WORKER,
                    created_at=pickup.completed_at + timedelta(hours=random.randint(1, 72))
                )

                reviews_created += 1

        print(f"✅ Created {reviews_created} customer reviews")

    def create_payments(self):
        """Generate payment records for completed pickups"""
        print("💳 Creating payment transactions...")

        completed_pickups = [p for p in self.pickup_requests if p.status == PickupRequest.PickupStatus.COMPLETED and p.actual_fee]

        payments_created = 0
        for pickup in completed_pickups:
            # Create payment transaction
            payment = PaymentTransaction.objects.create(
                user=pickup.owner,
                amount=pickup.actual_fee,
                transaction_type=PaymentTransaction.TransactionType.PAYMENT,
                status=PaymentTransaction.TransactionStatus.COMPLETED,
                method=random.choice([
                    PaymentTransaction.PaymentMethod.MOBILE_MONEY,
                    PaymentTransaction.PaymentMethod.MOBILE_MONEY,
                    PaymentTransaction.PaymentMethod.MOBILE_MONEY,  # M-Pesa is dominant
                    PaymentTransaction.PaymentMethod.CARD,
                    PaymentTransaction.PaymentMethod.CASH
                ]),
                reference_id=f"PAY{payments_created+1:06d}",
                created_at=pickup.completed_at + timedelta(minutes=random.randint(5, 30))
            )

            payments_created += 1

        print(f"✅ Created {payments_created} payment transactions")

    def update_user_ratings(self):
        """Update user ratings based on their reviews"""
        print("🔄 Updating user ratings...")

        for worker in self.workers:
            reviews = Review.objects.filter(reviewed_user=worker)
            if reviews.exists():
                avg_rating = reviews.aggregate(models.Avg('rating'))['rating__avg']
                worker.rating_average = Decimal(str(round(avg_rating, 2)))
                worker.rating_count = reviews.count()
                worker.save()

        print("✅ Updated user ratings")

    def print_summary(self):
        """Print data generation summary"""
        print("\n" + "="*60)
        print("🎉 KLYNAA DATA SEEDING COMPLETE!")
        print("="*60)
        print(f"👷 Workers created: {len(self.workers)}")
        print(f"🏠 Customers created: {len(self.customers)}")
        print(f"🗂️  Bins created: {len(self.bins)}")
        print(f"📋 Pickup requests: {len(self.pickup_requests)}")

        # Status breakdown
        status_counts = {}
        for pickup in self.pickup_requests:
            status = pickup.status
            status_counts[status] = status_counts.get(status, 0) + 1

        print(f"\nPickup Status Breakdown:")
        for status, count in status_counts.items():
            percentage = (count / len(self.pickup_requests)) * 100
            print(f"  {status}: {count} ({percentage:.1f}%)")

        print(f"\n⭐ Reviews created: {Review.objects.count()}")
        print(f"💳 Payments created: {PaymentTransaction.objects.count()}")

        # Worker performance summary
        high_performers = [w for w in self.workers if w._performance_tier == 'high_performer']
        print(f"\n🏆 High performing workers: {len(high_performers)}")

        print(f"\n🌍 Data covers {MONTHS_OF_HISTORY} months of realistic activity")
        print("📊 Your dashboard is now populated with rich, realistic data!")
        print("="*60)

def main():
    """Main seeding function"""
    print("🚀 Starting Klynaa realistic data seeding...")

    seeder = KlynaaDataSeeder()

    # Execute seeding steps
    seeder.clear_existing_data()
    seeder.create_workers()
    seeder.create_customers()
    seeder.create_bins()
    seeder.create_pickup_requests()
    seeder.create_reviews()
    seeder.create_payments()
    seeder.update_user_ratings()
    seeder.print_summary()

if __name__ == "__main__":
    main()