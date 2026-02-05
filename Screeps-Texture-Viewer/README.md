# Screeps-Texture-Viewer

🎨 获取Steam市场上Screeps:World texture的800x800高分辨率图片的简单工具

## 功能特点

- ✅ 支持多种图片URL格式 (330x192, 360fx360f, 等)
- ✅ 一键转换为800x800高分辨率
- ✅ 实时预览转换结果
- ✅ 直接下载或复制高分辨率URL
- ✅ 纯客户端处理，无需网络请求
- ✅ 简洁友好的用户界面

## 快速开始

### 使用方法

1. **打开工具** - 双击 `Texture.html` 文件
2. **获取图片URL** - 从Steam市场页面获取texture图片URL
3. **粘贴转换** - 粘贴URL并点击转换
4. **预览下载** - 查看800x800高分辨率效果并下载

### 获取图片URL的两种方式

**方法1: 右键获取 (简单)**
- 右键点击Steam页面的texture缩略图
- 选择"复制图片地址"
- 直接粘贴使用

**方法2: 开发者工具 (高质量)**
- 按F12打开开发者工具
- 搜索 `image_src` 标签
- 复制href中的URL (通常是360x360高质量版本)

## 文件说明

- **`Texture.html`** - 主要工具，直接打开使用
- **`guide.html`** - 详细使用指南
- **`Texture.js`** - 核心JavaScript脚本
- **`使用指南.md`** - 中文使用说明

## 支持的URL格式

工具自动识别并支持以下所有格式：

```
✅ https://community.steamstatic.com/economy/image/.../360fx360f
✅ https://community.steamstatic.com/economy/image/.../330x192
✅ https://community.steamstatic.com/economy/image/.../256x256
✅ 其他任何尺寸格式
```

## 使用示例

### 输入URL示例
```
https://community.steamstatic.com/economy/image/rtOnLXYUD-u65eusOk-nO4hCpUCJo2NbTFgyVoRu1dTMUtrgwQcK00wcDPtguX6_6cpCjkj5KCLzRKX8j0q3Yji5umhEwn0Cjhgkm40MUW3kqczfGShQbGJ-wsYuY_ybvHXycjiV/360fx360f
```

### 输出结果
```
https://community.steamstatic.com/economy/image/rtOnLXYUD-u65eusOk-nO4hCpUCJo2NbTFgyVoRu1dTMUtrgwQcK00wcDPtguX6_6cpCjkj5KCLzRKX8j0q3Yji5umhEwn0Cjhgkm40MUW3kqczfGShQbGJ-wsYuY_ybvHXycjiV/800x800
```

## 技术特点

- **纯客户端** - 无需服务器，避免CORS问题
- **智能解析** - 自动识别多种URL格式
- **即时转换** - 字符串处理，转换速度极快
- **兼容性好** - 支持所有现代浏览器

## 为什么选择800x800？

经过测试发现，Screeps texture的最大原生分辨率就是800x800，这是能获得的最佳质量。

## 许可证

MIT License - 自由使用和修改

---

**开始使用**: 直接打开 `Texture.html` 文件即可！