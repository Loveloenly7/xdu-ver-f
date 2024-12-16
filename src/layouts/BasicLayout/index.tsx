"use client";
import {BellOutlined, GithubFilled, LogoutOutlined, UserOutlined} from "@ant-design/icons";
import { ProLayout } from "@ant-design/pro-components";
import {Badge, Button, Dropdown, message} from "antd";
import React, {useEffect, useState} from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import GlobalFooter from "@/components/GlobalFooter";
import { menus } from "../../../config/menu";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/stores";
import getAccessibleMenus from "@/access/menuAccess";
import { userLogoutUsingPost } from "@/api/userController";
import { setLoginUser } from "@/stores/loginUser";
import { DEFAULT_USER } from "@/constants/user";
import SearchInput from "@/layouts/BasicLayout/components/SearchInput";
import "./index.css";
import {listMessageVoByPageUsingPost} from "@/api/messageController";
import ACCESS_ENUM from "@/access/accessEnum";

interface Props {
  children: React.ReactNode;
}

/**
 * 全局通用布局
 * @param children
 * @constructor
 */
export default function BasicLayout({ children }: Props) {
  const pathname = usePathname();
  // 当前登录用户
  const loginUser = useSelector((state: RootState) => state.loginUser);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // 判断是否登录
  const isLoggedIn = loginUser.userRole!=ACCESS_ENUM.NOT_LOGIN;

  //前端改造小铃铛
  const [unreadCount, setUnreadCount] = useState(0);  // 存储未读消息数量
  const [isLoading, setIsLoading] = useState(true);   // 控制是否正在加载消息数据

  // 获取未读消息数量
  const fetchUnreadMessagesCount = async () => {
    try {
      const response = await listMessageVoByPageUsingPost({
        /*这里可以用VO字段去查 因为后端的爬虫只针对具体内容 我们的目的不是这个。。*/
        pageSize:1,
        current:1,
        userId:loginUser.id,
        isRead:0
      });
      setUnreadCount(response.data.total || 0);  // 假设返回的结构是 { data: { count: 数量 } }
    } catch (error) {
      console.error("无法获取未读消息数量", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 轮询获取未读消息数量
  useEffect(() => {
    fetchUnreadMessagesCount();
    //todo 上线前特别注意这里的轮询时间！！！
    const intervalId = setInterval(fetchUnreadMessagesCount, 50000000); // 每5秒轮询一次 测试就0.5秒直接。。

    return () => clearInterval(intervalId);  // 清除定时器
  }, []);



  /**
   * 用户注销
   */
  const userLogout = async () => {
    try {
      await userLogoutUsingPost();
      message.success("已退出登录");
      dispatch(setLoginUser(DEFAULT_USER));
      router.push("/user/login");
    } catch (e) {
      message.error("操作失败，" + e.message);
    }
  };

  return (
    <div
      id="basicLayout"
      style={{
        height: "100vh",
        overflow: "auto",
      }}
    >
      <ProLayout
        title="北雷村校招备考系统"
        layout="top"
        logo={
          <Image
            src="/assets/logo.png"
            height={32}
            width={32}
            alt="北雷村校招备考系统"
          />
        }
        location={{
          pathname,
        }}
        avatarProps={{
          src: loginUser.userAvatar || "/assets/logo.png",
          size: "small",
          title: loginUser.userName || "XDU",
          render: (props, dom) => {
            if (!loginUser.id) {
              return (
                <div
                  onClick={() => {
                    router.push("/user/login");
                  }}
                >
                  {dom}
                </div>
              );
            }
            return (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "userCenter",
                      icon: <UserOutlined />,
                      label: "个人中心",
                    },
                    {
                      key: "logout",
                      icon: <LogoutOutlined />,
                      label: "退出登录",
                    },
                  ],
                  onClick: async (event: { key: React.Key }) => {
                    const { key } = event;
                    if (key === "logout") {
                      userLogout();
                    } else if (key === "userCenter") {
                      router.push("/user/center");
                    }
                  },
                }}
              >
                {dom}
              </Dropdown>
            );
          },
        }}
        actionsRender={(props) => {
          if (props.isMobile) return [];
          return [
            <SearchInput key="search" />,
            <a
              key="github"
              href="https://github.com/Loveloenly7"
              target="_blank"
            >
              <GithubFilled key="GithubFilled" />
            </a>,


              /*todo 这玩意怎么换方向。。？换一下这个小铃铛的标志！！！*/


            // <Badge
            //     key="message-bell"
            //     count={unreadCount}
            //     overflowCount={99}  // 如果超过99条未读消息，显示99+
            //     size="small"
            //     style={{ marginRight: 16 }}
            //     offset={[10, 10]} // 横向偏移6px，纵向偏移-6px，将红点移到右上角 OK这个偏移量我觉得没什么问题了。。
            // >
            //   <Button
            //       icon={<BellOutlined />}
            //       onClick={() => router.push("/user/center")}  // 点击铃铛跳转到消息中心
            //       shape="circle"
            //       style={{ border: "none", backgroundColor: "transparent", padding: 0 }}
            //   />
            // </Badge>,
              //todo 完成了未登录不渲染小铃铛图标的设计
            <>
              {isLoggedIn ? (
                  <Badge
                      key="message-bell"
                      count={unreadCount}
                      overflowCount={99}  // 如果超过99条未读消息，显示99+
                      size="small"
                      style={{ marginRight: 16 }}
                      offset={[10, 10]} // 横向偏移6px，纵向偏移-6px，将红点移到右上角
                  >
                    <Button
                        icon={<BellOutlined />}
                        onClick={() => router.push("/user/center")}  // 点击铃铛跳转到消息中心
                        shape="circle"
                        style={{ border: "none", backgroundColor: "transparent", padding: 0 }}
                    />
                  </Badge>
              ) : null}  {/* 未登录时不渲染任何内容 */}
            </>

          ];
        }}
        headerTitleRender={(logo, title, _) => {
          return (
            <a>
              {logo}
              {title}
            </a>
          );
        }}
        // 渲染底部栏
        footerRender={() => {
          return <GlobalFooter />;
        }}
        onMenuHeaderClick={(e) => console.log(e)}
        // 定义有哪些菜单
        menuDataRender={() => {
          return getAccessibleMenus(loginUser, menus);
        }}
        // 定义了菜单项如何渲染
        menuItemRender={(item, dom) => (
          <Link href={item.path || "/"} target={item.target}>
            {dom}
          </Link>
        )}
      >
        {children}
      </ProLayout>
    </div>
  );
}
