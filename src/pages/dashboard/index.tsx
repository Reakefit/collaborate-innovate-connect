import React from 'react';
import { ProjectDashboard } from '@/components/layouts/ProjectDashboard';
import { useProjects } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { 
  FolderKanban, 
  Users, 
  Clock, 
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { projects, loading } = useProjects();
  const { profile } = useAuth();

  const stats = [
    {
      name: 'Total Projects',
      value: projects.length,
      icon: FolderKanban,
      change: '+12%',
      changeType: 'increase',
    },
    {
      name: 'Active Teams',
      value: projects.filter(p => p.status === 'in_progress').length,
      icon: Users,
      change: '+5%',
      changeType: 'increase',
    },
    {
      name: 'In Progress',
      value: projects.filter(p => p.status === 'in_progress').length,
      icon: Clock,
      change: '-2%',
      changeType: 'decrease',
    },
    {
      name: 'Completed',
      value: projects.filter(p => p.status === 'completed').length,
      icon: CheckCircle,
      change: '+8%',
      changeType: 'increase',
    },
  ];

  const recentProjects = projects
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const upcomingMilestones = projects
    .flatMap(p => p.milestones || [])
    .filter(m => m.status === 'pending')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <ProjectDashboard>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </ProjectDashboard>
    );
  }

  return (
    <ProjectDashboard>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile?.name}!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your projects today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6"
            >
              <dt>
                <div className="absolute rounded-md bg-indigo-500 p-3">
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">
                  {stat.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.change}
                </p>
              </dd>
            </div>
          ))}
        </div>

        {/* Recent Projects & Upcoming Milestones */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Projects */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Recent Projects
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <ul role="list" className="divide-y divide-gray-200">
                {recentProjects.map((project) => (
                  <li key={project.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <FolderKanban className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {project.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {project.category}
                          </p>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            project.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : project.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Upcoming Milestones */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Upcoming Milestones
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <ul role="list" className="divide-y divide-gray-200">
                {upcomingMilestones.map((milestone) => (
                  <li key={milestone.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <TrendingUp className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {milestone.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            Due {new Date(milestone.due_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            milestone.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : milestone.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {milestone.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ProjectDashboard>
  );
};

export default DashboardPage; 