import { message, Upload } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { UploadChangeParam } from 'antd/lib/upload';
import React, { useState } from 'react';

export default function UploadAvatarComp(props: any) {
  const { onChange, setFileObj } = props;
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传头像</div>
    </div>
  );
  function handleChange(info:UploadChangeParam<any>) {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      const random = `${Math.floor(Math.random() * 1000000)}`;
      onChange(`${random}.${info.file.name}`);
      setFileObj(info.file.originFileObj);
      // uploadImage(`${random}.${info.file.name}`, info.file.originFileObj);
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, (imageUrl: string) => {
        setLoading(false);
        setImageUrl(imageUrl);
      },
      );
    }
  }
  return (
    <Upload
      // name="avatar"
      listType="picture-card"
      className="avatar-uploader"
      showUploadList={false}
      // 检验图片规格
      beforeUpload={beforeUpload}
      onChange={handleChange}
    >
      {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
    </Upload>
  );
};


/**
 * 将图片的数据读取出来，转换为一个url供预览
 *
 * @param {*} img
 * @param {*} callback
 */
function getBase64(img: any, callback: any) {
  const reader = new FileReader();
  // 绑定事件。读取完后就执行回调，传入图片临时url
  reader.addEventListener('load', () => callback(reader.result));
  // 解析图片，生成临时url
  reader.readAsDataURL(img);
}


/**
 * 校验上传文件的合规性
 *
 * @param {*} file
 * @return {*}
 */
function beforeUpload(file: any) {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJpgOrPng && isLt2M;
}
