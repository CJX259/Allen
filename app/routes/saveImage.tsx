import { ActionFunction, LoaderFunction } from 'remix';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
import React, { useState } from 'react';
import { UploadChangeParam } from 'antd/lib/upload';
import Cos from 'cos-js-sdk-v5';
import config from '../../cloudConfig.json';

export const action: ActionFunction = () => {
  return null;
};

export const loader: LoaderFunction = () => {
  return null;
};

function getBase64(img: any, callback: any) {
  const reader = new FileReader();
  // 绑定事件。读取完后就执行回调，传入图片临时url
  reader.addEventListener('load', () => callback(reader.result));
  // 解析图片，生成临时url
  reader.readAsDataURL(img);
}

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

export default function Avatar() {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );
  function handleChange(info:UploadChangeParam<any>) {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      const random = `${Math.floor(Math.random() * 1000000)}`;
      uploadImage(`${random}.${info.file.name}`, info.file.originFileObj);
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
      name="avatar"
      listType="picture-card"
      className="avatar-uploader"
      showUploadList={false}
      // action="/saveImage"
      // 检验图片规格
      beforeUpload={beforeUpload}
      onChange={handleChange}
    >
      {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
    </Upload>
  );
}

function uploadImage(filename: string, file: any) {
  console.log('uploadImage');
  const cos = new Cos({
    SecretId: config.SecretId,
    SecretKey: config.SecretKey,
  });
  cos.putObject({
    Bucket: 'sls-cloudfunction-ap-guangzhou-code-1301421790', /* 必须 */
    Region: 'ap-guangzhou', /* 存储桶所在地域，必须字段 */
    Key: 'Allen-img/' + filename, /* 必须 */
    StorageClass: 'STANDARD',
    Body: file, // 上传文件对象
    onProgress: function(progressData) {
      console.log(JSON.stringify(progressData));
    },
  }, function(err, data) {
    console.log(err || data);
  });
};
