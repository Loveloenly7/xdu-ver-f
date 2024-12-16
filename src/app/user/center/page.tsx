"use client";
import {Avatar, Button, Card, Col, Form, Image, Input, message, Modal, Row, Space, Typography, Upload} from "antd";
import {useSelector} from "react-redux";
import {RootState} from "@/stores";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import React, {useState} from "react";
import CalendarChart from "@/app/user/center/components/CalendarChart";
import "./index.css";
import {EditOutlined, PlusOutlined, UploadOutlined} from "@ant-design/icons";
import {ProColumns, ProTable} from "@ant-design/pro-components";
import UserUpdateModal from "@/app/user/center/components/UserUpdateModal";
import FavoriteTabs from "@/app/user/center/components/FavoriteTabs/FavoriteTabs";
import InterViewRecordTab from "@/app/user/center/components/InterViewRecordTab/InterViewRecordTab";
import {uploadFileUsingPost} from "@/api/fileController";
import MessageTabs from "@/app/user/center/components/MessageTabs/MessageTabs";


/**
 * 用户中心页面
 * @constructor
 */
export default function UserCenterPage() {
    // 获取登录用户信息
    const loginUser = useSelector((state: RootState) => state.loginUser);
    // 便于复用，新起一个变量

    // const dispatch = useDispatch();

    // const {user,setUser} =useState<any>(loginUser);
    // const [user, setUser] = useState<any>(loginUser);

    /*useState 不返回对象
useState 的返回值是一个数组，而不是对象。解构时需要遵循数组的解构方式。
你的写法：const { user, setUser } = useState<any>(loginUser); 是错误的。
大花括号是用来解构对象的*/

    // console.log(user);

    // 控制菜单栏的 Tab 高亮
    const [activeTabKey, setActiveTabKey] = useState<string>("record");

    /*新功能 编辑用户的个人信息的弹窗*/
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    // 显示弹窗
    const showModal = () => {
        //初始化
        form.setFieldsValue({
            /*这三个是可见的 但说实话我不知道头像的上传那个要怎么搞。。。*/
            userAvatar: loginUser.userAvatar,
            userName: loginUser.userName,
            userProfile: loginUser.userProfile,
        });
        setIsModalVisible(true);
    };


    /**
     * 表格列配置
     */
    const columns: ProColumns<API.User>[] = [
        {
            title: 'id',
            dataIndex: 'id',
            valueType: 'text',
            hideInForm: true,
        },
        // {
        //     title: '账号',
        //     dataIndex: 'userAccount',
        //     valueType: 'text',
        // },
        {
            title: '用户名',
            dataIndex: 'userName',
            valueType: 'text',
        },
        // {
        //     // todo 实现头像的上传式编辑。。
        //     title: '头像',
        //     dataIndex: 'userAvatar',
        //     valueType: 'image',
        //     fieldProps: {
        //         width: 64,
        //     },
        //     hideInSearch: true,
        // },
        {
            title: '头像',
            dataIndex: 'userAvatar',
            valueType: 'image',
            renderFormItem: (_, {type, defaultRender, record, ...rest}, form) => {
                const customRequest = async (options: any) => {
                    const {file, onSuccess, onError} = options;
                    try {
                        //todo biz这里是传枚举的名字还是说。。？
                        const response = await uploadFileUsingPost({biz: 'user_avatar'}, {}, file); // 调用后端方法
                        // console.log(response);
                        const url = response.data; // 假设后端返回的是上传文件的 URL 好像不是 返回的东西有点多我只能说 我草 为什么返回的东西那么离谱
                        //我怎么确定是这个字段呢
                        form.setFieldValue('userAvatar', url); // 更新表单字段
                        onSuccess(response, file); // 通知上传成功
                    } catch (error) {
                        onError(error); // 通知上传失败
                    }
                };

                return (

                    <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                        {form.getFieldValue('userAvatar') && (
                            <div style={{marginRight: 20}}> {/* 右侧间距调整 */}
                                <Image
                                    width={100}
                                    src={form.getFieldValue('userAvatar')} // 显示上传后的图片
                                    alt="Uploaded Image"
                                />
                            </div>
                        )}

                        <Upload
                            customRequest={customRequest} // 使用自定义上传方法
                            listType="picture-card"
                            maxCount={1}
                            showUploadList={false} // 不显示文件列表，只显示图片上传按钮
                            style={{display: 'flex', alignItems: 'center'}} // 使用flex布局
                        >
                            {/* 上传按钮 */}
                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                <PlusOutlined/>
                                <div style={{marginTop: 8}}>上传</div>
                            </div>
                        </Upload>


                    </div>


                );
            },
            hideInSearch: true,
        },
        {
            title: '简介',
            dataIndex: 'userProfile',
            valueType: 'textarea',
        },
        // {
        //     title: '权限',
        //     dataIndex: 'userRole',
        //     valueEnum: {
        //         user: {
        //             text: '用户',
        //         },
        //         admin: {
        //             text: '管理员',
        //         },
        //     },
        // },
        // {
        //     title: '创建时间',
        //     sorter: true,
        //     dataIndex: 'createTime',
        //     valueType: 'dateTime',
        //     hideInSearch: true,
        //     hideInForm: true,
        // },
        // {
        //     title: '更新时间',
        //     sorter: true,
        //     dataIndex: 'updateTime',
        //     valueType: 'dateTime',
        //     hideInSearch: true,
        //     hideInForm: true,
        // },
        // {
        //     title: '操作',
        //     dataIndex: 'option',
        //     valueType: 'option',
        //     render: (_, record) => (
        //         <Space size="middle">
        //             <Typography.Link
        //                 onClick={() => {
        //                     setCurrentRow(record);
        //                     setUpdateModalVisible(true);
        //                 }}
        //             >
        //                 修改
        //             </Typography.Link>
        //             <Typography.Link type="danger" onClick={() => handleDelete(record)}>
        //                 删除
        //             </Typography.Link>
        //         </Space>
        //     ),
        // },
    ];

    // //表格列 Reload
    // const columns: ProColumns<API.User>[] = [
    //     {
    //         title: 'id',
    //         dataIndex: 'id',
    //         valueType: 'text',
    //         hideInForm: true,
    //     },
    //     {
    //         title: '用户名',
    //         dataIndex: 'userName',
    //         valueType: 'text',
    //     },
    //     {
    //         title: '头像',
    //         dataIndex: 'userAvatar',
    //         valueType: 'image',
    //         renderFormItem: (_, { type, defaultRender, record, ...rest }, form) => {
    //             const customRequest = async (options: any) => {
    //                 const { file, onSuccess, onError } = options;
    //                 try {
    //                     //todo biz这里是传枚举的名字还是说。。？
    //                     const response = await uploadFileUsingPost({biz:'user_avatar'}, {}, file); // 调用后端方法
    //                     const url = response.data; // 假设后端返回的是上传文件的 URL
    //                     form.setFieldValue('userAvatar', url); // 更新表单字段
    //                     onSuccess(response, file); // 通知上传成功
    //                 } catch (error) {
    //                     onError(error); // 通知上传失败
    //                 }
    //             };
    //
    //             return (
    //                 <Upload
    //                     customRequest={customRequest} // 使用自定义上传方法
    //                     listType="picture-card"
    //                     maxCount={1}
    //                 >
    //                     {form.getFieldValue('userAvatar') ? (
    //                         <img
    //                             src={form.getFieldValue('userAvatar')}
    //                             alt="avatar"
    //                             style={{ width: '100%' }}
    //                         />
    //                     ) : (
    //                         <div>
    //                             <PlusOutlined />
    //                             <div style={{ marginTop: 8 }}>上传</div>
    //                         </div>
    //                     )}
    //                 </Upload>
    //             );
    //         },
    //         hideInSearch: true,
    //     },
    //     {
    //         title: '简介',
    //         dataIndex: 'userProfile',
    //         valueType: 'textarea',
    //     },
    // ];


    return (
        <div id="userCenterPage" className="max-width-content">
            {/*卧槽 这里的布局。。。有点东西*/}
            <Row gutter={[16, 16]}>
                <Col xs={24} md={6}>
                    <Card style={{textAlign: "center"}}>
                        <Avatar src={loginUser.userAvatar} size={72}/>
                        <div style={{marginBottom: 16}}/>
                        <Card.Meta
                            title={
                                <Title level={4} style={{marginBottom: 0}}>
                                    {loginUser.userName}
                                </Title>
                            }
                            description={
                                <Paragraph type="secondary">{loginUser.userProfile}</Paragraph>
                            }
                        />
                        {/*在这里加一个居中的按钮 是一个铅笔样式的outline的icon 点击会显示一个编辑用户个人信息的弹窗 可以编辑用户的头像 用户昵称 用户简介*/}
                        <Button
                            type="default"
                            shape="circle"
                            icon={<EditOutlined/>}
                            style={{marginTop: 16}}
                            onClick={showModal}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={18}>
                    <Card
                        tabList={[
                            {
                                key: "record",
                                label: "学习日历",
                            },
                            {
                                key: "favorites",
                                label: "收藏和标记",
                            },
                            {
                                key: "mockInterviewResults",
                                label: "模拟面试结果",
                            },
                            {
                                key: "messages",
                                label: "消息中心",
                            },

                        ]}
                        activeTabKey={activeTabKey} // 当前激活的标签页
                        onTabChange={(key: string) => {
                            setActiveTabKey(key); // 更新选中的标签页
                        }}
                    >
                        {activeTabKey === "record" && (
                            <>
                                <CalendarChart/>
                            </>
                        )}
                        {/*todo 这两个组件还没写*/}
                        {activeTabKey === "messages" && (
                            <>
                                <MessageTabs userId={loginUser.id}/>
                            </>
                        )}
                        {activeTabKey === "mockInterviewResults" && (
                            <>
                                <InterViewRecordTab userId={loginUser.id}/>
                            </>
                        )}
                        {activeTabKey === "favorites" && (
                            <>
                                <FavoriteTabs userId={loginUser.id}/>
                            </>
                        )}
                        {/*   实现  选中的时候渲染某个组件 */}
                    </Card>

                </Col>
            </Row>

            {/* 编辑用户信息的弹窗 */}

            {/*我人晕了 这个真的有点麻烦 哦不 太麻烦了有点。。。*/}
            <UserUpdateModal
                visible={isModalVisible}
                columns={columns}
                oldData={loginUser}
                onSubmit={() => {
                    setIsModalVisible(false);


                    // dispatch(setLoginUser(loginUser));

                    // setUser(loginUser);

                    //重新加载卡片组件 重新获取用户的信息
//                     解决思路
//                     更新 Redux 或全局状态
//                     在用户更新信息成功后，刷新 Redux 中的 loginUser 数据（或其他用于存储用户信息的状态）。
// 强制触发组件重新渲染
//                     在 Card 组件依赖的数据发生变化时，触发 useSelector 获取最新的用户数据。
// 异步刷新用户数据
//                     在更新成功的回调中调用 API，重新获取用户的最新数据并更新状态。


                    // setCurrentRow(undefined);
                    // actionRef.current?.reload();
                }}
                onCancel={() => {
                    setIsModalVisible(false);
                }}
            />

        </div>
    );
}
