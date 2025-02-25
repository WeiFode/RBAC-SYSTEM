const selectedIcons = [
    'openmoji:chart-increasing',
    'openmoji:code-editor',
    'noto:newspaper',
    'noto:books',
    'ic:outline-heat-pump',
    'noto:briefcase',
    'noto:satellite-antenna',
    'noto:satellite',
    'noto:airplane',
    'noto:rocket',
    'emojione:house-with-garden',
    'emojione:bust-in-silhouette',
    'emojione:gear',
    'emojione:page-facing-up',
    'emojione:bar-chart',
    'emojione:envelope',
    'emojione:bell',
    'emojione:file-folder',
    'emojione:card-file-box',
    'emojione:shield',
    'emojione:shopping-cart',
    'emojione:credit-card',
    'emojione:cloud',
    'emojione:locked',
    'emojione:star',
    'emojione:money-bag',
    'emojione:package',
    'emojione:memo',
    'emojione:clipboard',
    'emojione:round-pushpin',
    'emojione:bookmark-tabs',
    'emojione:world-map',
    'emojione:alarm-clock',
    'emojione:calendar',
    'emojione:mobile-phone',
    'emojione:desktop-computer',
    'emojione:printer',
    'emojione:camera',
    'emojione:video-camera',
    'emojione:microphone',
    'emojione:headphone',
    'emojione:magnifying-glass-tilted-left',
    'emojione:key',
    'emojione:wrench',
    'emojione:hammer-and-wrench',
    'emojione:nut-and-bolt',
    'emojione:chart-increasing',
    'emojione:chart-decreasing',
    'emojione:spiral-notepad',
    'emojione:scroll',
    'emojione:books',
    'emojione:open-book',
    'emojione:graduation-cap',
    'emojione:briefcase',
    'emojione:satellite-antenna',
    'emojione:satellite',
    'emojione:airplane',
    'emojione:rocket',
    'emojione:hourglass-with-flowing-sand',
    'emojione:stopwatch',
    'emojione:crystal-ball',
    'emojione:light-bulb',
    'emojione:battery',
    'emojione:telescope',
    'emojione:microscope',
    'fluent-emoji:busts-in-silhouette', // 多个客户
    'fluent-emoji:bust-in-silhouette', // 单个客户
    'fluent-emoji:handshake', // 合作/成交
    'fluent-emoji:money-bag', // 资金/收入
    'fluent-emoji:chart-increasing', // 增长趋势
    'fluent-emoji:trophy', // 成就/目标
    'fluent-emoji:memo', // 记录/备忘
    'fluent-emoji:calendar', // 日历/计划
    'fluent-emoji:briefcase', // 商务/工作
    // CRM核心功能图标
    'material-symbols:contact-page-outline', // 联系人
    'material-symbols:campaign-outline', // 市场营销
    'material-symbols:assignment-outline', // 商机
    'material-symbols:description-outline', // 合同
    'material-symbols:analytics-outline', // 数据分析
    'material-symbols:task-outline', // 任务
    'material-symbols:calendar-month-outline', // 日程
    'material-symbols:notifications-outline', // 提醒

    // 客户管理相关图标
    'material-symbols:group-outline', // 客户群组
    'material-symbols:star-outline', // 客户评级
    'material-symbols:label-outline', // 客户标签
    'material-symbols:category-outline', // 客户分类
    'material-symbols:attach-money', // 销售机会

    // 文档管理图标
    'material-symbols:folder-outline', // 文件夹
    'material-symbols:upload-file-outline', // 上传文件
    'material-symbols:file-present-outline', // 文档
    'material-symbols:picture-as-pdf-outline', // PDF文件

    // 沟通工具图标
    'material-symbols:mail-outline', // 邮件
    'material-symbols:chat-outline', // 消息
    'material-symbols:event-outline', // 会议

    // 系统功能图标
    'material-symbols:settings-outline', // 设置
    'material-symbols:dashboard-outline', // 仪表盘
    'material-symbols:admin-panel-settings-outline', // 管理员
    'material-symbols:search', // 搜索

    // 数据展示图标
    'material-symbols:pie-chart-outline', // 饼图
    'material-symbols:trending-up', // 趋势图

    // 状态图标
    'material-symbols:check-circle-outline', // 成功/完成
    'material-symbols:error-outline', // 错误/警告
    'material-symbols:info-outline', // 信息
    'material-symbols:pending-outline', // 待处理

    // 其他常用图标
    'material-symbols:add-circle-outline', // 新增
    'material-symbols:edit-outline', // 编辑
    'material-symbols:delete-outline', // 删除
    'material-symbols:refresh', // 刷新
    'material-symbols:more-vert', // 更多操作
];

export function searchIcons(query: string): string[] {
    return selectedIcons.filter(name =>
        name.toLowerCase().includes(query.toLowerCase())
    );
}

export function getIcon(name: string): string | null {
    return selectedIcons.includes(name) ? name : null;
}