
import React from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import ProjectDashboard from "@/components/layouts/ProjectDashboard";

const DashboardPage = () => {
  return (
    <DashboardLayout activeTab="dashboard">
      <ProjectDashboard />
    </DashboardLayout>
  );
};

export default DashboardPage;
