import { ComponentType, ReactNode } from 'react';

export interface DashboardKPIs {
  totalEarnings: {
    value: number;
    currency: string;
    trendPercent: number;
    periodLabel: string;
  };
  pendingPickups: {
    count: number;
    nearby: number;
    scheduled: number;
  };
  completedPickups: {
    count: number;
    weeklyGoalPercent: number;
  };
  averageRating: {
    value: number;
    reviewsCount: number;
  };
}

export interface ChartSeries {
  key: string;
  label: string;
  points: number[];
  color?: string;
}

export interface TrendingChart {
  labels: string[];
  series: ChartSeries[];
}

export interface TrendingChartData {
  labels: string[];
  series: ChartSeries[];
}

export interface RatingAgenciesChartData {
  labels: string[];
  series: BarChartSeries[];
}

export interface BarChartSeries {
  label: string;
  values: number[];
  color?: string;
}

export interface BarChart {
  labels: string[];
  series: BarChartSeries[];
}

export interface DonutCategory {
  label: string;
  value: number;
  color?: string;
}

export interface DonutChart {
  categories: DonutCategory[];
}

export interface DonutChartData {
  categories: DonutCategory[];
}

export interface ScorecardRow {
  id: string;
  company: string;
  sentiment: number;
  mentions: number;
  impactScore: number;
}

export interface Scorecard {
  total: number;
  page: number;
  pageSize: number;
  rows: ScorecardRow[];
}

export interface Review {
  id: string;
  name: string;
  customerName: string;
  rating: number;
  text: string;
  comment: string;
  date: string;
  tags: string[];
  avatar?: string;
}

export interface ReviewsData {
  distribution: number[]; // [5-star count, 4-star count, 3-star count, 2-star count, 1-star count]
  recent: Review[];
}

export interface DashboardOverviewData {
  kpis: DashboardKPIs;
  charts: {
    trending: TrendingChart;
    ratingAgencies: BarChart;
  };
  donut: DonutChart;
  scorecard: Scorecard;
  reviews: ReviewsData;
  lastUpdated: string;
}

export interface DateRange {
  start: string;
  end: string;
  tz?: string;
}

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  dateRange: DateRange;
  includeCharts?: boolean;
}

// Component prop interfaces
export interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  icon?: ComponentType<any>;
  loading?: boolean;
  className?: string;
}

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  data: any;
  type: 'line' | 'area' | 'bar' | 'donut';
  height?: number;
  loading?: boolean;
  className?: string;
  children?: ReactNode;
}

export interface CardContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  loading?: boolean;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export interface DashboardError {
  message: string;
  code?: string;
  details?: any;
}

export interface DashboardState {
  data: DashboardOverviewData | null;
  loading: boolean;
  error: DashboardError | null;
  lastUpdated: Date | null;
}