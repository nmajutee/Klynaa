"""QR Code scanning and management views."""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from .models import Bin
from .serializers import BinSerializer
import uuid


class QRCodeViewSet(viewsets.ViewSet):
    """QR Code scanning and management endpoints."""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def scan(self, request):
        """Scan QR code and return bin information."""
        qr_data = request.data.get('qr_data')
        if not qr_data:
            return Response(
                {'error': 'qr_data is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Extract UUID from QR data (format: klynaa://bin/{uuid})
        try:
            if qr_data.startswith('klynaa://bin/'):
                qr_uuid = qr_data.split('/')[-1]
                bin_uuid = uuid.UUID(qr_uuid)
            else:
                # Try direct UUID parsing
                bin_uuid = uuid.UUID(qr_data)
        except (ValueError, IndexError):
            return Response(
                {'error': 'Invalid QR code format'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find bin by QR UUID
        try:
            bin_obj = Bin.objects.get(qr_code_uuid=bin_uuid)
            serializer = BinSerializer(bin_obj)
            return Response({
                'success': True,
                'bin': serializer.data,
                'message': f'Bin {bin_obj.label} scanned successfully'
            })
        except Bin.DoesNotExist:
            return Response(
                {'error': 'Bin not found for this QR code'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def generate(self, request):
        """Generate QR code for a specific bin."""
        bin_id = request.query_params.get('bin_id')
        if not bin_id:
            return Response(
                {'error': 'bin_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        bin_obj = get_object_or_404(Bin, bin_id=bin_id)

        # Ensure user owns the bin or is staff
        if bin_obj.owner != request.user and not request.user.is_staff:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Generate QR code if not exists
        if not bin_obj.qr_code_image:
            bin_obj.generate_qr_code()
            bin_obj.save()

        # Return QR code image
        if bin_obj.qr_code_image:
            response = HttpResponse(bin_obj.qr_code_image.read(), content_type='image/png')
            response['Content-Disposition'] = f'inline; filename="qr_{bin_obj.bin_id}.png"'
            return response
        else:
            return Response(
                {'error': 'Failed to generate QR code'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def validate_location(self, request):
        """Validate that user is at the bin location for scanning."""
        qr_uuid = request.data.get('qr_uuid')
        user_lat = request.data.get('latitude')
        user_lng = request.data.get('longitude')

        if not all([qr_uuid, user_lat, user_lng]):
            return Response(
                {'error': 'qr_uuid, latitude, and longitude are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            bin_obj = Bin.objects.get(qr_code_uuid=qr_uuid)
        except Bin.DoesNotExist:
            return Response(
                {'error': 'Bin not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Calculate distance (simple approximation)
        from math import radians, cos, sin, asin, sqrt

        def haversine(lon1, lat1, lon2, lat2):
            """Calculate distance between two points on earth."""
            lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
            dlon = lon2 - lon1
            dlat = lat2 - lat1
            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c = 2 * asin(sqrt(a))
            r = 6371  # Radius of earth in kilometers
            return c * r * 1000  # Return in meters

        distance = haversine(
            float(user_lng), float(user_lat),
            float(bin_obj.longitude), float(bin_obj.latitude)
        )

        # Allow 50 meter radius for location validation
        max_distance = 50
        is_valid = distance <= max_distance

        return Response({
            'valid': is_valid,
            'distance_meters': round(distance, 2),
            'max_distance_meters': max_distance,
            'bin': BinSerializer(bin_obj).data
        })
