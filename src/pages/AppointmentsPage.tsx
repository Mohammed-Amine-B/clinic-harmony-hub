import { Plus, Search, Filter, Clock, Calendar as CalendarIcon, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/dashboard/DashboardComponents';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { mockAppointments } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const isPatient = user?.role === 'patient';

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
      case 'no-show':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return CheckCircle;
      case 'cancelled':
      case 'no-show':
        return XCircle;
      case 'in-progress':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const filteredAppointments = mockAppointments.filter(
    (apt) =>
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingAppointments = filteredAppointments.filter(
    (apt) => !isPast(apt.date) || isToday(apt.date)
  );
  const pastAppointments = filteredAppointments.filter(
    (apt) => isPast(apt.date) && !isToday(apt.date)
  );

  const formatDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM dd, yyyy');
  };

  const AppointmentCard = ({ appointment }: { appointment: typeof mockAppointments[0] }) => {
    const StatusIcon = getStatusIcon(appointment.status);

    return (
      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-primary/10 text-primary">
              {(isPatient ? appointment.doctorName : appointment.patientName)
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {isPatient ? appointment.doctorName : appointment.patientName}
            </p>
            <p className="text-sm text-muted-foreground">{appointment.reason}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                {formatDateLabel(appointment.date)}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {appointment.time}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={getStatusColor(appointment.status)} className="flex items-center gap-1">
            <StatusIcon className="w-3 h-3" />
            {appointment.status}
          </Badge>
          <Button variant="outline" size="sm">
            View
          </Button>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Appointments"
        description={isPatient ? 'Manage your scheduled appointments' : 'View and manage all appointments'}
        actions={
          <Button variant="hero">
            <Plus className="w-4 h-4" />
            {isPatient ? 'Book Appointment' : 'New Appointment'}
          </Button>
        }
      />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Appointment Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No upcoming appointments
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                Past Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pastAppointments.length > 0 ? (
                  pastAppointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No past appointments
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
