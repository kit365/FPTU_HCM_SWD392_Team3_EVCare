import { Link } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";

interface TableProps {
  headers: { key: string; label: string }[];
  data: any[];
  loading?: boolean;
  onDelete?: (id: string) => Promise<void>;
  onRestore?: (id: string) => Promise<void>;
  editPath?: string;
  viewPath?: string;
}

export const Table = ({ 
  headers = [], 
  data = [], 
  loading = false, 
  onDelete, 
  onRestore, 
  editPath, 
  viewPath 
}: TableProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            {Array.isArray(headers) && headers.map((header) => (
              <th
                key={header.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.isArray(data) && data.map((item, index) => (
            <tr key={item.id || index} className="hover:bg-gray-50">
              {Array.isArray(headers) && headers.map((header) => {
                if (header.key === "actions") {
                  return (
                    <td key={header.key} className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2 items-center">
                        {/* Custom actions (e.g. "Phân công" button) */}
                        {item['actions'] && item['actions']}
                        
                        {/* Default actions (view, edit, delete, restore) */}
                        {viewPath && (
                          <Link
                            to={`${viewPath}/${item.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <RemoveRedEyeIcon className="w-4 h-4" />
                          </Link>
                        )}
                        {editPath && (
                          <Link
                            to={`${editPath}/${item.id}`}
                            className="text-green-600 hover:text-green-900"
                          >
                            <EditIcon className="w-4 h-4" />
                          </Link>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <DeleteOutlineIcon className="w-4 h-4" />
                          </button>
                        )}
                        {onRestore && item.isDeleted && (
                          <button
                            onClick={() => onRestore(item.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Khôi phục
                          </button>
                        )}
                      </div>
                    </td>
                  );
                }
                
                return (
                  <td key={header.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof item[header.key] === 'object' ? item[header.key] : item[header.key]}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Export alias for backward compatibility
export const TableAdmin = Table;