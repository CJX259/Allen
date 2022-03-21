import React, { useEffect, useState } from 'react';
import { Table, Input, InputNumber, Form, Space, message, Spin, Popconfirm, Button, Modal } from 'antd';
import { useActionData, useLoaderData, useSubmit, useTransition } from 'remix';
import { ERROR, SUCCESS, TagManagerLoader } from '~/types';
import { Tag } from '@prisma/client';
import { USER_PAGESIZE } from '~/const';

function EditableCell(params: { inputType: any; editing: any; dataIndex: any; title: any; children: any; }) {
  const { inputType, editing, dataIndex, title, children } = params;
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
  return (
    <td key={dataIndex}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `${title}不能为空!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

export default function TagManagerComp() {
  const submit = useSubmit();
  const actionData: ERROR & SUCCESS | undefined = useActionData();
  const loaderData: TagManagerLoader = useLoaderData();
  const { data = [], page, total } = loaderData || {};
  const transition = useTransition();
  console.log('loaderData', loaderData);
  const [form] = Form.useForm();
  // 修改的行key，这里用key而不用id是因为string是方便初始化，以及后续submit也只能传string(key与id值相同，只是key为string，id为number，table必须要我有key，加rowKey也不管用)
  const [editingKey, setEditingKey] = useState<string>('');
  const [createVisible, setCreateVisible] = useState(false);
  const [createData, setCreateData] = useState<{name?: string}>({});
  const isEditing = (record: { key: string; }) => record.key === editingKey;

  useEffect(() => {
    if (actionData?.msg) {
      message.error(actionData.msg);
      return;
    } else if (actionData?.success) {
      message.success('操作成功');
    }
    if (transition.type === 'actionReload') {
      setEditingKey('');
      setCreateVisible(false);
      setCreateData({});
    }
  }, [actionData]);

  const edit = (record: { key: string } & Tag) => {
    form.setFieldsValue({
      ...record,
    });
    setEditingKey(record.key);
  };
  const delTag = (record: { key: string; }) => {
    // key是string版的id
    submit({ id: record.key }, { method: 'delete' });
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (id: number) => {
    try {
      // 修改过的form内容
      const row = await form.validateFields();
      // 找到原来数据所在
      const index = data.findIndex((item) => id === item.id);

      // 获取原数据信息
      const item = data[index];
      // 发起update请求
      submit({ ...item, ...row }, { method: 'post' });
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
      message.error('参数校验错误');
    }
  };

  const create = async () => {
    if (!createData.name) {
      message.error('参数校验错误');
      return;
    }
    console.log('createData', createData);
    submit({ ...createData }, { method: 'put' });
  };

  const changePage = (page: number, pageSize: number) => {
    submit({ page: page.toString() }, { method: 'get' });
  };

  const columns = [
    {
      title: '标签ID',
      dataIndex: 'id',
      width: '33%',
      editable: false,
    },
    {
      title: '标签名',
      dataIndex: 'name',
      width: '33%',
      editable: true,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_: any, record: { key: any; } & Tag) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Button
              type='link'
              onClick={() => save(record.id)}
              style={{
                marginRight: 8,
              }}
            >
              保存
            </Button>
            <a onClick={cancel}>取消</a>
          </span>
        ) : (
          <Space>
            <Button type='link' disabled={editingKey !== ''} onClick={() => edit(record)}>
              修改
            </Button>
            <Popconfirm
              okText='确定'
              cancelText='取消'
              disabled={editingKey !== ''}
              onConfirm={() => delTag(record)} title="确定删除该标签吗？"
            >
              <Button
                type='link'
              >
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record: { key: string; }) => ({
        record,
        inputType: 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });
  return (
    <Spin spinning={transition.state !== 'idle'}>
      <Button type='primary' onClick={() => setCreateVisible(true)}>新增标签</Button>
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          style={{ marginTop: 20 }}
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{
            showSizeChanger: false,
            current: +page || 1,
            total,
            pageSize: USER_PAGESIZE,
            onChange: changePage,
          }}
        />
      </Form>
      <Modal
        onCancel={() => setCreateVisible(false)}
        onOk={create}
        title='新增标签'
        visible={createVisible}
        okText='新增'
        cancelText='取消'
      >
        <Space>
          <label htmlFor="name">标签名:</label>
          {/* 后续属性多了可以抽成一个组件 */}
          <Input value={createData.name} onChange={(e) => setCreateData({ name: e.target.value })} />
        </Space>
      </Modal>
    </Spin>
  );
};
