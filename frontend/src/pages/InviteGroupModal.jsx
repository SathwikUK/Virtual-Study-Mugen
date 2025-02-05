import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Search } from 'lucide-react';

const InviteGroupModal = ({ groupId, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setUsers([]);
        return;
      }

      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/auth/search-users?query=${searchQuery}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data.users);
      } catch (error) {
        console.error('Error searching users:', error);
        toast.error('Failed to search users');
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimeout = setTimeout(searchUsers, 500);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const handleSendInvite = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/auth/send-group-invite',
        {
          groupId,
          userId: selectedUser._id
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setRequestSent(true);
      toast.success(`Invitation sent to ${selectedUser.name}`);
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error('Failed to send invitation');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Invite to Group</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="max-h-60 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user._id}
                className={`flex items-center p-2 hover:bg-gray-100 cursor-pointer rounded-lg ${
                  selectedUser?._id === user._id ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <img
                  src={user.image || 'https://via.placeholder.com/40'}
                  alt={user.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSendInvite}
            disabled={!selectedUser || requestSent}
            className={`px-4 py-2 rounded-lg ${
              !selectedUser || requestSent
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {requestSent ? 'Invitation Sent' : 'Send Invite'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteGroupModal;
