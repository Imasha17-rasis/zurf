import React, { useState, useEffect, useMemo } from 'react';
import { bookingAPI, guideAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import {
    FiSearch,
    FiFilter,
    FiCalendar,
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiEye,
    FiX,
} from 'react-icons/fi';
import { format } from 'date-fns';

const STATUS_OPTIONS = ['all', 'pending', 'approved', 'rejected', 'completed', 'cancelled'];

const OwnerBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [spotFilter, setSpotFilter] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [hireRequests, setHireRequests] = useState([]);
    const [assigningGuide, setAssigningGuide] = useState(false);

    useEffect(() => {
        fetchBookings();
        fetchHireRequests();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await bookingAPI.getOwnerBookings();
            setBookings(res.data.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHireRequests = async () => {
        try {
            const response = await guideAPI.getOwnerHireRequests();
            setHireRequests(response.data.data || []);
        } catch (error) {
            console.error('Error fetching hire requests:', error);
        }
    };

    const handleAssignGuide = async (bookingId, guideId) => {
        try {
            setAssigningGuide(true);
            await guideAPI.assignGuideToBooking(bookingId, guideId);
            // Refresh bookings
            const res = await bookingAPI.getOwnerBookings();
            setBookings(res.data.data);
            // Update selected booking with fresh data
            const updatedBooking = res.data.data.find(b => b._id === bookingId);
            setSelectedBooking(updatedBooking);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to assign guide');
        } finally {
            setAssigningGuide(false);
        }
    };

    // Unique surf spot names for the spot filter dropdown
    const spotNames = useMemo(() => {
        const names = [...new Set(bookings.map((b) => b.surfSpot?.name).filter(Boolean))];
        return names.sort();
    }, [bookings]);

    // Filtered and searched bookings
    const filteredBookings = useMemo(() => {
        return bookings.filter((b) => {
            // Status filter
            if (statusFilter !== 'all' && b.status !== statusFilter) return false;

            // Spot filter
            if (spotFilter !== 'all' && b.surfSpot?.name !== spotFilter) return false;

            // Search
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const matchesSurfer = b.surfer?.name?.toLowerCase().includes(term);
                const matchesEmail = b.surfer?.email?.toLowerCase().includes(term);
                const matchesSpot = b.surfSpot?.name?.toLowerCase().includes(term);
                const matchesId = b._id?.toLowerCase().includes(term);
                if (!matchesSurfer && !matchesEmail && !matchesSpot && !matchesId) return false;
            }

            return true;
        });
    }, [bookings, statusFilter, spotFilter, searchTerm]);

    // Stats
    const stats = useMemo(() => ({
        total: bookings.length,
        pending: bookings.filter((b) => b.status === 'pending').length,
        approved: bookings.filter((b) => b.status === 'approved').length,
        completed: bookings.filter((b) => b.status === 'completed').length,
    }), [bookings]);

    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            setActionLoading(bookingId);
            await bookingAPI.updateStatus(bookingId, newStatus);
            // Refresh bookings
            await fetchBookings();
            // Close detail modal if open
            if (selectedBooking?._id === bookingId) {
                setSelectedBooking(null);
            }
        } catch (error) {
            alert(error.response?.data?.message || `Failed to ${newStatus} booking`);
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            completed: 'bg-blue-100 text-blue-800',
            cancelled: 'bg-gray-100 text-gray-800',
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.pending}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <div className="flex">
                    <Sidebar role="owner" />
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
                <Sidebar role="owner" />

                <div className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookings</h1>
                            <p className="text-gray-600">
                                Manage and review all bookings for your surf spots
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-white rounded-xl shadow-md p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Total</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                    </div>
                                    <div className="bg-blue-100 p-2.5 rounded-lg">
                                        <FiCalendar className="h-5 w-5 text-blue-600" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-md p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Pending</p>
                                        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                    </div>
                                    <div className="bg-yellow-100 p-2.5 rounded-lg">
                                        <FiClock className="h-5 w-5 text-yellow-600" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-md p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Approved</p>
                                        <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                                    </div>
                                    <div className="bg-green-100 p-2.5 rounded-lg">
                                        <FiCheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-md p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Completed</p>
                                        <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
                                    </div>
                                    <div className="bg-blue-100 p-2.5 rounded-lg">
                                        <FiCheckCircle className="h-5 w-5 text-blue-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search & Filters */}
                        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Search */}
                                <div className="flex-1 relative">
                                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search by surfer name, email, spot, or booking ID..."
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Status Filter */}
                                <div className="flex items-center gap-2">
                                    <FiFilter className="h-4 w-4 text-gray-500" />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                                    >
                                        {STATUS_OPTIONS.map((s) => (
                                            <option key={s} value={s}>
                                                {s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Spot Filter */}
                                {spotNames.length > 1 && (
                                    <div>
                                        <select
                                            value={spotFilter}
                                            onChange={(e) => setSpotFilter(e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                                        >
                                            <option value="all">All Spots</option>
                                            {spotNames.map((name) => (
                                                <option key={name} value={name}>
                                                    {name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bookings Table */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {filteredBookings.length} Booking{filteredBookings.length !== 1 ? 's' : ''}
                                </h2>
                            </div>

                            {filteredBookings.length === 0 ? (
                                <div className="p-12 text-center">
                                    <FiCalendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 text-lg mb-2">No bookings found</p>
                                    <p className="text-gray-500 text-sm">
                                        {searchTerm || statusFilter !== 'all' || spotFilter !== 'all'
                                            ? 'Try adjusting your search or filters'
                                            : 'Bookings will appear here when surfers book your spots'}
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Surfer
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Surf Spot
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Date
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Time
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Duration
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Price
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {filteredBookings.map((booking) => (
                                                <tr key={booking._id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {booking.surfer?.name || 'N/A'}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {booking.surfer?.email || ''}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-900">
                                                        {booking.surfSpot?.name || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-600">
                                                        {booking.bookingDate
                                                            ? format(new Date(booking.bookingDate), 'MMM dd, yyyy')
                                                            : 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-600">
                                                        {booking.startTime || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-600">
                                                        {booking.durationHours}h
                                                    </td>
                                                    <td className="px-4 py-4 text-sm font-semibold text-green-600">
                                                        ${booking.totalPrice}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {getStatusBadge(booking.status)}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center space-x-1">
                                                            {/* Approve / Reject buttons only for pending bookings */}
                                                            {booking.status === 'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleStatusUpdate(booking._id, 'approved')}
                                                                        disabled={actionLoading === booking._id}
                                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                                                                        title="Approve"
                                                                    >
                                                                        <FiCheckCircle className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                                                                        disabled={actionLoading === booking._id}
                                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                                                        title="Decline"
                                                                    >
                                                                        <FiXCircle className="h-4 w-4" />
                                                                    </button>
                                                                </>
                                                            )}
                                                            {/* Mark completed for approved bookings */}
                                                            {booking.status === 'approved' && (
                                                                <button
                                                                    onClick={() => handleStatusUpdate(booking._id, 'completed')}
                                                                    disabled={actionLoading === booking._id}
                                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                                                                    title="Mark Completed"
                                                                >
                                                                    <FiCheckCircle className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                            {/* View details */}
                                                            <button
                                                                onClick={() => setSelectedBooking(booking)}
                                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                                                title="View Details"
                                                            >
                                                                <FiEye className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Detail Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">Booking Details</h3>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <FiX className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Booking ID</p>
                                    <p className="text-sm font-mono text-gray-900">{selectedBooking._id}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Status</p>
                                    {getStatusBadge(selectedBooking.status)}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Surfer</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {selectedBooking.surfer?.name || 'N/A'}
                                    </p>
                                    <p className="text-xs text-gray-500">{selectedBooking.surfer?.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Surf Spot</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {selectedBooking.surfSpot?.name || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Date</p>
                                    <p className="text-sm text-gray-900">
                                        {selectedBooking.bookingDate
                                            ? format(new Date(selectedBooking.bookingDate), 'MMM dd, yyyy')
                                            : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Start Time</p>
                                    <p className="text-sm text-gray-900">{selectedBooking.startTime || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Duration</p>
                                    <p className="text-sm text-gray-900">{selectedBooking.durationHours}h</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Total Price</p>
                                    <p className="text-lg font-bold text-green-600">${selectedBooking.totalPrice}</p>
                                </div>
                            </div>

                            {selectedBooking.guide && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Guide</p>
                                    <p className="text-sm text-gray-900">
                                        {selectedBooking.guide.user?.name || selectedBooking.guide.name || 'Assigned'}
                                    </p>
                                </div>
                            )}

                            {!selectedBooking.guide && selectedBooking.status === 'approved' && hireRequests.filter(r => r.status === 'accepted').length > 0 && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-2">Assign a Guide</p>
                                    <select
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                handleAssignGuide(selectedBooking._id, e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                        disabled={assigningGuide}
                                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Select a guide...</option>
                                        {hireRequests
                                            .filter(r => r.status === 'accepted')
                                            .map(request => (
                                                <option key={request._id} value={request.guide._id}>
                                                    {request.guide.name} (${request.guide.pricePerSession}/session)
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            )}

                            {selectedBooking.gears?.length > 0 && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Rented Gear</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {selectedBooking.gears.map((gear) => (
                                            <span
                                                key={gear._id}
                                                className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-700"
                                            >
                                                {gear.name || gear._id}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action buttons in modal */}
                            {selectedBooking.status === 'pending' && (
                                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => handleStatusUpdate(selectedBooking._id, 'approved')}
                                        disabled={actionLoading === selectedBooking._id}
                                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
                                    >
                                        <FiCheckCircle className="h-4 w-4" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedBooking._id, 'rejected')}
                                        disabled={actionLoading === selectedBooking._id}
                                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
                                    >
                                        <FiXCircle className="h-4 w-4" />
                                        Decline
                                    </button>
                                </div>
                            )}

                            {selectedBooking.status === 'approved' && (
                                <div className="pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => handleStatusUpdate(selectedBooking._id, 'completed')}
                                        disabled={actionLoading === selectedBooking._id}
                                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
                                    >
                                        <FiCheckCircle className="h-4 w-4" />
                                        Mark as Completed
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerBookings;
