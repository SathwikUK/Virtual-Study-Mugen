import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const NotificationItem = ({ notification, onStatusUpdate }) => {
  const handleResponse = async (accept) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/auth/respond-group-invite',
        {
          notificationId: notification._id,
          groupId: notification.groupId,
          accept
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data) {
        // Show different messages based on accept/reject
        const message = accept 
          ? `Successfully joined ${notification.groupName}`
          : `Declined invitation to ${notification.groupName}`;
        
        toast.success(message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Force refresh of notifications
        if (onStatusUpdate) {
          onStatusUpdate();
        }

        // If accepted, refresh the page to update group list
        if (accept) {
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast.error(
        error.response?.data?.message || 'Failed to respond to invitation',
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-2">
      <p className="text-sm text-gray-800 mb-2">
        You have been invited to join{' '}
        <span className="font-semibold">{notification.groupName}</span>
      </p>
      
      {(!notification.status || notification.status === 'pending') && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => handleResponse(true)}
            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm transition-colors duration-200"
          >
            Accept
          </button>
          <button
            onClick={() => handleResponse(false)}
            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm transition-colors duration-200"
          >
            Reject
          </button>
        </div>
      )}
      
      {notification.status === 'accepted' && (
        <p className="text-sm text-green-500">Accepted</p>
      )}
      
      {notification.status === 'rejected' && (
        <p className="text-sm text-red-500">Rejected</p>
      )}
    </div>
  );
};

export default NotificationItem;