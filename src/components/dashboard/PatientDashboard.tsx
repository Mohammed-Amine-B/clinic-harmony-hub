import { Calendar, FileText, Stethoscope, Clock, Plus, Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatCard, PageHeader } from './DashboardComponents';
import { mockAppointments, mockDoctors } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export default function PatientDashboard() {
  const { user } = useAuth();

  const upcomingAppointments = mockAppointments
    .filter((apt) => apt.date >= new Date() && apt.patientName === 'Emma Wilson')
    .slice(0, 3);

  const recommendedDoctors = mockDoctors.filter((d) => d.status === 'active').slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'scheduled':
        return 'info';
      default:
        return 'secondary';
    }
  };

  return (
    <div>
      <PageHeader
        title={`Hello, ${user?.name?.split(' ')[0] || 'Patient'}`}
        description="Manage your health journey with ease"
        actions={
          <Button variant="hero">
            <Plus className="w-4 h-4" />
            Book Appointment
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Upcoming Appointments"
          value={2}
          icon={Calendar}
          iconColor="text-primary"
          iconBg="bg-primary/10"
        />
        <StatCard
          title="Prescriptions"
          value={3}
          icon={FileText}
          iconColor="text-info"
          iconBg="bg-info/10"
        />
        <StatCard
          title="Visits This Year"
          value={8}
          icon={Stethoscope}
          iconColor="text-accent"
          iconBg="bg-accent/10"
        />
        <StatCard
          title="Health Score"
          value="Good"
          icon={Star}
          iconColor="text-success"
          iconBg="bg-success/10"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2">
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Upcoming Appointments
              </CardTitle>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    doctor: 'Dr. Michael Chen',
                    specialty: 'Cardiology',
                    date: 'Dec 22, 2024',
                    time: '09:00 AM',
                    status: 'confirmed',
                  },
                  {
                    doctor: 'Dr. Sarah Kim',
                    specialty: 'Dermatology',
                    date: 'Dec 28, 2024',
                    time: '02:30 PM',
                    status: 'scheduled',
                  },
                ].map((apt, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {apt.doctor
                            .split(' ')
                            .slice(1)
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{apt.doctor}</p>
                        <p className="text-sm text-muted-foreground">{apt.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{apt.date}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" />
                          {apt.time}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(apt.status)}>{apt.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline-primary" className="w-full mt-4">
                <Plus className="w-4 h-4" />
                Schedule New Appointment
              </Button>
            </CardContent>
          </Card>

          {/* Recent Medical Records */}
          <Card variant="elevated" className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Recent Medical Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { title: 'Blood Pressure Check', date: 'Dec 15, 2024', doctor: 'Dr. Michael Chen' },
                  { title: 'Annual Physical Exam', date: 'Nov 20, 2024', doctor: 'Dr. Emily Rodriguez' },
                  { title: 'Skin Consultation', date: 'Oct 10, 2024', doctor: 'Dr. Sarah Kim' },
                ].map((record, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-info" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{record.title}</p>
                        <p className="text-xs text-muted-foreground">{record.doctor}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{record.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Find Doctors */}
        <div className="space-y-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-primary" />
                Recommended Doctors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendedDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="p-3 rounded-xl border border-border hover:border-primary/20 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {doctor.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{doctor.name}</p>
                        <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1 text-xs">
                            <Star className="w-3 h-3 text-warning fill-warning" />
                            <span>{doctor.rating}</span>
                          </div>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {doctor.experience} years
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      Book Appointment
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4">
                View All Doctors
              </Button>
            </CardContent>
          </Card>

          <Card variant="gradient">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-display font-semibold">Visit Our Clinic</p>
                  <p className="text-sm text-muted-foreground">123 Health Street, NY</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Open Monday - Saturday, 8:00 AM - 8:00 PM
              </p>
              <Button variant="outline" className="w-full">
                Get Directions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
