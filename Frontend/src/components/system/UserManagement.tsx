'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Popconfirm, Space, Drawer, message, Dropdown, Menu, Checkbox, Row, Col, Tag, Empty, Select, TableProps, notification, Tree, TreeProps, TreeSelect, Switch } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, SettingOutlined, SearchOutlined, FilterOutlined, PhoneOutlined, ReloadOutlined, TeamOutlined, UserOutlined, ApartmentOutlined } from '@ant-design/icons'
import Notification from '@/components/Notification'
import Pagination from '@/components/Pagination'
import '@/styles/user_department_tree.css'
import { buildTree } from '@/utils/treeUtil';
import Loading from '@/components/Loading'
import { DataNode } from 'antd/es/tree'
import { useLayout } from '@/contexts/layoutContext';
import { $clientReq } from '@/utils/clientRequest';
import PermissionButton from '@/components/PermissionButton';
import { Icon } from '@iconify/react'

interface User {
  id: number;
  roles: any;
  key: string;
  name: string;
  email: string;
  age: number;
  role: string;
  phone: string;
  department?: string;
  last_login?: string;
}

const UserManagement: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [form] = Form.useForm();

  const [users, setUsers] = useState<User[]>([]);
  /** 查询条件-start */
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchName, setSearchName] = useState<string>('');
  const [searchEmail, setSearchEmail] = useState<string>('');
  const [searchRoles, setSearchRoles] = useState<string[]>([]);
  /** 查询条件-end */
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const { setUseDefaultLayout } = useLayout();
  useEffect(() => {
    return () => setUseDefaultLayout(true);
  }, [setUseDefaultLayout]);

  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (size: number) => {
    if (size !== pageSize) {
      setPageSize(size);
      setCurrentPage(1);
      fetchUsers('', '', [], 1, size, departmentId);
    }
  };

  /** 部门-start */
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [treeKey, setTreeKey] = useState(0);
  const [departmentOption, setDepartmentOption] = useState<object[]>([])
  interface TreeNode extends DataNode {
    key: string;
    title: string;
    children?: TreeNode[];
  }
  const [treeLoading, setTreeLoading] = useState<boolean>(false)
  const [treeData, setTreeData] = useState<any>([]);
  useEffect(() => {
    setTreeLoading(true)
    fetch('/api/departments/get')
      .then(response => response.json())
      .then(data => {
        const departments = data.data.list
        // 供给添加修改表单使用
        setDepartmentOption(departments.map((department: { name: string; id: number }) => ({
          label: department.name,
          value: department.id,
        })))

        // 构建树形结构
        const tree = buildTree(departments)
        setTreeData(tree)
        setTreeLoading(false)
      })
  }, [])

  const handleDepartmentSelect: TreeProps['onSelect'] = async (selectedKeys, info) => {
    if (info.selected) {
      const selectedNode = info.node as TreeNode;
      setDepartmentId(selectedNode.key)
      setSearchName('')
      setSearchEmail('')
      setSearchRoles([])
      fetchUsers('', '', [], 1, pageSize, selectedNode.key)
    }
  };
  /** 部门-end */

  /** 角色 */
  const [rolesOption, setRolesOption] = useState<any[]>([])
  const fetchRoles = async () => {
    fetch('/api/dicts')
      .then(response => response.json())
      .then(data => {
        setRolesOption(data.data.list)
      })
      .catch(error => {
        console.error('error:', error);
      });
  }

  useEffect(() => {
    fetchRoles();
  }, []);

  // 新增
  const handleAdd = () => {
    setEditingUser(null);
    setIsDrawerOpen(true);
    form.resetFields();
  };

  // 编辑
  const handleEdit = (record: User) => {
    setEditingUser(record);
    setIsDrawerOpen(true);

    // 将 roles 转换为数组格式,select option支持的格式是string
    const rolesIds = record.roles.map((role: { id: any }) => role.id.toString());

    // 设置表单值
    form.setFieldsValue({
      ...record,
      roles: rolesIds
    });
  };


  // 删除
  const handleDelete = async (record: User) => {
    const response = await fetch(`/api/users/del?id=${record.id}`, { method: 'DELETE' });
    const result = await response.json()
    if (!response.ok) {
      message.error(result.error)
    } else {
      Notification({
        type: 'success',
        message: '删除成功!',
        description: '用户已删除',
        placement: 'topRight'
      });
    }
    fetchUsers();
  };

  // 提交操作
  const [saveLoading, setSaveLoading] = useState<boolean>(false)
  const handleSave = async () => {
    form.validateFields().then(async values => {
      setSaveLoading(true);
      try {
        // 将roles转换为roles_ids
        const role_ids = values.roles.map((role: any) => Number(role));
        // 从values中删除roles
        delete values.roles;

        const url = editingUser ? '/users/update' : '/users/create';
        const method = editingUser ? 'put' : 'post';

        const params = {
          ...values,
          id: editingUser?.id,
          status: values.status ? 1 : 0,
          role_ids, // 使用roles_ids替代roles
        }

        const result = await $clientReq[method](url, params);
        if (!result.data) {
          return
        }

        Notification({
          type: 'success',
          message: editingUser ? '更新成功!' : '添加成功!',
          description: editingUser ? '用户信息已成功更新。' : '新用户已成功添加。',
          placement: 'topRight',
        });
      } finally {
        setSaveLoading(false);
        setIsDrawerOpen(false);
        fetchUsers();
      }
    });
  };

  const fetchUsers = useCallback(async (name = searchName, email = searchEmail, roles = searchRoles, page = currentPage, size = pageSize, deptId = departmentId) => {
    setLoading(true);
    const url = `/users/get?page=${page}&pageSize=${size}&name=${name}&email=${email}&roles=${roles}` + (deptId ? `&departmentID=${deptId}` : '');
    try {
      const data = await $clientReq.get(url);
      if (data) {
        setUsers(data.data.list);
        setTotalItems(data.data.total);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [searchName, searchEmail, searchRoles, currentPage, pageSize, departmentId]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const handleRefresh = () => {
    // 保持当前的 pageSize
    const currentSize = pageSize;
    setCurrentPage(1);
    setDepartmentId(null);
    setSearchName('');
    setSearchEmail('');
    setSearchRoles([]);
    setTreeKey(prevKey => prevKey + 1);
    fetchUsers('', '', [], 1, currentSize, null);
    Notification({
      type: 'success',
      message: '刷新成功!',
      description: '表格数据已刷新',
      placement: 'topRight'
    });
  };

  /* 自定义列配置区域-start */
  // 设置列的显隐
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    email: true,
    roles: true,
    phone: true,
    last_login: true
  });
  // 用于自定义列配置的数据源
  const columnDefinitions = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '角色', dataIndex: 'roles', key: 'roles' },
    { title: '电话', dataIndex: 'phone', key: 'phone' },
    { title: '最后登录时间', dataIndex: 'last_login', key: 'last_login' }
  ];

  const handleColumnVisibilityChange = (e: any, columnKey: string) => {
    setVisibleColumns({
      ...visibleColumns,
      [columnKey]: e.target.checked,
    });
  };

  const columnMenu: any = (
    <Menu>
      {columnDefinitions.map((col) => (
        <Menu.Item key={col.dataIndex}>
          <Checkbox
            checked={visibleColumns[col.dataIndex as keyof typeof visibleColumns]}
            onChange={(e) => handleColumnVisibilityChange(e, col.dataIndex)}
          >
            {col.title}
          </Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  );

  const columns: any[] = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: User, b: User) => a.name.localeCompare(b.name),
      align: 'center',
      width: 150,
      visible: visibleColumns.name,
      render: (text: string) => <strong style={{ color: '#1DA57A' }}>{text}</strong>
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      sorter: (a: User, b: User) => a.email.localeCompare(b.email),
      align: 'center',
      width: 200,
      visible: visibleColumns.email,
      editable: true,
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      align: 'center',
      width: 200,
      visible: visibleColumns.roles,
      render: (roles: { name: string }[]) => (
        <>
          {roles.map((role) => (
            <Tag color={role.name === '超级管理员' ? 'green' : 'blue'} key={role.name}>
              {role.name}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      align: 'center',
      width: 150,
      visible: visibleColumns.phone,
      render: (phone: string) => (
        <Button type="link" icon={<PhoneOutlined />} onClick={() => message.info(`拨打电话: ${phone}`)}>
          {phone}
        </Button>
      ),
    },
    {
      title: '最后登录时间',
      dataIndex: 'last_login',
      key: 'last_login',
      align: 'center',
      width: 200,
      visible: visibleColumns.last_login,
      sorter: (a: User, b: User) => {
        const dateA = a.last_login ? new Date(a.last_login).getTime() : 0;
        const dateB = b.last_login ? new Date(b.last_login).getTime() : 0;
        return dateA - dateB;
      },
      render: (date: string | undefined) => (
        <span>{date ? new Date(date).toLocaleString() : '-'}</span> // 使用 toLocaleString 格式化时间
      )
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      width: 250,
      fixed: 'right',
      render: (text: any, record: User) => (
        <Space size="middle">
          <PermissionButton permissionCode="system:user:update" type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </PermissionButton>
          <Popconfirm title="你确定要删除此用户吗?" onConfirm={() => handleDelete(record)}>
            <PermissionButton permissionCode="system:user:delete" type="link" danger icon={<DeleteOutlined />}>
              删除
            </PermissionButton>
          </Popconfirm>
        </Space>
      ),
    },
  ].filter(column => column.visible !== false); // 过滤掉隐藏的列
  /* end */

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys as string[]);
    },
  };

  // 批量删除
  const handleBatchDelete = () => {
    setLoading(true);
    setTimeout(() => {
      setUsers(users.filter(user => !selectedRowKeys.includes(user.key)));
      Notification({
        type: 'success',
        message: '删除成功!',
        description: '已删除选中的用户',
        placement: 'top'
      });
      setSelectedRowKeys([]);
      setLoading(false);
    }, 500); // 模拟批量删除加载
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(searchName, searchEmail, searchRoles, 1, pageSize, departmentId);
  };

  return (
    <div className="p-4">
      <Row gutter={4}>
        {/* 左侧部门树 */}
        <Col span={4}>
          <div className="flex justify-center items-center p-4 bg-gray-100 rounded-lg">
            <h3 className="text-xl font-bold text-gray-700 tracking-wide border-b-2 border-blue-500 pb-1">
              部门
            </h3>
          </div>
          {
            treeLoading ? (<Loading isShow={treeLoading} />) :
              <div className="tree-container">
                <Tree
                  showLine
                  showIcon
                  defaultExpandAll
                  key={treeKey}
                  treeData={treeData}
                  onSelect={handleDepartmentSelect}
                />
                {treeData.length === 0 && <Empty description="暂无数据" />}
              </div>
          }
        </Col>
        <Col span={20}>
          {/* 高级搜索区域 */}
          <Form>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Form.Item label="姓名">
                  <Input
                    placeholder="搜索姓名"
                    prefix={<SearchOutlined />}
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="邮箱">
                  <Input
                    placeholder="搜索邮箱"
                    prefix={<SearchOutlined />}
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="角色">
                  <Select mode="multiple" value={searchRoles} options={rolesOption} placeholder="请选择角色" allowClear onChange={(value) => setSearchRoles(value)} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="">
                  <Space size={16}>
                    <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                      搜索
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={handleRefresh}>刷新</Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>

          {/* 批量操作和列控制 */}
          <Space style={{ marginBottom: '20px', marginTop: '10px' }} className="space-x-2">
            <PermissionButton permissionCode="system:user:add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加用户
            </PermissionButton>
            {selectedRowKeys.length > 0 && (
              <Button danger icon={<DeleteOutlined />} onClick={handleBatchDelete}>批量删除</Button>
            )}
            <Dropdown overlay={columnMenu}>
              <Button icon={<SettingOutlined />}>自定义列</Button>
            </Dropdown>
          </Space>

          {/* 用户表格 */}
          <Table
            columns={columns}
            dataSource={users}
            rowSelection={rowSelection} // 多选行
            pagination={false}
            rowKey={(record) => record.id.toString()} // 使用 id 作为唯一键
            bordered
            loading={loading}
            locale={{
              emptyText: (
                <div className="py-8 flex flex-col items-center">
                  <Icon
                    icon="icon-park-twotone:every-user"
                    className="text-4xl text-gray-300 mb-2"
                  />
                  <div className="text-gray-500">暂无用户数据</div>
                </div>
              )
            }}
            scroll={{ x: 1000 }} // 滚动以支持固定列
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
        </Col>
      </Row>
      {/* 抽屉表单 */}
      <Drawer
        title={editingUser ? '编辑用户' : '添加用户'}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        width={400}
        footer={
          <Space style={{ textAlign: 'right' }}>
            <Button onClick={() => setIsDrawerOpen(false)}>取消</Button>
            <Button type="primary" loading={saveLoading} onClick={handleSave}>保存</Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, message: '请输入邮箱' }]}>
            <Input type="email" />
          </Form.Item>
          {/* <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password />
          </Form.Item> */}
          <Form.Item name="phone" label="电话" rules={[{ required: true, message: '请输入电话号码' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="department_id" label="部门" rules={[{ required: true, message: '请选择部门' }]}>
            <Select options={departmentOption} />
          </Form.Item>
          <Form.Item name="status" label="状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
          <Form.Item name="roles" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select mode="multiple" options={rolesOption} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default UserManagement;
