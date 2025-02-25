'use client'
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import sideIconOne from '@/public/icons/sideIconOne.png'
import sideIconTwo from '@/public/icons/sideIconTwo.png'
import { Avatar, Dropdown, Menu, Input, Badge, Tooltip, Modal, Button, Divider } from "antd";
import { UserOutlined, SettingOutlined, LogoutOutlined, BellOutlined, SearchOutlined, QuestionCircleOutlined, FullscreenOutlined, FullscreenExitOutlined, MessageOutlined, TranslationOutlined } from '@ant-design/icons';
import { useBreadcrumb } from '@/contexts/breadcrumbContext';
import { signOut } from "next-auth/react";
import { Icon } from '@iconify/react';
interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
}

const { Search } = Input;

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen, sidebarExpanded, setSidebarExpanded }) => {
  const { breadcrumbs } = useBreadcrumb();
  const [notificationCount, setNotificationCount] = useState(5);
  const [messageCount, setMessageCount] = useState(3);
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('中文');

  // 退出登录
  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link href="/profile">个人中心</Link>
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        <Link href="/settings">设置</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出
      </Menu.Item>
    </Menu>
  );

  const notificationMenu = (
    <Menu>
      <Menu.Item key="notification1">系统更新通知</Menu.Item>
      <Menu.Item key="notification2">新消息提醒</Menu.Item>
      <Menu.Item key="notification3">待办事项提醒</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="viewAll">
        <Link href="/notifications">查看全部</Link>
      </Menu.Item>
    </Menu>
  );

  const messageMenu = (
    <Menu>
      <Menu.Item key="message1">来自用户A的消息</Menu.Item>
      <Menu.Item key="message2">来自用户B的消息</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="viewAllMessages">
        <Link href="/messages">查看全部消息</Link>
      </Menu.Item>
    </Menu>
  );

  const onSearch = (value: string) => {
    console.log('搜索:', value);
    // 实现搜索逻辑
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* 移动端菜单按钮 */}
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
          >
            {/* ... 保持原有的汉堡菜单按钮样式 ... */}
          </button>

          <Link className="block flex-shrink-0 lg:hidden" href="/">
            <Image
              width={32}
              height={32}
              src={"http://8.134.73.175/favicon.ico"}
              alt="Logo"
            />
          </Link>
        </div>

        {/* 非移动端 */}
        <div className="hidden lg:flex items-center">
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarExpanded(!sidebarExpanded);
            }}
            className="p-2"
          >
            <Image
              src={sidebarExpanded ? sideIconOne : sideIconTwo}
              alt="Toggle Sidebar"
              width={24}
              height={24}
            />
          </button>
          <div className="px-4 py-2 md:px-6 2xl:px-11">
            <nav>
              <ol className="flex items-center gap-2">
                {breadcrumbs.map((crumb:any, index:any) => (
                  <li key={index} className="flex items-center">
                    {crumb.icon && (
                      <Icon
                        icon={crumb.icon}
                        className="mr-1 text-gray-500"
                        width="16"
                        height="16"
                      />
                    )}
                    {crumb.href ? (
                      <a href={crumb.href} className="font-medium text-gray-500 hover:text-primary">
                        {crumb.title}
                      </a>
                    ) : (
                      <span className="font-medium text-primary">{crumb.title}</span>
                    )}
                    {index < breadcrumbs.length - 1 && <span className="mx-2 text-gray-400">/</span>}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          <Search
            placeholder="全局搜索"
            onSearch={onSearch}
            style={{ width: 200 }}
            className="hidden md:block"
          />

          <Tooltip title="全屏">
            <Button
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={toggleFullscreen}
              type="text"
            />
          </Tooltip>

          <Dropdown overlay={notificationMenu} trigger={['click']}>
            <Badge count={notificationCount} className="cursor-pointer">
              <BellOutlined style={{ fontSize: '20px' }} className="text-gray-600" />
            </Badge>
          </Dropdown>

          <Dropdown overlay={messageMenu} trigger={['click']}>
            <Badge count={messageCount} className="cursor-pointer">
              <MessageOutlined style={{ fontSize: '20px' }} className="text-gray-600" />
            </Badge>
          </Dropdown>

          <Tooltip title="帮助">
            <QuestionCircleOutlined
              style={{ fontSize: '20px' }}
              className="cursor-pointer text-gray-600"
              onClick={() => setIsHelpModalVisible(true)}
            />
          </Tooltip>

          <Divider type="vertical" />

          <Dropdown overlay={userMenu} trigger={['hover']} className="cursor-pointer">
            <div className="flex items-center gap-2">
              <Avatar src="https://cdn.iconscout.com/icon/premium/png-256-thumb/programmer-2105401-1770286.png?f=webp&w=128" size="large" />
              <span className="hidden md:inline">管理员</span>
            </div>
          </Dropdown>
        </div>
      </div>

      <Modal
        title="帮助中心"
        visible={isHelpModalVisible}
        onOk={() => setIsHelpModalVisible(false)}
        onCancel={() => setIsHelpModalVisible(false)}
      >
        <p>这里是帮助信息。您可以添加常见问题、使用指南等内容。</p>
        <ul className="list-disc pl-5 mt-2">
          <li>如何使用搜索功能？</li>
          <li>如何管理通知？</li>
          <li>如何更改个人设置？</li>
        </ul>
        <p className="mt-4">如需更多帮助，请联系系统管理员。</p>
      </Modal>
    </header>
  );
};

export default Header;