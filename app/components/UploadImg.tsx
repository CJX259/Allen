import { message, Popover, Upload } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { UploadChangeParam } from 'antd/lib/upload';
import React, { useEffect, useState } from 'react';
import { getBase64, uploadImage } from '~/utils/client.index';


// 通过FormItem传入onChange，外部传入设置file数据的函数即可，提交时需要在父级传递file数据去COS
export default function UploadImg(props: any) {
  const { onChange, imgUrl } = props;
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(imgUrl || '');
  // props传递的url变化
  useEffect(() => {
    setImageUrl(imgUrl);
  }, [imgUrl]);
  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传头像</div>
    </div>
  );
  const hoverImage = (
    <Popover
      content={
        <img src={imageUrl} alt="avatar" style={{ width: 250, height: 250 }} />
      }
      style={{ width: 250, height: 250 }}
      title="预览图">
      <img src={imageUrl} alt="avatar" style={{ width: '100%', height: '100%' }} />
    </Popover>
  );
  function handleChange(info:UploadChangeParam<any>) {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      console.log('file done');
      const random = `${Math.floor(Math.random() * 1000000)}`;
      onChange(`${random}.${info.file.name}`);
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
      // name="avatar"
      listType="picture-card"
      className="avatar-uploader"
      showUploadList={false}
      // action到一个不作处理的url
      action={'/queryUser'}
      // 检验图片规格
      beforeUpload={beforeUpload}
      onChange={handleChange}
    >
      {
        imageUrl ?
        hoverImage :
        uploadButton
      }
    </Upload>
  );
};


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
