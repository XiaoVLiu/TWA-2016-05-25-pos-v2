function parseTags(inputs) {
    var tags = [];
    inputs.forEach(function(item) {
        var tag = {};
        var split = item.split('-', 2);
        tag.barcode = split[0];
        tag.count = parseInt(split[1]) || 1;

        tags.push(tag);
    })
    return tags;
}

function mergeItem(tags, allItems) {
    var mergeItems = [];
    tags.forEach(function(tag) {
        var existItem = mergeItems.find(function(item) {
            return item.barcode === tag.barcode;
        });

        if (!existItem) {
            var assignItem = allItems.find(function(item) {
                return item.barcode === tag.barcode;
            });
            existItem = Object.assign({
                count: 0
            }, assignItem);

            mergeItems.push(existItem);
        }

        existItem.count += tag.count;
    })
    return mergeItems;
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
    })
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

function getPromoteItems(cartItems) {
    var promoteItems = [];

    cartItems.forEach(function(item) {
        if (item.freeCount>0) {
            var promoteItem = {};
            promoteItem.name = item.name;
            promoteItem.freeCount = item.freeCount;
            promoteItem.unit = item.unit;
            promoteItems.push(promoteItem);
        }
    });
    return promoteItems;
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

function buildReceiptString(cartItems, promoteItems, total, saveMoney) {
    var receiptString = '***<没钱赚商店>购物清单***\n' +
        '打印时间：' + buildDateString() + '\n' +
        '----------------------\n';

    cartItems.forEach(function(item) {
        receiptString += '名称：'+item.name+'，数量：'+item.count+item.unit+'，单价：'+item.price.toFixed(2)+'(元)，小计：'+item.actualSubTotal.toFixed(2)+'(元)\n';
    });
    receiptString += "----------------------\n";

    receiptString += '挥泪赠送商品：\n';
    promoteItems.forEach(function(item) {
        receiptString += '名称：'+item.name+'，数量：'+item.freeCount+item.unit+'\n';
    });

    receiptString += '----------------------\n';
    receiptString += '总计：'+total.toFixed(2)+'(元)\n';
    receiptString += '节省：'+saveMoney.toFixed(2)+'(元)\n';
    receiptString += "**********************";

    console.log(receiptString);
}
function printInventory(inputs) {
    var allItems = loadAllItems();
    var promotions = loadPromotions();
    var tags = parseTags(inputs);
    var mergeItems = mergeItem(tags, allItems);
    var cartPromoteItems = calculateFreeCount(mergeItems, promotions);
    var cartItems = calculateSubTotal(cartPromoteItems);
    var total = calculateTotal(cartItems);
    var saveMoney = calculateSaveMoney(cartItems);
    var promoteItems = getPromoteItems(cartItems);

    buildReceiptString(cartItems, promoteItems, total, saveMoney);
}
