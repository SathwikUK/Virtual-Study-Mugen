import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SearchBar from "../components/SearchBar";
import UserProfileModal from "../components/UserProfileModal";
import DeleteUserModal from "../components/DeleteUserModal";
import EditUserProfileModal from "../components/EditUserProfileModal";
import Sidebar from "../components/Sidebar";
import GroupProfileModal from "../components/GroupProfileModal";
import EditGroupModal from "../components/EditGroupModal";
import DeleteGroupModal from "../components/DeleteGroupModal";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isGroupProfileOpen, setIsGroupProfileOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isDeleteGroupModalOpen, setIsDeleteGroupModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching users from the database.");
    }
  };

  // Fetch groups from API
  const fetchGroups = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/groups");
      if (!response.ok) throw new Error("Failed to fetch groups");
      const data = await response.json();
      setGroups(data.data);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching groups from the database.");
    }
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setIsProfileOpen(true);
  };

  const handleGroupView = (group) => {
    setSelectedItem(group);
    setIsGroupProfileOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsEditProfileOpen(true);
  };

  const handleGroupEdit = (group) => {
    setSelectedItem(group);
    setIsEditGroupOpen(true);
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "groups") {
      fetchGroups();
    }
  }, [activeTab]);

  const renderUsers = () => {
    if (!Array.isArray(users) || users.length === 0) {
      return (
        <div className="text-white text-center p-8 bg-gray-900/50 rounded-xl backdrop-blur-lg 
          border border-gray-800/50 shadow-neon">
          No users found.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto 
        custom-scrollbar max-h-[calc(100vh-7rem)]">
        {users
          .filter(
            (user) =>
              (user.name &&
                user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (user.email &&
                user.email.toLowerCase().includes(searchQuery.toLowerCase()))
          )
          .map((user) => (
            <Card
              key={user.email}
              title={user.name}
              subtitle={user.email}
              image={user.image ? `data:image/png;base64,${user.image}` : null}
              onView={() => handleView(user)}
              onEdit={() => handleEdit(user)}
              onDelete={() => {
                setSelectedItem(user);
                setIsDeleteModalOpen(true);
              }}
            />
          ))}
      </div>
    );
  };

  const renderGroups = () => {
    if (!Array.isArray(groups) || groups.length === 0) {
      return (
        <div className="text-white text-center p-8 bg-gray-900/50 rounded-xl backdrop-blur-lg 
          border border-gray-800/50 shadow-neon">
          No groups found.
        </div>
      );
    }
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto 
        custom-scrollbar max-h-[calc(100vh-7rem)]">
        {groups
          .filter(
            (group) =>
              (group.name &&
                group.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (group.description &&
                group.description.toLowerCase().includes(searchQuery.toLowerCase()))
          )
          .map((group) => {
            // Ensure the image is correctly formatted
            const imageSrc = group.image?.startsWith("data:image")
              ? group.image
              : `data:image/jpeg;base64,${group.image}`;
  
            return (
              <Card
                key={group._id}
                title={group.name}
                subtitle={group.description || "No description available"}
                image={imageSrc || "https://via.placeholder.com/150"} // Fallback image
                onView={() => handleGroupView(group)}
                onEdit={() => handleGroupEdit(group)}
                onDelete={() => {
                  setSelectedItem(group);
                  setIsDeleteGroupModalOpen(true);
                }}
              />
            );
          })}
      </div>
    );
  };
  
  

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <SearchBar setSearchQuery={setSearchQuery} />
          
        </div>

        <div className="bg-gray-900/50 rounded-xl backdrop-blur-lg shadow-2xl 
          border border-gray-800/50 hover:border-pink-500/30 transition-all duration-300">
          {activeTab === "users" ? renderUsers() : renderGroups()}
        </div>
      </div>

      {isProfileOpen && selectedItem && (
        <UserProfileModal
          selectedItem={selectedItem}
          onClose={() => setIsProfileOpen(false)}
          onEdit={handleEdit}
        />
      )}

      {isEditProfileOpen && selectedItem && (
        <EditUserProfileModal
          selectedItem={selectedItem}
          onClose={() => {
            setIsEditProfileOpen(false);
            setIsProfileOpen(false);
          }}
          fetchUsers={fetchUsers}
        />
      )}

      {isDeleteModalOpen && selectedItem && (
        <DeleteUserModal
          selectedItem={selectedItem}
          closeDeleteModal={() => setIsDeleteModalOpen(false)}
          fetchUsers={fetchUsers}
        />
      )}

      {isGroupProfileOpen && selectedItem && (
        <GroupProfileModal
          selectedGroup={selectedItem}
          onClose={() => setIsGroupProfileOpen(false)}
          onEdit={() => handleGroupEdit(selectedItem)}
        />
      )}

      {isEditGroupOpen && selectedItem && (
        <EditGroupModal
          selectedGroup={selectedItem}
          onClose={() => {
            setIsEditGroupOpen(false);
            setIsGroupProfileOpen(false);
          }}
          fetchGroups={fetchGroups}
        />
      )}

      {isDeleteGroupModalOpen && selectedItem && (
        <DeleteGroupModal
          selectedGroup={selectedItem}
          onClose={() => setIsDeleteGroupModalOpen(false)}
          fetchGroups={fetchGroups}
        />
      )}

      <ToastContainer />
    </div>
  );
};

export default AdminDashboard;