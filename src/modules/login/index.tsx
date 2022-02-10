import { useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import { Button, Checkbox, Form, Input, TreeSelect } from 'antd'
import { UserOutlined, SecurityScanOutlined, LockOutlined } from '@ant-design/icons'
import { commonStore, appStore, loadingStore } from 'src/stores'
import { $api, $consts } from 'src/plugins'
import { uuid, getBaseURL, getFirstValidTree } from 'src/utils/tools'
import docCookies from 'src/utils/docCookies'
import MD5 from 'md5'
import 'src/styles/modules/login/login.less'

const verifyCodeApi = 'Common/VerificationCode/Number'

const Login = (props: any) => {
  const [treeData, setTreeData] = useState([])
  const [formState, setFormState] = useState({
    orgId: '',
    username: '',
    password: '',
    verifyCode: '',
  })
  const [verify, setVerify] = useState<any>({
    orgId: undefined,
    username: undefined,
    password: undefined,
    verifyCode: undefined
  })
  const [verifyRandomCode, setVerifyRandomCode] = useState(uuid())
  const [loginError, setLoginError] = useState('')

  // 获取组织树
  useEffect(() => {
    const recurseData = (data: any) => {
      data.forEach((item: any) => {
        const { Node = item, Children } = item
        item.title = `${Node.NAME}(${Node.CODE})`
        item.key = Node.ID
        item.value = Node.ID
        item.children = Children
        Children && Children.length && recurseData(Children)
      })
    }

    $api['common/getOrgList']().then((res: any) => {
      if (res && res.Data) {
        commonStore.setOrgInfo(res)
        recurseData(res.Data)
        setTreeData(res.Data)
      }
    })
  }, [])

  // 获取组织默认选中
  useEffect(() => {
    if (!formState.orgId) {
      const cookieOrgId = docCookies.getItem($consts['STORAGE/COOKIE_ORG_ID'])
      cookieOrgId && setFormState({ ...formState, orgId: cookieOrgId })
    }
  }, [formState])

  const handleTreeSelect = (val: string) => {
    // 这边用 cookie 存，因为退出登录时候，会清空所有的 localStorage 存储数据
    docCookies.setItem($consts['STORAGE/COOKIE_ORG_ID'], val)
    setFormState({ ...formState, orgId: val })
  }

  const formFieldInvalid = () => {
    const { orgId, username, password, verifyCode } = formState
    setVerify({
      orgId: orgId ? undefined : 'error',
      username: username ? undefined : 'error',
      password: password ? undefined : 'error',
      verifyCode: verifyCode ? undefined : 'error'
    })
    return !orgId || !username || !password || !verifyCode
  }

  const toLogin = () => {
    const { orgId, username, password } = formState
    $api['common/login']({
      Parameter1: username,
      Parameter2: MD5(password),
      Parameter4: orgId
    }).then((res: any) => {
      if (res) {
        commonStore.setLoginData(res, { username, password: MD5(password), orgId })
        $api['common/getAllEnum']()
        // 载入第一项菜单页
        const firstMenu = appStore.activeMenu?.ID || getFirstValidTree(res.Menus[0])
        props.history.push(`/main/${firstMenu}`)
      }
    })
  }

  const preLogin = () => {
    const { orgId, username, password, verifyCode } = formState
    $api['common/getToken']({
      orgId,
      username,
      password: MD5(password),
      random: verifyRandomCode,
      verificationCode: verifyCode
    }).then((res: any) => {
      if (res && !res.error) {
        commonStore.setAccessToken(res)
        toLogin()
        return
      }
      setLoginError(res.error_description)
    }).catch((err: any) => {
      setLoginError(err.message)
    })
  }

  const handleLogin = () => {
    !formFieldInvalid() && preLogin()
  }

  const { orgId, username, password, verifyCode } = verify
  return (
    <div className='login-page'>
      <div className='login-page__login'>
        <p className='login-page__login-cn'>OPTiWeb纸机智能控制系统</p>
        <div className='login-page__login-box'>
          <Form className='login-page__login-form'>
            <Form.Item validateStatus={orgId}>
              <TreeSelect
                treeDefaultExpandAll
                treeData={treeData}
                value={formState.orgId}
                onChange={handleTreeSelect}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                placeholder='请选择组织'
                className='login-page__login-tree'
              />
            </Form.Item>
            <Form.Item validateStatus={username}>
              <Input
                onChange={evt => setFormState({ ...formState, username: evt.target.value })}
                onPressEnter={handleLogin}
                prefix={<UserOutlined style={{ fontSize: 18 }} />}
                placeholder="请输入用户名"
                className='login-page__login-input'
              />
            </Form.Item>
            <Form.Item validateStatus={password}>
              <Input
                type='password'
                onChange={evt => setFormState({ ...formState, password: evt.target.value })}
                onPressEnter={handleLogin}
                prefix={<LockOutlined style={{ fontSize: 18 }} />}
                placeholder='请输入密码'
                className='login-page__login-input'
              />
            </Form.Item>
            <div className='login-page__login-pwd'>
              <Checkbox defaultChecked>记住密码</Checkbox>
              {/* <a>忘记密码？</a> */}
            </div>
            <Form.Item validateStatus={verifyCode}>
              <Input
                onChange={evt => setFormState({ ...formState, verifyCode: evt.target.value })}
                onPressEnter={handleLogin}
                prefix={<SecurityScanOutlined style={{ fontSize: 18 }} />}
                suffix={
                  <img
                    key={verifyRandomCode}
                    src={`${getBaseURL(verifyCodeApi)}/${verifyCodeApi}?random=${verifyRandomCode}`}
                    alt='验证码'
                    onClick={() => setVerifyRandomCode(uuid())}
                    className='login-page__login-verifyCode'
                  />
                }
                placeholder='验证码'
                className='login-page__login-input'
              />
            </Form.Item>
          </Form>
        </div>
        <Button
          type='primary'
          className='login-page__login-btn'
          disabled={loadingStore.visible}
          loading={loadingStore.visible}
          onClick={handleLogin}
        >登录</Button>
        {loginError ? <div className='login-page__login-error'>{loginError}</div> : null}
      </div>
      <div className='login-page__copyright'>
        <p>Copyright ©2020-2021 厦门奥普拓自控科技有限公司 optiems <a href="https://beian.miit.gov.cn/" rel="noopener noreferrer" target="_blank" style={{ color: 'inherit' }}>闽ICP备17001301号-5</a></p>
      </div>
    </div>
  )
}

export default observer(Login)