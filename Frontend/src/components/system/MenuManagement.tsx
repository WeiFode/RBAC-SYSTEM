'use client';
import React, { useEffect, useState } from 'react';
import Notification from '@/components/Notification'
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Popconfirm,
    message,
    Space,
    TreeSelect,
    Checkbox,
    Dropdown,
    Menu,
    Tag,
    Switch,
    InputNumber,
    Drawer,
    Tooltip
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SettingOutlined,
    SlidersOutlined
} from '@ant-design/icons';
import { useLayout } from '@/contexts/layoutContext';
import IconSelector from '@/components/IconSelect/IconSelector';
import { Icon } from '@iconify/react';
import Pagination from '../Pagination';
import { $clientReq } from '@/utils/clientRequest';
import PermissionConfigDrawer from '../PermissionConfigDrawer';

interface MenuItem {
    id: number;
    title: string;
    path: string;
    component_path?: string;
    icon?: string;
    parent_id?: number;
    children?: MenuItem[];
    status?: 0 | 1;
    sort?: number;
    created_at?: string;
    updated_at?: string;
    roles?: any;
}

const MenuManagement: React.FC = () => {
    const { setUseDefaultLayout } = useLayout();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(99);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [drawerVisible, setDrawerVisible] = useState(false);

    // 关联角色，菜单所有关联角色
    const [visibleRoles, setVisibleRoles] = useState<{ id: number; name: string }[]>([]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const fetchMenus = async () => {
        setLoading(true);
        try {
            const url = `/menus/get?page=${currentPage}&pageSize=${pageSize}`;
            const data = await $clientReq.get(url);
            const treeData = buildMenuTree(data.data.list);
            setMenus(treeData);
            setTotalItems(data.data.total);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    }

    const buildMenuTree = (menuList: MenuItem[]): MenuItem[] => {
        const menuMap = new Map<number, MenuItem>();
        const rootMenus: MenuItem[] = [];

        menuList.forEach(menu => {
            menuMap.set(menu.id, { ...menu, children: [] });
        });

        menuList.forEach(menu => {
            if (menu.parent_id) {
                const parentMenu = menuMap.get(menu.parent_id);
                if (parentMenu) {
                    parentMenu.children?.push(menuMap.get(menu.id)!);
                }
            } else {
                rootMenus.push(menuMap.get(menu.id)!);
            }
        });

        return rootMenus;
    }

    useEffect(() => {
        fetchMenus();
    }, [currentPage, pageSize]);


    const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const onExpand = (expanded: boolean, record: MenuItem) => {
        if (expanded) {
            // 展开当前行
            setExpandedRowKeys(prev => {
                const newKeys = new Set([...prev, record.id]);
                return Array.from(newKeys);
            });
        } else {
            // 收起当前行，包括第一个主菜单
            setExpandedRowKeys(prev =>
                prev.filter(key => key !== record.id)
            );
        }
    };

    useEffect(() => {
        if (isInitialLoad && menus.length > 0) {
            const firstMainMenuId = menus[0]?.id;
            if (firstMainMenuId) {
                setExpandedRowKeys([firstMainMenuId]);
            }
            setIsInitialLoad(false);
        }
    }, [menus, isInitialLoad]);

    const handleExpandAll = () => {
        const allIds = getAllMenuIds(menus);
        setExpandedRowKeys(allIds);
    };

    const handleCollapseAll = () => {
        setExpandedRowKeys([]); // 允许完全收起
    };

    // 辅助函数：获取所有菜单ID
    const getAllMenuIds = (menuList: MenuItem[]): number[] => {
        let ids: number[] = [];
        menuList.forEach(menu => {
            ids.push(menu.id);
            if (menu.children?.length) {
                ids = [...ids, ...getAllMenuIds(menu.children)];
            }
        });
        return ids;
    };

    const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
    // 用于显示和隐藏自定义列
    const [visibleColumns, setVisibleColumns] = useState({
        path: true,
        component_path: true,
        status: true,
        icon: true
    });
    // 用于显示和隐藏图标选择器
    const [iconSelectorVisible, setIconSelectorVisible] = useState(false);

    const [form] = Form.useForm();

    // 用于在组件卸载时恢复默认布局
    useEffect(() => {
        return () => setUseDefaultLayout(true);
    }, [setUseDefaultLayout]);

    // 添加菜单
    const handleAdd = () => {
        setEditingMenu(null);
        setDrawerVisible(true);
        form.resetFields();
    };

    // 编辑菜单
    const handleEdit = (menu: MenuItem) => {
        setEditingMenu(menu);
        setDrawerVisible(true);
        form.setFieldsValue(menu);
    };

    // 删除菜单
    const handleDelete = async (id: number) => {
        const result = await $clientReq.delete(`/menus/del?id=${id}`);
        if (result && !result?.message) {
            return
        } else {
            Notification({
                type: 'success',
                message: '删除成功!',
                description: '菜单已删除',
                placement: 'topRight'
            });
            fetchMenus();
        }
    };

    /** 权限配置-start */
    const [permissionDrawerVisible, setPermissionDrawerVisible] = useState(false);
    const [currentMenuId, setCurrentMenuId] = useState<number | null>(null);
    const handleConfigPermissions = (menuId: number) => {
        setCurrentMenuId(menuId);
        setPermissionDrawerVisible(true);
    };
    /** 权限配置-end */

    // 保存菜单
    const [saveLoading, setSaveLoading] = useState<boolean>(false)
    const handleSave = async () => {
        setSaveLoading(true);
        try {
            const values = await form.validateFields();
            const newMenu: Partial<MenuItem> = {
                ...(editingMenu?.id ? { id: editingMenu.id } : {}),
                ...values,
            };

            const url = editingMenu ? '/menus/update' : '/menus/create';
            const method = editingMenu ? 'put' : 'post';

            const result = await $clientReq[method](url, newMenu);
            if (!result.data) {
                message.error(result || '操作失败');
                return;
            }

            message.success(editingMenu ? '菜单已更新' : '新菜单已添加');
        } catch (error) {
            if (error instanceof Error) {
                message.error(error.message);
            } else {
                message.error('发生未知错误');
            }
        } finally {
            setSaveLoading(false);
            setDrawerVisible(false);
            fetchMenus();
        }
    };

    // 用于显示和隐藏自定义列
    const handleColumnVisibilityChange = (columnKey: keyof typeof visibleColumns) => {
        setVisibleColumns(prev => ({
            ...prev,
            [columnKey]: !prev[columnKey],
        }));
    };

    // 选择图标
    const handleIconSelect = (iconName: string) => {
        form.setFieldsValue({ icon: iconName });
        setIconSelectorVisible(false);
    };

    // 用于配置自定义列
    const columnDefinitions = [
        { title: '页面路径', dataIndex: 'path', key: 'path' },
        { title: '组件路径', dataIndex: 'component_path', key: 'component_path' },
        { title: '状态', dataIndex: 'status', key: 'status' },
        { title: '图标', dataIndex: 'icon', key: 'icon' }
    ];

    // 表格列定义
    const columns: any = [
        {
            title: '菜单标题',
            dataIndex: 'title',
            key: 'title',
            align: 'left',
            width: 250,
            render: (text: string, record: MenuItem) => (
                <div className="flex items-center space-x-2">
                    {record.icon ? (
                        <Icon icon={record.icon} className="text-lg text-blue-500" />
                    ) : (
                        <div className="w-4 h-4" /> // 占位
                    )}
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                        {text}
                    </span>
                </div>
            )
        },
        {
            title: '页面路径',
            dataIndex: 'path',
            key: 'path',
            align: 'center',
            width: 200,
            visible: visibleColumns.path,
            render: (path: string) => (
                <Tooltip title={path}>
                    <span className="text-gray-600 dark:text-gray-300 truncate block max-w-[180px]">
                        {path || '-'}
                    </span>
                </Tooltip>
            )
        },
        {
            title: '组件路径',
            dataIndex: 'component_path',
            key: 'component_path',
            align: 'center',
            width: 300,
            visible: visibleColumns.component_path,
            render: (path: string) => (
                <Tooltip title={path}>
                    <span className="text-gray-500 dark:text-gray-400 truncate block">
                        {path || '-'}
                    </span>
                </Tooltip>
            )
        },
        {
            title: '排序',
            dataIndex: 'sort',
            key: 'sort',
            align: 'center',
            width: 100,
            render: (sort: number) => (
                <Tag className="min-w-[40px] text-center">
                    {sort}
                </Tag>
            )
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            width: 100,
            visible: visibleColumns.status,
            render: (status: number) => (
                <Tag
                    className={`px-3 py-1 rounded-full border-none
                        ${status === 1
                            ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                        }`}
                >
                    <div className="flex items-center space-x-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${status === 1 ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span>{status === 1 ? '启用' : '禁用'}</span>
                    </div>
                </Tag>
            )
        },
        {
            title: '操作',
            key: 'action',
            align: 'center',
            width: 250,
            fixed: 'right',
            render: (_: any, record: MenuItem) => (
                <Space size={4} className="flex justify-center">
                    <Tooltip title="编辑菜单">
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                            className="text-blue-500 hover:text-blue-600 transition-colors"
                        >
                            编辑
                        </Button>
                    </Tooltip>

                    <Tooltip title="配置权限">
                        <Button
                            type="link"
                            icon={<SlidersOutlined />}
                            onClick={() => handleConfigPermissions(record.id)}
                            className="text-green-500 hover:text-green-600 transition-colors"
                        >
                            配置权限
                        </Button>
                    </Tooltip>

                    <Popconfirm
                        title="删除确认"
                        description="确定要删除这个菜单吗？此操作不可恢复。"
                        onConfirm={() => handleDelete(record.id)}
                        okText="确定"
                        cancelText="取消"
                        okButtonProps={{
                            danger: true,
                            className: 'hover:bg-red-600'
                        }}
                    >
                        <Tooltip title="删除菜单">
                            <Button
                                type="link"
                                danger
                                icon={<DeleteOutlined />}
                                className="hover:text-red-600 transition-colors"
                            >
                                删除
                            </Button>
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ].filter(column => column.visible !== false);

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

    return (
        <div className="p-4">
            <Space size={16}>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    添加菜单
                </Button>
                <Dropdown overlay={columnMenu}>
                    <Button icon={<SettingOutlined />}>自定义列</Button>
                </Dropdown>
                <Button
                    icon={<SettingOutlined />}
                    onClick={() => handleExpandAll()}
                >
                    展开所有
                </Button>
                <Button
                    icon={<SettingOutlined />}
                    onClick={() => handleCollapseAll()}
                >
                    收起所有
                </Button>
            </Space>

            <Table
                style={{ marginTop: 20 }}
                loading={loading}
                columns={columns}
                dataSource={menus}
                rowKey="id"
                pagination={false}
                bordered
                expandable={{
                    expandedRowKeys,
                    onExpand,
                    indentSize: 20,
                }}
                className="mt-4 shadow-sm rounded-lg overflow-hidden"
                rowClassName={(record) => `
                    hover:bg-blue-50 transition-colors duration-200
                    dark:hover:bg-gray-700
                `}
                locale={{
                    emptyText: (
                        <div className="py-8 flex flex-col items-center">
                            <Icon
                                icon="dashicons:welcome-widgets-menus"
                                className="text-4xl text-gray-300 mb-2"
                            />
                            <div className="text-gray-500">暂无菜单数据</div>
                        </div>
                    )
                }}
            />
            {
                totalItems > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        pageSize={pageSize}
                        totalItems={totalItems}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                )
            }
            <Drawer
                title={editingMenu ? '编辑菜单' : '添加菜单'}
                placement="right"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                width={400}
                footer={
                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={() => setDrawerVisible(false)} style={{ marginRight: 8 }}>
                            取消
                        </Button>
                        <Button onClick={handleSave} type="primary" loading={saveLoading}>
                            保存
                        </Button>
                    </div>
                }
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="title" label="菜单标题" rules={[{ required: true, message: '请输入菜单标题' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="path" label="菜单路径" rules={[{ required: true, message: '请输入路径' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="component_path" label="组件路径"
                        rules={[
                            {
                                validator: (_, value) => {
                                    if (value && value.startsWith('/')) {
                                        return Promise.reject('组件路径不能以 "/" 开头');
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <Input placeholder="请输入组件路径,不要以 / 开头" />
                    </Form.Item>
                    <Form.Item name="parent_id" label="上级菜单">
                        <TreeSelect
                            showSearch
                            treeDefaultExpandAll
                            treeData={menus.map(menu => ({
                                title: menu.title,
                                value: menu.id,
                                key: menu.id,
                                children: menu.children?.map(child => ({
                                    title: child.title,
                                    value: child.id,
                                    key: child.id,
                                })),
                            }))}
                            placeholder="选择上级菜单"
                            allowClear
                        />
                    </Form.Item>
                    <Form.Item name="icon" label="图标">
                        <Input
                            readOnly
                            value={form.getFieldValue('icon')}
                            addonAfter={
                                <Button onClick={() => setIconSelectorVisible(true)}>
                                    选择图标
                                </Button>
                            }
                            addonBefore={
                                form.getFieldValue('icon') && (
                                    <Icon icon={`${form.getFieldValue('icon')}`} width="24" height="24" />
                                )
                            }
                        />
                    </Form.Item>
                    <Form.Item name="status" label="状态" valuePropName="checked" getValueFromEvent={(checked: boolean) => checked ? 1 : 0}>
                        <Switch checkedChildren="启用" unCheckedChildren="禁用" />
                    </Form.Item>
                    <Form.Item
                        name="sort"
                        label="排序"
                        rules={[
                            { required: true, message: '请输入排序' },
                            { type: 'number', message: '请输入有效的数字' }
                        ]}
                    >
                        <InputNumber
                            min={0}
                            precision={0}
                            style={{ width: '100%' }}
                            placeholder="请输入排序数字"
                        />
                    </Form.Item>
                </Form>
            </Drawer>

            <PermissionConfigDrawer
                visible={permissionDrawerVisible}
                onClose={() => setPermissionDrawerVisible(false)}
                menuId={currentMenuId}
            />

            <IconSelector
                visible={iconSelectorVisible}
                onClose={() => setIconSelectorVisible(false)}
                onSelect={handleIconSelect}
            />
        </div>
    );
};

export default MenuManagement;