// src/components/modern/Pagination.tsx

import React from "react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@jsinfo/components/shadcn/ui2/Pagination";

interface PaginationControlProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const PaginationControl: React.FC<PaginationControlProps> = ({ currentPage, totalPages, onPageChange }) => {
    const maxVisiblePages = 5;
    const ellipsisThreshold = 2;

    const renderPaginationItems = () => {
        let items = [];
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - ellipsisThreshold && i <= currentPage + ellipsisThreshold)
            ) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                onPageChange(i);
                            }}
                            isActive={currentPage === i}
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            } else if (
                (i === currentPage - ellipsisThreshold - 1 && i > 1) ||
                (i === currentPage + ellipsisThreshold + 1 && i < totalPages)
            ) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }
        }
        return items;
    };

    return (
        <Pagination className="mt-4">
            <PaginationContent>
                {currentPage > 1 && (
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                onPageChange(Math.max(currentPage - 1, 1));
                            }}
                        />
                    </PaginationItem>
                )}
                {renderPaginationItems()}
                {currentPage < totalPages && (
                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                onPageChange(Math.min(currentPage + 1, totalPages));
                            }}
                        />
                    </PaginationItem>
                )}
            </PaginationContent>
        </Pagination>
    );
};

export default PaginationControl;
