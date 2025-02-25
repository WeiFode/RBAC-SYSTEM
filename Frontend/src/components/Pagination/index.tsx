import React, { useState, useEffect } from 'react';
import { Button, Tooltip, Select, InputNumber } from 'antd';
import { LeftOutlined, RightOutlined, DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons';

interface PaginationProps {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    disabled?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
    disabled = false
}) => {
    const [inputValue, setInputValue] = useState<number>(currentPage);
    const totalPages = Math.ceil(totalItems / pageSize);

    // 同步外部currentPage变化
    useEffect(() => {
        setInputValue(currentPage);
    }, [currentPage]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    const renderPageButton = (page: number) => (
        <Tooltip title={`第 ${page} 页`} key={page}>
            <Button
                type={currentPage === page ? 'primary' : 'default'}
                shape="circle"
                onClick={() => handlePageChange(page)}
                disabled={disabled}
                className={`
                    !mx-1 transition-all duration-200
                    ${currentPage === page 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white border-transparent' 
                        : 'text-gray-700 hover:text-blue-600 hover:border-blue-600 dark:text-gray-300'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                {page}
            </Button>
        </Tooltip>
    );

    // 构建分页按钮逻辑
    const paginationItems = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
            paginationItems.push(renderPageButton(i));
        }
    } else {
        paginationItems.push(renderPageButton(1));
        if (currentPage > 4) {
            paginationItems.push(
                <span key="left-dots" className="mx-1 text-gray-500 dark:text-gray-400">•••</span>
            );
        }
        const start = Math.max(2, currentPage - 2);
        const end = Math.min(totalPages - 1, currentPage + 2);
        for (let i = start; i <= end; i++) {
            paginationItems.push(renderPageButton(i));
        }
        if (currentPage < totalPages - 3) {
            paginationItems.push(
                <span key="right-dots" className="mx-1 text-gray-500 dark:text-gray-400">•••</span>
            );
        }
        paginationItems.push(renderPageButton(totalPages));
    }

    return (
        <div className="bg-white dark:bg-gray-800 px-4 py-3 sm:px-6 rounded-b-lg shadow-b border border-x-zinc-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                {/* 显示信息 */}
                <div className="mb-4 sm:mb-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        显示第
                        <span className="font-medium mx-1">{Math.min(((currentPage - 1) * pageSize) + 1, totalItems)}</span>
                        至
                        <span className="font-medium mx-1">{Math.min(currentPage * pageSize, totalItems)}</span>
                        条，共
                        <span className="font-medium mx-1">{totalItems}</span>
                        条记录
                    </p>
                </div>

                <div className="flex items-center justify-center space-x-2 flex-wrap gap-y-2">
                    {/* 页面大小选择器 */}
                    {onPageSizeChange && (
                        <Select
                            value={pageSize}
                            style={{ width: 100 }}
                            onChange={onPageSizeChange}
                            disabled={disabled}
                            className="!mr-2"
                            options={[
                                { value: 5, label: '5 条/页' },
                                { value: 10, label: '10 条/页' },
                                { value: 20, label: '20 条/页' },
                                { value: 50, label: '50 条/页' },
                                { value: 100, label: '100 条/页' },
                            ]}
                        />
                    )}

                    {/* 导航按钮组 */}
                    <div className="flex items-center">
                        <Tooltip title="第一页">
                            <Button
                                icon={<DoubleLeftOutlined />}
                                shape="circle"
                                disabled={currentPage === 1 || disabled}
                                onClick={() => handlePageChange(1)}
                                className="!mx-1 transition-all duration-200 hover:text-blue-600 hover:border-blue-600"
                            />
                        </Tooltip>

                        <Tooltip title="上一页">
                            <Button
                                icon={<LeftOutlined />}
                                shape="circle"
                                disabled={currentPage === 1 || disabled}
                                onClick={() => handlePageChange(currentPage - 1)}
                                className="!mx-1 transition-all duration-200 hover:text-blue-600 hover:border-blue-600"
                            />
                        </Tooltip>

                        {/* 页码按钮 */}
                        <div className="flex items-center mx-2">
                            {paginationItems}
                        </div>

                        <Tooltip title="下一页">
                            <Button
                                icon={<RightOutlined />}
                                shape="circle"
                                disabled={currentPage === totalPages || disabled}
                                onClick={() => handlePageChange(currentPage + 1)}
                                className="!mx-1 transition-all duration-200 hover:text-blue-600 hover:border-blue-600"
                            />
                        </Tooltip>

                        <Tooltip title="最后一页">
                            <Button
                                icon={<DoubleRightOutlined />}
                                shape="circle"
                                disabled={currentPage === totalPages || disabled}
                                onClick={() => handlePageChange(totalPages)}
                                className="!mx-1 transition-all duration-200 hover:text-blue-600 hover:border-blue-600"
                            />
                        </Tooltip>
                    </div>

                    {/* 页码跳转 */}
                    <InputNumber
                        min={1}
                        max={totalPages}
                        value={inputValue}
                        onChange={(value) => setInputValue(value || 1)}
                        onPressEnter={() => handlePageChange(inputValue)}
                        onBlur={() => handlePageChange(inputValue)}
                        disabled={disabled}
                        className="!w-20 !ml-2"
                        controls={false}
                        placeholder="跳转页码"
                    />
                </div>
            </div>
        </div>
    );
};

export default Pagination;