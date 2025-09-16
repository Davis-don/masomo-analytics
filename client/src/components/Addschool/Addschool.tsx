// components/Addschool/Addschool.tsx
import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast, Toaster } from 'sonner';
import { useNavigate } from 'react-router-dom';
import useSchoolStore from '../../store/Schooldata';
import './addschool.css';

export interface SchoolFormData {
  name: string;
  location: string; // This will store the county code
  schoolUsername: string;
}

interface AddSchoolProps {
  onSuccess?: () => void;
}

// Kenya counties with their codes and names
const kenyaCounties = [
  { code: '001', name: 'Mombasa' },
  { code: '002', name: 'Kwale' },
  { code: '003', name: 'Kilifi' },
  { code: '004', name: 'Tana River' },
  { code: '005', name: 'Lamu' },
  { code: '006', name: 'Taita Taveta' },
  { code: '007', name: 'Garissa' },
  { code: '008', name: 'Wajir' },
  { code: '009', name: 'Mandera' },
  { code: '010', name: 'Marsabit' },
  { code: '011', name: 'Isiolo' },
  { code: '012', name: 'Meru' },
  { code: '013', name: 'Tharaka-Nithi' },
  { code: '014', name: 'Embu' },
  { code: '015', name: 'Kitui' },
  { code: '016', name: 'Machakos' },
  { code: '017', name: 'Makueni' },
  { code: '018', name: 'Nyandarua' },
  { code: '019', name: 'Nyeri' },
  { code: '020', name: 'Kirinyaga' },
  { code: '021', name: "Murang'a" },
  { code: '022', name: 'Kiambu' },
  { code: '023', name: 'Turkana' },
  { code: '024', name: 'West Pokot' },
  { code: '025', name: 'Samburu' },
  { code: '026', name: 'Trans Nzoia' },
  { code: '027', name: 'Uasin Gishu' },
  { code: '028', name: 'Elgeyo-Marakwet' },
  { code: '029', name: 'Nandi' },
  { code: '030', name: 'Baringo' },
  { code: '031', name: 'Laikipia' },
  { code: '032', name: 'Nakuru' },
  { code: '033', name: 'Narok' },
  { code: '034', name: 'Kajiado' },
  { code: '035', name: 'Kericho' },
  { code: '036', name: 'Bomet' },
  { code: '037', name: 'Kakamega' },
  { code: '038', name: 'Vihiga' },
  { code: '039', name: 'Bungoma' },
  { code: '040', name: 'Busia' },
  { code: '041', name: 'Siaya' },
  { code: '042', name: 'Kisumu' },
  { code: '043', name: 'Homa Bay' },
  { code: '044', name: 'Migori' },
  { code: '045', name: 'Kisii' },
  { code: '046', name: 'Nyamira' },
  { code: '047', name: 'Nairobi' }
];

