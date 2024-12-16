import { MenuDataItem } from "@ant-design/pro-layout";
import {
  AuditOutlined,
  BulbOutlined,
  DashboardOutlined,
  FileTextOutlined, FireFilled, FolderOutlined,
  MenuOutlined, NotificationOutlined, UserOutlined
} from "@ant-design/icons";
import ACCESS_ENUM from "@/access/accessEnum";

// 菜单列表
export const menus = [
  {
    path: "/",
    name: "主页",
    icon: <DashboardOutlined />,
  },
  {
    path: "/banks",
    name: "题库",
    icon: <FolderOutlined />,
  },
  {
    path: "/questions",
    name: "题目",
    icon: <FileTextOutlined />,
  },
  {
    name: "模拟面试",
    path: "/test",
    target: "_blank",
    icon: <AuditOutlined />,
  },
  {
    path: "/admin",
    name: "管理",
    icon: <BulbOutlined />,
    access: ACCESS_ENUM.ADMIN,
    children: [
      {
        path: "/admin/user",
        name: "用户管理",
        icon: <UserOutlined />,
        access: ACCESS_ENUM.ADMIN,
      },
      {
        path: "/admin/bank",
        name: "题库管理",
        icon: <FolderOutlined />,
        access: ACCESS_ENUM.ADMIN,
      },
      {
        path: "/admin/question",
        name: "题目管理",
        icon: <FileTextOutlined />,
        access: ACCESS_ENUM.ADMIN,
      },

      {
        path: "/admin/oneStation",
        name: "一站式生成新题目",
        icon: <FireFilled />,
        access: ACCESS_ENUM.ADMIN,
      },
      {
        path: "/admin/message",
        name: "消息广播站",
        icon: <NotificationOutlined />,
        access: ACCESS_ENUM.ADMIN,
      },
      {
        path: "/mock",
        name: "测试页面（开发完成后移除）",
        access: ACCESS_ENUM.ADMIN,
      },
    ],
  },
] as MenuDataItem[];

// 根据全部路径查找菜单
export const findAllMenuItemByPath = (path: string): MenuDataItem | null => {
  return findMenuItemByPath(menus, path);
};

// 根据路径查找菜单（递归）
export const findMenuItemByPath = (
  menus: MenuDataItem[],
  path: string,
): MenuDataItem | null => {
  for (const menu of menus) {
    if (menu.path === path) {
      return menu;
    }
    if (menu.children) {
      const matchedMenuItem = findMenuItemByPath(menu.children, path);
      if (matchedMenuItem) {
        return matchedMenuItem;
      }
    }
  }
  return null;
};
