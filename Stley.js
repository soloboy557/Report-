// Product Database
const PRODUCT_DATABASE = {
    '8859771700136': { name: 'ເອນເມເຊໂຄ 20 ບາດບໍ່ພໍເພຍ', price: 15000 },
    '8850260026447': { name: 'ກິນເມດ 1000 ມລ ສະຫວາ', price: 21000 },
    '6971447953379': { name: 'ເຟັ້ນນາດ ລິ້ນ', price: 12000 },
    '8859580900277': { name: 'ເອນເມເຊດນ໌', price: 36000 },
    '1234567890123': { name: 'ສິ້ນຄ້າຕົວຢ່າງ 1', price: 5000 },
    '9876543210987': { name: 'ສິ້ນຄ້າຕົວຢ່າງ 2', price: 8500 },
};

// Global Variables
let cart = [];
let scanning = false;
let cameraFacing = 'environment'; // 'environment' = back, 'user' = front
let stream = null;

// DOM Elements
const startCameraBtn = document.getElementById('startCameraBtn');
const stopCameraBtn = document.getElementById('stopCameraBtn');
const toggleCameraBtn = document.getElementById('toggleCameraBtn');
const cameraView = document.getElementById('cameraView');
const videoElement = document.getElementById('videoElement');
const manualBarcodeInput = document.getElementById('manualBarcode');
const addManualBtn = document.getElementById('addManualBtn');
const testBarcodesDiv = document.getElementById('testBarcodes');
const cartItemsDiv = document.getElementById('cartItems');
const cartTotalDiv = document.getElementById('cartTotal');
const totalAmountSpan = document.getElementById('totalAmount');
const printBtn = document.getElementById('printBtn');
const clearCartBtn = document.getElementById('clearCartBtn');

// Initialize
function init() {
    setupEventListeners();
    renderTestBarcodes();
    updateCartDisplay();
}

// Setup Event Listeners
function setupEventListeners() {
    startCameraBtn.addEventListener('click', startCamera);
    stopCameraBtn.addEventListener('click', stopCamera);
    toggleCameraBtn.addEventListener('click', toggleCamera);
    addManualBtn.addEventListener('click', addManualBarcode);
    manualBarcodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addManualBarcode();
        }
    });
    printBtn.addEventListener('click', printReceipt);
    clearCartBtn.addEventListener('click', clearCart);
}

