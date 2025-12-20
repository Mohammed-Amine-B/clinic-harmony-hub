import {
  Users,
  Stethoscope,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatCard, PageHeader } from './DashboardComponents';
import { mockDashboardStats, mockAppointments, mockDoctors } from '@/data/mockData';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const stats = mockDashboardStats;
  const todayAppointments = mockAppointments.filter(
    (apt) => format(apt.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'scheduled':
        return 'info';
      case 'in-progress':
        return 'warning';
      case 'completed':
        return 'teal';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="Welcome back! Here's what's happening today."
        actions={
          <Button variant="hero">
            <Plus className="w-4 h-4" />
            Add Appointment
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Doctors"
          value={stats.totalDoctors}
          change="+2 this month"
          changeType="positive"
          icon={Stethoscope}
          iconColor="text-primary"
          iconBg="bg-primary/10"
        />
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          change="+12 this week"
          changeType="positive"
          icon={Users}
          iconColor="text-info"
          iconBg="bg-info/10"
        />
        <StatCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          change={`${stats.pendingAppointments} pending`}
          changeType="neutral"
          icon={Calendar}
          iconColor="text-accent"
          iconBg="bg-accent/10"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          change="+18% vs last month"
          changeType="positive"
          icon={DollarSign}
          iconColor="text-success"
          iconBg="bg-success/10"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-2">
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Today's Appointments
              </CardTitle>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayAppointments.length > 0 ? (
                  todayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {appointment.patientName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{appointment.patientName}</p>
                          <p className="text-sm text-muted-foreground">
                            with {appointment.doctorName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {appointment.time}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {appointment.type.replace('-', ' ')}
                          </p>
                        </div>
                        <Badge variant={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No appointments scheduled for today
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats & Doctors */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
                <span className="font-bold text-success">{stats.completedAppointments}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-warning" />
                  <span className="text-sm font-medium">Pending</span>
                </div>
                <span className="font-bold text-warning">{stats.pendingAppointments}</span>
              </div>
            </CardContent>
          </Card>

          {/* Active Doctors */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-primary" />
                Active Doctors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockDoctors.slice(0, 4).map((doctor) => (
                  <div
                    key={doctor.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {doctor.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doctor.name}</p>
                      <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
                    </div>
                    <Badge
                      variant={doctor.status === 'active' ? 'success' : 'secondary'}
                      className="text-xs"
                    >
                      {doctor.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
