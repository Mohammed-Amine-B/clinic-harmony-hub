import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AppointmentWithDetails {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  duration: number;
  type: string;
  status: string;
  reason: string;
  notes: string | null;
  // Joined data
  patient_name: string;
  doctor_name: string;
  doctor_specialty?: string;
}

async function fetchAppointments(): Promise<AppointmentWithDetails[]> {
  // Fetch appointments
  const { data: appointments, error: appointmentsError } = await supabase
    .from('appointments')
    .select('*')
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });

  if (appointmentsError) throw appointmentsError;
  if (!appointments) return [];

  // Get unique doctor and patient IDs
  const doctorIds = [...new Set(appointments.map(a => a.doctor_id))];
  const patientIds = [...new Set(appointments.map(a => a.patient_id))];

  // Fetch doctors with their profiles
  const { data: doctors } = await supabase
    .from('doctors')
    .select('id, user_id, specialty')
    .in('id', doctorIds);

  const doctorUserIds = doctors?.map(d => d.user_id) || [];
  const { data: doctorProfiles } = await supabase
    .from('profiles')
    .select('user_id, name')
    .in('user_id', doctorUserIds);

  // Fetch patients with their profiles
  const { data: patients } = await supabase
    .from('patients')
    .select('id, user_id')
    .in('id', patientIds);

  const patientUserIds = patients?.map(p => p.user_id) || [];
  const { data: patientProfiles } = await supabase
    .from('profiles')
    .select('user_id, name')
    .in('user_id', patientUserIds);

  // Map appointments with names
  return appointments.map(appointment => {
    const doctor = doctors?.find(d => d.id === appointment.doctor_id);
    const doctorProfile = doctorProfiles?.find(p => p.user_id === doctor?.user_id);
    
    const patient = patients?.find(p => p.id === appointment.patient_id);
    const patientProfile = patientProfiles?.find(p => p.user_id === patient?.user_id);

    return {
      ...appointment,
      patient_name: patientProfile?.name || 'Unknown Patient',
      doctor_name: doctorProfile?.name || 'Unknown Doctor',
      doctor_specialty: doctor?.specialty,
    };
  });
}

export function useAppointments() {
  return useQuery({
    queryKey: ['appointments'],
    queryFn: fetchAppointments,
  });
}

export function useUserAppointments(userId: string, role: 'doctor' | 'patient') {
  return useQuery({
    queryKey: ['appointments', 'user', userId, role],
    queryFn: async () => {
      let recordId = '';

      if (role === 'doctor') {
        const { data } = await supabase
          .from('doctors')
          .select('id')
          .eq('user_id', userId)
          .single();
        recordId = data?.id || '';
      } else {
        const { data } = await supabase
          .from('patients')
          .select('id')
          .eq('user_id', userId)
          .single();
        recordId = data?.id || '';
      }

      if (!recordId) return [];

      // Get the full appointment details and filter
      const allAppointments = await fetchAppointments();
      return allAppointments.filter(a => 
        role === 'doctor' ? a.doctor_id === recordId : a.patient_id === recordId
      );
    },
    enabled: !!userId,
  });
}

interface CreateAppointmentInput {
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  duration?: number;
  type?: string;
  reason: string;
  notes?: string;
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointment: CreateAppointmentInput) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          patient_id: appointment.patient_id,
          doctor_id: appointment.doctor_id,
          appointment_date: appointment.appointment_date,
          appointment_time: appointment.appointment_time,
          duration: appointment.duration || 30,
          type: appointment.type || 'consultation',
          reason: appointment.reason,
          notes: appointment.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}