// Start Camera
async function startCamera() {
    try {
        const constraints = {
            video: {
                facingMode: cameraFacing,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = stream;
        
        cameraView.style.display = 'block';
        startCameraBtn.style.display = 'none';
        stopCameraBtn.style.display = 'block';
        toggleCameraBtn.style.display = 'block';
        scanning = true;

        // Start barcode detection (simulated - in real app would use a barcode library)
        startBarcodeDetection();
    } catch (error) {
        alert('ບໍ່ສາມາດເປີດກ້ອງໄດ້: ' + error.message);
    }
}

// Stop Camera
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    videoElement.srcObject = null;
    cameraView.style.display = 'none';
    startCameraBtn.style.display = 'block';
    stopCameraBtn.style.display = 'none';
    toggleCameraBtn.style.display = 'none';
    scanning = false;
}

// Toggle Camera
function toggleCamera() {
    cameraFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    stopCamera();
    setTimeout(() => startCamera(), 100);
}

// Barcode Detection (Simulated)
// Note: In a real implementation, you would use a library like QuaggaJS or ZXing
function startBarcodeDetection() {
    // This is a placeholder. Real barcode scanning would use computer vision libraries
    console.log('Barcode detection started. In a real app, use QuaggaJS or ZXing library.');
}

// Add Manual Barcode
function addManualBarcode() {
    const barcode = manualBarcodeInput.value.trim();
    if (barcode) {
        addToCart(barcode);
        manualBarcodeInput.value = '';
    }
}

// Add Product to Cart
function addToCart(barcode) {
    const product = PRODUCT_DATABASE[barcode];
    
    if (!product) {
        alert('ບໍ່ພົບສິ້ນຄ້າດັ່ງກ່າວໃນລະບົບ: ' + barcode);
        return;
    }

    const existingItem = cart.find(item => item.barcode === barcode);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            barcode: barcode,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    playAddSound();
}

// Update Cart Display
function updateCartDisplay() {
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = `
            <div class="empty-cart">
                <p>ຍັງບໍ່ມີສິ້ນຄ້າໃນລາຍການ</p>
                <p class="empty-cart-subtitle">ສະແກນບາໂຄດເພື່ອເພີ່ມສິ້ນຄ້າ</p>
            </div>
        `;
        cartTotalDiv.style.display = 'none';
        printBtn.style.display = 'none';
    } else {
        let html = '';
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            html += `
                <div class="cart-item">
                    <div class="cart-item-header">
                        <div class="cart-item-info">
                            <h3>${item.name}</h3>
                            <p class="cart-item-barcode">${item.barcode}</p>
                            <p class="cart-item-price">${formatPrice(item.price)} ກີບ</p>
                        </div>
                        <button class="delete-btn" onclick="removeItem('${item.barcode}')">🗑️</button>
                    </div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn minus" onclick="updateQuantity('${item.barcode}', ${item.quantity - 1})">−</button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn plus" onclick="updateQuantity('${item.barcode}', ${item.quantity + 1})">+</button>
                        </div>
                        <div class="cart-item-total">
                            <span class="cart-item-total-amount">${formatPrice(itemTotal)} ກີບ</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        cartItemsDiv.innerHTML = html;
        
        const total = calculateTotal();
        totalAmountSpan.textContent = formatPrice(total) + ' ກີບ';
        cartTotalDiv.style.display = 'block';
        printBtn.style.display = 'block';
    }
}

// Update Quantity
function updateQuantity(barcode, newQuantity) {
    if (newQuantity <= 0) {
        removeItem(barcode);
        return;
    }
    
    const item = cart.find(item => item.barcode === barcode);
    if (item) {
        item.quantity = newQuantity;
        updateCartDisplay();
    }
}

// Remove Item
function removeItem(barcode) {
    cart = cart.filter(item => item.barcode !== barcode);
    updateCartDisplay();
}

// Calculate Total
function calculateTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Format Price
function formatPrice(price) {
    return price.toLocaleString('lo-LA');
}

// Clear Cart
function clearCart() {
    if (cart.length > 0 && confirm('ທ່ານຕ້ອງການລ້າງລາຍການທັງໝົດບໍ?')) {
        cart = [];
        updateCartDisplay();
    }
}

// Print Receipt
function printReceipt() {
    const printWindow = window.open('', '', 'width=300,height=600');
    const total = calculateTotal();
    const currentDate = new Date().toLocaleString('lo-LA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    let itemsHTML = '';
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        itemsHTML += `
            <div class="item">
                <div>
                    <div>${item.name}</div>
                    <div style="font-size: 10px; color: #666;">
                        ${item.quantity} x ${formatPrice(item.price)} ກີບ
                    </div>
                </div>
                <div>${formatPrice(itemTotal)}</div>
            </div>
        `;
    });
    
    const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>ໃບເສັດ</title>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: 'Courier New', monospace;
                    width: 280px;
                    margin: 10px;
                    font-size: 12px;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px dashed #000;
                    padding-bottom: 10px;
                    margin-bottom: 10px;
                }
                .items {
                    margin: 10px 0;
                }
                .item {
                    display: flex;
                    justify-content: space-between;
                    margin: 5px 0;
                    padding: 5px 0;
                }
                .total {
                    border-top: 2px dashed #000;
                    padding-top: 10px;
                    margin-top: 10px;
                    font-size: 16px;
                    font-weight: bold;
                }
                .total-line {
                    display: flex;
                    justify-content: space-between;
                }
                .footer {
                    text-align: center;
                    margin-top: 15px;
                    font-size: 10px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>ໃບເສັດການຂາຍ</h2>
                <p>${currentDate}</p>
            </div>
            
            <div class="items">
                ${itemsHTML}
            </div>
            
            <div class="total">
                <div class="total-line">
                    <span>ລວມທັງໝົດ:</span>
                    <span>${formatPrice(total)} ກີບ</span>
                </div>
            </div>
            
            <div class="footer">
                <p>ຂອບໃຈທີ່ໃຊ້ບໍລິການ</p>
                <p>◈◈◈</p>
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

// Render Test Barcodes
function renderTestBarcodes() {
    const barcodes = Object.keys(PRODUCT_DATABASE).slice(0, 4);
    let html = '';
    
    barcodes.forEach(barcode => {
        html += `<button class="barcode-btn" onclick="addToCart('${barcode}')">${barcode}</button>`;
    });
    
    testBarcodesDiv.innerHTML = html;
}

// Play Add Sound (optional)
function playAddSound() {
    // You can add a beep sound here if needed
    // const audio = new Audio('beep.mp3');
    // audio.play();
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', init);