const fs = require('fs');
const path = require('path');

class ImageCombiner {
    constructor(inputDir = './CreepColor', outputPath = './combined_image.html') {
        this.inputDir = inputDir;
        this.outputPath = outputPath;
    }

    // 获取文件夹中的所有图片文件
    getImageFiles() {
        try {
            if (!fs.existsSync(this.inputDir)) {
                console.log(`创建 ${this.inputDir} 文件夹...`);
                fs.mkdirSync(this.inputDir, { recursive: true });
                return [];
            }
            
            const files = fs.readdirSync(this.inputDir);
            return files.filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'].includes(ext);
            });
        } catch (error) {
            console.error('读取文件夹失败:', error.message);
            return [];
        }
    }

    // 生成 HTML 页面用于图片合成
    generateCombinerHTML() {
        const imageFiles = this.getImageFiles();

        const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Creep Designer - Screeps 爬虫皮肤设计器</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .controls {
            margin-bottom: 20px;
            text-align: center;
        }
        button {
            background: #007cba;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin: 5px;
            font-size: 16px;
        }
        button:hover {
            background: #005a87;
        }
        .canvas-container {
            text-align: center;
            margin: 20px 0;
        }
        canvas {
            border: 2px solid #ddd;
            border-radius: 4px;
            max-width: 100%;
        }
        .upload-area {
            border: 2px dashed #007cba;
            border-radius: 8px;
            padding: 40px;
            text-align: center;
            margin: 20px 0;
            background: #f8f9fa;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .upload-area:hover {
            border-color: #005a87;
            background: #e9ecef;
        }
        .upload-area.dragover {
            border-color: #28a745;
            background: #d4edda;
        }
        .upload-text p {
            margin: 5px 0;
            color: #666;
        }
        .image-preview {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
            margin: 20px 0;
            max-height: 200px;
            overflow-y: auto;
        }
        .preview-item {
            position: relative;
            text-align: center;
            padding: 5px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: #f9f9f9;
        }
        .preview-item img {
            max-width: 80px;
            max-height: 80px;
            object-fit: contain;
        }
        .preview-item .remove-btn {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 12px;
            cursor: pointer;
        }
        .status {
            margin: 10px 0;
            padding: 10px;
            border-radius: 4px;
            text-align: center;
        }
        .status.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .status.info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
        .status.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Creep Designer</h1>
        
        <div class="status info">
            <p>Screeps 爬虫皮肤设计器 - 预览皮肤组合效果</p>
        </div>

        <div class="upload-area" id="uploadArea">
            <input type="file" id="fileInput" multiple accept="image/*" style="display: none;">
            <div class="upload-text">
                <p>拖拽皮肤图片到这里或点击选择文件</p>
                <p>支持多选：PNG, JPG, JPEG, GIF, BMP, WEBP</p>
                ${imageFiles.length > 0 ? `<p>检测到 CreepColor 文件夹中有 ${imageFiles.length} 个皮肤文件</p>` : ''}
            </div>
        </div>

        <div class="controls">
            <button onclick="combineImages()">🎨 设计爬虫</button>
            <button onclick="downloadResult()">💾 下载设计</button>
            <button onclick="resetCanvas()">🔄 重置画布</button>
        </div>

        <div class="canvas-container">
            <canvas id="canvas"></canvas>
            <p id="canvasInfo">等待上传图片...</p>
        </div>

        <div class="image-preview" id="imagePreview">
            <!-- 上传的图片预览将显示在这里 -->
        </div>

        <div id="status" class="status" style="display: none;"></div>
    </div>

    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const canvasInfo = document.getElementById('canvasInfo');
        let combinedImageData = null;
        let uploadedImages = []; // 存储上传的图片

        // 文件上传处理
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');
        const imagePreview = document.getElementById('imagePreview');

        // 点击上传区域
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // 文件选择处理
        fileInput.addEventListener('change', handleFiles);

        // 拖拽处理
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files);
            handleFiles({ target: { files } });
        });

        // 处理文件
        function handleFiles(event) {
            const files = Array.from(event.target.files);
            const imageFiles = files.filter(file => file.type.startsWith('image/'));
            
            if (imageFiles.length === 0) {
                showStatus('请选择图片文件', 'error');
                return;
            }
            
            showStatus(\`正在加载 \${imageFiles.length} 个图片文件...\`, 'info');
            
            imageFiles.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        uploadedImages.push({
                            name: file.name,
                            image: img,
                            dataUrl: e.target.result
                        });
                        updateImagePreview();
                    };
                    img.onerror = () => {
                        showStatus(\`图片加载失败: \${file.name}\`, 'error');
                    };
                    img.src = e.target.result;
                };
                reader.onerror = () => {
                    showStatus(\`文件读取失败: \${file.name}\`, 'error');
                };
                reader.readAsDataURL(file);
            });
        }

        // 更新图片预览
        function updateImagePreview() {
            imagePreview.innerHTML = '';
            uploadedImages.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = 'preview-item';
                div.innerHTML = \`
                    <img src="\${item.dataUrl}" alt="\${item.name}">
                    <button class="remove-btn" onclick="removeImage(\${index})">×</button>
                    <p style="font-size: 12px; margin: 2px 0;">\${item.name}</p>
                \`;
                imagePreview.appendChild(div);
            });
            
            if (uploadedImages.length > 0) {
                showStatus(\`已加载 \${uploadedImages.length} 张图片，可以开始合成\`, 'success');
            }
        }

        // 移除图片
        function removeImage(index) {
            uploadedImages.splice(index, 1);
            updateImagePreview();
            if (uploadedImages.length === 0) {
                showStatus('请上传图片文件', 'info');
                canvasInfo.textContent = '等待上传图片...';
            } else {
                showStatus(\`已加载 \${uploadedImages.length} 张图片，可以开始合成\`, 'success');
            }
        }

        // 显示状态信息
        function showStatus(message, type = 'info') {
            const statusDiv = document.getElementById('status');
            statusDiv.textContent = message;
            statusDiv.className = \`status \${type}\`;
            statusDiv.style.display = 'block';
        }

        // 合成图片 - 直接重叠，保持原图清晰度
        async function combineImages() {
            if (uploadedImages.length === 0) {
                showStatus('请先上传图片文件', 'error');
                return;
            }

            showStatus('正在合成图片...', 'info');

            try {
                // 设置固定输出尺寸 256x256
                const outputSize = 256;
                canvas.width = outputSize;
                canvas.height = outputSize;
                
                // 更新画布信息
                canvasInfo.textContent = \`输出尺寸：\${outputSize} × \${outputSize} 像素\`;

                // 清除画布（透明背景）
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // 直接依次绘制所有图片，自然重叠
                for (let i = 0; i < uploadedImages.length; i++) {
                    const img = uploadedImages[i].image;
                    
                    // 直接绘制图片到画布，缩放到256x256
                    ctx.drawImage(img, 0, 0, outputSize, outputSize);
                    
                    showStatus(\`已叠加 \${i + 1}/\${uploadedImages.length} 张图片\`, 'info');
                }

                // 保存结果
                combinedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                showStatus(\`合成完成！共叠加了 \${uploadedImages.length} 张图片\`, 'success');

            } catch (error) {
                showStatus(\`合成失败: \${error.message}\`, 'error');
                console.error('合成失败:', error);
            }
        }

        // 下载结果
        function downloadResult() {
            if (!combinedImageData) {
                showStatus('请先进行图片合成', 'error');
                return;
            }

            canvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'creep_design.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showStatus('图片已下载', 'success');
            });
        }

        // 重置画布
        function resetCanvas() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            combinedImageData = null;
            uploadedImages = [];
            imagePreview.innerHTML = '';
            canvasInfo.textContent = '等待上传图片...';
            showStatus('画布已重置', 'info');
        }

        // 页面加载完成后的初始化
        window.onload = function() {
            showStatus('欢迎使用 Creep Designer！请上传皮肤图片开始设计', 'info');
        };
    </script>
</body>
</html>`;

        fs.writeFileSync(this.outputPath, htmlContent);
        console.log(`HTML 合成器已生成: ${this.outputPath}`);
        console.log('请用浏览器打开此文件进行图片合成');
    }

    // 列出当前图片
    listImages() {
        const imageFiles = this.getImageFiles();
        console.log(`\n=== CreepColor 文件夹图片列表 ===`);
        if (imageFiles.length === 0) {
            console.log('没有找到图片文件');
            console.log('支持的格式：PNG, JPG, JPEG, GIF, BMP, WEBP');
        } else {
            imageFiles.forEach((file, index) => {
                console.log(`${index + 1}. ${file}`);
            });
        }
        console.log(`总计: ${imageFiles.length} 个文件\n`);
    }
}

// 命令行使用
function main() {
    const combiner = new ImageCombiner();
    
    const args = process.argv.slice(2);
    const command = args[0] || 'generate';
    
    switch (command) {
        case 'list':
            combiner.listImages();
            break;
        case 'generate':
        default:
            combiner.generateCombinerHTML();
            break;
    }
}

// 如果直接运行此文件
if (require.main === module) {
    main();
}

module.exports = ImageCombiner;