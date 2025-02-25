'use client';

import { useState, useEffect, useRef } from 'react';
import { $clientReq } from '@/utils/clientRequest';
import { usePathname } from 'next/navigation';

export const useMenuDataFetch = () => {
  const [menuData, setMenuData] = useState([]);
  const pathname = usePathname();
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    const fetchMenuData = async () => {
      if (pathname === '/' || fetchingRef.current || !mountedRef.current) return;
      
      fetchingRef.current = true;
      try {
        const data = await $clientReq.get('/menus/getMenusByUser');
        if (mountedRef.current) {
          setMenuData(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(data.data)) {
              return data.data;
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('获取菜单数据失败:', error);
      } finally {
        if (mountedRef.current) {
          fetchingRef.current = false;
        }
      }
    };

    fetchMenuData();

    return () => {
      mountedRef.current = false;
    };
  }, [pathname]);

  return { menuData };
};