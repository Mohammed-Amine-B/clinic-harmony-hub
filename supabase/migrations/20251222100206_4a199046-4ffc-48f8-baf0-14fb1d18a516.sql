-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'doctor', 'patient');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create doctors table
CREATE TABLE public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    specialty TEXT NOT NULL,
    bio TEXT,
    experience INTEGER NOT NULL DEFAULT 0,
    rating NUMERIC(2,1) NOT NULL DEFAULT 0.0,
    consultation_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    available_days TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    working_hours_start TIME NOT NULL DEFAULT '09:00',
    working_hours_end TIME NOT NULL DEFAULT '17:00',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on-leave')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on doctors
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Create patients table
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    blood_group TEXT,
    address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relationship TEXT,
    medical_history TEXT[],
    allergies TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Create appointments table
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration INTEGER NOT NULL DEFAULT 30,
    type TEXT NOT NULL DEFAULT 'consultation' CHECK (type IN ('consultation', 'follow-up', 'emergency', 'routine-checkup')),
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show')),
    reason TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create medical_records table
CREATE TABLE public.medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    diagnosis TEXT NOT NULL,
    symptoms TEXT[],
    treatment TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on medical_records
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Create prescriptions table
CREATE TABLE public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
    diagnosis TEXT NOT NULL,
    medications JSONB NOT NULL DEFAULT '[]',
    instructions TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on prescriptions
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Function to get user's doctor_id
CREATE OR REPLACE FUNCTION public.get_doctor_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id FROM public.doctors WHERE user_id = _user_id LIMIT 1
$$;

-- Function to get user's patient_id
CREATE OR REPLACE FUNCTION public.get_patient_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id FROM public.patients WHERE user_id = _user_id LIMIT 1
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON public.medical_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Create profile for new user
    INSERT INTO public.profiles (user_id, name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
        NEW.email
    );
    
    -- Assign default role (patient) if no role specified
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
        NEW.id,
        COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'patient')
    );
    
    -- If role is patient, create patient record
    IF COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'patient') = 'patient' THEN
        INSERT INTO public.patients (user_id)
        VALUES (NEW.id);
    END IF;
    
    -- If role is doctor, create doctor record
    IF (NEW.raw_user_meta_data ->> 'role')::app_role = 'doctor' THEN
        INSERT INTO public.doctors (user_id, specialty)
        VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'specialty', 'General Practice'));
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
    ON public.user_roles FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Doctors can view patient profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        public.has_role(auth.uid(), 'doctor') AND
        EXISTS (
            SELECT 1 FROM public.patients p
            WHERE p.user_id = profiles.user_id
        )
    );

-- RLS Policies for doctors
CREATE POLICY "Anyone authenticated can view doctors"
    ON public.doctors FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Doctors can update their own record"
    ON public.doctors FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can manage doctors"
    ON public.doctors FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for patients
CREATE POLICY "Patients can view their own record"
    ON public.patients FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Patients can update their own record"
    ON public.patients FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can manage patients"
    ON public.patients FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Doctors can view their patients"
    ON public.patients FOR SELECT
    TO authenticated
    USING (
        public.has_role(auth.uid(), 'doctor') AND
        EXISTS (
            SELECT 1 FROM public.appointments a
            WHERE a.patient_id = patients.id
            AND a.doctor_id = public.get_doctor_id(auth.uid())
        )
    );

-- RLS Policies for appointments
CREATE POLICY "Patients can view their own appointments"
    ON public.appointments FOR SELECT
    TO authenticated
    USING (patient_id = public.get_patient_id(auth.uid()));

CREATE POLICY "Patients can create appointments"
    ON public.appointments FOR INSERT
    TO authenticated
    WITH CHECK (patient_id = public.get_patient_id(auth.uid()));

CREATE POLICY "Patients can update their own appointments"
    ON public.appointments FOR UPDATE
    TO authenticated
    USING (patient_id = public.get_patient_id(auth.uid()));

CREATE POLICY "Doctors can view their appointments"
    ON public.appointments FOR SELECT
    TO authenticated
    USING (doctor_id = public.get_doctor_id(auth.uid()));

CREATE POLICY "Doctors can update their appointments"
    ON public.appointments FOR UPDATE
    TO authenticated
    USING (doctor_id = public.get_doctor_id(auth.uid()));

CREATE POLICY "Admins can manage all appointments"
    ON public.appointments FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for medical_records
CREATE POLICY "Patients can view their own medical records"
    ON public.medical_records FOR SELECT
    TO authenticated
    USING (patient_id = public.get_patient_id(auth.uid()));

CREATE POLICY "Doctors can view records they created"
    ON public.medical_records FOR SELECT
    TO authenticated
    USING (doctor_id = public.get_doctor_id(auth.uid()));

CREATE POLICY "Doctors can create medical records"
    ON public.medical_records FOR INSERT
    TO authenticated
    WITH CHECK (doctor_id = public.get_doctor_id(auth.uid()));

CREATE POLICY "Doctors can update their own records"
    ON public.medical_records FOR UPDATE
    TO authenticated
    USING (doctor_id = public.get_doctor_id(auth.uid()));

CREATE POLICY "Admins can manage all medical records"
    ON public.medical_records FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for prescriptions
CREATE POLICY "Patients can view their prescriptions"
    ON public.prescriptions FOR SELECT
    TO authenticated
    USING (patient_id = public.get_patient_id(auth.uid()));

CREATE POLICY "Doctors can view prescriptions they created"
    ON public.prescriptions FOR SELECT
    TO authenticated
    USING (doctor_id = public.get_doctor_id(auth.uid()));

CREATE POLICY "Doctors can create prescriptions"
    ON public.prescriptions FOR INSERT
    TO authenticated
    WITH CHECK (doctor_id = public.get_doctor_id(auth.uid()));

CREATE POLICY "Doctors can update their prescriptions"
    ON public.prescriptions FOR UPDATE
    TO authenticated
    USING (doctor_id = public.get_doctor_id(auth.uid()));

CREATE POLICY "Admins can manage all prescriptions"
    ON public.prescriptions FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));