import React, { useState } from 'react';
import useGroupStore from '../Store/group';
import useAuthStore from '../Store/Auth';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const JoinGroupPage = () => {
  const navigate = useNavigate();
  const { joinGroupWithCode, loading } = useGroupStore();
  const { user } = useAuthStore();

  const [code, setCode] = useState('');
  const [group, setGroup] = useState(null);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleJoin = async () => {
    if (!user) {
      navigate('/signIn');
      return;
    }

    if (!code || !code.startsWith('GRP-')) {
      setError('Enter a valid invite code');
      return;
    }

    try {
      setJoining(true);
      setError('');
      const res = await joinGroupWithCode(code);
      setSuccess(true);
      setGroup(res.group);

      // Navigate to the group page immediately upon success
      if (res.group?._id) {
        navigate(`/groups/${res.group._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to join group');
    } finally {
      setJoining(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with back button */}
      <div className="flex items-center px-4 py-4 border-b border-gray-100">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 text-gray-600 hover:text-gray-800"
        >
          <FiArrowLeft size={20} />
        </button>
      </div>

      {/* Main content */}
      <div className="px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Join An Existing Group
          </h1>
          <p className="text-sm text-gray-500">
            Please put in the code of the group you want to join
          </p>
        </div>

        {/* Code input section */}
        <div className="mb-8">
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <input
              type="text"
              placeholder="Enter group code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full bg-transparent text-base text-gray-900 placeholder-gray-400 outline-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center mb-4">{error}</p>
          )}

          {/* Success state */}
          {success && group && (
            <div className="text-center mb-6">
              <img
                src={`https://api.joinonemai.com${group.image}`}
                alt={group.name}
                className="w-20 h-20 rounded-full mx-auto object-cover mb-3 border"
              />
              <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
              <p className="text-sm text-gray-600 mb-1">
                {group.description || 'No description provided'}
              </p>
              <p className="text-xs text-gray-500">
                {group.members.length}/{group.maxMembers} members
              </p>
              <p className="mt-3 text-green-600 text-sm font-medium">
                Joined! Redirecting...
              </p>
            </div>
          )}
        </div>

        {/* Confirm button */}
        <button
          onClick={handleJoin}
          disabled={joining || loading || !code}
          className="w-full bg-[#3390d5] hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-lg font-medium text-base transition-colors"
        >
          {joining ? 'Joining...' : 'Confirm Group'}
        </button>
      </div>
    </div>
  );
};

export default JoinGroupPage;