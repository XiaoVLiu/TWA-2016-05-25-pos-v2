function parseTiger(inputs) {
    var tigers = [];
    inputs.forEach(function(item) {
        var tiger = {};
        if (item.match('-')) {
            var split = item.split('-', 2);
            tiger.barcode = split[0];
            tiger.count = parseInt(split[1]);
        } else {
            tiger.barcode = item;
            tiger.count = 1;
        }

        tigers.push(tiger);
    })
    return tigers;
}

function mergeItem(tigers, allItems) {
    var mergeItems = [];
    tigers.forEach(function(tiger) {
        var existItem = mergeItems.find(function(item) {
            return item.barcode === tiger.barcode;
        });

        if (!existItem) {
            var assignItem = allItems.find(function(item) {
                return item.barcode === tiger.barcode;
            });
            existItem = Object.assign({
                count: 0
            }, assignItem);

            mergeItems.push(existItem);
        }

        existItem.count += tiger.count;
    })
    return mergeItems;
}

function calculateItemFreeCount(barcodes, item) {
    for (var i=0; i<barcodes.length; i++) {
        if (barcodes[i]===item.barcode) {
            return parseInt(item.count/3);
        }
    }
    return 0;
}

function calculateFreeCount(mergeItems, promotions) {
    var promoteBarcodes = promotions.find(function(item) {
        return item.type = 'BUY_TWO_GET_ONE_FREE';
    });

    return mergeItems.map(function(item) {
        var resultItem = Object.assign({
            freeCount: calculateItemFreeCount(promoteBarcodes.barcodes, item)
        }, item);

        return resultItem;
    })
}

function calculateSubTotal(items) {
    return items.map(function(item) {
        return Object.assign({
            subTotal: item.count*item.price,
            actualSubTotal: (item.count-item.freeCount)*item.price,
        }, item);
    })
}

function calculateTotal(cartItems) {
    var total = 0;
    cartItems.forEach(function(item){
        total += item.actualSubTotal;
    });
    return total;
}

function printInventory(inputs) {
    var allItems = loadAllItems();
    var promotions = loadPromotions();

    var tigers = parseTiger(inputs);
    var mergeItems = mergeItem(tigers, allItems);
    var cartPromoteItems = calculateFreeCount(mergeItems, promotions);
    var cartItems = calculateSubTotal(cartPromoteItems);

    var total = calculateTotal(cartItems);

    console.debug(total, cartItems);
}
