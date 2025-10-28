import { useState, useEffect, useRef } from 'react';
import { BellOutlined, CloseOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuthContext } from '../../context/useAuthContext';
import { useNotification } from '../../hooks/useNotification';
import { useWebSocket } from '../../hooks/useWebSocket';
import type { WebSocketNotification } from '../../types/notification.types';
import { notification as antdNotification } from 'antd';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [realtimeNotifications, setRealtimeNotifications] = useState<WebSocketNotification[]>([]);
  const { user } = useAuthContext();

  // Load notifications from API
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    refreshNotifications,
    refreshUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotification(user?.userId || "");

  // WebSocket for real-time notifications
  useWebSocket({
    userId: user?.userId || "",
    onNotification: (notification) => {
      console.log('🔔 Received real-time notification:', notification);
      
      // Add to realtime notifications list
      setRealtimeNotifications(prev => [notification, ...prev]);
      
      // Show toast notification
      antdNotification.info({
        message: notification.title,
        description: notification.content,
        placement: 'topRight',
        duration: 5,
      });
      
      // Refresh unread count
      refreshUnreadCount();
      refreshNotifications();
    },
    onConnected: () => {
      console.log('✅ Notification WebSocket connected');
    },
    onDisconnected: () => {
      console.log('❌ Notification WebSocket disconnected');
    }
  });

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Combine API notifications + realtime notifications
  // Remove duplicates based on notificationId
  const allNotifications = [...realtimeNotifications, ...notifications]
    .filter((notif, index, self) => 
      index === self.findIndex(n => n.notificationId === notif.notificationId)
    )
    .sort((a, b) => {
      // Sort by sentAt (newest first)
      const dateA = new Date(a.sentAt || 0).getTime();
      const dateB = new Date(b.sentAt || 0).getTime();
      return dateB - dateA;
    });

  if (!user?.userId) {
    return null;
  }

  const unreadCountTotal = allNotifications.filter(n => !('isRead' in n) || !(n as any).isRead).length;

  return (
    <>
      {/* Notification Bell Button */}
      <div className="fixed bottom-24 right-6 z-50">
        <button
          onClick={toggleDropdown}
          className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 relative"
          style={{ width: '64px', height: '64px' }}
          title="Thông báo"
        >
          {unreadCountTotal > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center animate-bounce">
              {unreadCountTotal > 99 ? '99+' : unreadCountTotal}
            </span>
          )}
          <BellOutlined className="text-2xl" />
        </button>
      </div>

      {/* Notification Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed bottom-40 right-6 z-40 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
          style={{
            width: '420px',
            height: '600px',
            maxWidth: '90vw',
            maxHeight: '70vh',
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Thông báo</h3>
              <p className="text-xs text-purple-100">{unreadCountTotal} chưa đọc</p>
            </div>
            <button
              onClick={() => markAllAsRead()}
              className="text-sm hover:text-purple-200 transition-colors"
              title="Đánh dấu tất cả đã đọc"
            >
              Đánh dấu tất cả
            </button>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto h-full" style={{ maxHeight: '540px' }}>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : allNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <BellOutlined className="text-5xl mb-4" />
                <p>Không có thông báo nào</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {allNotifications.map((notif) => {
                  const isRead = 'isRead' in notif ? notif.isRead : false;
                  
                  return (
                    <div
                      key={notif.notificationId}
                      className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                        !isRead ? 'bg-blue-50/30' : ''
                      }`}
                      onClick={() => {
                        if (!isRead && 'isRead' in notif) {
                          markAsRead(notif.notificationId);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Notification Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          notif.notificationType === 'REMINDER' ? 'bg-blue-100 text-blue-600' :
                          notif.notificationType === 'ALERT' ? 'bg-red-100 text-red-600' :
                          notif.notificationType === 'UPDATE' ? 'bg-green-100 text-green-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {notif.notificationType === 'REMINDER' && '🔔'}
                          {notif.notificationType === 'ALERT' && '⚠️'}
                          {notif.notificationType === 'UPDATE' && '📝'}
                          {notif.notificationType === 'SYSTEM' && '⚙️'}
                        </div>

                        {/* Notification Content */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-gray-900 truncate">
                            {notif.title}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {notif.content}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notif.sentAt).toLocaleString('vi-VN')}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1">
                          {!isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if ('isRead' in notif) {
                                  markAsRead(notif.notificationId);
                                }
                              }}
                              className="w-6 h-6 rounded hover:bg-gray-200 flex items-center justify-center"
                              title="Đánh dấu đã đọc"
                            >
                              <CheckOutlined className="text-sm text-gray-600" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notif.notificationId);
                            }}
                            className="w-6 h-6 rounded hover:bg-red-100 flex items-center justify-center"
                            title="Xóa"
                          >
                            <DeleteOutlined className="text-sm text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

