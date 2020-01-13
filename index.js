#!/usr/bin/env node
const fs = require('fs')
const request = require('request');
const program = require('commander')
const chalk = require('chalk')

program
    .option('-s --url [value]', 'swagger-doc访问地址')
    .option('-d --dir [value]', '生成的api文件存放的文件地址')
    .option('-p --prefix [value]', '过滤的接口前缀')
    .parse(process.argv)
if (!program.url || program.url === true) {
    console.log(chalk.red('  请输入swagger请求地址！\n'))
    return
} else if (!program.dir || program.dir === true) {
    console.log(chalk.red('  请输入生成文件的存放地址！\n'))
    return
}
const requestUrl = program.url
const dir = program.dir
// 筛选接口，我司后端约定开头为/api
const filterPrefix = program.prefix === (true || undefined) ? '' : program.prefix
const reg = filterPrefix ? new RegExp("\\b(?!(" + filterPrefix + "))\\w+\\b", "g") : /\b\w+\b/g
// 根据具体业务导入封装的请求方法
let code = `import { request } from '../config/http'\n`

request(requestUrl, function (err, res, body) {
    if (err) {
        console.log(chalk.red('  请求出错\n'));
        console.log(err);
        return
    } else if (res.statusCode === 200) {
        let data = JSON.parse(body).paths
        let url = Object.keys(data)
        url.forEach(item => {
            if (filterPrefix && item.indexOf('/' + filterPrefix) !== 0) return;
            // item例如：/api/log/listGroupResultByKey/{esIndex}/{key}
            let origin_url = item
            let method = Object.keys(data[item])[0]
            let params = '{ data = null, params = null'

            //将{key}换成${key}，再组装成模板字符串
            origin_url = origin_url.replace(/\{/g, '${')
            origin_url = '`'.concat(origin_url).concat('`')

            // 生成hasUrlParams：[esIndex, key]
            let c_url = item
            let hasUrlParams = []
            if (item.includes('{')) {
                let i = item.indexOf('{')
                // c_url：截取为/api/log/listGroupResultByKey，作为之后匹配生成驼峰函数名
                c_url = item.substring(0, i)
                hasUrlParams = item.match(/\{\w+\}/g)
            }

            // 根据hasUrlParams进行参数拼接， 如：最终为{ data=null, params=null, esIndex, key }
            hasUrlParams.forEach(el => {
                let str = el.match(/\b\w+\b/g)[0]
                params = params.concat(', ' + str)
            })
            params = params.concat(' }')

            // 匹配生成驼峰式名字
            let fncName = c_url.match(reg).map((i, index) => {
                if (index) {
                    return i = i.charAt(0).toUpperCase().concat(i.substring(1))
                } else {
                    return i
                }
            }).join('')

            // 生成注释与方法
            let s = `\n//${data[item][method].tags[0]}，${data[item][method].summary}\n` +
                `export const ${fncName} = (${params} = {}) => request({ url: ${origin_url}, data, params, method: '${method}' })\n`
            code += s
        })
        fs.writeFile(dir, code, (err) => {
            if (!err) {
                console.log(chalk.hex('#00EE76').bold('  创建成功！\n'))
            } else {
                console.log(chalk.red(err));
            }
        })
    }
})
