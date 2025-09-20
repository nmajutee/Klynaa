#!/usr/bin/env python3
"""
Simple Data Seeder for Klynaa Dashboard - No Signal Dependencies
Creates realistic data directly without triggering notifications
"""

import os
import sys
import django
import random
from datetime import datetime, timedelta
from decimal import Decimal

# Django setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, '/home/dev/Klynaa/backend')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction

# Import models
User = get_user_model()

def create_simple_data():
    print("🚀 Creating simple realistic data for dashboard...")

    # Disable Django signals temporarily
    from django.db.models import signals
    from apps.notifications.signals import handle_pickup_request_changes

    # Disconnect the problematic signal
    signals.post_save.disconnect(handle_pickup_request_changes, sender=None)

    with transaction.atomic():
        # Create a test worker
        print("Creating worker...")
        worker, created = User.objects.get_or_create(
            username="james_worker",
            defaults={
                'email': "james.mwangi@klynaa.com",
                'first_name': "James",
                'last_name': "Mwangi",
                'phone_number': "+254712345678",
                'role': User.UserRole.WORKER,
                'is_verified': True,
                'latitude': Decimal('-1.2921'),
                'longitude': Decimal('36.8219'),
                'rating_average': Decimal('4.7'),
                'rating_count': 45,
                'wallet_balance': Decimal('12500.00'),
                'is_available': True
            }
        )
        print(f"✅ Worker created: {worker.get_full_name()}")

        # Create test customers
        print("Creating customers...")
        customers = []
        customer_data = [
            ("Grace", "Wanjiku", "+254701234567"),
            ("Peter", "Kariuki", "+254702345678"),
            ("Mary", "Njeri", "+254703456789"),
            ("John", "Kamau", "+254704567890")
        ]

        for i, (first, last, phone) in enumerate(customer_data):
            customer, created = User.objects.get_or_create(
                username=f"customer_{i+1}",
                defaults={
                    'email': f"{first.lower()}.{last.lower()}@example.com",
                    'first_name': first,
                    'last_name': last,
                    'phone_number': phone,
                    'role': User.UserRole.CUSTOMER,
                    'is_verified': True,
                    'latitude': Decimal(str(-1.2921 + random.uniform(-0.01, 0.01))),
                    'longitude': Decimal(str(36.8219 + random.uniform(-0.01, 0.01))),
                    'wallet_balance': Decimal(str(random.randint(500, 3000)))
                }
            )
            customers.append(customer)

        print(f"✅ Created {len(customers)} customers")

        # Create bins
        print("Creating bins...")
        from apps.bins.models import Bin
        bins = []

        for i, customer in enumerate(customers):
            bin_obj, created = Bin.objects.get_or_create(
                bin_id=f"BIN{i+1:03d}01",
                defaults={
                    'owner': customer,
                    'label': f"{customer.first_name}'s Main Bin",
                    'latitude': customer.latitude,
                    'longitude': customer.longitude,
                    'address': f"Address {i+1}, Nairobi",
                    'status': random.choice(['empty', 'partial', 'full']),
                    'fill_level': random.randint(0, 100),
                    'capacity_liters': 120
                }
            )
            bins.append(bin_obj)

        print(f"✅ Created {len(bins)} bins")

        # Create pickup requests manually (bypassing signals)
        print("Creating pickup requests...")
        from apps.bins.models import PickupRequest
        pickups = []
        waste_types = ['organic', 'plastic', 'paper', 'glass', 'general']

        # Create pickups for the last 30 days
        for day in range(30):
            date = timezone.now() - timedelta(days=day)

            # 2-4 pickups per day
            for _ in range(random.randint(2, 4)):
                bin_obj = random.choice(bins)
                waste_type = random.choices(waste_types, weights=[40, 25, 15, 10, 10])[0]

                # Most are completed
                status = random.choices([
                    'completed', 'in_progress', 'cancelled'
                ], weights=[80, 15, 5])[0]

                expected_fee = Decimal(str(random.randint(300, 800)))
                actual_fee = expected_fee if status == 'completed' else None

                pickup = PickupRequest(
                    bin=bin_obj,
                    owner=bin_obj.owner,
                    worker=worker,
                    status=status,
                    created_at=date,
                    expected_fee=expected_fee,
                    actual_fee=actual_fee,
                    waste_type=waste_type,
                    estimated_weight_kg=Decimal(str(random.uniform(5, 30))),
                    accepted_at=date + timedelta(minutes=random.randint(5, 60)),
                    picked_at=date + timedelta(minutes=random.randint(70, 150)) if status != 'cancelled' else None,
                    completed_at=date + timedelta(minutes=random.randint(160, 240)) if status == 'completed' else None
                )
                pickup.save()
                pickups.append(pickup)

        print(f"✅ Created {len(pickups)} pickup requests")

        # Create reviews
        print("Creating reviews...")
        from apps.reviews.models import Review
        completed_pickups = [p for p in pickups if p.status == 'completed']
        reviews = []

        review_comments = [
            "Excellent service! Very professional and punctual.",
            "Great worker! Highly recommend.",
            "Good service overall. Happy with the pickup.",
            "Professional and efficient. Will use again!",
            "Amazing service. Clean and quick pickup."
        ]

        for pickup in random.sample(completed_pickups, min(len(completed_pickups), 20)):
            rating = random.choices([5, 4, 3], weights=[60, 30, 10])[0]

            review = Review(
                reviewer=pickup.owner,
                reviewed_user=pickup.worker,
                pickup_request=pickup,
                rating=rating,
                comment=random.choice(review_comments),
                review_type='customer_to_worker',
                created_at=pickup.completed_at + timedelta(hours=random.randint(1, 48))
            )
            review.save()
            reviews.append(review)

        print(f"✅ Created {len(reviews)} reviews")

        # Create payments
        print("Creating payments...")
        from apps.payments.models import PaymentTransaction
        payments = []

        for pickup in completed_pickups[:15]:  # Create payments for some pickups
            if pickup.actual_fee:
                payment = PaymentTransaction(
                    user=pickup.owner,
                    amount=pickup.actual_fee,
                    transaction_type='payment',
                    status='completed',
                    method=random.choice(['mobile_money', 'card', 'cash']),
                    reference_id=f"PAY{len(payments)+1:06d}",
                    created_at=pickup.completed_at + timedelta(minutes=random.randint(5, 30))
                )
                payment.save()
                payments.append(payment)

        print(f"✅ Created {len(payments)} payments")

        # Update worker stats
        print("Updating worker statistics...")
        if reviews:
            avg_rating = sum(r.rating for r in reviews) / len(reviews)
            worker.rating_average = Decimal(str(round(avg_rating, 2)))
            worker.rating_count = len(reviews)
            worker.save()

        print(f"✅ Updated worker rating: {worker.rating_average}★ ({worker.rating_count} reviews)")

    # Print summary
    print("\n" + "="*50)
    print("🎉 SIMPLE DATA SEEDING COMPLETE!")
    print("="*50)
    print(f"👷 Worker: James Mwangi")
    print(f"🏠 Customers: {len(customers)}")
    print(f"🗂️  Bins: {len(bins)}")
    print(f"📋 Pickups: {len(pickups)}")
    print(f"⭐ Reviews: {len(reviews)}")
    print(f"💳 Payments: {len(payments)}")

    completed = len([p for p in pickups if p.status == 'completed'])
    total_earnings = sum(p.actual_fee for p in pickups if p.actual_fee and p.status == 'completed')

    print(f"\n📊 Statistics:")
    print(f"  Completed pickups: {completed}")
    print(f"  Total earnings: KES {total_earnings:,}")
    print(f"  Worker rating: {worker.rating_average}★")
    print("="*50)
    print("🚀 Your dashboard now has realistic data!")

if __name__ == "__main__":
    create_simple_data()