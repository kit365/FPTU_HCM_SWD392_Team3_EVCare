import React from 'react';
import { List, Avatar, Badge, Empty, Spin } from 'antd';
import { MessageOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { MessageAssignmentResponse } from '../../types/message.types';

interface MessageListProps {
  assignments: MessageAssignmentResponse[];
  selectedUserId: string | null;
  onSelectConversation: (userId: string, userName: string) => void;
  loading?: boolean;
  currentUserIsStaff?: boolean; // true = staff view (show customers), false = customer view (show staff)
}

export const MessageList: React.FC<MessageListProps> = ({
  assignments,
  selectedUserId,
  onSelectConversation,
  loading = false,
  currentUserIsStaff = true,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            currentUserIsStaff
              ? 'Chưa có khách hàng nào được phân công'
              : 'Chưa được phân công staff hỗ trợ'
          }
        />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      <List
        dataSource={assignments}
        renderItem={(assignment) => {
          const isSelected = currentUserIsStaff
            ? selectedUserId === assignment.customerId
            : selectedUserId === assignment.assignedStaffId;

          const displayName = currentUserIsStaff
            ? assignment.customerName
            : assignment.assignedStaffName;

          const displayEmail = currentUserIsStaff
            ? assignment.customerEmail
            : assignment.assignedStaffEmail;

          const displayAvatar = currentUserIsStaff
            ? assignment.customerAvatarUrl
            : assignment.assignedStaffAvatarUrl;

          const userId = currentUserIsStaff
            ? assignment.customerId
            : assignment.assignedStaffId;

          return (
            <List.Item
              key={assignment.assignmentId}
              onClick={() => onSelectConversation(userId, displayName)}
              className={`
                px-4 py-3 cursor-pointer transition-all duration-200 border-l-4
                ${
                  isSelected
                    ? 'bg-blue-50 border-blue-600'
                    : 'bg-white border-transparent hover:bg-gray-50'
                }
              `}
              style={{
                borderLeftWidth: '4px',
              }}
            >
              <List.Item.Meta
                avatar={
                  <Badge count={assignment.unreadMessageCount || 0} offset={[-5, 5]}>
                    <Avatar
                      size={48}
                      style={{
                        backgroundColor: isSelected ? '#2563eb' : '#3b82f6',
                        fontSize: '20px',
                        fontWeight: 600,
                      }}
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </Avatar>
                  </Badge>
                }
                title={
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-semibold ${
                        isSelected ? 'text-blue-900' : 'text-gray-900'
                      }`}
                    >
                      {displayName}
                    </span>
                    {assignment.unreadMessageCount && assignment.unreadMessageCount > 0 ? (
                      <Badge
                        count={assignment.unreadMessageCount}
                        style={{
                          backgroundColor: '#ef4444',
                          boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
                        }}
                      />
                    ) : null}
                  </div>
                }
                description={
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 truncate">{displayEmail}</div>
                    {assignment.lastMessageAt && (
                      <div className="flex items-center text-xs text-gray-400">
                        <ClockCircleOutlined className="mr-1" />
                        <span>
                          {new Date(assignment.lastMessageAt).toLocaleString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />

      <style>{`
        .ant-list-item {
          border-bottom: 1px solid #f3f4f6 !important;
        }
        
        .ant-list-item:last-child {
          border-bottom: none !important;
        }
        
        .ant-badge-count {
          font-size: 11px;
          height: 18px;
          min-width: 18px;
          line-height: 18px;
        }
      `}</style>
    </div>
  );
};

