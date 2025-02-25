'use client';

import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';
import { MenuItem } from '@/types/menu';
import { useMenuDataFetch } from '@/hooks/useMenuDataFetch';

interface MenuContextType {
  menuData: MenuItem[];
  permissionsMap: Map<string, string[]>;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { menuData } = useMenuDataFetch();

  // 使用 useCallback 优化 processMenuItem 函数
  const processMenuItem = useCallback((item: MenuItem, map: Map<string, string[]>) => {
    if (item?.permission_items) {
      const permissionCodes = item.permission_items.map((p: any) => p.code);
      map.set(item.path, permissionCodes);
    }
    if (item.children) {
      item.children.forEach(child => processMenuItem(child, map));
    }
  }, []);

  // 优化 permissionsMap 的计算
  const permissionsMap = useMemo(() => {
    if (!menuData.length) return new Map<string, string[]>();
    
    const map = new Map<string, string[]>();
    menuData.forEach(item => processMenuItem(item, map));
    return map;
  }, [menuData, processMenuItem]);

  // 优化 context value 的创建
  const value = useMemo(() => ({
    menuData,
    permissionsMap
  }), [menuData, permissionsMap]);

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenuContext = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenuContext must be used within a MenuProvider');
  }
  return context;
};