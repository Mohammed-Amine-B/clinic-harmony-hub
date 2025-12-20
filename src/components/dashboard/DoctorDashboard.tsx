import { Calendar, Users, Clock, CheckCircle, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatCard, PageHeader } from './DashboardComponents';
import { mockAppointments, mockPatients } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export default function DoctorDashboard() {
  const { user } = useAuth();

  const todayAppointments = mockAppointments.filter(
    (apt) =>
      format(apt.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') &&
      apt.doctorName.includes('Michael')
  );

  const myPatients = mockPatients.slice(0, 3);

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
      default:
        return 'secondary';
    }
  };

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name || 'Doctor'}`}
        description="Here's your schedule for today"
        actions={
          <Button variant="hero">
            <Plus className="w-4 h-4" />
            Add Notes
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Today's Appointments"
          value={todayAppointments.length || 3}
          icon={Calendar}
          iconColor="text-primary"
          iconBg="bg-primary/10"
        />
        <StatCard
          title="Total Patients"
          value={12}
          change="+3 this week"
          changeType="positive"
          icon={Users}
          iconColor="text-info"
          iconBg="bg-info/10"
        />
        <StatCard
          title="Pending Reviews"
          value={4}
          icon={Clock}
          iconColor="text-warning"
          iconBg="bg-warning/10"
        />
        <StatCard
          title="Completed Today"
          value={2}
          icon={CheckCircle}
          iconColor="text-success"
          iconBg="bg-success/10"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Today's Schedule
              </CardTitle>
              <Button variant="ghost" size="sm">
                View Full Schedule
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: '09:00 AM', patient: 'Emma Wilson', type: 'Consultation', status: 'completed' },
                  { time: '10:30 AM', patient: 'David Brown', type: 'Follow-up', status: 'in-progress' },
                  { time: '02:00 PM', patient: 'Sophia Martinez', type: 'Check-up', status: 'scheduled' },
                  { time: '04:00 PM', patient: 'William Johnson', type: 'Consultation', status: 'scheduled' },
                ].map((apt, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 text-center">
                        <p className="text-sm font-bold text-primary">{apt.time}</p>
                      </div>
                      <div className="h-12 w-px bg-border" />
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {apt.patient
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{apt.patient}</p>
                        <p className="text-sm text-muted-foreground">{apt.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusColor(apt.status)}>{apt.status}</Badge>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Patients */}
        <div className="space-y-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Recent Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer"
                  >
                    <Avatar>
                      <AvatarFallback className="bg-info/10 text-info">
                        {patient.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {patient.medicalHistory?.[0] || 'No history'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Patients
              </Button>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Add Medical Record
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Follow-up
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
