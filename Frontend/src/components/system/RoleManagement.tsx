'use client'
import React, { useCallback, useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Popconfirm, message, Drawer, Tree, Space, Tooltip } from 'antd';
import Pagination from '../Pagination';
import { EditOutlined, SettingOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import Notification from '@/components/Notification'
import { useLayout } from '@/contexts/layoutContext';
import { $clientReq } from '@/utils/clientRequest';
import { DataNode } from 'antd/es/tree';
import { Icon } from '@iconify/react';

// 扩展 DataNode 类型
interface ExtendedDataNode extends DataNode {
  checked?: boolean;
}

interface Role {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  users: any;
}
interface MenuItem {
  id: number;
  title: string;
  icon?: string;
  parent_id: number | null;
  children?: MenuItem[];
}

const RoleManagement: React.FC = () => {
  const { setUseDefaultLayout } = useLayout();
  useEffect(() => {
    return () => setUseDefaultLayout(true);
  }, [setUseDefaultLayout]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchName, setSearchName] = useState<string>('');
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchAssignedMenusLoading, setFetchAssignedMenusLoading] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form] = Form.useForm();

  /** 菜单树模块-start */
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [menuTree, setMenuTree] = useState<DataNode[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [assignedMenuIds, setAssignedMenuIds] = useState<number[]>([]);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const convertToTreeData = useCallback((menus: MenuItem[], selectedMenuIds: number[]): DataNode[] => {
    const menuMap = new Map<number, DataNode>();
    const treeData: DataNode[] = [];

    menus.forEach(menu => {
      const node: DataNode = {
        title: menu.title,
        key: menu.id,
        children: [],
        icon: menu.icon ? <Icon icon={menu.icon} /> : undefined,
      };
      menuMap.set(menu.id, node);
    });

    menus.forEach(menu => {
      const node = menuMap.get(menu.id)!;
      if (menu.parent_id === null) {
        treeData.push(node);
      } else {
        const parentNode = menuMap.get(menu.parent_id);
        if (parentNode) {
          parentNode.children?.push(node);
        }
      }
    });

    return treeData;
  }, []);


  const fetchMenus = useCallback(async () => {
    try {
      const menuRes = await $clientReq.get('/roles/getMenus?page=1&pageSize=999');
      setMenus(menuRes.data.list);
      setMenuTree(convertToTreeData(menuRes.data.list, []));
    } catch (error) {
      message.error('获取菜单列表失败');
    }
  }, [convertToTreeData]);

  // 获取已分配菜单
  const fetchAssignedMenus = useCallback(async (roleId: number) => {
    setFetchAssignedMenusLoading(true);
    const menuIds = await $clientReq.get(`/roles/getAssignedMenus?id=${roleId}`);
    setAssignedMenuIds(menuIds.data);
    setFetchAssignedMenusLoading(false);
  }, []);

  // 打开分配菜单抽屉
  const handleAssignMenus = useCallback((record: Role) => {
    setCurrentRole(record);
    fetchAssignedMenus(record.id);
    setIsMenuDrawerOpen(true);
  }, [fetchAssignedMenus]);

  // 菜单树节点选中状态改变
  const handleMenuChange = useCallback((checkedKeys: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] }, info: any) => {
    const { node, checked } = info;
    let newCheckedKeys: React.Key[] = Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked;

    if (node.children) {
      const updateChildrenKeys = (parentKey: React.Key, shouldCheck: boolean) => {
        const updateKeys = (items: DataNode[]) => {
          items.forEach(item => {
            if (shouldCheck) {
              newCheckedKeys.push(item.key);
            } else {
              newCheckedKeys = newCheckedKeys.filter(key => key !== item.key);
            }
            if (item.children) {
              updateKeys(item.children);
            }
          });
        };

        const parent = menuTree.find(item => item.key === parentKey);
        if (parent && parent.children) {
          updateKeys(parent.children);
        }
      };

      updateChildrenKeys(node.key, checked);
    }

    setAssignedMenuIds(Array.from(new Set(newCheckedKeys)).map(key => Number(key)));
  }, [menuTree]);

  // 保存分配菜单
  const handleSaveAssignedMenus = async () => {
    if (!currentRole) return;
    try {
      await $clientReq.post('/roles/assignMenus', {
        role_id: currentRole.id,
        menu_ids: assignedMenuIds,
      });
      Notification({
        type: 'success',
        message: '菜单分配成功!',
        description: '角色的菜单权限已更新。',
        placement: 'topRight',
      });
      setIsMenuDrawerOpen(false);
    } catch (error) {
      message.error('菜单分配失败');
    } finally {
      fetchRoles();
    }
  };

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);
  /** 菜单树模块-end */

  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      setCurrentPage(page);
      fetchRoles(page, pageSize);
    }
  };

  const handlePageSizeChange = (size: number) => {
    if (size !== pageSize) {
      setPageSize(size);
      setCurrentPage(1);
      fetchRoles(1, size);
    }
  };

  // 获取角色列表
  const fetchRoles = useCallback(async (page = currentPage, size = pageSize, name = searchName) => {
    setLoading(true);
    const url = `/roles/get?page=${page}&pageSize=${size}&name=${name}`;
    try {
      const data = await $clientReq.get(url);
      if (data) {
        setRoles(data.data.list);
        setTotalItems(data.data.total);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchName])

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchRoles(1, pageSize, searchName);
  }

  const handleRefresh = () => {
    setCurrentPage(1);
    setSearchName('');
    fetchRoles(1, pageSize, '');
  }

  const handleAdd = () => {
    setEditingRole(null);
    setIsDrawerOpen(true);
    form.resetFields();
  };

  const handleEdit = (record: Role) => {
    setEditingRole(record);
    setIsDrawerOpen(true);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
    });
  };

  const [saveLoading, setSaveLoading] = useState<boolean>(false)
  const handleSave = async () => {
    form.validateFields().then(async values => {
      setSaveLoading(true);
      try {
        const url = editingRole ? '/roles/update' : '/roles/create';
        const method = editingRole ? 'put' : 'post';

        const params = {
          ...values,
          id: editingRole?.id
        }

        const result = await $clientReq[method](url, params);
        console.log('result:', result);

        if (!result.data) {
          message.error(result);
          return;
        }
        Notification({
          type: 'success',
          message: editingRole ? '更新成功!' : '添加成功!',
          description: editingRole ? '角色信息已成功更新。' : '角色信息已成功添加。',
          placement: 'topRight',
        });
      } finally {
        setSaveLoading(false);
        setIsDrawerOpen(false);
        fetchRoles();
      }
    });
  };

  const handleDelete = async (id: number) => {
    const result = await $clientReq.delete(`/roles/del?id=${id}`);

    if (!result.data) {
      message.error(result)
    } else {
      Notification({
        type: 'success',
        message: '删除成功!',
        description: '角色已删除',
        placement: 'topRight'
      });
    }
    fetchRoles();
  };

  const columns: any[] = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      render: (text: string) => (
        <span className="font-bold text-blue-600 hover:to-blue-800 cursor-pointer">
          {text}
        </span>
      )
    },
    {
      title: '角色描述',
      dataIndex: 'description',
      key: 'description',
      align: 'center',
      render: (text: string) => (
        <span className="text-gray-600 dark:text-gray-300">
          {text || '-'}
        </span>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      render: (text: string) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {text ? new Date(text).toLocaleString() : '-'}
        </span>
      )
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 280,
      render: (text: any, record: Role) => (
        <Space size="middle" className="flex justify-center">
          <Tooltip title="编辑角色">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              className="text-blue-500 hover:text-blue-600 transition-colors"
            >
              编辑
            </Button>
          </Tooltip>

          <Tooltip title="分配菜单权限">
            <Button
              type="link"
              icon={<SettingOutlined />}
              onClick={() => handleAssignMenus(record)}
              className="text-green-500 hover:text-green-600 transition-colors"
            >
              分配菜单
            </Button>
          </Tooltip>

          <Popconfirm
            title="删除确认"
            description="你确定要删除这个角色吗？此操作不可恢复。"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            okButtonProps={{
              danger: true,
              className: 'hover:bg-red-600'
            }}
          >
            <Tooltip title="删除角色">
              <Button
                type="link"
                icon={<DeleteOutlined />}
                danger
                className="hover:text-red-600 transition-colors"
              >
                删除
              </Button>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className='p-4'>
      <Space size={16}>
        <Input
          placeholder="搜索角色名称"
          prefix={<SearchOutlined />}
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
          搜索
        </Button>
        <Button icon={<ReloadOutlined />} onClick={handleRefresh}>刷新</Button>
        <Button type="primary" onClick={handleAdd}>添加角色</Button>
      </Space>
      <Table
        columns={columns}
        dataSource={roles}
        style={{ marginTop: 20 }}
        loading={loading}
        bordered
        rowKey={(record) => record.id.toString()} // 使用 id 作为唯一键
        pagination={false} // 使用自定义的 Pagination
        locale={{
          emptyText: (
            <div className="py-8 flex flex-col items-center">
              <Icon
                icon="eos-icons:role-binding"
                className="text-4xl text-gray-300 mb-2"
              />
              <div className="text-gray-500">暂无角色数据</div>
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
        title={editingRole ? '编辑角色' : '添加角色'}
        placement="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        width={400}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setIsDrawerOpen(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" loading={saveLoading} onClick={handleSave}>保存</Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="角色描述"
            rules={[{ required: true, message: '请输入角色描述' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        loading={fetchAssignedMenusLoading}
        title={`为 ${currentRole?.name || ''} 分配菜单`}
        placement="right"
        width={400}
        onClose={() => setIsMenuDrawerOpen(false)}
        open={isMenuDrawerOpen}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setIsMenuDrawerOpen(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" onClick={handleSaveAssignedMenus}>
              保存
            </Button>
          </div>
        }
      >
        <Tree
          showLine={true}
          showIcon={true}
          checkable
          checkStrictly
          checkedKeys={assignedMenuIds}
          onCheck={handleMenuChange}
          treeData={menuTree}
        />
      </Drawer>
    </div>
  );
};

export default RoleManagement;
