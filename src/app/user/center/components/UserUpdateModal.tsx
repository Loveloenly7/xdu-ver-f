import {ProColumns, ProTable} from '@ant-design/pro-components';
import {message, Modal} from 'antd';
import React, {useRef} from 'react';
import {getUserByIdUsingGet, getUserVoByIdUsingGet, updateUserUsingPost} from "@/api/userController";
import {setLoginUser} from "@/stores/loginUser";


//来看看这个要怎么写才会比较合理。。？

interface Props {
    oldData?: API.User;
    visible: boolean;
    columns: ProColumns<API.User>[];
    onSubmit: (values: API.UserUpdateRequest) => void;
    onCancel: () => void;
}


/**
 * 更新方法
 *
 * @param fields
 */
const handleUpdate = async (fields: API.UserUpdateRequest) => {
    // const hide = message.loading('正在更新你的个人信息');
    try {
        await updateUserUsingPost(fields);
        // hide();
        message.success('个人信息更新成功');
        return true;
    } catch (error: any) {
        // hide();
        message.error('个人信息更新失败，' + error.message);
        return false;
    }
};

/**
 * 更新弹窗
 * @param props
 * @constructor
 */
const UserUpdateModal: React.FC<Props> = (props) => {
    const {oldData, visible, columns, onSubmit, onCancel} = props;

    if (!oldData) {
        return <></>;
    }

    // const formRef = useRef();

    return (
        <Modal
            destroyOnClose
            title={'更新你的个人信息'}
            open={visible}
            footer={null}
            onCancel={() => {
                onCancel?.();
            }}
        >
            <ProTable
                type="form"
                columns={columns}
                // formRef={formRef} // 绑定表单实例
                form={{
                    initialValues: oldData,
                }}
                // onSubmit={(values) => {
                //     console.log('提交时的表单字段和值:', values); // 打印表单提交时的字段和值
                // }}
                //todo bug 提交表单的时候不知道为什么变成了头像这个对象 而不是URL。。。。？
                onSubmit={async (values: API.UserUpdateRequest) => {


                    // console.log('所有字段和值:', formRef.current.getFieldsValue());
                    const success = await handleUpdate({
                        ...values,
                        id: oldData.id as any,
                        //可能更新不了。。
                        userAvatar: values.userAvatar
                    });
                    if (success) {

                        //todo 更改全局状态实现了刷新 但是。。。


                        // const response = await getUserVoByIdUsingGet({id: oldData.id as any});
                        // const dispatch = useDispatch();
                        //
                        // dispatch(setLoginUser(response.data));
                        // //as any..?
                        //todo 这里去改了Redux 直接改状态 总之是就是为了全局刷新的实现

                        //实现你大爷 还是没实现 算了老子放弃了。。。
                        // setUser(response.data);

                        onSubmit?.(values);


                    }
                }}
            />
        </Modal>
    );
};
export default UserUpdateModal;
