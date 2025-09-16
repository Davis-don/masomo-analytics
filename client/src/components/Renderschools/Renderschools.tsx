// components/schools/RenderSchools.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import './renderschools.css';

interface School {
  school_id: string;
  name: string;
  location: string;
  schoolUsername?: string;
  classes?: any[];
}

interface EditSchoolModalProps {
  school: School | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (schoolId: string, data: { name: string; location: string }) => void;
  isLoading: boolean;
}

// Kenya counties for the edit form
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

// Edit School Modal Component
const EditSchoolModal: React.FC<EditSchoolModalProps> = ({
  school,
  isOpen,
  onClose,
  onUpdate,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    name: school?.name || '',
    location: school?.location || ''
  });

  // Update form data when school changes
  React.useEffect(() => {
    if (school) {
      setFormData({
        name: school.name,
        location: school.location
      });
    }
  }, [school]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (school) {
      onUpdate(school.school_id, formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen || !school) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit School</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>School Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>County:</label>
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            >
              <option value="">Select a county</option>
              {kenyaCounties.map(county => (
                <option key={county.code} value={county.code}>
                  {county.name}
                </option>
              ))}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update School'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RenderSchools: React.FC = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch schools
  const { data: schools = [], isLoading, error } = useQuery<School[]>({
    queryKey: ['schools'],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/api/schools/fetch-all-schools`);
      if (!response.ok) {
        throw new Error('Failed to fetch schools');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Delete school mutation
  const deleteMutation = useMutation({
    mutationFn: async (schoolId: string) => {
      const response = await fetch(`${apiUrl}/api/schools/delete-school-by-id?school_id=${schoolId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete school');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success('School deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete school');
    }
  });

  // Update school mutation
  const updateMutation = useMutation({
    mutationFn: async ({ schoolId, data }: { schoolId: string; data: { name: string; location: string } }) => {
      const response = await fetch(`${apiUrl}/api/schools/update-school`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ school_id: schoolId, ...data })
      });
      if (!response.ok) {
        throw new Error('Failed to update school');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success('School updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      setIsEditModalOpen(false);
      setEditingSchool(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update school');
    }
  });

  const handleDelete = (schoolId: string) => {
    if (window.confirm('Are you sure you want to delete this school?')) {
      deleteMutation.mutate(schoolId);
    }
  };

  const handleEdit = (school: School) => {
    setEditingSchool(school);
    setIsEditModalOpen(true);
  };

  const handleUpdate = (schoolId: string, data: { name: string; location: string }) => {
    updateMutation.mutate({ schoolId, data });
  };

  const getCountyName = (code: string) => {
    const county = kenyaCounties.find(c => c.code === code);
    return county ? county.name : code;
  };

  if (isLoading) {
    return <div className="loading">Loading schools...</div>;
  }

  if (error) {
    return <div className="error">Error loading schools: {error.message}</div>;
  }

  return (
    <div className="schools-table-container">
      <div className="table-header">
        <h2>All Schools</h2>
        <span className="schools-count">Total: {schools.length} schools</span>
      </div>

      <div className="table-responsive">
        <table className="schools-table">
          <thead>
            <tr>
              <th>#</th>
              <th>School Name</th>
              <th>School Username</th>
              <th>Location (County)</th>
              <th>Classes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schools.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-data">
                  No schools found
                </td>
              </tr>
            ) : (
              schools.map((school, index) => (
                <tr key={school.school_id}>
                  <td>{index + 1}</td>
                  <td>{school.name}</td>
                  <td>{school.schoolUsername || 'N/A'}</td>
                  <td>{getCountyName(school.location)}</td>
                  <td>{school.classes?.length || 0}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(school)}
                        className="edit-btn"
                        disabled={deleteMutation.isPending}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(school.school_id)}
                        className="delete-btn"
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <EditSchoolModal
        school={editingSchool}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingSchool(null);
        }}
        onUpdate={handleUpdate}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
};

export default RenderSchools;