import React, { useState, useEffect } from 'react';
import { guideAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { FiCalendar, FiCheck, FiClock, FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const DashboardGuide = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [schedule, setSchedule] = useState([]);
  const [hireRequests, setHireRequests] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    pendingHireRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [hireLoading, setHireLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'overview') {
        // Fetch both schedule and hire requests count
        const [scheduleRes, hireRes] = await Promise.all([
          guideAPI.getSchedule(),
          guideAPI.getHireRequests()
        ]);
        
        const scheduleData = scheduleRes.data.data;
        const hireRequests = hireRes.data.data || [];
        
        setSchedule(scheduleData);
        
        // Calculate stats
        setStats(prev => ({
          ...prev,
          totalBookings: scheduleData.length,
          pendingBookings: scheduleData.filter(b => b.status === 'pending').length,
          approvedBookings: scheduleData.filter(b => b.status === 'approved').length,
          pendingHireRequests: hireRequests.filter(r => r.status === 'pending').length,
        }));
      } else if (activeTab === 'hireRequests') {
        const response = await guideAPI.getHireRequests();
        const requests = response.data.data || [];
        setHireRequests(requests);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          pendingHireRequests: requests.filter(r => r.status === 'pending').length,
        }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptHireRequest = async (requestId) => {
    if (!user) return;

    try {
      setActionLoading(requestId);
      await guideAPI.acceptHireRequest(requestId);
      
      setMessage({ type: 'success', text: 'Hire request accepted!' });
      
      // Refresh hire requests
      await fetchData();
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error accepting hire request:', error);
      setMessage({ type: 'error', text: 'Failed to accept hire request' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectHireRequest = async (requestId) => {
    if (!user) return;

    try {
      setActionLoading(requestId);
      await guideAPI.rejectHireRequest(requestId);
      
      setMessage({ type: 'success', text: 'Hire request rejected' });
      
      // Refresh hire requests
      await fetchData();
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error rejecting hire request:', error);
      setMessage({ type: 'error', text: 'Failed to reject hire request' });
    } finally {
      setActionLoading(null);
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
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Guide Dashboard</h1>
              <p className="text-gray-600">Welcome! Here's your overview</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-4 px-4 font-semibold transition ${
                  activeTab === 'overview'
                    ? 'text-ocean-600 border-b-2 border-ocean-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('hireRequests')}
                className={`pb-4 px-4 font-semibold transition ${
                  activeTab === 'hireRequests'
                    ? 'text-ocean-600 border-b-2 border-ocean-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Hire Requests ({stats.pendingHireRequests})
              </button>
            </div>

            {/* Message Alert */}
            {message.text && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {message.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
                {message.text}
              </div>
            )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <FiCalendar className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Pending</p>
                        <p className="text-3xl font-bold text-yellow-600">{stats.pendingBookings}</p>
                      </div>
                      <div className="bg-yellow-100 p-3 rounded-lg">
                        <FiClock className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Approved</p>
                        <p className="text-3xl font-bold text-green-600">{stats.approvedBookings}</p>
                      </div>
                      <div className="bg-green-100 p-3 rounded-lg">
                        <FiCheck className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Links</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a
                      href="/dashboard/guide/schedule"
                      className="p-4 border-2 border-ocean-500 rounded-lg hover:bg-ocean-50 transition text-center"
                    >
                      <h3 className="font-semibold text-ocean-600 mb-1">My Schedule</h3>
                      <p className="text-sm text-gray-600">View and manage your bookings</p>
                    </a>
                    <a
                      href="/dashboard/guide/profile"
                      className="p-4 border-2 border-ocean-500 rounded-lg hover:bg-ocean-50 transition text-center"
                    >
                      <h3 className="font-semibold text-ocean-600 mb-1">My Profile</h3>
                      <p className="text-sm text-gray-600">Update your profile information</p>
                    </a>
                    <button
                      onClick={() => setActiveTab('hireRequests')}
                      className="p-4 border-2 border-ocean-500 rounded-lg hover:bg-ocean-50 transition text-center cursor-pointer"
                    >
                      <h3 className="font-semibold text-ocean-600 mb-1">Hire Requests</h3>
                      <p className="text-sm text-gray-600">Review booking requests from owners</p>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Hire Requests Tab */}
            {activeTab === 'hireRequests' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Hire Requests</h2>
                
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500"></div>
                  </div>
                ) : hireRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-600">No hire requests at the moment</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hireRequests.map((request) => (
                      <div
                        key={request._id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {request.owner?.name || 'Anonymous Owner'}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {request.owner?.email}
                            </p>
                            {request.surfSpot && (
                              <div className="flex items-center gap-2 text-sm text-gray-700 mt-3">
                                <span className="font-medium">Selected Surf Spot:</span>
                                <span className="bg-ocean-100 text-ocean-700 px-3 py-1 rounded">
                                  {request.surfSpot.name || 'Unknown Spot'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className={`px-3 py-1 rounded text-sm font-semibold ${
                            request.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : request.status === 'accepted'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                          </div>
                        </div>

                        <p className="text-xs text-gray-500 mb-4">
                          Requested on: {new Date(request.requestedAt).toLocaleDateString()}
                        </p>

                        {request.status === 'pending' && (
                          <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <button
                              onClick={() => handleAcceptHireRequest(request._id)}
                              disabled={actionLoading === request._id}
                              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                            >
                              {actionLoading === request._id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <FiCheck />
                              )}
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectHireRequest(request._id)}
                              disabled={actionLoading === request._id}
                              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                            >
                              {actionLoading === request._id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <FiX />
                              )}
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGuide;