import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DoctorWithProfile {
  id: string;
  user_id: string;
  specialty: string;
  bio: string | null;
  experience: number;
  rating: number;
  consultation_fee: number;
  available_days: string[] | null;
  working_hours_start: string;
  working_hours_end: string;
  status: string;
  // Profile data
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
}

async function fetchDoctors(): Promise<DoctorWithProfile[]> {
  // Fetch doctors
  const { data: doctors, error: doctorsError } = await supabase
    .from('doctors')
    .select('*')
    .order('created_at', { ascending: false });

  if (doctorsError) throw doctorsError;
  if (!doctors) return [];

  // Fetch profiles for all doctor user_ids
  const userIds = doctors.map(d => d.user_id);
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('user_id', userIds);

  if (profilesError) throw profilesError;

  // Merge doctors with their profiles
  return doctors.map(doctor => {
    const profile = profiles?.find(p => p.user_id === doctor.user_id);
    return {
      ...doctor,
      name: profile?.name || 'Unknown Doctor',
      email: profile?.email || '',
      phone: profile?.phone || null,
      avatar_url: profile?.avatar_url || null,
    };
  });
}

export function useDoctors() {
  return useQuery({
    queryKey: ['doctors'],
    queryFn: fetchDoctors,
  });
}

export function useDoctor(doctorId: string) {
  return useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: async () => {
      const { data: doctor, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', doctorId)
        .single();

      if (error) throw error;
      if (!doctor) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', doctor.user_id)
        .single();

      return {
        ...doctor,
        name: profile?.name || 'Unknown Doctor',
        email: profile?.email || '',
        phone: profile?.phone || null,
        avatar_url: profile?.avatar_url || null,
      } as DoctorWithProfile;
    },
    enabled: !!doctorId,
  });
}
