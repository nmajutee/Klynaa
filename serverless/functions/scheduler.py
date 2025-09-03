"""
Scheduled Tasks and Analytics Lambda Functions
"""
import json
from datetime import datetime, timedelta
from typing import Dict, Any, List
from shared.utils import (
    DjangoAPIClient,
    create_response,
    extract_event_data,
    log_function_start,
    log_function_end
)

def generate_daily_reports(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Generate daily reports for earnings, completed pickups, and system metrics
    Runs every day at 6 AM UTC
    """
    function_name = "generate_daily_reports"

    try:
        log_function_start(function_name, event)

        django_client = DjangoAPIClient()

        # Calculate yesterday's date
        yesterday = datetime.utcnow().date() - timedelta(days=1)
        yesterday_str = yesterday.isoformat()

        # Get daily statistics
        stats_response = django_client.get(f'/api/reports/daily-stats/?date={yesterday_str}')
        daily_stats = stats_response

        # Generate earnings report
        earnings_report = django_client.get(f'/api/reports/earnings/?date={yesterday_str}')

        # Generate pickup completion report
        pickup_report = django_client.get(f'/api/reports/pickups/?date={yesterday_str}')

        # Generate worker performance report
        worker_report = django_client.get(f'/api/reports/worker-performance/?date={yesterday_str}')

        # Compile comprehensive report
        report_data = {
            'date': yesterday_str,
            'summary': {
                'total_pickups': daily_stats.get('total_pickups', 0),
                'completed_pickups': daily_stats.get('completed_pickups', 0),
                'total_earnings': earnings_report.get('total_earnings', 0),
                'active_workers': daily_stats.get('active_workers', 0),
                'active_bins': daily_stats.get('active_bins', 0),
                'completion_rate': daily_stats.get('completion_rate', 0)
            },
            'earnings': earnings_report,
            'pickups': pickup_report,
            'worker_performance': worker_report,
            'generated_at': datetime.utcnow().isoformat(),
            'generated_by': 'serverless'
        }

        # Save report to database
        save_response = django_client.post('/api/reports/daily/', report_data)

        # Send admin notification with key metrics
        admin_notification = {
            'title': f'Daily Report - {yesterday_str}',
            'body': f"📊 {daily_stats.get('completed_pickups', 0)} pickups completed, "
                   f"${earnings_report.get('total_earnings', 0):.2f} earned, "
                   f"{daily_stats.get('completion_rate', 0):.1f}% completion rate",
            'data': {
                'report_type': 'daily_summary',
                'date': yesterday_str,
                'total_pickups': daily_stats.get('total_pickups', 0),
                'total_earnings': earnings_report.get('total_earnings', 0)
            }
        }

        # Get admin users and send notification
        admin_users_response = django_client.get('/api/users/admins/')
        admin_users = admin_users_response.get('admins', [])

        if admin_users:
            from functions.notifications import send_pickup_notification
            notification_event = {
                'body': json.dumps({
                    'notification_type': 'daily_report',
                    'user_type': 'admin',
                    'user_ids': [admin['id'] for admin in admin_users],
                    'custom_title': admin_notification['title'],
                    'custom_body': admin_notification['body'],
                    'data': admin_notification['data']
                })
            }
            send_pickup_notification(notification_event, None)

        log_function_end(function_name, True, f"Daily report generated for {yesterday_str}")
        return create_response(200, {
            'message': f'Daily report generated for {yesterday_str}',
            'report_id': save_response.get('id'),
            'summary': report_data['summary']
        })

    except Exception as e:
        log_function_end(function_name, False, str(e))
        return create_response(500, {
            'error': 'Internal server error',
            'message': str(e)
        })

def process_weekly_analytics(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Process weekly analytics and generate insights
    Runs every Monday at 7 AM UTC
    """
    function_name = "process_weekly_analytics"

    try:
        log_function_start(function_name, event)

        django_client = DjangoAPIClient()

        # Calculate last week's date range
        today = datetime.utcnow().date()
        last_monday = today - timedelta(days=today.weekday() + 7)
        last_sunday = last_monday + timedelta(days=6)

        week_start = last_monday.isoformat()
        week_end = last_sunday.isoformat()

        # Get weekly data
        weekly_data = django_client.get(f'/api/analytics/weekly/?start_date={week_start}&end_date={week_end}')

        # Analyze trends
        trends = analyze_weekly_trends(weekly_data)

        # Generate insights
        insights = generate_weekly_insights(weekly_data, trends)

        # Identify top performers
        top_performers = django_client.get(f'/api/analytics/top-performers/?start_date={week_start}&end_date={week_end}')

        # Compile analytics report
        analytics_data = {
            'week_start': week_start,
            'week_end': week_end,
            'data': weekly_data,
            'trends': trends,
            'insights': insights,
            'top_performers': top_performers,
            'generated_at': datetime.utcnow().isoformat(),
            'generated_by': 'serverless'
        }

        # Save analytics to database
        save_response = django_client.post('/api/analytics/weekly/', analytics_data)

        # Send admin notification with key insights
        key_insights = insights[:3]  # Top 3 insights

        admin_notification = {
            'title': f'Weekly Analytics - {week_start} to {week_end}',
            'body': f"📈 {key_insights[0] if key_insights else 'Analytics completed'}",
            'data': {
                'report_type': 'weekly_analytics',
                'week_start': week_start,
                'week_end': week_end,
                'total_pickups': weekly_data.get('total_pickups', 0),
                'total_earnings': weekly_data.get('total_earnings', 0),
                'insights_count': len(insights)
            }
        }

        # Get admin users and send notification
        admin_users_response = django_client.get('/api/users/admins/')
        admin_users = admin_users_response.get('admins', [])

        if admin_users:
            from functions.notifications import send_pickup_notification
            notification_event = {
                'body': json.dumps({
                    'notification_type': 'weekly_analytics',
                    'user_type': 'admin',
                    'user_ids': [admin['id'] for admin in admin_users],
                    'custom_title': admin_notification['title'],
                    'custom_body': admin_notification['body'],
                    'data': admin_notification['data']
                })
            }
            send_pickup_notification(notification_event, None)

        log_function_end(function_name, True, f"Weekly analytics processed for {week_start} to {week_end}")
        return create_response(200, {
            'message': f'Weekly analytics processed for {week_start} to {week_end}',
            'analytics_id': save_response.get('id'),
            'insights_count': len(insights),
            'top_insights': key_insights
        })

    except Exception as e:
        log_function_end(function_name, False, str(e))
        return create_response(500, {
            'error': 'Internal server error',
            'message': str(e)
        })

def analyze_weekly_trends(weekly_data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze trends from weekly data"""
    trends = {
        'pickup_trend': 'stable',
        'earnings_trend': 'stable',
        'worker_activity_trend': 'stable',
        'customer_satisfaction_trend': 'stable'
    }

    # Simple trend analysis (you can make this more sophisticated)
    daily_pickups = weekly_data.get('daily_pickups', [])
    if len(daily_pickups) >= 2:
        first_half = sum(daily_pickups[:len(daily_pickups)//2])
        second_half = sum(daily_pickups[len(daily_pickups)//2:])

        if second_half > first_half * 1.1:
            trends['pickup_trend'] = 'increasing'
        elif second_half < first_half * 0.9:
            trends['pickup_trend'] = 'decreasing'

    return trends

def generate_weekly_insights(weekly_data: Dict[str, Any], trends: Dict[str, Any]) -> List[str]:
    """Generate actionable insights from weekly data"""
    insights = []

    total_pickups = weekly_data.get('total_pickups', 0)
    total_earnings = weekly_data.get('total_earnings', 0)
    avg_rating = weekly_data.get('average_rating', 0)

    if total_pickups > 0:
        insights.append(f"Completed {total_pickups} pickups this week")

    if total_earnings > 0:
        insights.append(f"Generated ${total_earnings:.2f} in earnings")

    if avg_rating > 0:
        insights.append(f"Average customer rating: {avg_rating:.1f}/5")

    # Trend-based insights
    if trends.get('pickup_trend') == 'increasing':
        insights.append("📈 Pickup volume is increasing - consider hiring more workers")
    elif trends.get('pickup_trend') == 'decreasing':
        insights.append("📉 Pickup volume is decreasing - investigate potential issues")

    if trends.get('earnings_trend') == 'increasing':
        insights.append("💰 Earnings are trending up - great performance!")

    return insights

def cleanup_old_data(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Clean up old logs and temporary data
    Runs weekly on Sunday at 2 AM UTC
    """
    function_name = "cleanup_old_data"

    try:
        log_function_start(function_name, event)

        django_client = DjangoAPIClient()

        # Define retention periods
        retention_days = {
            'notification_logs': 30,
            'geo_logs': 30,
            'escrow_logs': 90,
            'api_logs': 7,
            'temp_files': 1
        }

        cleanup_results = {}

        for data_type, days in retention_days.items():
            try:
                result = django_client.post('/api/cleanup/', {
                    'data_type': data_type,
                    'retention_days': days
                })
                cleanup_results[data_type] = result
            except Exception as e:
                cleanup_results[data_type] = {'error': str(e)}

        log_function_end(function_name, True, "Data cleanup completed")
        return create_response(200, {
            'message': 'Data cleanup completed',
            'cleanup_results': cleanup_results
        })

    except Exception as e:
        log_function_end(function_name, False, str(e))
        return create_response(500, {
            'error': 'Internal server error',
            'message': str(e)
        })
