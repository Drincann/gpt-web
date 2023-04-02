import { Button, Input, InputNumber, Modal, Table } from "antd";
import { useState } from "react";
import { expire, listUsers, recharge, UserDuck } from "../api";

import './AdminView.less'

export const AdminView: React.FC<{}> = () => {
  const [dataSource, setDataSource] = useState<UserDuck[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [rechargeAmount, setRechargeAmount] = useState<number>(0)
  const [rechargeTime, setRechargeTime] = useState<number>(0)
  const [openRechargeAmountModal, setOpenRechargeAmountModal] = useState<boolean>(false)
  const [openRechargeTimeModal, setOpenRechargeTimeModal] = useState<boolean>(false)
  const [phone, setPhone] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  const reload = () => {
    setLoading(true)
    listUsers(search).then(res => {
      setDataSource(res.data.list.map((item: any) => ({ key: item.id, ...item })))
    }).finally(() => setLoading(false))
  }

  return (
    <div id="admin-root">
      <Modal open={openRechargeAmountModal} footer={null} closable={false}>
        <div style={{ flexFlow: 'row nowrap', justifyContent: 'space-between', display: 'flex', }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <InputNumber value={rechargeAmount} onChange={(v) => setRechargeAmount(v ?? 0)} />
            <div style={{ marginLeft: '.5rem' }}>条</div>
          </div>
          <div>
            <Button
              type="primary"
              loading={loading}
              onClick={() => {
                setLoading(true)
                recharge(phone, rechargeAmount).finally(() => {
                  setLoading(false)
                  setOpenRechargeAmountModal(false)
                  reload()
                })
              }}
            >充值</Button>
            <Button
              style={{
                marginLeft: '.5rem'
              }}
              onClick={() => {
                setOpenRechargeAmountModal(false)
              }}
            > 关闭 </Button>
          </div>
        </div>
      </Modal>

      <Modal open={openRechargeTimeModal} footer={null} closable={false}>
        <div style={{ flexFlow: 'row nowrap', justifyContent: 'space-between', display: 'flex', }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <InputNumber value={rechargeTime} onChange={(v) => setRechargeTime(v ?? 0)} />
            <div style={{ marginLeft: '.5rem' }}>天</div>
          </div>
          <div>
            <Button
              type="primary"
              loading={loading}
              onClick={() => {
                setLoading(true)
                expire(phone, rechargeTime).finally(() => {
                  setLoading(false)
                  setOpenRechargeTimeModal(false)
                  reload()
                })
              }}
            >充值</Button>
            <Button
              style={{
                marginLeft: '.5rem'
              }}
              onClick={() => {
                setOpenRechargeTimeModal(false)
              }}
            > 关闭 </Button>
          </div>

        </div>
      </Modal>
      <Input.Search enterButton size="large" placeholder="搜索手机号" loading={loading}
        style={{
          marginBottom: '1rem'
        }}
        value={search}
        onChange={e => setSearch(e.target.value)}
        onSearch={() => { reload() }} />
      <Table className="admin-root__table"
        dataSource={dataSource}
        loading={loading}
        pagination={false}
        columns={
          [{
            title: '手机',
            key: 'phone',
            dataIndex: 'phone'
          }, {
            title: '剩余额度',
            key: 'chat_balance',
            dataIndex: 'chat_balance',
            render: text => <span
              style={{
                backgroundColor: Number(text) > 3 ? 'skyblue' : 'none',
                color: Number(text) > 3 ? 'black' : 'none',
                fontWeight: Number(text) > 3 ? 'bold' : 'none',
              }}
            >{text} 条</span>
          }, {
            title: '过期时间',
            key: 'expire',
            dataIndex: 'expire',
            render: stmp => <span
              style={{
                backgroundColor: new Date(stmp).getTime() > Date.now() ? 'skyblue' : 'none',
                color: new Date(stmp).getTime() > Date.now() ? 'black' : 'none',
                fontWeight: new Date(stmp).getTime() > Date.now() ? 'bold' : 'none',
              }}
            >{new Date(stmp).toLocaleString()}</span>
          }, {
            title: '操作',
            key: 'action',
            render: (_, record) => (<>
              <Button style={{ marginRight: '.5rem' }}
                onClick={() => {
                  setPhone(record.phone)
                  setOpenRechargeAmountModal(true)
                }}>充值对话额度</Button>

              <Button
                onClick={() => {
                  setPhone(record.phone)
                  setOpenRechargeTimeModal(true)
                }}>充值时间</Button>
            </>
            )
          }]} />
    </div>
  )
}