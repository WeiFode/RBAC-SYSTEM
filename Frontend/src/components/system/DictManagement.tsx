'use client';
import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Popconfirm, message, Space, Drawer, Select, InputNumber, Tag, Badge, Tooltip, Row, Col, Empty } from 'antd';
import Notification from '@/components/Notification'
import Pagination from '@/components/Pagination'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useLayout } from '@/contexts/layoutContext';
import { $clientReq } from '@/utils/clientRequest';
import DateUtils from '@/utils/dateFormat';
interface DictItem {
    id: number;
    type: string;
    label: string;
    value: string;
    sort: number;
    items?: DictItem[];
    count?: number;
    description: string;
    created_at: string;
    updated_at: string;
}

const DictManagement: React.FC = () => {
    const { setUseDefaultLayout } = useLayout();
    const [dictItems, setDictItems] = useState<DictItem[]>([]);
    /** 查询条件-start */
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(50);
    const [searchType, setSearchType] = useState('');
    const [searchLabel, setSearchLabel] = useState('');
    /** 查询条件-end */
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingItem, setEditingItem] = useState<DictItem | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [form] = Form.useForm();
    const [selectedType, setSelectedType] = useState<string>('');

    // 修改表格列配置，简化左侧主字典表格
    const mainColumns: any[] = [
        {
            title: '字典类型',
            dataIndex: 'type',
            key: 'type',
            align: 'center',
            render: (text: string) => (
                <Space>
                    <Tag color="blue">{text}</Tag>
                    <Badge count={dictItems.find(item => item.type === text)?.count || 0} overflowCount={999} />
                </Space>
            )
        }
    ];

    const detailColumns: any[] = [
        {
            title: '标签',
            dataIndex: 'label',
            key: 'label',
            align: 'center',
            render: (text: string) => <Tag color="green">{text}</Tag>
        },
        {
            title: '值',
            dataIndex: 'value',
            key: 'value',
            align: 'center',
            render: (text: string) => <Tag color="blue">{text}</Tag>
        },
        {
            title: '排序',
            dataIndex: 'sort',
            key: 'sort',
            align: 'center',
            width: 80,
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            align: 'center',
            ellipsis: true,
            render: (text: string) => (
                <Tooltip title={text}>
                    <span>{text || '-'}</span>
                </Tooltip>
            )
        },
        {
            title: '创建时间',
            dataIndex: 'created_at',
            key: 'created_at',
            align: 'center',
            width: 160,
            render: (text: string) => DateUtils.toCustomFormatString(text)
        },
        {
            title: '更新时间',
            dataIndex: 'updated_at',
            key: 'updated_at',
            align: 'center',
            width: 160,
            render: (text: string) => DateUtils.toCustomFormatString(text)
        },
        {
            title: '操作',
            key: 'action',
            align: 'center',
            fixed: 'right',
            width: 200,
            render: (_: any, record: DictItem) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定要删除这条记录吗？"
                        onConfirm={() => handleDelete(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    useEffect(() => {
        return () => setUseDefaultLayout(true);
    }, [setUseDefaultLayout]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const fetchDictItems = async (type = searchType, label = searchLabel) => {
        setLoading(true);
        const url = `/dicts/all?page=${currentPage}&pageSize=${pageSize}&type=${type}&label=${label}`;
        const data = await $clientReq.get(url);
        if (data) {
            const groupedData = data.dictionaries.reduce((acc: any, item: DictItem) => {
                if (!acc[item.type]) {
                    acc[item.type] = { type: item.type, items: [], count: 0 };
                }
                acc[item.type].items.push(item);
                acc[item.type].count++;
                return acc;
            }, {});
            setDictItems(Object.values(groupedData));
            setTotalItems(data.total);
            setLoading(false);
        }
    }

    const handleReset = () => {
        setSearchType('');
        setSearchLabel('');
        setCurrentPage(1);
        fetchDictItems('', '');
    };

    useEffect(() => {
        fetchDictItems();
    }, [currentPage, pageSize]);

    const handleAdd = (type?: string) => {
        setEditingItem(null);
        setIsEditing(false);
        setIsDrawerOpen(true);
        form.resetFields();
        if (type) {
            form.setFieldsValue({ type });
        }
    };

    const handleEdit = (record: DictItem) => {
        setEditingItem(record);
        setIsEditing(true);
        setIsDrawerOpen(true);
        form.setFieldsValue(record);
    };

    const [saveLoading, setSaveLoading] = useState<boolean>(false);
    const handleSave = async () => {
        form.validateFields().then(async values => {
            setSaveLoading(true);
            try {
                const url = editingItem ? '/dicts/update' : '/dicts/create';
                const method = editingItem ? 'put' : 'post';

                const result = await $clientReq[method](url, {
                    ...values,
                    id: editingItem?.id
                });

                if (result.error) {
                    message.error(result.error);
                    return;
                }

                Notification({
                    type: 'success',
                    message: editingItem ? '更新成功!' : '添加成功!',
                    description: editingItem ? '字典项已成功更新。' : '新字典项已成功添加。',
                    placement: 'topRight',
                });
            } catch (error) {
            } finally {
                setSaveLoading(false);
                setIsDrawerOpen(false);
                fetchDictItems();
            }
        });
    };

    const handleDelete = async (id: number) => {
        try {
            const result = await $clientReq.delete(`/dicts/del?id=${id}`);
            if (result.error) {
                message.error(result.error);
            } else {
                Notification({
                    type: 'success',
                    message: '删除成功!',
                    description: '字典项已删除',
                    placement: 'topRight'
                });
            }
        } catch (error) {
        } finally {
            fetchDictItems();
        }
    };

    return (
        <div className="p-4">
            <Row gutter={[16, 16]} className="mb-6">
                <Col span={24}>
                    <div className="flex justify-between items-center">
                        {/* <h2 className="text-xl font-bold m-0">数据字典管理</h2> */}
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => handleAdd()}
                            size="large"
                            className="hover:scale-105 transition-all"
                        >
                            添加字典项
                        </Button>
                    </div>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                {/* 左侧主字典列表 */}
                <Col span={6}>
                    <div className="bg-white rounded-lg shadow-md transition-all hover:shadow-lg">
                        <div className="p-4 border-b border-gray-100">
                            <Input
                                placeholder="搜索字典类型"
                                value={searchType}
                                onChange={(e) => setSearchType(e.target.value)}
                                prefix={<SearchOutlined className="text-gray-400" />}
                                className="hover:shadow transition-shadow"
                                allowClear
                            />
                        </div>
                        <div className="p-2">
                            <Table
                                columns={mainColumns}
                                dataSource={dictItems}
                                rowKey="type"
                                pagination={false}
                                loading={loading}
                                onRow={(record) => ({
                                    onClick: () => setSelectedType(record.type),
                                    className: `cursor-pointer transition-colors duration-200 hover:bg-blue-50 
                                    ${selectedType === record.type ? 'bg-blue-100' : ''}`
                                })}
                                size="middle"
                                className="dict-type-table"
                            />
                        </div>
                    </div>
                </Col>

                {/* 右侧字典项列表 */}
                <Col span={18}>
                    <div className="bg-white rounded-lg shadow-md transition-all hover:shadow-lg">
                        <div className="p-4 border-b border-gray-100">
                            <Row justify="space-between" align="middle">
                                <Col>
                                    <Space size="large">
                                        <span className="text-gray-500">当前字典：</span>
                                        {selectedType ? (
                                            <Tag color="blue" className="px-4 py-1 text-base">
                                                {selectedType}
                                            </Tag>
                                        ) : (
                                            <span className="text-gray-400 italic">请选择字典类型</span>
                                        )}
                                    </Space>
                                </Col>
                                <Col>
                                    <Space size="middle" className="flex-wrap">
                                        <Input
                                            placeholder="搜索标签"
                                            value={searchLabel}
                                            onChange={(e) => setSearchLabel(e.target.value)}
                                            prefix={<SearchOutlined className="text-gray-400" />}
                                            className="w-48 hover:shadow transition-shadow"
                                            allowClear
                                        />
                                        <Space>
                                            <Button
                                                type="primary"
                                                icon={<SearchOutlined />}
                                                onClick={() => fetchDictItems()}
                                                className="hover:scale-105 transition-all"
                                            >
                                                搜索
                                            </Button>
                                            <Button
                                                icon={<ReloadOutlined />}
                                                onClick={handleReset}
                                                className="hover:scale-105 transition-all"
                                            >
                                                重置
                                            </Button>
                                            {selectedType && (
                                                <Button
                                                    type="primary"
                                                    icon={<PlusOutlined />}
                                                    onClick={() => handleAdd(selectedType)}
                                                    className="hover:scale-105 transition-all"
                                                >
                                                    添加项
                                                </Button>
                                            )}
                                        </Space>
                                    </Space>
                                </Col>
                            </Row>
                        </div>
                        <div className="p-4">
                            <Table
                                columns={detailColumns}
                                dataSource={dictItems.find(item => item.type === selectedType)?.items || []}
                                rowKey="id"
                                pagination={false}
                                loading={loading}
                                className="dict-items-table"
                                size="middle"
                                locale={{
                                    emptyText: <Empty description="暂无数据" />, // 空数据时展示
                                }}
                                scroll={{ x: 1000 }} // 滚动以支持固定列
                            />
                            <div className="mt-4">
                                <Pagination
                                    currentPage={currentPage}
                                    pageSize={pageSize}
                                    totalItems={totalItems}
                                    onPageChange={handlePageChange}
                                    onPageSizeChange={handlePageSizeChange}
                                />
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
            <Drawer
                title={
                    <div className="text-lg">
                        {editingItem ? '编辑字典项' : '添加字典项'}
                    </div>
                }
                placement="right"
                onClose={() => setIsDrawerOpen(false)}
                open={isDrawerOpen}
                width={480}
                className="dict-drawer"
                footer={
                    <div className="flex justify-end space-x-2">
                        <Button
                            onClick={() => setIsDrawerOpen(false)}
                            className="hover:scale-105 transition-all"
                        >
                            取消
                        </Button>
                        <Button
                            onClick={handleSave}
                            type="primary"
                            loading={saveLoading}
                            className="hover:scale-105 transition-all"
                        >
                            保存
                        </Button>
                    </div>
                }
            >
                <Form form={form} layout="vertical" className="px-4">
                    <Form.Item name="type" label="类型" rules={[{ required: true, message: '请输入类型' }]}>
                        <Input disabled={!isEditing && !!form.getFieldValue('type')} />
                    </Form.Item>
                    <Form.Item name="label" label="标签" rules={[{ required: true, message: '请输入标签' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="value" label="值" rules={[{ required: true, message: '请输入值' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="sort" label="排序" rules={[{ required: true, message: '请输入排序' }]}>
                        <InputNumber min={0} className="w-full" />
                    </Form.Item>
                    <Form.Item name="description" label="描述">
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Drawer>
        </div>
    );
};

export default DictManagement;