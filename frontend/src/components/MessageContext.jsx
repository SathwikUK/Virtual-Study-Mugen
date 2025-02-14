import React, { useEffect, useRef } from "react";
import { Download, File, Check, X, Edit, Trash2 } from "lucide-react";
import { Menu, Item } from "react-contexify";

// MessageContext Component
export const MessageContext = ({ menuId, onStartEditing, onDeleteMessage }) => {
  return (
    <Menu
      id={menuId}
      className="bg-gray-900 border border-purple-500 rounded-lg shadow-lg backdrop-blur-sm"
    >
      <Item
        className="hover:bg-purple-900 text-purple-300 p-2 transition-all duration-300"
        onClick={({ props }) => onStartEditing(props.messageId)}
      >
        <Edit className="mr-2" size={16} />
        Edit Message
      </Item>
      <Item
        className="hover:bg-purple-900 text-purple-300 p-2 transition-all duration-300"
        onClick={onDeleteMessage}
      >
        <Trash2 className="mr-2" size={16} />
        Delete Message
      </Item>
    </Menu>
  );
};
export default MessageContext;
