import { Plus, Search, Phone, Mail, Filter, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/dashboard/DashboardComponents';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { mockPatients } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { format } from 'date-fns';

export default function PatientsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const isAdmin = user?.role === 'admin';

  const filteredPatients = mockPatients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <DashboardLayout>
      <PageHeader
        title={isAdmin ? 'Manage Patients' : 'My Patients'}
        description={isAdmin ? 'View and manage all patient records' : 'View your assigned patients'}
        actions={
          isAdmin && (
            <Button variant="hero">
              <Plus className="w-4 h-4" />
              Add Patient
            </Button>
          )
        }
      />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search patients by name or email..."
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

      {/* Patients Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} variant="elevated" className="overflow-hidden hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarFallback className="bg-info/10 text-info text-lg">
                    {patient.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold truncate">{patient.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="capitalize">
                      {patient.gender}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {calculateAge(patient.dateOfBirth)} years
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground truncate">{patient.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{patient.phone}</span>
                </div>
              </div>

              {patient.bloodGroup && (
                <div className="flex items-center gap-2 mt-4">
                  <Badge variant="coral">Blood: {patient.bloodGroup}</Badge>
                  {patient.allergies && patient.allergies.length > 0 && (
                    <Badge variant="warning">{patient.allergies.length} Allergies</Badge>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                <Button variant="outline" className="flex-1" size="sm">
                  <FileText className="w-4 h-4 mr-1" />
                  Records
                </Button>
                <Button variant="default" className="flex-1" size="sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
