'use client'
import React, { useRef, useEffect, useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SidebarLinkGroup from "./SidebarLinkGroup";
import { MenuItem } from "@/types/menu";
import { Tooltip, Popover } from "antd";
import LOGO from '@/public/icons/logo.png'
import { Icon } from '@iconify/react';

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    menuData: MenuItem[];
    sidebarExpanded: boolean;
    setSidebarExpanded: (expanded: boolean) => void;
}

const buildTree = (items: MenuItem[]): MenuItem[] => {
    const itemMap = new Map<number, MenuItem>();
    const rootItems: MenuItem[] = [];

    // 首先，按照 sort 字段对所有项目进行排序
    const sortedItems = [...items].sort((a: any, b: any) => {
        if (a.sort === b.sort) {
            // 如果 sort 值相同，则按照 id 排序
            return a.id - b.id;
        }
        return a.sort - b.sort;
    });

    sortedItems.forEach(item => {
        itemMap.set(item.id, { ...item, children: [] });
    });

    itemMap.forEach(item => {
        if (item.parent_id === null) {
            rootItems.push(item);
        } else {
            const parent = itemMap.get(item.parent_id);
            if (parent) {
                parent.children?.push(item);
            }
        }
    });

    // 对每个父项的子项进行排序
    const sortChildren = (items: MenuItem[]) => {
        items.forEach(item => {
            if (item.children && item.children.length > 0) {
                item.children.sort((a: any, b: any) => {
                    if (a.sort === b.sort) {
                        return a.id - b.id;
                    }
                    return a.sort - b.sort;
                });
                sortChildren(item.children);
            }
        });
    };

    sortChildren(rootItems);

    return rootItems;
};

