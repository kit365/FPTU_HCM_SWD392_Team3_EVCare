import { useState, useEffect } from 'react';
import { MessageOutlined, CloseOutlined } from '@ant-design/icons';
import { Badge } from 'antd';
import { MessagePage } from '../../pages/message/MessagePage';
import { useAuthContext } from '../../context/useAuthContext';
import { messageService } from '../../service/messageService';

export function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuthContext();

  useEffect(() => {
    const loadUnreadCount = async () => {
      if (user?.userId) {
        try {
          const response = await messageService.getUnreadCount(user.userId);
          if (response?.data?.success) {
            setUnreadCount(response.data.data || 0);
          }
        } catch (error) {
          console.error('Error loading unread count:', error);
        }
      }
    };

    loadUnreadCount();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user?.userId]);

  if (!user?.userId) {
    return null; // Don't show if not logged in
  }

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Badge count={unreadCount} size="small" offset={[-5, 5]}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-blue-600/50"
            aria-label="Tin nhắn"
          >
            {isOpen ? (
              <CloseOutlined className="text-3xl" />
            ) : (
              <MessageOutlined className="text-3xl" />
            )}
          </button>
        </Badge>
      </div>

      {/* Chat Widget Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40">
          {/* Chat Widget */}
          <div
            className="bg-gradient-to-br from-white/95 to-blue-50/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/20"
            style={{
              width: '500px',
              height: '680px',
              maxWidth: '95vw',
              maxHeight: '85vh',
            }}
          >
            {/* Nút close ở góc trên */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all z-10 text-gray-600 hover:text-gray-800"
              title="Đóng"
            >
              <CloseOutlined className="text-lg" />
            </button>

            {/* Content - Full height cho MessagePage */}
            <div className="h-full overflow-hidden">
              <MessagePage />
            </div>
          </div>
        </div>
      )}

      {/* Notification placeholder for future */}
      <div className="fixed bottom-28 right-6 z-50">
        {/* This is where notification bell will go later */}
      </div>
    </>
  );
}

