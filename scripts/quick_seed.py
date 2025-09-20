#!/usr/bin/env python3
"""
Quick Realistic Data Seeder for Klynaa
Creates essential test data for dashboard demonstration
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
from apps.bins.models import Bin, PickupRequest
from apps.reviews.models import Review
from apps.payments.models import PaymentTransaction

User = get_user_model()

def create_test_data():
    print("🚀 Creating realistic test data...")

    # Create a high-performing worker
    worker = User.objects.create(
        username="james_worker",
        email="james.mwangi@klynaa.com",
        first_name="James",
        last_name="Mwangi",
        phone_number="+254712345678",
        role=User.UserRole.WORKER,
        is_verified=True,
        latitude=Decimal('-1.2921'),
        longitude=Decimal('36.8219'),
        rating_average=Decimal('4.7'),
        rating_count=45,
        wallet_balance=Decimal('12500.00'),
        is_available=True
    )
    print(f"✅ Created worker: {worker.get_full_name()}")

    # Create several customers with bins
    customers_data = [
        ("Grace", "Wanjiku", "residential"),
        ("Peter", "Kariuki", "business"),
        ("Mary", "Njeri", "restaurant"),
        ("John", "Kamau", "office")
    ]

    customers = []
    bins = []

    for i, (first, last, type_) in enumerate(customers_data):
        customer = User.objects.create(
            username=f"customer_{i+1}",
            email=f"{first.lower()}.{last.lower()}@example.com",
            first_name=first,
            last_name=last,
            phone_number=f"+25470{random.randint(1000000, 9999999)}",
            role=User.UserRole.CUSTOMER,
            is_verified=True,
            latitude=Decimal(str(-1.2921 + random.uniform(-0.01, 0.01))),
            longitude=Decimal(str(36.8219 + random.uniform(-0.01, 0.01))),
            wallet_balance=Decimal(str(random.randint(500, 3000)))
        )
        customers.append(customer)

        # Create 1-2 bins per customer
        num_bins = 2 if type_ in ['business', 'restaurant'] else 1
        for j in range(num_bins):
            bin_obj = Bin.objects.create(
                owner=customer,
                bin_id=f"BIN{i+1:03d}{j+1:02d}",
                label=f"{customer.first_name}'s {['Main', 'Kitchen', 'Office'][j]} Bin",
                latitude=customer.latitude,
                longitude=customer.longitude,
                address=f"Address {i+1}, Nairobi",
                status=random.choice([Bin.BinStatus.EMPTY, Bin.BinStatus.PARTIAL, Bin.BinStatus.FULL]),
                fill_level=random.randint(0, 100),
                capacity_liters=random.choice([120, 240])
            )
            bins.append(bin_obj)

    print(f"✅ Created {len(customers)} customers and {len(bins)} bins")

    # Create pickup history for the last 60 days
    pickups = []
    waste_types = ['organic', 'plastic', 'paper', 'glass', 'general']

    for day in range(60):  # Last 60 days
        date = timezone.now() - timedelta(days=day)

        # 2-5 pickups per day
        for _ in range(random.randint(2, 5)):
            bin_obj = random.choice(bins)
            waste_type = random.choices(waste_types, weights=[40, 25, 15, 10, 10])[0]

            # Most pickups are completed
            status = random.choices([
                PickupRequest.PickupStatus.COMPLETED,
                PickupRequest.PickupStatus.IN_PROGRESS,
                PickupRequest.PickupStatus.CANCELLED
            ], weights=[85, 10, 5])[0]

            pickup = PickupRequest.objects.create(
                bin=bin_obj,
                owner=bin_obj.owner,
                worker=worker,
                status=status,
                created_at=date,
                expected_fee=Decimal(str(random.randint(300, 800))),
                actual_fee=Decimal(str(random.randint(300, 800))) if status == PickupRequest.PickupStatus.COMPLETED else None,
                waste_type=waste_type,
                estimated_weight_kg=Decimal(str(random.uniform(5, 30))),
                accepted_at=date + timedelta(minutes=random.randint(5, 60)),
                picked_at=date + timedelta(minutes=random.randint(70, 150)) if status != PickupRequest.PickupStatus.CANCELLED else None,
                completed_at=date + timedelta(minutes=random.randint(160, 240)) if status == PickupRequest.PickupStatus.COMPLETED else None
            )
            pickups.append(pickup)

    print(f"✅ Created {len(pickups)} pickup requests")

    # Create reviews for completed pickups
    completed_pickups = [p for p in pickups if p.status == PickupRequest.PickupStatus.COMPLETED]
    reviews = []

    review_comments = [
        "Excellent service! Very professional and punctual.",
        "Great worker! Highly recommend.",
        "Good service overall. Happy with the pickup.",
        "Professional and efficient. Will use again!",
        "Amazing service. Clean and quick pickup.",
        "Very satisfied with the service quality.",
        "Outstanding work! 5 stars!",
        "Reliable and friendly worker.",
        "Perfect pickup service. No complaints.",
        "Excellent communication and service."
    ]

    # Create reviews for 70% of completed pickups
    for pickup in random.sample(completed_pickups, int(len(completed_pickups) * 0.7)):
        rating = random.choices([5, 4, 3], weights=[60, 30, 10])[0]  # Mostly positive reviews

        review = Review.objects.create(
            reviewer=pickup.owner,
            reviewed_user=pickup.worker,
            pickup_request=pickup,
            rating=rating,
            comment=random.choice(review_comments),
            review_type=Review.ReviewType.CUSTOMER_TO_WORKER,
            created_at=pickup.completed_at + timedelta(hours=random.randint(1, 48))
        )
        reviews.append(review)

    print(f"✅ Created {len(reviews)} customer reviews")

    # Create payment transactions
    payments = []
    for pickup in completed_pickups:
        if pickup.actual_fee:
            payment = PaymentTransaction.objects.create(
                user=pickup.owner,
                amount=pickup.actual_fee,
                transaction_type=PaymentTransaction.TransactionType.PAYMENT,
                status=PaymentTransaction.TransactionStatus.COMPLETED,
                method=random.choices([
                    PaymentTransaction.PaymentMethod.MOBILE_MONEY,
                    PaymentTransaction.PaymentMethod.CARD,
                    PaymentTransaction.PaymentMethod.CASH
                ], weights=[70, 20, 10])[0],
                reference_id=f"PAY{len(payments)+1:06d}",
                created_at=pickup.completed_at + timedelta(minutes=random.randint(5, 30))
            )
            payments.append(payment)

    print(f"✅ Created {len(payments)} payment transactions")

    # Update worker rating based on reviews
    all_reviews = Review.objects.filter(reviewed_user=worker)
    if all_reviews.exists():
        avg_rating = sum(r.rating for r in all_reviews) / len(all_reviews)
        worker.rating_average = Decimal(str(round(avg_rating, 2)))
        worker.rating_count = len(all_reviews)
        worker.save()
        print(f"✅ Updated worker rating: {worker.rating_average} ({worker.rating_count} reviews)")

    # Summary
    print("\n" + "="*50)
    print("🎉 TEST DATA CREATION COMPLETE!")
    print("="*50)
    print(f"👷 Workers: 1 (James Mwangi)")
    print(f"🏠 Customers: {len(customers)}")
    print(f"🗂️  Bins: {len(bins)}")
    print(f"📋 Pickup requests: {len(pickups)}")
    print(f"⭐ Reviews: {len(reviews)}")
    print(f"💳 Payments: {len(payments)}")

    # Status breakdown
    completed = len([p for p in pickups if p.status == PickupRequest.PickupStatus.COMPLETED])
    in_progress = len([p for p in pickups if p.status == PickupRequest.PickupStatus.IN_PROGRESS])
    cancelled = len([p for p in pickups if p.status == PickupRequest.PickupStatus.CANCELLED])

    print(f"\nPickup Status:")
    print(f"  Completed: {completed} ({completed/len(pickups)*100:.1f}%)")
    print(f"  In Progress: {in_progress} ({in_progress/len(pickups)*100:.1f}%)")
    print(f"  Cancelled: {cancelled} ({cancelled/len(pickups)*100:.1f}%)")

    print(f"\n💰 Total earnings: KES {sum(p.actual_fee for p in completed_pickups if p.actual_fee):,}")
    print(f"📊 Worker rating: {worker.rating_average}★ ({worker.rating_count} reviews)")
    print("="*50)
    print("🚀 Your dashboard is now ready with realistic data!")

if __name__ == "__main__":
    create_test_data()