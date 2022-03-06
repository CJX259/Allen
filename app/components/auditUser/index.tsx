import { Role, Status, User } from '@prisma/client';
import { Button, Input, message, Modal, Radio, Space, Spin, Table, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { useActionData, useLoaderData, useSubmit, useTransition } from 'remix';
import { SearchOutlined } from '@ant-design/icons';
import { AuditUserLoaderData, ERROR } from '~/types';
import { ColumnsType } from 'antd/lib/table';
import { AUDIT_STATUS_MAP, ROLE_MAP, USER_PAGESIZE } from '~/const';
import { formatFormData } from '~/utils/client.index';
import InfoModalContent from './InfoModalContent';
import RejectModalContent from './RejectModalContent';
import axios from 'axios';

export default function AuditUserComp() {
  const loaderData: AuditUserLoaderData = useLoaderData();
  const actionData: ERROR | undefined = useActionData();
  const { searchKey, data, page, total, status: loaderStatus } = loaderData;
  const [infoVisible, setInfoVisible] = useState(false);
  const [rejectVisible, setRejectVisible] = useState(false);
  // 当前审核的用户
  const [curIndex, setCurIndex] = useState(null as any);
  const [reason, setReason] = useState('');
  const [key, setSearchKey] = useState(searchKey || '');
  const [status, setStatus] = useState(loaderStatus || Status.ALL as any);
  const [resLoad, setResLoad] = useState(false);
  const [rejLoad, setRejLoad] = useState(false);
  const submit = useSubmit();
  const transition = useTransition();
  // 表格列
  const columns: ColumnsType<any> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (v) => v,
    },
    {
      title: '昵称',
      dataIndex: 'name',
      key: 'name',
      render: (v) => v,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (v: Role) => {
        return <Tag color={v === Role.ANCHOR ? 'green' : 'red'}>{ROLE_MAP[v]}</Tag>;
      },
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: Status) => {
        let color = 'orange';
        if (v === Status.REJECT) {
          color = 'red';
        }
        if (v === Status.RESOLVE) {
          color = 'green';
        }
        return <Tag color={color}>{AUDIT_STATUS_MAP[v]}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 350,
      render: (value: User, record: User, index: number) => {
        if (!data) {
          return null;
        }
        return (
          <Space>
            <Button onClick={() => {
              setInfoVisible(true);
              setCurIndex(index);
            }}>查看信息</Button>
            <Button
              loading={resLoad}
              type='primary'
              disabled={data[index].status === Status.RESOLVE}
              onClick={() => changeStatus('' + data[index]?.id, Status.RESOLVE)}>
              上架用户
            </Button>
            <Button
              loading={rejLoad}
              danger
              type='primary'
              onClick={() => {
                setRejectVisible(true);
                setCurIndex(index);
              }}
              disabled={data[index].status === Status.REJECT}
            >
              下架用户
            </Button>
          </Space>
        );
      },
    },
  ];


  // 状态改变后重新搜索
  useEffect(() => {
    sendSearch();
  }, [status]);
  // 显示操作响应结果
  useEffect(() => {
    actionData?.msg ? message.error(actionData.msg) : '';
  }, [actionData]);

  // 发起搜索请求
  function sendSearch(curPage?: number) {
    // 重置分页器
    const params = {
      searchKey: key,
      status,
    } as any;
    if (curPage) {
      params.page = curPage;
    };
    const temp = formatFormData(params);
    submit(temp, {
      method: 'get',
    });
  };
  // 修改用户审核状态
  async function changeStatus(id: string, userStatus: Status, reason?: string) {
    const params = {
      id,
      status: userStatus,
    } as any;
    if (reason) {
      params.reason = reason;
      setRejLoad(true);
    } else {
      setResLoad(true);
    }
    const res = await axios.post('/auditUser?_data=routes/auditUser', {
      ...params,
    });
    // 提交完后重置reason
    setReason('');
    reason ? setRejLoad(false) : setResLoad(false);

    if (res.data.id) {
      message.success('更新成功');
      // 重新刷新页面
      submit({
        ...(loaderData as any),
      }, {
        method: 'get',
      });
    } else {
      message.error('更新失败，请联系开发人员');
    }
  }
  return (
    <Spin spinning={transition.state !== 'idle'}>
      <div className="audit-wrapper">
        {/* 搜索框区域 */}
        <div className='search-input'>
          <Input
            value={key}
            placeholder='可通过id与昵称搜索'
            onKeyPress={(e) => e.key === 'Enter' && sendSearch() }
            onChange={(e) => setSearchKey(e.target.value)}
          />
          <Button
            type='primary'
            onClick={() => sendSearch()}
            icon={<SearchOutlined />}
          >搜索</Button>
        </div>
        <div className="search-status">
          <span>审核状态：</span>
          <Radio.Group onChange={(e) => setStatus(e.target.value)} value={status}>
            <Radio value={Status.ALL}>全部</Radio>
            <Radio value={Status.PENDING}>待审核</Radio>
            <Radio value={Status.REJECT}>已下架</Radio>
            <Radio value={Status.RESOLVE}>已上架</Radio>
          </Radio.Group>
        </div>
        {/* 审核表格部分，尝试使用嵌套路由渲染审核框 */}
        <div className="audit-table">
          <Table
            columns={columns}
            pagination={{
              total,
              current: page,
              pageSize: USER_PAGESIZE,
              onChange: sendSearch,
            }}
            dataSource={data as any}
          />
        </div>
      </div>
      <Modal
        title='用户信息'
        visible={infoVisible}
        onCancel={() => setInfoVisible(false)}
        footer={null}
      >
        <InfoModalContent data={data ? data[curIndex] : undefined} />
      </Modal>;
      <Modal
        title='下架用户'
        visible={rejectVisible}
        onCancel={() => {
          // 重置reason
          setReason('');
          setRejectVisible(false);
        }}
        cancelText='取消'
        maskClosable={false}
        onOk={() => {
          if (!data) {
            return;
          }
          changeStatus('' + data[curIndex].id, Status.REJECT, reason);
          setRejectVisible(false);
        }}
      >
        <RejectModalContent reason={reason} setReason={setReason} />
      </Modal>;
    </Spin>
  );
};
