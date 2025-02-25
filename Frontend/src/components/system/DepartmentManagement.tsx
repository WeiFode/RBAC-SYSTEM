'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Form, Input, Popconfirm, Space, Drawer, Select, Row, Col, TreeSelect, Dropdown, Menu, Checkbox, Empty, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, SettingOutlined, ReloadOutlined, ApartmentOutlined, TeamOutlined, UserOutlined, BankOutlined, GroupOutlined, SolutionOutlined } from '@ant-design/icons';
import Notification from '@/components/Notification'
import { useLayout } from '@/contexts/layoutContext';
import { $clientReq } from '@/utils/clientRequest';
import { DataNode } from 'antd/es/tree';
import { Icon } from '@iconify/react';

interface Department {
    id: number;
    name: string;
    parent_id: number | null;
    icon: string;
    created_at: string;
    updated_at: string;
    children?: Department[];
}

const DepartmentManagement: React.FC = () => {
    const { setUseDefaultLayout } = useLayout();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
    const [form] = Form.useForm();
    const [searchName, setSearchName] = useState('');

    // 获取所有部门的扁平数据，用于构建选择树
    const [flatDepartments, setFlatDepartments] = useState<Department[]>([]);
    useEffect(() => {
        return () => setUseDefaultLayout(true);
    }, [setUseDefaultLayout]);

    // 获取部门数据
    const fetchDepartments = useCallback(async (name = searchName) => {
        setLoading(true);
        try {
            const data = await $clientReq.get(`/departments/get?name=${name}`);
            if (data?.data?.list) {
                // 保存扁平数据
                setFlatDepartments(data.data.list);
                // 构建树形数据用于表格显示
                const treeData = buildTreeForTableData(data.data.list);
                setDepartments(treeData);

            }
        } catch (error) {
            console.error('获取部门列表失败:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    // 获取当前部门的所有子部门ID
    const getChildDepartmentIds = (deptId: number, deps: Department[]): number[] => {
        const childIds: number[] = [];
        const getChildIds = (id: number) => {
            deps.forEach(dept => {
                if (dept.parent_id === id) {
                    childIds.push(dept.id);
                    getChildIds(dept.id);
                }
            });
        };
        getChildIds(deptId);
        return childIds;
    };

    // 构建部门选择树的数据，排除当前编辑部门及其子部门
    const getTreeSelectData = useCallback(() => {
        if (!flatDepartments.length) return [];

        // 获取需要排除的部门ID列表
        const excludeIds = editingDepartment
            ? [editingDepartment.id, ...getChildDepartmentIds(editingDepartment.id, flatDepartments)]
            : [];

        // 过滤掉需要排除的部门
        const filteredDepts = flatDepartments.filter(dept => !excludeIds.includes(dept.id));

        return buildTreeData(filteredDepts);
    }, [flatDepartments, editingDepartment]);

    const buildTreeData = (departments: Department[]): DataNode[] => {
        const treeMap = new Map<number, DataNode>();
        const rootNodes: DataNode[] = [];

        departments.forEach(dept => {
            const node: any = {
                title: dept.name,
                key: dept.id,
                value: dept.id,  // 添加 value 属性
                children: [],
                icon: getIconComponent(dept.icon),
            };
            treeMap.set(dept.id, node);
        });

        departments.forEach(dept => {
            const node = treeMap.get(dept.id)!;
            if (dept.parent_id === null) {
                rootNodes.push(node);
            } else {
                const parentNode = treeMap.get(dept.parent_id);
                if (parentNode) {
                    parentNode.children?.push(node);
                }
            }
        });
        return rootNodes;
    };

    const buildTreeForTableData = (departments: Department[]): Department[] => {
        const treeMap = new Map<number, Department>();
        const rootNodes: Department[] = [];

        departments.forEach(dept => {
            treeMap.set(dept.id, { ...dept, children: [] });
        });

        departments.forEach(dept => {
            if (dept.parent_id === null) {
                rootNodes.push(treeMap.get(dept.id)!);
            } else {
                const parentNode = treeMap.get(dept.parent_id);
                if (parentNode) {
                    parentNode.children?.push(treeMap.get(dept.id)!);
                }
            }
        });

        return rootNodes;
    };


    const getIconComponent = (iconName: string) => {
        switch (iconName) {
            case 'ApartmentOutlined':
                return <ApartmentOutlined />;
            case 'TeamOutlined':
                return <TeamOutlined />;
            case 'UserOutlined':
                return <UserOutlined />;
            case 'BankOutlined':
                return <BankOutlined />;
            case 'GroupOutlined':
                return <GroupOutlined />;
            case 'SolutionOutlined':
                return <SolutionOutlined />;
            default:
                return <ApartmentOutlined />;
        }
    };

    const handleAdd = () => {
        setEditingDepartment(null);
        setIsDrawerOpen(true);
        form.resetFields();
    };

    // 处理编辑部门
    const handleEdit = (record: Department) => {
        setEditingDepartment(record);
        setIsDrawerOpen(true);
        form.setFieldsValue({
            name: record.name,
            parent_id: record.parent_id,
            icon: record.icon,
        });
    };

    const [saveLoading, setSaveLoading] = useState<boolean>(false);
    const handleSave = async () => {
        form.validateFields().then(async values => {
            setSaveLoading(true);
            try {
                const url = editingDepartment ? '/departments/update' : '/departments/create';
                const method = editingDepartment ? $clientReq.put : $clientReq.post;

                const result = await method(url, {
                    ...values,
                    id: editingDepartment?.id
                });

                if (!result.data) {
                    message.error(result);
                } else {
                    Notification({
                        type: 'success',
                        message: editingDepartment ? '更新成功!' : '添加成功!',
                        description: editingDepartment ? '部门信息已成功更新。' : '新部门已成功添加。',
                        placement: 'topRight',
                    });
                }
            } catch (error) {
            } finally {
                setSaveLoading(false);
                setIsDrawerOpen(false);
                fetchDepartments();
            }
        });
    };

    const handleDelete = async (id: number) => {
        await $clientReq.delete(`/departments/del?id=${id}`);
        Notification({
            type: 'success',
            message: '删除成功!',
            description: '部门已删除',
            placement: 'topRight'
        });
        fetchDepartments();
    };

    const handleSearch = () => {
        fetchDepartments(searchName);
    };

    const handleReset = () => {
        setSearchName('');
        fetchDepartments('');
    };

    const [visibleColumns, setVisibleColumns] = useState({
        name: true,
        parent_id: true,
        created_at: true
    });
    // 用于自定义列配置的数据源
    const columnDefinitions = [
        { title: '部门名称', dataIndex: 'name', key: 'name' },
        { title: '上级部门', dataIndex: 'parent_id', key: 'parent_id' },
        { title: '创建时间', dataIndex: 'created_at', key: 'created_at' },
    ];

    // 用于显示和隐藏自定义列
    const handleColumnVisibilityChange = (columnKey: keyof typeof visibleColumns) => {
        setVisibleColumns(prev => ({
            ...prev,
            [columnKey]: !prev[columnKey],
        }));
    };
    // 自定义列
    const columnMenu = (
        <Menu>
            {columnDefinitions.map((col) => (
                <Menu.Item key={col.dataIndex}>
                    <Checkbox
                        checked={visibleColumns[col.dataIndex as keyof typeof visibleColumns]}
                        onChange={() => handleColumnVisibilityChange(col.dataIndex as keyof typeof visibleColumns)}
                    >
                        {col.title}
                    </Checkbox>
                </Menu.Item>
            ))}
        </Menu>
    );

    const columns: any = [
        {
            title: '部门名称',
            dataIndex: 'name',
            key: 'name',
            align: 'center',
            render: (text: string, record: Department) => (
                <Space>
                    {getIconComponent(record.icon)}
                    <span>{text}</span>
                </Space>
            ),
            visible: visibleColumns.name,
        },
        {
            title: '上级部门',
            dataIndex: 'parent_id',
            key: 'parent_id',
            align: 'center',
            render: (parentId: number | null) => {
                const parentDept = departments.find(dept => dept.id === parentId);
                return parentDept ? parentDept.name : '无';
            },
            visible: visibleColumns.parent_id,
        },
        {
            title: '创建时间',
            dataIndex: 'created_at',
            key: 'created_at',
            align: 'center',
            render: (text: string) => new Date(text).toLocaleString(),
            visible: visibleColumns.created_at,
        },
        {
            title: '操作',
            key: 'action',
            align: 'center',
            render: (_: any, record: Department) => (
                <Space size="middle">
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定要删除此部门吗?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ].filter(column => column.visible !== false);

    return (
        <div className="p-4">
            <Row gutter={[16, 16]}>
                <Col span={6}>
                    <Input
                        placeholder="搜索部门名称"
                        prefix={<SearchOutlined />}
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />
                </Col>
                <Col span={18}>
                    <Space size={16}>
                        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                            搜索
                        </Button>
                        <Button icon={<ReloadOutlined />} onClick={handleReset}>
                            重置
                        </Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                            添加部门
                        </Button>
                        <Dropdown overlay={columnMenu}>
                            <Button icon={<SettingOutlined />}>自定义列</Button>
                        </Dropdown>
                    </Space>
                </Col>
            </Row>

            <Table
                columns={columns}
                dataSource={departments}
                rowKey={(record) => record.id.toString()}
                loading={loading}
                pagination={false}
                style={{ marginTop: 16 }}
                bordered
                expandable={{
                    defaultExpandAllRows: true,
                }}
                scroll={{ x: 'max-content' }}
                locale={{
                    emptyText: (
                        <div className="py-8 flex flex-col items-center">
                            <Icon
                                icon="carbon:tree-view-alt"
                                className="text-4xl text-gray-300 mb-2"
                            />
                            <div className="text-gray-500">暂无菜单数据</div>
                        </div>
                    )
                }}  
            />

            <Drawer
                title={editingDepartment ? '编辑部门' : '添加部门'}
                placement="right"
                onClose={() => setIsDrawerOpen(false)}
                open={isDrawerOpen}
                width={400}
                footer={
                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={() => setIsDrawerOpen(false)} style={{ marginRight: 8 }}>
                            取消
                        </Button>
                        <Button onClick={handleSave} type="primary" loading={saveLoading}>
                            保存
                        </Button>
                    </div>
                }
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="部门名称" rules={[{ required: true, message: '请输入部门名称' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="parent_id" label="上级部门">
                        <TreeSelect
                            treeData={getTreeSelectData()}
                            placeholder="请选择上级部门"
                            allowClear
                            treeDefaultExpandAll
                            disabled={editingDepartment?.parent_id === null} // 可选：禁止顶级部门修改父部门
                        />
                    </Form.Item>
                    <Form.Item name="icon" label="图标" rules={[{ required: true, message: '请选择图标' }]}>
                        <Select>
                            <Select.Option value="ApartmentOutlined">
                                <Space><ApartmentOutlined /> 公司</Space>
                            </Select.Option>
                            <Select.Option value="TeamOutlined">
                                <Space><TeamOutlined /> 团队</Space>
                            </Select.Option>
                            <Select.Option value="UserOutlined">
                                <Space><UserOutlined /> 个人</Space>
                            </Select.Option>
                            <Select.Option value="BankOutlined">
                                <Space><BankOutlined /> 机构</Space>
                            </Select.Option>
                            <Select.Option value="GroupOutlined">
                                <Space><GroupOutlined /> 群组</Space>
                            </Select.Option>
                            <Select.Option value="SolutionOutlined">
                                <Space><SolutionOutlined /> 解决方案</Space>
                            </Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Drawer>
        </div>
    );
};

export default DepartmentManagement;