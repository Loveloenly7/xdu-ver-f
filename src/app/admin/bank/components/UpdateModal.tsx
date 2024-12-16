
import { updateQuestionBankUsingPost } from '@/api/questionBankController';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import {Button, message, Modal, Upload} from 'antd';
import React, {useState} from 'react';
import {uploadFileUsingPost} from "@/api/fileController";
import {UploadOutlined} from "@ant-design/icons";

interface Props {
  oldData?: API.QuestionBank;
  visible: boolean;
  columns: ProColumns<API.QuestionBank>[];
  onSubmit: (values: API.QuestionBankAddRequest) => void;
  onCancel: () => void;
}

/**
 * 更新节点
 *
 * @param fields
 */
const handleUpdate = async (fields: API.QuestionBankUpdateRequest) => {
  const hide = message.loading('正在更新');
  try {
    await updateQuestionBankUsingPost(fields);
    hide();
    message.success('更新成功');
    return true;
  } catch (error: any) {
    hide();
    message.error('更新失败，' + error.message);
    return false;
  }
};

/**
 * 更新弹窗
 * @param props
 * @constructor
 */
const UpdateModal: React.FC<Props> = (props) => {
  const { oldData, visible, columns, onSubmit, onCancel } = props;


  //？不是说组件不能用吗
  const [imageUrl, setImageUrl] = useState<string | undefined>(oldData?.picture);

  if (!oldData) {
    return <></>;
  }

  // todo 自定义上传方法，调用 uploadFileUsingPost
  const customRequest = async ({ file, onSuccess, onError }: any) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      // 调用后端上传接口
      const response = await uploadFileUsingPost({}, {}, file);
      if (response?.data) {
        onSuccess(response.data);
        setImageUrl(response.data); // 上传成功后保存图片 URL
      } else {
        onError(new Error('上传失败'));
      }
    } catch (error) {
      onError(error);
      message.error('上传失败');
    }
  };


  return (
    <Modal
      destroyOnClose
      title={'更新'}
      open={visible}
      footer={null}
      onCancel={() => {
        onCancel?.();
      }}
    >
      <ProTable
        type="form"
        columns={columns}
        form={{
          initialValues: oldData,
        }}
        onSubmit={async (values: API.QuestionBankAddRequest) => {
          const success = await handleUpdate({
            ...values,
            id: oldData.id as any,
            // todo 玄学
            //总之是要更新
            picture: values.picture
          });
          if (success) {
            onSubmit?.(values);
          }
        }}
      />
    </Modal>
  );
};
export default UpdateModal;
