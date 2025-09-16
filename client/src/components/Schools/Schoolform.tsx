// components/schools/SchoolForm.tsx
import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast,Toaster} from 'sonner';
import './schoolform.css';

export interface SchoolFormData {
  name: string;
  location: string; // This will store the county code
  schoolUsername: string;
}

interface SchoolFormProps {
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

const SchoolForm: React.FC<SchoolFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<SchoolFormData>({
    name: '',
    location: '',
    schoolUsername: ''
  });

  const [errors, setErrors] = useState<Partial<SchoolFormData>>({});
  const apiUrl = import.meta.env.VITE_API_URL;

  // Mutation to add school
  const mutation = useMutation({
    mutationFn: async (data: SchoolFormData) => {
      const res = await fetch(`${apiUrl}/api/schools/add-school`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          location: data.location, // This sends the county code
          // Note: Your backend expects 'name' and 'location' fields
          // If you need to store schoolUsername, you might need to adjust the backend
        })
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || 'Failed to add school');
      return result;
    },
    onSuccess: (res: any) => {
      toast.success(res.message || 'School added successfully!');
      // Reset form after successful submission
      setFormData({
        name: '',
        location: '',
        schoolUsername: ''
      });
      if (onSuccess) onSuccess();
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
    <div className="school-form-container">
        <Toaster position='top-center' richColors/>
      <div className="school-form-content">
        <h2>Add New School</h2>
        <form onSubmit={handleSubmit}>
          {/* School Name */}
          <div className="school-form-group">
            <label htmlFor="name" className="school-form-label">
              School Name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="school-form-input"
              placeholder="Enter school name"
              disabled={isPending}
            />
            {errors.name && (
              <p className="school-form-error">{errors.name}</p>
            )}
          </div>

          {/* County Selection */}
          <div className="school-form-group">
            <label htmlFor="location" className="school-form-label">
              County:
            </label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="school-form-input"
              disabled={isPending}
            >
              <option value="">Select a county</option>
              {kenyaCounties.map(county => (
                <option key={county.code} value={county.code}>
                  {county.name}
                </option>
              ))}
            </select>
            {formData.location && (
              <p className="county-code-display">
                Selected: {selectedCounty?.name} (Code: {formData.location})
              </p>
            )}
            {errors.location && (
              <p className="school-form-error">{errors.location}</p>
            )}
          </div>

          {/* School Username */}
          <div className="school-form-group">
            <label htmlFor="schoolUsername" className="school-form-label">
              School Username:
            </label>
            <input
              type="text"
              id="schoolUsername"
              name="schoolUsername"
              value={formData.schoolUsername}
              onChange={handleChange}
              className="school-form-input"
              placeholder="Enter school username"
              disabled={isPending}
            />
            {errors.schoolUsername && (
              <p className="school-form-error">{errors.schoolUsername}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="school-form-actions">
            <button 
              type="submit" 
              className="school-submit-btn"
              disabled={isPending}
            >
              {isPending ? 'Adding School...' : 'Add School'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SchoolForm;