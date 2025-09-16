import React, { useState, useEffect } from 'react';
import './addadminuser.css';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast, Toaster } from 'sonner';
import useSchoolStore from '../../store/Schooldata';
import useAuthStore from '../../store/Loginsstore';

interface UserFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  dob: string;
  userName: string;
  password: string;
  role: string;
  school_id: string;
}

const Addadminuser: React.FC = () => {
  const navigate = useNavigate();
  const { schools } = useSchoolStore();
  const { setCredentials } = useAuthStore();
  const currentSchool = schools.length > 0 ? schools[0] : null;
  
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    dob: '',
    userName: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const apiUrl = import.meta.env.VITE_API_URL;

  // Update the full username whenever firstName or lastName changes
  useEffect(() => {
    const generateFullUsername = () => {
      if (!userData.firstName && !userData.lastName) return '';
      
      const baseUsername = `${userData.firstName.toLowerCase()}${userData.lastName.toLowerCase()}`.replace(/\s+/g, '');
      const schoolPrefix = currentSchool?.username || 'school';
      
      return `${baseUsername}@${schoolPrefix}admin`;
    };

    setUserData(prev => ({
      ...prev,
      userName: generateFullUsername()
    }));
  }, [userData.firstName, userData.lastName, currentSchool]);

  // Mutation to add admin user
  const mutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const res = await fetch(`${apiUrl}/api/admin/user/add-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || 'Failed to create admin user');
      return result;
    },
    onSuccess: (_ , variables) => {
      // Store the created username and password in the auth store
      setCredentials(variables.userName, variables.password);
      
      toast.success('Admin user created successfully! Credentials saved for auto-login.');
      
      // Wait for 3 seconds before navigating to login
      setTimeout(() => {
        navigate('/');
      }, 3000);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create admin user');
      console.error('Error creating admin user:', err);
    }
  });

  const { mutate, isPending } = mutation;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear password error when user starts typing in confirm password
    if (name === 'confirmPassword' || name === 'password') {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (userData.password !== userData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (!currentSchool) {
      toast.error('No school selected. Please add a school first.');
      return;
    }
    
    // Prepare data for submission
    const submissionData: UserFormData = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
      email: userData.email,
      dob: userData.dob,
      userName: userData.userName,
      password: userData.password,
      role: 'admin',
      school_id: currentSchool.school_id
    };
    
    mutate(submissionData);
  };

  return (
    <div className="adminUserAddContainer">
      <Toaster position='top-center' richColors />
      <div className="adminUserAddBackground">
        <div className="adminUserAddShape adminUserAddShapeOne"></div>
        <div className="adminUserAddShape adminUserAddShapeTwo"></div>
        <div className="adminUserAddShape adminUserAddShapeThree"></div>
      </div>
      
      <div className="adminUserAddCard">
        <div className="adminUserAddHeader">
          <h1 className="adminUserAddTitle">Add Admin User</h1>
          <p className="adminUserAddSubtitle">Create a new administrator account</p>
        </div>

        <form className="adminUserAddForm" onSubmit={handleSubmit}>
          <div className="adminUserAddInputGroup">
            <label htmlFor="adminUserAddFirstName" className="adminUserAddInputLabel">
              First Name
            </label>
            <div className="adminUserAddInputContainer">
              <i className="adminUserAddInputIcon fas fa-user"></i>
              <input
                type="text"
                id="adminUserAddFirstName"
                name="firstName"
                value={userData.firstName}
                onChange={handleInputChange}
                className="adminUserAddInputField"
                placeholder="Enter first name"
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="adminUserAddInputGroup">
            <label htmlFor="adminUserAddLastName" className="adminUserAddInputLabel">
              Last Name
            </label>
            <div className="adminUserAddInputContainer">
              <i className="adminUserAddInputIcon fas fa-user"></i>
              <input
                type="text"
                id="adminUserAddLastName"
                name="lastName"
                value={userData.lastName}
                onChange={handleInputChange}
                className="adminUserAddInputField"
                placeholder="Enter last name"
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="adminUserAddInputGroup">
            <label htmlFor="adminUserAddUserName" className="adminUserAddInputLabel">
              Username
            </label>
            <div className="adminUserAddInputContainer">
              <i className="adminUserAddInputIcon fas fa-at"></i>
              <input
                type="text"
                id="adminUserAddUserName"
                name="userName"
                value={userData.userName}
                className="adminUserAddInputField"
                placeholder="Username will be generated automatically"
                required
                disabled={true}
                readOnly
              />
            </div>
            <div className="adminUserAddHelpText">
              Username is automatically generated in the format: firstnamelastname@
              {currentSchool?.username ? `${currentSchool.username}admin` : 'schooladmin'}
            </div>
          </div>

          <div className="adminUserAddInputGroup">
            <label htmlFor="adminUserAddPhone" className="adminUserAddInputLabel">
              Phone Number
            </label>
            <div className="adminUserAddInputContainer">
              <i className="adminUserAddInputIcon fas fa-phone"></i>
              <input
                type="tel"
                id="adminUserAddPhone"
                name="phoneNumber"
                value={userData.phoneNumber}
                onChange={handleInputChange}
                className="adminUserAddInputField"
                placeholder="Enter phone number"
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="adminUserAddInputGroup">
            <label htmlFor="adminUserAddEmail" className="adminUserAddInputLabel">
              Email Address
            </label>
            <div className="adminUserAddInputContainer">
              <i className="adminUserAddInputIcon fas fa-envelope"></i>
              <input
                type="email"
                id="adminUserAddEmail"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                className="adminUserAddInputField"
                placeholder="Enter email address"
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="adminUserAddInputGroup">
            <label htmlFor="adminUserAddDob" className="adminUserAddInputLabel">
              Date of Birth
            </label>
            <div className="adminUserAddInputContainer">
              <i className="adminUserAddInputIcon fas fa-calendar"></i>
              <input
                type="date"
                id="adminUserAddDob"
                name="dob"
                value={userData.dob}
                onChange={handleInputChange}
                className="adminUserAddInputField"
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="adminUserAddInputGroup">
            <label htmlFor="adminUserAddPassword" className="adminUserAddInputLabel">
              Password
            </label>
            <div className="adminUserAddInputContainer">
              <i className="adminUserAddInputIcon fas fa-lock"></i>
              <input
                type="password"
                id="adminUserAddPassword"
                name="password"
                value={userData.password}
                onChange={handleInputChange}
                className="adminUserAddInputField"
                placeholder="Enter password"
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="adminUserAddInputGroup">
            <label htmlFor="adminUserAddConfirmPassword" className="adminUserAddInputLabel">
              Confirm Password
            </label>
            <div className="adminUserAddInputContainer">
              <i className="adminUserAddInputIcon fas fa-lock"></i>
              <input
                type="password"
                id="adminUserAddConfirmPassword"
                name="confirmPassword"
                value={userData.confirmPassword}
                onChange={handleInputChange}
                className="adminUserAddInputField"
                placeholder="Confirm password"
                required
                disabled={isPending}
              />
            </div>
            {passwordError && <div className="adminUserAddErrorText">{passwordError}</div>}
          </div>

          <button 
            type="submit" 
            className={`adminUserAddSubmitButton ${isPending ? 'adminUserAddButtonLoading' : ''}`}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <i className="adminUserAddSpinner fas fa-spinner"></i>
                Creating Admin User...
              </>
            ) : (
              'Create Admin User'
            )}
          </button>

          <div className="adminUserAddBackPrompt">
            <a onClick={() => navigate(-1)} className="adminUserAddBackLink">
              <i className="fas fa-arrow-left"></i> Back to previous page
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Addadminuser;