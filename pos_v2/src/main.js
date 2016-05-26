function parseTags(inputs) {
    var result = [];

    inputs.forEach(function(input) {
        var item = {};
        var split = input.split('-', 2);

        item.barcode = split[0];
        item.count = parseInt(split[1]) || 1;

        result.push(item);
    })

    return result;
}

function mergeItems(originItems) {
    var mergeItems = [];

    originItems.forEach(function(tag) {
        var existItem = mergeItems.find(function(item) {
            return item.barcode === tag.barcode;
        });

        if (!existItem) {
            existItem = Object.assign({}, tag);
            mergeItems.push(existItem);
        } else {
            existItem.count += tag.count;
        }
    })

    return mergeItems;
}

function buildOriginCartItems(mergedItems, allItems) {
    return mergedItems.map(function(mergedItem){
        var detailItem = allItems.find(function(item){
            return item.barcode === mergedItem.barcode;
        });

        return Object.assign({}, detailItem, mergedItem);
    })
}

function calculateItemFreeCount(barcodes, item) {
    var existBarcode = barcodes.find(function(barcode){
        return barcode === item.barcode;
    });

    if (existBarcode) {
        return parseInt(item.count/3);
    } else {
        return 0;
    }
}

function calculateFreeCount(mergeItems, promotions) {
    var promoteBarcodes = promotions.find(function(item) {
        return item.type = 'BUY_TWO_GET_ONE_FREE';
    });

    return mergeItems.map(function(item) {
        var resultItem = Object.assign( {
            freeCount: calculateItemFreeCount(promoteBarcodes.barcodes, item)
        }, item);

        return resultItem;
    })
}

function calculateSubTotal(items) {
    return items.map(function(item) {
        return Object.assign( {
            subTotal: item.count*item.price,
            actualSubTotal: (item.count-item.freeCount)*item.price,
        }, item);
    });
}

function calculateTotal(cartItems) {
    var total = 0;

    cartItems.forEach(function(item) {
        total += item.actualSubTotal;
    });

    return total;
}

function calculateSaveMoney(cartItems) {
    var saveMoney = 0;

    cartItems.forEach(function(item) {
        saveMoney += item.freeCount*item.price;
    });

    return saveMoney;
}

function getfreeItems(cartItems) {
    var result = cartItems.filter(function(item){
        return item.freeCount > 0;
    });

    return result;
}

function buildDateString() {
    var dateDigitToString = function (num) {
        return num < 10 ? '0' + num : num;
    };

    var currentDate = new Date(),
        year = dateDigitToString(currentDate.getFullYear()),
        month = dateDigitToString(currentDate.getMonth() + 1),
        date = dateDigitToString(currentDate.getDate()),
        hour = dateDigitToString(currentDate.getHours()),
        minute = dateDigitToString(currentDate.getMinutes()),
        second = dateDigitToString(currentDate.getSeconds()),
        formattedDateString = year + '年' + month + '月' + date + '日 ' + hour + ':' + minute + ':' + second;

    return formattedDateString;
}

function buildReceiptBody(cartItems) {
    var result = "";

    cartItems.forEach(function (item) {
        result += `名称：${item.name}，数量：${item.count}${item.unit}，单价：${item.price.toFixed(2)}(元)，` +
            `小计：${item.actualSubTotal.toFixed(2)}(元)\n`;
    });
    result += "----------------------\n";

    return result;
}

function buildPromoteString(freeItems) {
    var result = "";

    result += '挥泪赠送商品：\n';
    freeItems.forEach(function (item) {
        result += `名称：${item.name}，数量：${item.freeCount}${item.unit}\n`;
    });

    return result;
}

function buildTotalString(total, saveMoney) {
    var result = '----------------------\n' +
        '总计：' + total.toFixed(2) + '(元)\n' +
        '节省：' + saveMoney.toFixed(2) + '(元)\n' +
        "**********************";

    return result;
}

function buildReceiptString(cartItems, freeItems, total, saveMoney) {
    var receiptString = '***<没钱赚商店>购物清单***\n' +
        '打印时间：' + buildDateString() + '\n' +
        '----------------------\n';

    receiptString += buildReceiptBody(cartItems);
    receiptString += buildPromoteString(freeItems);
    receiptString += buildTotalString(total, saveMoney);

    console.log(receiptString);
}

function printInventory(inputs) {
    var allItems = loadAllItems();
    var promotions = loadPromotions();

    var originItems = parseTags(inputs);
    var mergedItems = mergeItems(originItems);
    var originCartItems = buildOriginCartItems(mergedItems, allItems);
    var cartPromoteItems = calculateFreeCount(originCartItems, promotions);
    var finalCartItems = calculateSubTotal(cartPromoteItems);
    var total = calculateTotal(finalCartItems);
    var saveMoney = calculateSaveMoney(finalCartItems);
    var freeItems = getfreeItems(finalCartItems);

    buildReceiptString(finalCartItems, freeItems, total, saveMoney);
}
