## 插件的安装
> **使用request模块进行请求**
```
npm i auto-create-swagger -D
```

## 配置语法
```
package.json
...
"scripts": {
    "swagger":"swagger -s swagger-doc-url -d store-address -p prefix"
  },

```
## 运行
```
npm run swagger

```
## 生成
```
import { request } from '../config/http'

//微信登录控制层，获取微信配置
export const wechatconfigGetWeChatConfig = ({ data=null, params=null } = {}) => request({ url:`/api/wechatconfig/getWeChatConfig`, data, params, method:'get' })

//微信登录控制层，修改微信配置
export const wechatconfigUpdateWeChatConfig = ({ data=null, params=null, id, appid, secret } = {}) => request({ url:`/api/wechatconfig/updateWeChatConfig/${id}/${appid}/${secret}`, data, params, method:'get' })

//微信登录控制层，绑定用户信息
export const wechatscanBindUserInfo = ({ data=null, params=null } = {}) => request({ url:`/api/wechatscan/bindUserInfo`, data, params, method:'post' })
...

```

## 使用说明

```
函数参数采用对象解构方式，参照上面例子

无参数时：   getuser()

参数跟URL后：wechatconfigUpdateWeChatConfig({ id, appid, secret })

GET params：wechatconfigGetWeChatConfig({ params })

POST data： wechatscanBindUserInfo({ data })
```
## 参数说明
| 参数 | 说明 |
|------|------------|
| swagger-doc-url  | (**必填**) swagger文档地址，如 ：**http://xxx.com/v2/api-docs**      |
| store-address  | (**必填**) 生成的api文件存放地址，注意路径开头为：**'./'**， 即为相对于项目的存放路径， 如：**./src/api.js**      |
| prefix  | (**选填**)  过滤接口前缀，如： **api**，则非/api开头的接口将被过滤，默认无筛选      |
| import { request } from '../config/http'  | 导出本地封装请求接口，根据实际业务修改 |


> **特别说明：**../config/http.js文件

```

例如：
import axios from 'axios'

const http=axios.create({
    baseURL, 
    withCredentials:true,
    timeout: 60000,
    isRetryRequest: false,
    headers: {'Content-Type': 'application/json;charset=UTF-8'}
})
...
...
// 统一请求
export function request({ url, method, data, params }){
        return http({
            url,
            data,
            params,
            method
        })
}
```


