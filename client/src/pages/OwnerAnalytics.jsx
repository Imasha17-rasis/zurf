import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AnalyticsCard from '../components/AnalyticsCard';
import {
    FiCalendar,
    FiDollarSign,
    FiTrendingUp,
    FiBarChart2,
} from 'react-icons/fi';

const OwnerAnalytics = () => {
    const [monthlyReport, setMonthlyReport] = useState(null);
    const [yearlyReport, setYearlyReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('monthly');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [monthlyRes, yearlyRes] = await Promise.all([
                bookingAPI.getMonthlyReport(),
                bookingAPI.getYearlyReport(),
            ]);
            setMonthlyReport(monthlyRes.data.data);
            setYearlyReport(yearlyRes.data.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
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
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
                            <p className="text-gray-600">
                                Track your performance and revenue
                            </p>
                        </div>

                        {/* Tabs */}
                        <div className="bg-white rounded-lg shadow-sm p-1.5 mb-8 flex gap-1">
                            {['monthly', 'yearly'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-5 py-2.5 rounded-lg font-semibold capitalize transition-all duration-200 ${activeTab === tab
                                            ? 'bg-ocean-500 text-white shadow-md ring-2 ring-ocean-300'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                        }`}
                                >
                                    {tab} Performance
                                </button>
                            ))}
                        </div>

                        {/* Monthly Performance */}
                        {activeTab === 'monthly' && (
                            <div className="space-y-8">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <AnalyticsCard
                                        title="Total Bookings"
                                        value={monthlyReport?.totalBookings || 0}
                                        icon={FiCalendar}
                                        color="blue"
                                        subtitle="This month"
                                    />
                                    <AnalyticsCard
                                        title="Total Revenue"
                                        value={`$${(monthlyReport?.totalIncome || 0).toFixed(2)}`}
                                        icon={FiDollarSign}
                                        color="green"
                                        subtitle="This month"
                                    />
                                    <AnalyticsCard
                                        title="Avg Booking Value"
                                        value={`$${(monthlyReport?.averageBookingValue || 0).toFixed(2)}`}
                                        icon={FiTrendingUp}
                                        color="ocean"
                                        subtitle="This month"
                                    />
                                </div>

                                {/* Most Rented Gear */}
                                {monthlyReport?.mostRentedGear?.length > 0 && (
                                    <div className="bg-white rounded-xl shadow-md p-6">
                                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                            <FiBarChart2 className="mr-2" />
                                            Most Rented Gear
                                        </h2>
                                        <div className="space-y-3">
                                            {monthlyReport.mostRentedGear.map(([gearId, count], idx) => (
                                                <div
                                                    key={gearId}
                                                    className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
                                                >
                                                    <span className="text-sm font-medium text-gray-700">
                                                        #{idx + 1} Gear ID: {gearId}
                                                    </span>
                                                    <span className="text-sm font-bold text-ocean-600">
                                                        {count} rentals
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {monthlyReport?.totalBookings === 0 && (
                                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                                        <FiBarChart2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600 text-lg mb-2">
                                            No booking data for this month
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            Revenue and analytics will appear once bookings come in
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Yearly Performance */}
                        {activeTab === 'yearly' && (
                            <div className="space-y-8">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <AnalyticsCard
                                        title="Total Bookings"
                                        value={yearlyReport?.totalBookings || 0}
                                        icon={FiCalendar}
                                        color="blue"
                                        subtitle={`Year ${yearlyReport?.year || ''}`}
                                    />
                                    <AnalyticsCard
                                        title="Total Revenue"
                                        value={`$${(yearlyReport?.totalIncome || 0).toFixed(2)}`}
                                        icon={FiDollarSign}
                                        color="green"
                                        subtitle={`Year ${yearlyReport?.year || ''}`}
                                    />
                                    <AnalyticsCard
                                        title="Avg Booking Value"
                                        value={`$${(yearlyReport?.averageBookingValue || 0).toFixed(2)}`}
                                        icon={FiTrendingUp}
                                        color="ocean"
                                        subtitle={`Year ${yearlyReport?.year || ''}`}
                                    />
                                </div>

                                {/* Monthly Breakdown Table */}
                                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                            <FiBarChart2 className="mr-2" />
                                            Monthly Breakdown — {yearlyReport?.year}
                                        </h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Month
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Bookings
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Revenue
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {yearlyReport?.monthlyBreakdown?.map((m) => (
                                                    <tr key={m.month} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                            {m.label}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                            {m.bookings}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm font-semibold text-green-600">
                                                            ${m.income.toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {yearlyReport?.totalBookings === 0 && (
                                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                                        <FiBarChart2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600 text-lg mb-2">
                                            No booking data for {yearlyReport?.year}
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            Revenue and analytics will appear once bookings come in
                                        </p>
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

export default OwnerAnalytics;
