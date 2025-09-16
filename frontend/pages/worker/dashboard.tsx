/**
 * Worker Dashboard - Enhanced with Enterprise-Grade Modular Components
 */

import React from 'react';
import Head from 'next/head';
import WorkerLayout from '../../components/WorkerLayout';
import DashboardOverview from '../../src/components/dashboard/DashboardOverview';

/**
 * Main Dashboard Component
 */
const WorkerDashboard: React.FC = () => {
  return (
    <>
      <Head>
        <title>Worker Dashboard - Klynaa Waste Management</title>
        <meta name="description" content="Worker dashboard for managing pickups, tracking performance, and viewing analytics" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <WorkerLayout>
        <DashboardOverview />
      </WorkerLayout>
    </>
  );
};

export default WorkerDashboard;