const Sidebar: React.FC<SidebarProps> = ({
    sidebarOpen,
    setSidebarOpen,
    menuData,
    sidebarExpanded,
    setSidebarExpanded
}) => {
    const pathname = usePathname();
    const sidebar = useRef<HTMLDivElement | null>(null);
    const trigger = useRef<HTMLButtonElement | null>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
    const treeMenuData = useMemo(() => buildTree(menuData), [menuData]);

    useEffect(() => {
        const clickHandler = ({ target }: MouseEvent) => {
            if (!sidebar.current || !trigger.current || !sidebarOpen) return;
            if (!(target instanceof Node) || sidebar.current.contains(target) || trigger.current.contains(target)) return;
            setSidebarOpen(false);
        };

        document.addEventListener("click", clickHandler);
        return () => document.removeEventListener("click", clickHandler);
    }, [sidebarOpen, setSidebarOpen]);

    useEffect(() => {
        const keyHandler = ({ key }: KeyboardEvent) => {
            if (key === "Escape") setSidebarOpen(false);
        };
        document.addEventListener("keydown", keyHandler);
        return () => document.removeEventListener("keydown", keyHandler);
    }, [setSidebarOpen]);

    useEffect(() => {
        localStorage.setItem("sidebar-expanded", sidebarExpanded.toString());
        document.body.classList.toggle("sidebar-expanded", sidebarExpanded);
    }, [sidebarExpanded]);

    useEffect(() => {
        const findActiveMenu = (items: MenuItem[]): { path: string | null, parent: string | null } => {
            for (const item of items) {
                if (item.path === pathname) {
                    return { path: item.path, parent: item.parent_id ? item.parent_id.toString() : null };
                }
                if (item.children) {
                    const result = findActiveMenu(item.children);
                    if (result.path) {
                        return { path: result.path, parent: item.path };
                    }
                }
            }
            return { path: null, parent: null };
        };
        const { path: activeMenuPath, parent: activeMenuParent } = findActiveMenu(treeMenuData);
        setActiveMenu(activeMenuPath);
        setExpandedMenu(activeMenuParent);
    }, [pathname, treeMenuData]);

    const handleMenuClick = (path: string, hasChildren: boolean, parentPath: string | null) => {
        setActiveMenu(path);
        if (hasChildren) {
            setExpandedMenu(prevExpanded => prevExpanded === path ? null : path);
        } else if (parentPath) {
            setExpandedMenu(parentPath);
        } else {
            setExpandedMenu(null);
        }
        if (!sidebarExpanded) setSidebarExpanded(true);
    };

    const renderMenuItem = (item: MenuItem, isSubMenu = false, parentPath: string | null = null) => {
        const isActive = pathname === item.path;
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedMenu === item.path;

        // 子菜单渲染函数
        const renderPopoverContent = () => (
            <div className="min-w-[220px] py-3">
                {/* 标题区域 - 调整颜色使其更柔和 */}
                <div className="px-4 pb-2 mb-2 border-b border-gray-800/50">
                    <span className="text-sm font-medium text-gray-3">
                        {item.title}
                    </span>
                </div>
                <div className="space-y-1 px-2">
                    {item.children?.map((subItem) => (
                        <Link
                            key={subItem.id}
                            href={subItem.path}
                            className={`
                                flex items-center px-3 py-2.5 text-sm rounded-lg
                                transition-all duration-200 group relative
                                ${pathname === subItem.path
                                    ? "bg-gradient-to-r from-blue-500/90 to-indigo-600/90 text-white shadow-lg shadow-blue-500/20"
                                    : "text-gray-3 hover:bg-gray-800/50"}
                            `}
                        >
                            {/* 悬浮发光效果 */}
                            <div className={`
                                absolute inset-0 rounded-lg opacity-0 
                                transition-opacity duration-200
                                ${pathname === subItem.path
                                    ? ""
                                    : "group-hover:opacity-50 bg-gradient-to-r from-blue-500/5 to-indigo-500/5"}
                            `} />

                            {/* 图标 */}
                            {subItem.icon && (
                                <div className="relative">
                                    <div className={`
                                        absolute -inset-1 rounded-full 
                                        transition-all duration-300 opacity-0
                                        ${pathname === subItem.path
                                            ? "bg-white/20"
                                            : "group-hover:bg-blue-500/10 group-hover:opacity-100"}
                                    `} />
                                    <Icon
                                        icon={subItem.icon}
                                        className={`
                                            w-4 h-4 relative
                                            transition-colors duration-200
                                            ${pathname === subItem.path
                                                ? "text-white"
                                                : "text-gray-300/90 group-hover:text-blue-400"}
                                        `}
                                    />
                                </div>
                            )}

                            {/* 文字 */}
                            <span className={`
                                ml-3 relative transition-colors duration-200
                                ${pathname === subItem.path
                                    ? "text-white"
                                    : "text-gray-300/90 group-hover:text-blue-400"}
                            `}>
                                {subItem.title}
                            </span>

                            {/* 活跃状态指示器 */}
                            {pathname === subItem.path && (
                                <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/90" />
                            )}
                        </Link>
                    ))}
                </div>
            </div>
        );
        // 主菜单项
        const menuItem = (
            <Link
                href={hasChildren ? '#' : item.path}
                className={`group relative flex items-center py-2.5 px-3 
                ${isSubMenu ? "rounded-md" : "rounded-lg"}
                transition-all duration-300 ease-in-out
                ${isActive
                        ? "bg-gradient-to-r from-blue-500/90 to-indigo-600/90 text-gray-400"
                        : "text-gray-400 hover:bg-gradient-to-r hover:from-gray-800/40 hover:to-gray-800/20"
                    }
                ${!isActive && "hover:translate-x-1"}
                ${isSubMenu ? "text-sm" : "text-base"}
            `}
                onClick={(e) => {
                    if (hasChildren) {
                        e.preventDefault();
                    }
                    handleMenuClick(item.path, hasChildren || false, parentPath);
                }}
            >
                {/* 发光效果 */}
                {isActive && (
                    <div className="absolute inset-0 rounded-lg opacity-50 blur-sm bg-blue-500/20" />
                )}

                {/* 活跃状态指示器 */}
                {isActive && (
                    <>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-300 to-indigo-300 rounded-r-full" />
                        <div className="absolute inset-0 rounded-lg ring-1 ring-white/20" />
                    </>
                )}

                {/* 图标 */}
                {item.icon && (!isSubMenu || sidebarExpanded) && (
                    <div className="relative z-10">
                        <div className={`
                            absolute -inset-2 rounded-full transition-all duration-300
                            ${isActive ? 'bg-white/10' : 'group-hover:bg-blue-500/10'}
                            scale-0 group-hover:scale-100
                        `} />
                        <Icon
                            icon={item.icon}
                            width={isSubMenu ? "18" : "20"}
                            height={isSubMenu ? "18" : "20"}
                            className={`relative transition-all duration-300
                                ${isActive
                                    ? "text-white"
                                    : "text-gray-400 group-hover:text-blue-600"}
                            `}
                        />
                    </div>
                )}

                {/* 标题文本 - 悬浮效果 */}
                {sidebarExpanded && (
                    <span className={`
                        relative z-10 ml-3 transition-all duration-300 
                        overflow-hidden text-ellipsis whitespace-nowrap
                        ${isActive
                            ? "text-white"
                            : "group-hover:text-blue-600 font-medium"}
                    `}>
                        {item.title}
                    </span>
                )}


                {/* 展开箭头 */}
                {hasChildren && sidebarExpanded && (
                    <div className="relative z-10 ml-auto">
                        <Icon
                            icon="material-symbols:keyboard-arrow-down-rounded"
                            className={`w-5 h-5 transition-all duration-300 
                                ${isExpanded ? "rotate-180" : ""}
                                ${isActive
                                    ? "text-white"
                                    : "text-gray-400 group-hover:text-blue-600"}
                            `}
                        />
                    </div>
                )}
            </Link>
        )

        return (
            <div key={item.id} className={`${isSubMenu ? "ml-3" : ""}`}>
                {/* 当菜单折叠且有子菜单时，使用 Popover */}
                {!sidebarExpanded && hasChildren && !isSubMenu ? (
                    <Popover
                        placement="rightTop"
                        content={renderPopoverContent}
                        trigger="hover"
                        overlayClassName="sidebar-popover"
                        overlayInnerStyle={{
                            background: 'rgb(17 24 39)',
                            border: '1px solid rgb(55 65 81)',
                            borderRadius: '0.5rem',
                        }}
                    >
                        {menuItem}
                    </Popover>
                ) : (
                    menuItem
                )}

                {/* 展开状态的子菜单保持不变 */}
                {hasChildren && sidebarExpanded && (
                    <div className={`
                        relative mt-1 pl-3 overflow-hidden
                        transition-all duration-300 ease-in-out
                        ${isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
                    `}>
                        <div className="absolute left-[22px] top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/20 via-gray-700/20 to-transparent" />
                        <div className="space-y-1">
                            {item.children?.map((subItem) => renderMenuItem(subItem, true, item.path))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <aside
            ref={sidebar}
            className={`absolute left-0 top-0 z-99 flex h-screen 
                ${sidebarExpanded ? "w-72" : "w-20"} 
                flex-col bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800
                overflow-x-hidden overflow-y-auto 
                transition-all duration-300 ease-in-out
                shadow-2xl shadow-gray-900/50
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                lg:static lg:translate-x-0
            `}
        >
            {/* 顶部装饰线条 */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

            {/* 毛玻璃效果背景 */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-gray-800/50 backdrop-blur-xl" />

            {/* Logo区域 */}
            <div className="relative flex items-center justify-between px-4 py-4">
                <Link href="/" className="flex items-center group">
                    <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-300" />
                        <Image
                            className="transition-all duration-300 relative"
                            width={42}
                            height={42}
                            src={LOGO}
                            alt="Logo"
                            priority
                        />
                    </div>

                    {/* Logo文字容器 */}
                    <div className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${sidebarExpanded ? "w-40 ml-3" : "w-0 ml-0"}
        `}>
                        <span className={`
                        text-2xl
                whitespace-nowrap font-semibold
                bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 
                bg-clip-text text-transparent
                transition-all duration-300
                ${sidebarExpanded ? "translate-x-0 opacity-100" : "-translate-x-3 opacity-0"}
            `}>
                            Com Admin
                        </span>
                    </div>
                </Link>
            </div>

            {/* 分隔线 */}
            <div className="relative mx-4 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent opacity-50" />

            {/* 导航区域 */}
            <nav className="relative flex-1 px-4 py-2 space-y-1">
                {treeMenuData.map((item) => renderMenuItem(item))}
            </nav>

            {/* 底部装饰 */}
            <div className="relative mx-4 mb-4">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent opacity-50" />
            </div>
        </aside>
    );
};

export default Sidebar;