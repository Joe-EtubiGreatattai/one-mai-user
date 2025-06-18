import React, { useState } from 'react';
import GroupCreationStart from '../Components/Group/GroupCreationStart';
import GroupBasicInfo from '../Components/Group/GroupBasicInfo';
import GroupSettings from '../Components/Group/GroupSettings';
import GroupMembers from '../Components/Group/GroupMembers';
import GroupCreationSuccess from '../Components/Group/GroupCreationSuccess';
import axios from '../Api/axios';
import useGroupStore from '../Store/group';
import { useNavigate } from 'react-router-dom';

const GroupCreationFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [groupData, setGroupData] = useState({
    name: '',
    description: '',
    profilePicture: null,
    frequency: 'weekly',
    memberLimit: 10,
    payoutDate: '1',
    amount: '50',
    inviteCode: 'GRP-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
    members: []
  });
  const [previewImage, setPreviewImage] = useState('');
  const [error, setError] = useState('');

  const { createGroup, loading } = useGroupStore();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGroupData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.match('image.*')) {
      setError('Please upload an image file (JPEG, PNG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError('Image size must be less than 5MB');
      return;
    }

    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewImage(e.target.result);
    reader.readAsDataURL(file);

    // Store file for upload
    setGroupData(prev => ({
      ...prev,
      profilePicture: file
    }));
  };

  const removeImage = () => {
    setPreviewImage('');
    setGroupData(prev => ({
      ...prev,
      profilePicture: null
    }));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(groupData.inviteCode);
    alert('Group code copied to clipboard!');
  };

  const shareLink = () => {
    const link = `${window.location.origin}/join/${groupData.inviteCode}`;
    if (navigator.share) {
      navigator.share({
        title: 'Join my savings group',
        text: 'Join my savings group on GroupSave',
        url: link
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(link);
      alert('Group link copied to clipboard!');
    }
  };

  const handleCreateGroup = async () => {
    try {
      setError('');

      const formData = new FormData();
      formData.append('name', groupData.name);
      formData.append('description', groupData.description || '');
      formData.append('savingsAmount', groupData.amount);
      formData.append('frequency', groupData.frequency);
      formData.append('maxMembers', groupData.memberLimit);
      formData.append('privacy', 'public');
      formData.append('inviteCode', groupData.inviteCode);
      formData.append('payoutDate', groupData.payoutDate);

      if (groupData.profilePicture) {
        formData.append('image', groupData.profilePicture);
      }

      const response = await axios.post('/api/group/createGroup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setCurrentStep(5); // Show success step
      } else {
        setError(response.data.message || 'Failed to create group');
      }
    } catch (err) {
      console.error('Create group error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to create group. Please try again.'
      );
    }
  };

  const steps = {
    1: <GroupCreationStart setCurrentStep={setCurrentStep} />,
    2: (
      <GroupBasicInfo
        groupData={groupData}
        setGroupData={setGroupData}
        previewImage={previewImage}
        setPreviewImage={setPreviewImage}
        setCurrentStep={setCurrentStep}
        handleFileChange={handleFileChange}
        removeImage={removeImage}
      />
    ),
    3: (
      <GroupSettings
        groupData={groupData}
        setGroupData={setGroupData}
        setCurrentStep={setCurrentStep}
      />
    ),
    4: (
      <GroupMembers
        groupData={groupData}
        setCurrentStep={setCurrentStep}
        handleCreateGroup={handleCreateGroup}
        loading={loading}
        copyToClipboard={copyToClipboard}
        shareLink={shareLink}
      />
    ),
    5: <GroupCreationSuccess groupData={groupData} />
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Progress Indicator - Mobile */}
        <div className="md:hidden mb-6">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step ? 'bg-[#3390d5] text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 5 && (
                  <div
                    className={`h-1 w-8 ${
                      currentStep > step ? 'bg-[#3390d5]' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Progress Indicator - Desktop */}
        <div className="hidden md:flex justify-between mb-8">
          {['Start', 'Basic Info', 'Settings', 'Members', 'Complete'].map((label, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep > index + 1
                    ? 'bg-[#3390d5] text-[#3390d5]'
                    : currentStep === index + 1
                    ? 'bg-[#3390d5] text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`mt-2 text-sm font-medium ${
                  currentStep >= index + 1 ? 'text-[#3390d5]' : 'text-gray-500'
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Current Step Content */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 md:p-8">
          {steps[currentStep]}
        </div>
      </div>

      {/* Error Notification */}
      {error && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 max-w-md bg-red-500 text-white p-3 sm:p-4 rounded-lg shadow-lg flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            className="ml-4 text-lg font-bold"
            aria-label="Close error message"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default GroupCreationFlow;