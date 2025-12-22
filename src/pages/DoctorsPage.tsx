import { Plus, Search, Star, Phone, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/dashboard/DashboardComponents';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useDoctors } from '@/hooks/useDoctors';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DoctorsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const isAdmin = user?.role === 'admin';

  const { data: doctors = [], isLoading, error } = useDoctors();

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PageHeader
        title={isAdmin ? 'Manage Doctors' : 'Find Doctors'}
        description={isAdmin ? 'View and manage all doctors in the clinic' : 'Book appointments with our specialists'}
        actions={
          isAdmin && (
            <Button variant="hero">
              <Plus className="w-4 h-4" />
              Add Doctor
            </Button>
          )
        }
      />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search doctors by name or specialty..."
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

      {/* Loading State */}
      {isLoading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} variant="elevated">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-12 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load doctors. Please try again.</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredDoctors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No doctors found.</p>
        </div>
      )}

      {/* Doctors Grid */}
      {!isLoading && !error && filteredDoctors.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} variant="elevated" className="overflow-hidden hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {doctor.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-semibold truncate">{doctor.name}</h3>
                      <Badge
                        variant={doctor.status === 'active' ? 'success' : doctor.status === 'on-leave' ? 'warning' : 'secondary'}
                        className="shrink-0"
                      >
                        {doctor.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-warning fill-warning" />
                        <span className="text-sm font-medium">{doctor.rating}</span>
                      </div>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{doctor.experience} years exp</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mt-4 line-clamp-2">{doctor.bio || 'No bio available'}</p>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span className="truncate">{doctor.phone || 'No phone'}</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  {isAdmin ? (
                    <>
                      <Button variant="outline" className="flex-1">
                        Edit
                      </Button>
                      <Button variant="destructive" size="icon">
                        <span className="sr-only">Delete</span>
                        ×
                      </Button>
                    </>
                  ) : (
                    <Button variant="hero" className="w-full">
                      Book Appointment
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <span className="text-sm text-muted-foreground">Consultation Fee</span>
                  <span className="font-display font-semibold text-primary">${doctor.consultation_fee}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
