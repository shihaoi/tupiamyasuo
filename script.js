document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const previewContainer = document.getElementById('previewContainer');
    const originalImage = document.getElementById('originalImage');
    const compressedImage = document.getElementById('compressedImage');
    const originalSize = document.getElementById('originalSize');
    const compressedSize = document.getElementById('compressedSize');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    const downloadBtn = document.getElementById('downloadBtn');

    let currentFile = null;

    // 上传区域点击事件
    uploadArea.addEventListener('click', () => {
        imageInput.click();
    });

    // 拖拽功能
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#0071e3';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#c7c7c7';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#c7c7c7';
        const file = e.dataTransfer.files[0];
        if (file && file.type.match('image.*')) {
            processImage(file);
        }
    });

    // 文件选择事件
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            processImage(file);
        }
    });

    // 质量滑块事件
    qualitySlider.addEventListener('input', (e) => {
        const quality = e.target.value / 100;
        qualityValue.textContent = `${Math.round(quality * 100)}%`;
        if (currentFile) {
            // 添加防抖，避免频繁压缩
            clearTimeout(window.compressionTimeout);
            window.compressionTimeout = setTimeout(() => {
                compressImage(currentFile, quality);
            }, 300);
        }
    });

    // 处理图片
    function processImage(file) {
        currentFile = file;
        previewContainer.style.display = 'block';
        
        // 显示原始图片
        const reader = new FileReader();
        reader.onload = (e) => {
            originalImage.src = e.target.result;
            originalSize.textContent = formatFileSize(file.size);
            compressImage(file, qualitySlider.value / 100);
        };
        reader.readAsDataURL(file);
    }

    // 压缩图片
    function compressImage(file, quality) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // 创建canvas
                const canvas = document.createElement('canvas');
                
                // 计算压缩后的尺寸
                let width = img.width;
                let height = img.height;
                
                // 如果图片尺寸过大，按比例缩小
                const MAX_WIDTH = 1920;
                const MAX_HEIGHT = 1080;
                
                if (width > MAX_WIDTH) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                }
                if (height > MAX_HEIGHT) {
                    width = Math.round((width * MAX_HEIGHT) / height);
                    height = MAX_HEIGHT;
                }
                
                // 设置canvas尺寸
                canvas.width = width;
                canvas.height = height;
                
                // 获取context并设置图像平滑
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                // 绘制图像
                ctx.drawImage(img, 0, 0, width, height);
                
                // 转换为blob，使用指定的质量
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            compressedImage.src = URL.createObjectURL(blob);
                            compressedSize.textContent = formatFileSize(blob.size);
                            
                            // 更新下载按钮
                            downloadBtn.onclick = () => {
                                const link = document.createElement('a');
                                link.href = URL.createObjectURL(blob);
                                link.download = `compressed_${quality*100}%_${file.name}`;
                                link.click();
                            };
                        }
                    },
                    file.type,
                    quality
                );
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}); 