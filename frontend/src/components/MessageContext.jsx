import React from "react";
import { Menu, Item } from "react-contexify";
import { Edit, Trash2 } from "lucide-react";

const MessageContext = ({ menuId, onStartEditing, onDeleteMessage }) => {
  return (
    <Menu id={menuId}>
      <Item onClick={({ props }) => onStartEditing(props.messageId)}>
        <Edit className="mr-2" size={16} />
        Edit Message
      </Item>
      <Item onClick={onDeleteMessage}>
        <Trash2 className="mr-2" size={16} />
        Delete Message
      </Item>
    </Menu>
  );
};

export default MessageContext;
