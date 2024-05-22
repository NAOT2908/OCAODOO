/** @odoo-module **/

export default class BarcodeCache {
    constructor(cacheData, params) {
        this.rpc = params.rpc;
        this.dbIdCache = {}; // Cache by model + id
        this.dbBarcodeCache = {}; // Cache by model + barcode
        this.missingBarcode = new Set(); // Used as a cache by `_getMissingRecord`
        this.barcodeFieldByModel = {
            'stock.location': 'barcode',
            'product.product': 'barcode',
            'product.packaging': 'barcode',
            'stock.package.type': 'barcode',
            'stock.picking': 'name',
            'stock.quant.package': 'name',
            'stock.lot': 'name', // Also ref, should take in account multiple fields ?
        };
        this.gs1LengthsByModel = {
            'product.product': 14,
            'product.packaging': 14,
            'stock.location': 13,
            'stock.quant.package': 18,
        };
        // If there is only one active barcode nomenclature, set the cache to be compliant with it.
        if (cacheData['barcode.nomenclature'].length === 1) {
            this.nomenclature = cacheData['barcode.nomenclature'][0];
        }
        this.cache = new Map();
        this.setCache(cacheData);
    }
    setCache(cacheData) {
    }
    updateCache(barcodeData, data) {
        this.cache.set(`${barcodeData.type}:${barcodeData.barcode}`, data);
    }
    getData(barcodeData) {
        return this.cache.get(`${barcodeData.type}:${barcodeData.barcode}`);
    }
}