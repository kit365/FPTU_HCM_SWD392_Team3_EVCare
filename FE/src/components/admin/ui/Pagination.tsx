import { Pagination as MuiPagination } from "@mui/material";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  return (
    <div className="flex justify-center mt-6">
      <MuiPagination
        count={totalPages}
        page={currentPage + 1} // MUI Pagination is 1-based, our currentPage is 0-based
        onChange={(_, page) => onPageChange(page - 1)} // Convert back to 0-based
        color="primary"
        size="large"
        showFirstButton
        showLastButton
      />
    </div>
  );
};