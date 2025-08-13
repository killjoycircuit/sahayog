import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from './context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DollarSign, Calendar, Target, Loader2, AlertCircle } from 'lucide-react';

const MyContributionPage = () => {
    const { user, ready } = useContext(UserContext);
    const navigate = useNavigate();
    const [contributions, setContributions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (ready && !user) {
            navigate('/login');
        }

        if (user) {
            fetchUserContributions();
        }
    }, [user, ready, navigate]);

    const fetchUserContributions = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get('/api/user/contributions');
            setContributions(response.data);
        } catch (err) {
            console.error('Error fetching contributions:', err);
            setError(err.response?.data?.error || 'Failed to load your contributions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleContributionClick = (eventId) => {
        navigate(`/event/${eventId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-teal-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading your contributions...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                </div>
            </div>
        );
    }

    if (contributions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                <div className="text-center max-w-lg mx-auto p-8 bg-white rounded-xl shadow-lg">
                    <Target className="w-16 h-16 text-teal-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No Contributions Yet</h2>
                    <p className="text-gray-600 mb-6">
                        It looks like you haven't contributed to any events yet.
                        Start exploring and find a cause you care about!
                    </p>
                    <button
                        onClick={() => navigate('/events')}
                        className="bg-teal-600 text-white font-semibold py-3 px-6 rounded-full hover:bg-teal-700 transition-colors shadow-md"
                    >
                        Explore Events
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-10">Your Contributions</h1>
                <div className="space-y-6">
                    {contributions.map((contribution, index) => (
                        <div
                            key={index}
                            onClick={() => handleContributionClick(contribution.event._id)}
                            className="bg-white rounded-xl shadow-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between transition-transform transform hover:scale-[1.01] cursor-pointer"
                        >
                            <div className="flex-grow">
                                <h2 className="text-xl font-bold text-gray-900 mb-1">
                                    {contribution.event.title}
                                </h2>
                                <p className="text-sm text-gray-500 flex items-center space-x-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>Contributed on {formatDate(contribution.date)}</span>
                                </p>
                            </div>
                            <div className="mt-4 sm:mt-0 sm:ml-6 text-right flex-shrink-0">
                                <p className="text-lg font-bold text-teal-600 flex items-center justify-end space-x-1">
                                    <DollarSign className="w-5 h-5 text-teal-500" />
                                    <span>{contribution.amount}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MyContributionPage;