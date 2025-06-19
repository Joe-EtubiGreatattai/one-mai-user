import React, { useState } from 'react';
import useGroupStore from '../Store/group';
import useAuthStore from '../Store/Auth';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiUserPlus } from 'react-icons/fi';

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

      if (res.group?._id) {
        setGroup(res.group);
        setTimeout(() => navigate(`/group/${res.group._id}`), 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to join group');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Join a Group</h2>
        <p className="text-sm text-gray-600 mb-4">Enter an invite code below</p>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="e.g. GRP-ABC123"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="flex-1 px-3 py-2 border rounded-md text-sm"
          />
          <button
            onClick={handleJoin}
            disabled={joining || loading}
            className="bg-[#3390d5] hover:bg-blue-600 text-white px-3 rounded-md flex items-center"
          >
            <FiUserPlus className="mr-1" />
            {joining ? 'Joining...' : 'Join'}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 mt-2">{error}</p>
        )}

        {success && group && (
          <div className="mt-4">
            <img
              src={`https://api.joinonemai.com${group.image}`}
              alt={group.name}
              className="w-20 h-20 rounded-full mx-auto object-cover mb-3 border"
            />
            <h3 className="text-lg font-bold text-gray-800">{group.name}</h3>
            <p className="text-sm text-gray-600">
              {group.description || 'No description provided'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {group.members.length}/{group.maxMembers} members
            </p>
            <p className="mt-2 text-green-600 text-sm font-medium">
              Joined! Redirecting...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinGroupPage;
