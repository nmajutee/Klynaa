"""
Add PostGIS location field to Bin model for advanced spatial queries.
"""

from django.contrib.gis.geos import Point
from django.db import migrations
from django.contrib.gis.db import models as gis_models


def populate_location_field(apps, schema_editor):
    """Populate the new location field from existing latitude/longitude."""
    Bin = apps.get_model('bins', 'Bin')

    for bin_obj in Bin.objects.all():
        if bin_obj.latitude and bin_obj.longitude:
            try:
                location = Point(
                    float(bin_obj.longitude),
                    float(bin_obj.latitude),
                    srid=4326
                )
                bin_obj.location = location
                bin_obj.save()
            except (ValueError, TypeError):
                continue  # Skip bins with invalid coordinates


def reverse_populate_location_field(apps, schema_editor):
    """Reverse migration - extract lat/lng from location field."""
    Bin = apps.get_model('bins', 'Bin')

    for bin_obj in Bin.objects.all():
        if bin_obj.location:
            bin_obj.longitude = bin_obj.location.x
            bin_obj.latitude = bin_obj.location.y
            bin_obj.save()


class Migration(migrations.Migration):

    dependencies = [
        ('bins', '0005_pickupproof_ai_verification_result_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='bin',
            name='location',
            field=gis_models.PointField(
                srid=4326,
                null=True,
                blank=True,
                help_text="PostGIS location point for spatial queries"
            ),
        ),
        migrations.RunPython(
            populate_location_field,
            reverse_populate_location_field
        ),
        migrations.AddIndex(
            model_name='bin',
            index=gis_models.Index(fields=['location'], name='bins_bin_location_idx'),
        ),
    ]