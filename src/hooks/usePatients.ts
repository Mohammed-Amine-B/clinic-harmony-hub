import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PatientWithProfile {
  id: string;
  user_id: string;
  date_of_birth: string | null;
  gender: string | null;
  blood_group: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
  medical_history: string[] | null;
  allergies: string[] | null;
  // Profile data
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
}

async function fetchPatients(): Promise<PatientWithProfile[]> {
  // Fetch patients
  const { data: patients, error: patientsError } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false });

  if (patientsError) throw patientsError;
  if (!patients) return [];

  // Fetch profiles for all patient user_ids
  const userIds = patients.map(p => p.user_id);
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('user_id', userIds);

  if (profilesError) throw profilesError;

  // Merge patients with their profiles
  return patients.map(patient => {
    const profile = profiles?.find(p => p.user_id === patient.user_id);
    return {
      ...patient,
      name: profile?.name || 'Unknown Patient',
      email: profile?.email || '',
      phone: profile?.phone || null,
      avatar_url: profile?.avatar_url || null,
    };
  });
}

export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: fetchPatients,
  });
}

export function usePatient(patientId: string) {
  return useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const { data: patient, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) throw error;
      if (!patient) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', patient.user_id)
        .single();

      return {
        ...patient,
        name: profile?.name || 'Unknown Patient',
        email: profile?.email || '',
        phone: profile?.phone || null,
        avatar_url: profile?.avatar_url || null,
      } as PatientWithProfile;
    },
    enabled: !!patientId,
  });
}
