import React, { useState, useEffect } from "react";
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

  const renderContent = () => {
    if (activeTab === "users") {
      return renderUsers();
    } else if (activeTab === "groups") {
      return renderGroups();
    }
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
      return <div>No users found.</div>;
    }

    return (
      <div className="grid grid-cols-1 m-4 gap-4 h-fit max-h-[87vh] overflow-y-auto">
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
      return <div>No groups found.</div>;
    }

    return (
      <div className="grid grid-cols-1 m-4 gap-4 h-fit max-h-[87vh] overflow-y-auto">
        {groups.map((group) => (
          <Card
            key={group._id}
            title={group.name}
            subtitle={group.description || "No description available"}
            image={group.image}
            onView={() => handleGroupView(group)}
            onEdit={() => handleGroupEdit(group)}
            onDelete={() => {
              setSelectedItem(group);
              setIsDeleteGroupModalOpen(true);
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="w-full h-screen bg-gray-100 p-4 lg:w-full flex-1">
        <SearchBar setSearchQuery={setSearchQuery} />
        {renderContent()}
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
