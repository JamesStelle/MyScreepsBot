/**
 * Screeps World Texture URL 自动化处理脚本
 * 用于获取和修改Steam市场上的texture图片URL，获得高分辨率预览
 */

class ScreepsTextureHelper {
    constructor() {
        this.baseMarketUrl = 'https://steamcommunity.com/market/listings/464350/';
        this.availableSizes = ['800x800'];
        this.defaultSize = '800x800';
    }

    /**
     * 从Steam市场页面URL提取texture ID
     * @param {string} marketUrl - Steam市场页面URL
     * @returns {string} texture ID
     */
    extractTextureId(marketUrl) {
        const match = marketUrl.match(/\/([^\/]+)$/);
        return match ? decodeURIComponent(match[1]) : null;
    }

    /**
     * 获取Steam市场页面的HTML内容
     * @param {string} marketUrl - Steam市场页面URL
     * @returns {Promise<string>} HTML内容
     */
    async fetchMarketPage(marketUrl) {
        try {
            // 尝试直接获取
            const response = await fetch(marketUrl, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            console.error('直接获取失败，尝试代理方式:', error);
            
            // 如果直接获取失败，尝试使用代理
            try {
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(marketUrl)}`;
                const proxyResponse = await fetch(proxyUrl);
                
                if (!proxyResponse.ok) {
                    throw new Error(`代理请求失败! status: ${proxyResponse.status}`);
                }
                
                const data = await proxyResponse.json();
                return data.contents;
            } catch (proxyError) {
                console.error('代理获取也失败:', proxyError);
                throw new Error('无法获取页面内容，可能是CORS限制。请尝试手动获取图片URL。');
            }
        }
    }

    /**
     * 从HTML中提取图片URL
     * @param {string} html - 页面HTML内容
     * @returns {string|null} 图片URL
     */
    extractImageUrl(html) {
        // 多种匹配模式，按优先级排序
        const patterns = [
            // 匹配market_listing_largeimage类的img标签
            /<img[^>]+class="[^"]*market_listing_largeimage[^"]*"[^>]+src="([^"]+)"/gi,
            // 匹配包含economy/image的img标签
            /<img[^>]+src="(https:\/\/community\.(?:akamai\.)?steamstatic\.com\/economy\/image\/[^"]+)"/gi,
            // 直接匹配URL模式
            /https:\/\/community\.(?:akamai\.)?steamstatic\.com\/economy\/image\/[^"'\s]+\/\d+x\d+[^"'\s]*/g,
            /https:\/\/community\.(?:akamai\.)?steamstatic\.com\/economy\/image\/[^"'\s\/]+/g
        ];

        for (const pattern of patterns) {
            const matches = [...html.matchAll(pattern)];
            if (matches.length > 0) {
                // 获取第一个匹配结果
                let url = matches[0][1] || matches[0][0];
                
                // 清理URL，移除可能的HTML实体编码
                url = url.replace(/&amp;/g, '&');
                
                // 如果URL不包含尺寸参数，添加默认尺寸
                if (!url.match(/\/\d+x\d+/)) {
                    url += '/330x192';
                }
                
                console.log('提取到图片URL:', url);
                return url;
            }
        }
        
        console.log('未找到图片URL，HTML内容长度:', html.length);
        return null;
    }

    /**
     * 修改图片URL的尺寸参数
     * @param {string} imageUrl - 原始图片URL
     * @param {string} newSize - 新的尺寸 (如 '512x512')
     * @returns {string} 修改后的URL
     */
    modifyImageSize(imageUrl, newSize = this.defaultSize) {
        // 替换URL中的尺寸参数
        const sizePattern = /\/(\d+x\d+)(\?|$)/;
        const match = imageUrl.match(sizePattern);
        
        if (match) {
            return imageUrl.replace(sizePattern, `/${newSize}$2`);
        }
        
        // 如果没有找到尺寸参数，尝试在URL末尾添加
        const hasQuery = imageUrl.includes('?');
        const separator = hasQuery ? '&' : '?';
        return `${imageUrl}${separator}size=${newSize}`;
    }

    /**
     * 生成多个尺寸的图片URL
     * @param {string} baseImageUrl - 基础图片URL
     * @returns {Object} 包含不同尺寸URL的对象
     */
    generateMultipleSizes(baseImageUrl) {
        const urls = {};
        this.availableSizes.forEach(size => {
            urls[size] = this.modifyImageSize(baseImageUrl, size);
        });
        return urls;
    }

    /**
     * 检查图片URL是否有效
     * @param {string} imageUrl - 图片URL
     * @returns {Promise<boolean>} 是否有效
     */
    async checkImageExists(imageUrl) {
        try {
            const response = await fetch(imageUrl, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * 获取最佳可用的图片尺寸
     * @param {string} baseImageUrl - 基础图片URL
     * @returns {Promise<string>} 最佳尺寸的URL
     */
    async getBestAvailableSize(baseImageUrl) {
        // 从大到小检查可用尺寸
        const sizesToCheck = [...this.availableSizes].reverse();
        
        for (const size of sizesToCheck) {
            const url = this.modifyImageSize(baseImageUrl, size);
            const exists = await this.checkImageExists(url);
            if (exists) {
                return url;
            }
        }
        
        // 如果都不可用，返回默认尺寸
        return this.modifyImageSize(baseImageUrl, this.defaultSize);
    }

    /**
     * 直接处理图片URL（手动获取的图片链接）
     * @param {string} imageUrl - 直接的图片URL
     * @param {string} preferredSize - 首选尺寸
     * @returns {Promise<Object>} 包含各种信息的结果对象
     */
    async processDirectImageUrl(imageUrl, preferredSize = this.defaultSize) {
        try {
            console.log('正在处理图片URL:', imageUrl);
            
            // 从URL中提取texture信息
            const textureId = this.extractTextureIdFromImageUrl(imageUrl);
            
            // 生成不同尺寸的URL
            const allSizes = this.generateMultipleSizes(imageUrl);
            
            // 获取首选尺寸的URL
            const preferredUrl = this.modifyImageSize(imageUrl, preferredSize);
            
            // 获取最佳可用尺寸
            const bestUrl = await this.getBestAvailableSize(imageUrl);
            
            return {
                success: true,
                textureId: textureId,
                originalUrl: imageUrl,
                preferredUrl: preferredUrl,
                bestAvailableUrl: bestUrl,
                allSizes: allSizes,
                preferredSize: preferredSize
            };
            
        } catch (error) {
            console.error('处理失败:', error);
            return {
                success: false,
                error: error.message,
                imageUrl: imageUrl
            };
        }
    }

    /**
     * 从图片URL中提取texture ID
     * @param {string} imageUrl - 图片URL
     * @returns {string} texture ID
     */
    extractTextureIdFromImageUrl(imageUrl) {
        // 尝试从URL路径中提取有用信息
        const match = imageUrl.match(/\/([^\/]+)\/\d+x\d+/);
        if (match) {
            return match[1].substring(0, 20) + '...'; // 截取前20个字符避免太长
        }
        return 'Unknown_Texture';
    }

    /**
     * 主要方法：从Steam市场URL获取高分辨率texture图片
     * @param {string} marketUrl - Steam市场页面URL
     * @param {string} preferredSize - 首选尺寸
     * @returns {Promise<Object>} 包含各种信息的结果对象
     */
    async getHighResTexture(marketUrl, preferredSize = this.defaultSize) {
        try {
            console.log('正在处理:', marketUrl);
            
            // 1. 获取页面内容
            const html = await this.fetchMarketPage(marketUrl);
            
            // 2. 提取图片URL
            const originalImageUrl = this.extractImageUrl(html);
            if (!originalImageUrl) {
                throw new Error('未找到图片URL');
            }
            
            console.log('找到原始图片URL:', originalImageUrl);
            
            // 3. 生成不同尺寸的URL
            const allSizes = this.generateMultipleSizes(originalImageUrl);
            
            // 4. 获取首选尺寸的URL
            const preferredUrl = this.modifyImageSize(originalImageUrl, preferredSize);
            
            // 5. 获取最佳可用尺寸
            const bestUrl = await this.getBestAvailableSize(originalImageUrl);
            
            return {
                success: true,
                textureId: this.extractTextureId(marketUrl),
                originalUrl: originalImageUrl,
                preferredUrl: preferredUrl,
                bestAvailableUrl: bestUrl,
                allSizes: allSizes,
                preferredSize: preferredSize
            };
            
        } catch (error) {
            console.error('处理失败:', error);
            return {
                success: false,
                error: error.message,
                marketUrl: marketUrl
            };
        }
    }

    /**
     * 批量处理多个texture URL
     * @param {string[]} marketUrls - Steam市场页面URL数组
     * @param {string} preferredSize - 首选尺寸
     * @returns {Promise<Object[]>} 结果数组
     */
    async batchProcess(marketUrls, preferredSize = this.defaultSize) {
        const results = [];
        
        for (const url of marketUrls) {
            const result = await this.getHighResTexture(url, preferredSize);
            results.push(result);
            
            // 添加延迟避免请求过于频繁
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        return results;
    }

    /**
     * 创建下载链接元素
     * @param {string} imageUrl - 图片URL
     * @param {string} filename - 文件名
     * @returns {HTMLElement} 下载链接元素
     */
    createDownloadLink(imageUrl, filename) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = filename;
        link.textContent = `下载 ${filename}`;
        link.style.margin = '5px';
        link.style.padding = '5px 10px';
        link.style.backgroundColor = '#4CAF50';
        link.style.color = 'white';
        link.style.textDecoration = 'none';
        link.style.borderRadius = '3px';
        return link;
    }

    /**
     * 在页面上显示结果
     * @param {Object} result - getHighResTexture的结果
     */
    displayResult(result) {
        if (!result.success) {
            console.error('显示失败的结果:', result.error);
            return;
        }

        const container = document.createElement('div');
        container.style.border = '1px solid #ccc';
        container.style.margin = '10px';
        container.style.padding = '10px';
        container.style.backgroundColor = '#f9f9f9';

        const title = document.createElement('h3');
        title.textContent = `Texture: ${result.textureId}`;
        container.appendChild(title);

        // 显示最佳图片
        const img = document.createElement('img');
        img.src = result.bestAvailableUrl;
        img.style.maxWidth = '300px';
        img.style.maxHeight = '300px';
        img.style.border = '1px solid #ddd';
        container.appendChild(img);

        // 添加下载链接
        const linksContainer = document.createElement('div');
        linksContainer.style.marginTop = '10px';
        
        Object.entries(result.allSizes).forEach(([size, url]) => {
            const link = this.createDownloadLink(url, `${result.textureId}_${size}.png`);
            linksContainer.appendChild(link);
        });

        container.appendChild(linksContainer);
        document.body.appendChild(container);
    }
}

// 使用示例和工具函数
const textureHelper = new ScreepsTextureHelper();

/**
 * 快速处理单个texture URL的便捷函数
 * @param {string} marketUrl - Steam市场URL
 * @param {string} size - 首选尺寸
 */
async function getTexture(marketUrl, size = '800x800') {
    const result = await textureHelper.getHighResTexture(marketUrl, size);
    console.log('处理结果:', result);
    return result;
}

/**
 * 快速处理图片URL的便捷函数（手动获取的图片链接）
 * @param {string} imageUrl - 图片URL
 * @param {string} size - 首选尺寸
 */
async function processImageUrl(imageUrl, size = '800x800') {
    const result = await textureHelper.processDirectImageUrl(imageUrl, size);
    console.log('处理结果:', result);
    return result;
}

/**
 * 在浏览器控制台中使用的快速命令
 */
window.ScreepsTextureHelper = ScreepsTextureHelper;
window.textureHelper = textureHelper;
window.getTexture = getTexture;
window.processImageUrl = processImageUrl;

// 导出模块（如果在Node.js环境中使用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScreepsTextureHelper;
}

console.log('Screeps Texture Helper 已加载！');
console.log('使用方法:');
console.log('1. getTexture("https://steamcommunity.com/market/listings/464350/F-00090%3AWI%3AB")');
console.log('2. textureHelper.getHighResTexture(url, "1024x1024")');
console.log('3. processImageUrl("https://community.steamstatic.com/economy/image/.../330x192") - 直接处理图片URL');