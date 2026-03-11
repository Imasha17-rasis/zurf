import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { guideAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { FiMail, FiPhone, FiMapPin, FiAward, FiEdit2, FiSave, FiX, FiCamera } from 'react-icons/fi';

const GuideProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await guideAPI.getProfile();
      setProfileData(response.data.data);
      setFormData(response.data.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setErrorMessage('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.name.trim()) {
        setErrorMessage('Name is required');
        return;
      }
      
      if (!formData.experienceYears && formData.experienceYears !== 0) {
        setErrorMessage('Years of experience is required');
        return;
      }

      if (!formData.pricePerSession && formData.pricePerSession !== 0) {
        setErrorMessage('Price per session is required');
        return;
      }

      console.log('Saving profile data:', formData);
      const response = await guideAPI.updateProfile(formData);
      console.log('Update response:', response);
      
      setProfileData(response.data.data);
      setFormData(response.data.data);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully');
      setErrorMessage('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update profile';
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleCancel = () => {
    setFormData(profileData);
    setIsEditing(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const formDataImage = new FormData();
      formDataImage.append('file', file);

      const response = await guideAPI.uploadProfileImage(formDataImage);
      
      setProfileData({
        ...profileData,
        profileImage: response.data.data.profileImage
      });
      setFormData({
        ...formData,
        profileImage: response.data.data.profileImage
      });
      
      setSuccessMessage('Profile image updated successfully');
      setErrorMessage('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to upload image';
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex">
          <Sidebar role="guide" />
          <div className="flex-1 flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar role="guide" />

        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
              <p className="text-gray-600">Manage your guide profile and information</p>
            </div>

            {/* Messages */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {errorMessage}
              </div>
            )}
            {profileData?.profileIncomplete && (
              <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
                <p className="font-medium">Welcome! Complete your guide profile to start accepting bookings.</p>
                <p className="text-sm mt-1">Update your information below and don't forget to add your experience details.</p>
              </div>
            )}

            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Edit Button */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 bg-ocean-500 hover:bg-ocean-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    <FiEdit2 className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              <div className="p-6">
                {/* Profile Image Section */}
                <div className="mb-8 flex flex-col items-center">
                  <div className="relative w-32 h-32 mb-4">
                    <img
                      src={profileData?.profileImage || `https://i.pravatar.cc/200?u=${profileData?.email}`}
                      alt={profileData?.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-ocean-500"
                    />
                    <label className="absolute bottom-0 right-0 bg-ocean-500 hover:bg-ocean-600 text-white p-2 rounded-full cursor-pointer transition shadow-lg">
                      <FiCamera className="h-5 w-5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {uploadingImage && (
                    <p className="text-sm text-gray-600">Uploading image...</p>
                  )}
                  <p className="text-xs text-gray-500 text-center mt-2">Click the camera icon to upload a profile picture</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profileData?.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FiMail className="h-4 w-4 mr-2" />
                      Email
                    </label>
                    <p className="text-gray-900 font-medium">{profileData?.email}</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FiPhone className="h-4 w-4 mr-2" />
                      Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profileData?.phone || 'Not provided'}</p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FiMapPin className="h-4 w-4 mr-2" />
                      Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="location"
                        value={formData.location || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profileData?.location || 'Not provided'}</p>
                    )}
                  </div>

                  {/* Experience Years */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FiAward className="h-4 w-4 mr-2" />
                      Years of Experience
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="experienceYears"
                        value={formData.experienceYears || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                        placeholder="e.g., 5"
                        min="0"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profileData?.experienceYears || 'Not specified'} years</p>
                    )}
                  </div>

                  {/* Price Per Session */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Per Session ($)
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="pricePerSession"
                        value={formData.pricePerSession || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                        placeholder="e.g., 50"
                        min="0"
                        step="0.01"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">${profileData?.pricePerSession || 'Not specified'}</p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio / Experience
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio || ''}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                      placeholder="Tell us about your experience as a surf guide..."
                    />
                  ) : (
                    <p className="text-gray-900">{profileData?.bio || 'No bio provided'}</p>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6 py-6 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">Verification Status</p>
                    <p className={`text-lg font-semibold ${profileData?.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                      {profileData?.isVerified ? 'Verified' : 'Pending Verification'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex items-center space-x-3 mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      <FiSave className="h-4 w-4" />
                      <span>Save Changes</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      <FiX className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideProfile;