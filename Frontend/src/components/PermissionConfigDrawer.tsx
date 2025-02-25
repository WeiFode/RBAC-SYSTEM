import { Drawer, Form, Input, Button, Space, Spin, message, Select } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { $clientReq } from '@/utils/clientRequest';

interface PermissionConfigDrawerProps {
    visible: boolean;
    onClose: () => void;
    menuId: number | null;
}

const PermissionConfigDrawer: React.FC<PermissionConfigDrawerProps> = ({ visible, onClose, menuId }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [rolesOption, setRolesOption] = useState<{ value: number; label: string }[]>([]);

    useEffect(() => {
        if (visible && menuId) {
            fetchPermissions(menuId);
            fetchRoles();
        }
    }, [visible, menuId]);


    const fetchPermissions = async (menuId: number) => {
        setLoading(true);
        try {
            const url = `/menus/permissions/get?id=${menuId}`;
            const response = await $clientReq.get(url);
            
            if (response) {
                const permissions = response.data.map((perm: any) => ({
                    code: perm.code,
                    description: perm.description,
                    role_ids: perm.role_ids.map((id: number) => id.toString()) // 将每个 ID 转换为字符串
                }));
                form.setFieldsValue({ permissions });
            } else {
                form.setFieldsValue({ permissions: [] });
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await $clientReq.get('/dicts');
            setRolesOption(response.data.list);
        } catch (error) {
        }
    };

    const onFinish = async (values: any) => {
        const formattedValues = {
            permissions: values.permissions.map((perm: any) => ({
                ...perm,
                role_ids: perm.role_ids.map((id: string | number) => Number(id))
            }))
        };
        const url = `/menus/permissions/post?id=${menuId}`;
        const res = await $clientReq.post(url, formattedValues);
        if (res) {
            message.success('提交成功');
        }
        onClose();
    };

    return (
        <Drawer
            title="配置权限"
            placement="right"
            onClose={onClose}
            open={visible}
            width={700}
            footer={
                <div style={{ textAlign: 'right' }}>
                    <Button onClick={onClose} style={{ marginRight: 8 }}>
                        取消
                    </Button>
                    <Button onClick={() => form.submit()} type="primary">
                        保存
                    </Button>
                </div>
            }
        >
            <Spin spinning={loading}>
                <Form form={form} onFinish={onFinish}>
                <Form.List name="permissions">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space key={key} style={{ display: 'flex', marginBottom: 16 }} align="baseline" direction="horizontal">
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'code']}
                                                rules={[{ required: true, message: '请输入权限代码' }]}
                                            >
                                                <Input placeholder="权限代码" />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'description']}
                                            >
                                                <Input placeholder="描述" />
                                            </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'role_ids']}
                                            style={{ width: '200px' }}
                                            rules={[{ required: true, message: '请选择至少一个角色' }]}
                                        >
                                            <Select
                                                mode="multiple"
                                                placeholder="请选择角色"
                                                options={rolesOption}
                                            />
                                        </Form.Item>
                                        <MinusCircleOutlined onClick={() => remove(name)} />
                                    </Space>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        添加权限
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Form>
                {!loading && form.getFieldValue('permissions')?.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#999' }}>
                        暂无权限数据,请添加新的权限
                    </div>
                )}
            </Spin>
        </Drawer>
    );
};

export default PermissionConfigDrawer;