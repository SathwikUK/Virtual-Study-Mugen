import React, { useState, useEffect, useCallback, memo } from 'react';

const Modal = ({
  onClose,
  groupName,
  setGroupName,
  groupDescription,
  setGroupDescription,
  groupImage,
  setGroupImage,
  onSubmit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Memoize file upload handler
  const handleFileUpload = useCallback(
    (e) => {
      const file = e.target.files[0];
      setGroupImage(file);
    },
    [setGroupImage]
  );

  // Create a preview URL for the uploaded image and revoke when done
  const [previewUrl, setPreviewUrl] = useState(null);
  useEffect(() => {
    if (groupImage) {
      const url = URL.createObjectURL(groupImage);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [groupImage]);

  // Handle form submission with loading effect and popup notification
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Assume onSubmit returns a promise
      await onSubmit();

      // Show success popup in the corner
      setShowPopup(true);
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="relative w-full max-w-md rounded-xl bg-[#1B1B2F] p-6 shadow-neon">
        {/* Popup Notification at top-right corner */}
        {showPopup && (
          <div className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded shadow-lg"
               style={{ width: '150px', height: 'auto' }}>
            <p className="text-sm font-semibold text-center">
              Group created successfully!
            </p>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#3B3B55] pb-3 mb-4">
          <h2 className="text-2xl font-bold text-white">Create Group</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors focus:outline-none text-2xl"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-6">
          {/* Group Name */}
          <div>
            <label htmlFor="group-name" className="block text-sm font-medium text-gray-300">
              Group Name
            </label>
            <input
              type="text"
              id="group-name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[#3B3B55] bg-[#2A2A3D] px-4 py-2 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              placeholder="Enter group name"
            />
          </div>

          {/* Group Description */}
          <div>
            <label htmlFor="group-description" className="block text-sm font-medium text-gray-300">
              Group Description
            </label>
            <textarea
              id="group-description"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[#3B3B55] bg-[#2A2A3D] px-4 py-2 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors sm:text-sm"
              placeholder="Enter group description"
              rows="4"
            ></textarea>
          </div>

          {/* Profile Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-300">Profile Photo</label>
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="block w-full cursor-pointer rounded-lg border border-dashed border-[#3B3B55] bg-[#1A1A2F] px-4 py-2 text-gray-300 file:mr-4 file:rounded-md file:border-none file:bg-gradient-to-r file:from-purple-600 file:to-pink-600 file:px-3 file:py-1 file:font-medium file:text-white hover:border-purple-500 hover:bg-[#24243E] transition-colors"
              />
            </div>
            {groupImage && previewUrl && (
              <div className="mt-4 flex items-center space-x-4">
                <img
                  src={previewUrl}
                  alt="Profile Preview"
                  className="h-12 w-12 rounded-full border border-[#3B3B55] object-cover"
                />
                <span className="text-sm font-medium text-gray-300">{groupImage.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end gap-3 border-t border-[#3B3B55] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#3B3B55] bg-transparent px-4 py-2 text-sm font-semibold text-gray-300 shadow-sm hover:bg-[#3B3B55] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className={`rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-1 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Creating...
              </div>
            ) : (
              'Create'
            )}
          </button>
        </div>
      </div>

      {/* Custom Styles for Neon Glow */}
      <style jsx="true">{`
        .shadow-neon {
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.7), 0 0 30px rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  );
};

export default memo(Modal);
