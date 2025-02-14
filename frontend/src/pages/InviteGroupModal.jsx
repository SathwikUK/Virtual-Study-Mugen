// InviteGroupModal.jsx
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
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setUsers([]);
        return;
      }
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/auth/search-users?query=${searchQuery}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
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
    setIsSendingInvite(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/auth/send-group-invite',
        { groupId, userId: selectedUser._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequestSent(true);
      toast.success(`Invitation sent to ${selectedUser.name}`);
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error('Failed to send invitation');
    } finally {
      setIsSendingInvite(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 neon-modal-backdrop">
      <div className="relative bg-[#1B1B2F] text-white neon-modal-glow p-6 w-full max-w-md rounded-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Invite to Group</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200 transition-colors">
            ×
          </button>
        </div>

        {/* Search Field */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="pl-10 w-full p-2 rounded-lg bg-[#2A2A3D] text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Search Results / Loader */}
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="max-h-60 overflow-y-auto scrollbar-hide">
            {users.map((user) => (
              <div
                key={user._id}
                className={`flex items-center p-2 cursor-pointer rounded-lg transition-colors ${
                  selectedUser?._id === user._id ? 'bg-purple-800' : 'hover:bg-[#2A2A3D]'
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <img
                  src={
                    user.image
                      ? `data:image/jpeg;base64,${btoa(
                          new Uint8Array(user.image.data).reduce(
                            (data, byte) => data + String.fromCharCode(byte),
                            ""
                          )
                        )}`
                      : "https://via.placeholder.com/40"
                  }
                  alt={user.name}
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                />
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-300">{user.email}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer: Send Invite Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSendInvite}
            disabled={!selectedUser || requestSent || isSendingInvite}
            className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 ${
              !selectedUser || requestSent || isSendingInvite
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90'
            } text-white`}
          >
            {isSendingInvite ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : requestSent ? (
              'Invitation Sent'
            ) : (
              'Send Invite'
            )}
          </button>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .neon-modal-backdrop {
          background: rgba(0, 0, 0, 0.8);
        }
        .neon-modal-glow {
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.5),
                      0 0 30px rgba(139, 92, 246, 0.3);
          border: 1px solid rgba(139, 92, 246, 0.4);
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default InviteGroupModal;