const AddSchool: React.FC<AddSchoolProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<SchoolFormData>({
    name: '',
    location: '',
    schoolUsername: ''
  });

  const [errors, setErrors] = useState<Partial<SchoolFormData>>({});
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  
  // Get the addSchool function from the store
  const addSchoolToStore = useSchoolStore((state) => state.addSchool);

  // Mutation to add school
  const mutation = useMutation({
    mutationFn: async (data: SchoolFormData) => {
      const res = await fetch(`${apiUrl}/api/schools/add-school`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          location: data.location,
          schoolUsername: data.schoolUsername
        })
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || 'Failed to add school');
      return result;
    },
    onSuccess: (res: any, variables: SchoolFormData) => {
      // Show success message with the username that was stored
      toast.success(`School "${variables.name}" added successfully with username: ${variables.schoolUsername}`, {
        duration: 3000, // Toast will show for 3 seconds
      });
      
      // Add the school to the Zustand store with the username included
      if (res.school) {
        addSchoolToStore({
          school_id: res.school.school_id,
          name: res.school.name,
          location: res.school.location,
          username: variables.schoolUsername // Add username to the store
        });
      } else {
        // Fallback: Create a temporary ID if backend doesn't return one
        addSchoolToStore({
          school_id: `temp-${Date.now()}`,
          name: variables.name,
          location: variables.location,
          username: variables.schoolUsername // Add username to the store
        });
      }
      
      // Reset form after successful submission
      setFormData({
        name: '',
        location: '',
        schoolUsername: ''
      });
      
      // Wait for 3 seconds to allow the success toast to be fully displayed
      // before navigating to the next page
      setTimeout(() => {
        if (onSuccess) onSuccess();
        // Navigate to create admin user page
        navigate('/create/admin');
      }, 3000);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add school');
      console.error('Error adding school:', err);
    }
  });

  const { mutate, isPending } = mutation;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof SchoolFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<SchoolFormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'School name is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'County is required';
    }
    
    if (!formData.schoolUsername.trim()) {
      newErrors.schoolUsername = 'School username is required';
    } else if (formData.schoolUsername.length < 3) {
      newErrors.schoolUsername = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.schoolUsername)) {
      newErrors.schoolUsername = 'Username can only contain letters, numbers, and underscores';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      mutate(formData);
    }
  };

  // Get selected county name for display
  const selectedCounty = kenyaCounties.find(county => county.code === formData.location);

  return (
    <div className="addSchoolAttractiveContainer">
      <Toaster position='top-center' richColors />
      <div className="addSchoolAttractiveBackground">
        <div className="addSchoolAttractiveShape addSchoolAttractiveShapeOne"></div>
        <div className="addSchoolAttractiveShape addSchoolAttractiveShapeTwo"></div>
        <div className="addSchoolAttractiveShape addSchoolAttractiveShapeThree"></div>
      </div>
      
      <div className="addSchoolAttractiveCard">
        <div className="addSchoolAttractiveHeader">
          <h1 className="addSchoolAttractiveTitle">Add New School</h1>
          <p className="addSchoolAttractiveSubtitle">Enter school details below</p>
        </div>

        <form className="addSchoolAttractiveForm" onSubmit={handleSubmit}>
          {/* School Name */}
          <div className="addSchoolAttractiveInputGroup">
            <label htmlFor="name" className="addSchoolAttractiveInputLabel">
              School Name
            </label>
            <div className="addSchoolAttractiveInputContainer">
              <i className="addSchoolAttractiveInputIcon fas fa-school"></i>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="addSchoolAttractiveInputField"
                placeholder="Enter school name"
                disabled={isPending}
              />
            </div>
            {errors.name && (
              <p className="addSchoolAttractiveError">{errors.name}</p>
            )}
          </div>

          {/* County Selection */}
          <div className="addSchoolAttractiveInputGroup">
            <label htmlFor="location" className="addSchoolAttractiveInputLabel">
              County
            </label>
            <div className="addSchoolAttractiveInputContainer">
              <i className="addSchoolAttractiveInputIcon fas fa-map-marker-alt"></i>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="addSchoolAttractiveInputField"
                disabled={isPending}
              >
                <option value="">Select a county</option>
                {kenyaCounties.map(county => (
                  <option key={county.code} value={county.code}>
                    {county.name}
                  </option>
                ))}
              </select>
            </div>
            {formData.location && (
              <p className="addSchoolAttractiveCountyDisplay">
                Selected: {selectedCounty?.name} (Code: {formData.location})
              </p>
            )}
            {errors.location && (
              <p className="addSchoolAttractiveError">{errors.location}</p>
            )}
          </div>

          {/* School Username */}
          <div className="addSchoolAttractiveInputGroup">
            <label htmlFor="schoolUsername" className="addSchoolAttractiveInputLabel">
              School Username
            </label>
            <div className="addSchoolAttractiveInputContainer">
              <i className="addSchoolAttractiveInputIcon fas fa-at"></i>
              <input
                type="text"
                id="schoolUsername"
                name="schoolUsername"
                value={formData.schoolUsername}
                onChange={handleChange}
                className="addSchoolAttractiveInputField"
                placeholder="Enter school username (e.g., baldosec)"
                disabled={isPending}
              />
            </div>
            <div className="addSchoolAttractiveHelpText">
              This will be used to create admin accounts (e.g., johndoe@baldosecadmin)
            </div>
            {errors.schoolUsername && (
              <p className="addSchoolAttractiveError">{errors.schoolUsername}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="addSchoolAttractiveActions">
            <button 
              type="submit" 
              className={`addSchoolAttractiveSubmitButton ${isPending ? 'addSchoolAttractiveButtonLoading' : ''}`}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <i className="addSchoolAttractiveSpinner fas fa-spinner"></i>
                  Adding School...
                </>
              ) : (
                'Add School'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSchool;