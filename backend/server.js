const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const XLSX = require('xlsx');
const ExcelJS = require('exceljs');
const fs = require('fs');

// Excel report generation function using ExcelJS without external template
async function generateExcelReport(orders, options = {}) {
    try {
        const {
            date = '',
            sheetTitle,
            dateLabel,
        } = options;

        // Create new workbook
        const workbook = new ExcelJS.Workbook();
        const worksheetName = sheetTitle
            || (date ? `Invoice ${date.replace(/-/g, '.')}` : 'Invoice Report');
        const worksheet = workbook.addWorksheet(worksheetName);
        
        // Build worksheet contents programmatically
        await buildWorksheetStructure(worksheet, orders, { date, dateLabel, sheetTitle });

        const excelDisplayOffset = 0.78;
        const desiredColumnWidths = {
            A: 5.78,
            B: 16.22,
            C: 26.22,
            D: 29.22,
            E: 19.44,
            F: 17.55,
            G: 11.55,
            H: 13.88,
            I: 15.11,
            J: 13.88,
            K: 14.33,
            L: 15.33,
            M: 17.77,
            N: 13.22,
            O: 15.55,
            P: 14,
            Q: 11.77,
            R: 18.55,
            S: 14.88,
            T: 13.66,
            U: 18.55,
            V: 16.66,
            W: 16.44,
            X: 14.44,
            Y: 19.44,
            Z: 14.66,
            AA: 18.22,
            AB: 13.44,
            AC: 16.33,
            AD: 12.11,
            AE: 15.11,
            AF: 16.88,
            AG: 18.66,
            AH: 20.11,
            AI: 17.22,
            AJ: 19.44,
            AK: 15.88,
            AL: 18.22,
            AM: 10.33,
            AN: 8.77,
            AO: 14.55,
            AP: 11,
            AQ: 14.11,
            AR: 12.88,
            AS: 12.22,
            AT: 10,
            AU: 11.33,
            AV: 13.11,
            AW: 14.44,
            AX: 11.77,
            AY: 14.22,
            AZ: 16,
            BA: 20.44,
            BB: 17,
            BC: 17.33,
            BD: 15.66,
            BE: 16,
            BF: 14.11,
            BG: 11.88,
            BH: 15,
            BI: 13.77,
            BJ: 13.33,
            BK: 11.11,
            BL: 14.22,
            BM: 13,
            BN: 15.22,
            BO: 17.11,
            BP: 12.22,
            BQ: 15.22,
            BR: 14.44,
            BS: 13.88,
            BT: 12.33,
            BU: 10.88,
            BV: 14.66,
            BW: 10.88,
            BX: 14.66,
            BY: 12.66,
            BZ: 12.66,
            CA: 15.88,
            CB: 12.66,
            CC: 15.88,
            CD: 11.77,
            CE: 11.77,
            CF: 15.11,
            CG: 10.77,
            CH: 9.11,
            CI: 17.77,
            CJ: 15.77,
            CK: 17.77,
            CL: 13,
            CM: 15.77,
            CN: 18.22,
            CO: 15.33,
            CP: 14.88,
            CQ: 12.44,
            CR: 10.33,
            CS: 13.22,
            CT: 11.66,
            CU: 10.66,
            CV: 14.55,
            CW: 9.66,
            CX: 9.66,
            CY: 9.66,
            CZ: 11.88,
            DA: 12.88,
            DB: 11.11,
            DC: 11.55,
            DD: 9.22,
            DE: 10.88,
            DF: 9.22,
            DG: 8.44,
            DH: 8.44,
            DI: 8.44,
            DJ: 8.44,
            DK: 8.44,
            DL: 10.11,
            DM: 11.44,
            DN: 11.44,
            DO: 12.33,
            DP: 12.33,
            DQ: 19.55,
        };

        worksheet.columns.forEach((column, colNumber) => {
            const columnNumber = colNumber + 1;
            const columnLetter = column.letter;
            let maxLength = 0;

            const headerCell = worksheet.getRow(1).getCell(columnNumber);
            if (headerCell.value) {
                maxLength = Math.max(maxLength, String(headerCell.value).trim().length);
            }

            worksheet.eachRow({ includeEmpty: false }, (row) => {
                const cell = row.getCell(columnNumber);
                if (cell.value == null) {
                    return;
                }

                let cellLength = 0;
                if (typeof cell.value === 'string') {
                    const trimmed = cell.value.trim();
                    cellLength = trimmed.length;
                } else if (typeof cell.value === 'number') {
                    cellLength = cell.value.toString().trim().length;
                } else if (cell.value instanceof Date) {
                    cellLength = cell.value.toLocaleDateString().trim().length;
                } else {
                    cellLength = String(cell.value).trim().length;
                }

                maxLength = Math.max(maxLength, cellLength);
            });

        const desiredWidth = desiredColumnWidths[columnLetter];
        const isTransportColumn = column.key === 'transport';
        if (desiredWidth != null) {
            column.width = desiredWidth + excelDisplayOffset;
        } else if (isTransportColumn) {
            column.width = 18.11 + excelDisplayOffset;
        } else {
            column.width = Math.max(3.5, Math.min(maxLength + 0.05, 30));
        }
            column.hidden = false;

            if (columnNumber >= 6) {
                worksheet.getColumn(columnNumber).eachCell({ includeEmpty: false }, (cell) => {
                    if (cell.value && String(cell.value).trim().length > 20) {
                        cell.alignment = { ...(cell.alignment || {}), wrapText: true };
                    }
                });
            }
        });
        
        // Generate Excel buffer
        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
        
    } catch (error) {
        console.error('Error generating Excel report:', error);
        throw error;
    }
}

async function fetchOrdersWithItemsBetween(startDate, endDate, user_id = null) {
    let ordersQuery = `
        SELECT 
            o.*, 
            ot.name AS order_type,
            d.id AS dealer_id,
            d.name AS dealer_name, 
            d.territory_name AS dealer_territory,
            d.address AS dealer_address,
            d.contact AS dealer_contact,
            w.name AS warehouse_name,
            w.alias AS warehouse_alias,
            t.truck_details AS transport_name,
            DATE(o.created_at) AS order_date
        FROM orders o
        LEFT JOIN order_types ot ON o.order_type_id = ot.id
        LEFT JOIN dealers d ON o.dealer_id = d.id
        LEFT JOIN warehouses w ON o.warehouse_id = w.id
        LEFT JOIN transports t ON o.transport_id = t.id
        WHERE DATE(o.created_at) BETWEEN ? AND ?
    `;
    
    const params = [startDate, endDate];
    if (user_id) {
        ordersQuery += ' AND o.user_id = ?';
        params.push(user_id);
    }
    ordersQuery += ' ORDER BY o.created_at ASC';

    const [orders] = await dbPromise.query(ordersQuery, params);
    if (!orders.length) {
        return [];
    }

    const orderIds = orders.map(order => order.order_id);
    const [items] = await dbPromise.query(`
        SELECT 
            oi.*, 
            p.name AS product_name, 
            p.product_code, 
            p.unit_tp, 
            p.unit_trade_price,
            p.mrp
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id IN (?)
        ORDER BY oi.order_id, oi.id
    `, [orderIds]);

    const itemsByOrder = {};
    orderIds.forEach(id => {
        itemsByOrder[id] = [];
    });
    items.forEach(item => {
        if (!itemsByOrder[item.order_id]) {
            itemsByOrder[item.order_id] = [];
        }
        itemsByOrder[item.order_id].push(item);
    });

    return orders.map(order => ({
        ...order,
        items: itemsByOrder[order.order_id] || []
    }));
}

function buildDealerRangeSummary(orders) {
    const dealerMap = new Map();
    let totalQuantity = 0;
    let totalValue = 0;

            orders.forEach(order => {
        const dealerKey = order.dealer_id || order.dealer_name || order.order_id;
        const orderDate = order.order_date ? order.order_date.toString() : null;
        let dealerEntry = dealerMap.get(dealerKey);

        if (!dealerEntry) {
            dealerEntry = {
                id: dealerKey,
                dealer_name: order.dealer_name || 'Unknown dealer',
                dealer_territory: order.dealer_territory || null,
                warehouse_names: new Set(),
                transport_names: new Set(),
                dealer_address: order.dealer_address || '',
                dealer_contact: order.dealer_contact || '',
                order_count: 0,
                total_quantity: 0,
                total_value: 0,
                products: new Map(),
                earliestDate: orderDate,
                latestDate: orderDate,
            };
            dealerMap.set(dealerKey, dealerEntry);
        } else {
            if (!dealerEntry.dealer_address && order.dealer_address) {
                dealerEntry.dealer_address = order.dealer_address;
            }
            if (!dealerEntry.dealer_contact && order.dealer_contact) {
                dealerEntry.dealer_contact = order.dealer_contact;
            }
        }

        dealerEntry.order_count += 1;
        if (order.warehouse_name) {
            dealerEntry.warehouse_names.add(order.warehouse_name);
        }
        if (order.warehouse_alias) {
            dealerEntry.warehouse_names.add(order.warehouse_alias);
        }
        if (order.transport_name) {
            dealerEntry.transport_names = dealerEntry.transport_names || new Set();
            dealerEntry.transport_names.add(order.transport_name);
        } else if (order.transport) {
            dealerEntry.transport_names = dealerEntry.transport_names || new Set();
            dealerEntry.transport_names.add(order.transport);
        }
        if (orderDate) {
            if (!dealerEntry.earliestDate || orderDate < dealerEntry.earliestDate) {
                dealerEntry.earliestDate = orderDate;
            }
            if (!dealerEntry.latestDate || orderDate > dealerEntry.latestDate) {
                dealerEntry.latestDate = orderDate;
            }
        }

        let orderQuantity = 0;
        let orderValue = 0;

        (order.items || []).forEach(item => {
            const quantity = Number(item.quantity) || 0;
            orderQuantity += quantity;

            const unitPrice = item.unit_tp != null
                ? Number(item.unit_tp)
                : item.unit_trade_price != null
                    ? Number(item.unit_trade_price)
                    : 0;
            orderValue += quantity * unitPrice;

            const productCode = item.product_code || `product_${item.product_id || item.id}`;
            let productSummary = dealerEntry.products.get(productCode);

            if (!productSummary) {
                productSummary = {
                    product_code: item.product_code || '',
                    product_name: item.product_name || '',
                    quantity: 0,
                    unit_tp: item.unit_tp != null
                        ? Number(item.unit_tp)
                        : item.unit_trade_price != null
                            ? Number(item.unit_trade_price)
                            : null,
                };
                dealerEntry.products.set(productCode, productSummary);
            }

            productSummary.quantity += quantity;
            if (productSummary.unit_tp == null && item.unit_tp != null) {
                productSummary.unit_tp = Number(item.unit_tp);
            }
        });

        dealerEntry.total_quantity += orderQuantity;
        dealerEntry.total_value += orderValue;

        totalQuantity += orderQuantity;
        totalValue += orderValue;
    });

    const summaries = Array.from(dealerMap.values())
        .map(entry => {
            const productSummaries = Array.from(entry.products.values())
                .sort((a, b) => (a.product_name || '').localeCompare(b.product_name || ''));
            
            const earliest = entry.earliestDate;
            const latest = entry.latestDate;
            let dateSpan = '';
            if (earliest && latest) {
                dateSpan = earliest === latest ? earliest : `${earliest} - ${latest}`;
            }

            return {
                id: entry.id,
                dealer_name: entry.dealer_name,
                dealer_territory: entry.dealer_territory,
                dealer_address: entry.dealer_address,
                dealer_contact: entry.dealer_contact,
                warehouse_names: Array.from(entry.warehouse_names),
                transport_names: entry.transport_names ? Array.from(entry.transport_names) : [],
                order_count: entry.order_count,
                distinct_products: productSummaries.length,
                total_quantity: entry.total_quantity,
                total_value: Number(entry.total_value.toFixed(2)),
                date_span: dateSpan,
                product_summaries: productSummaries,
            };
        })
        .sort((a, b) => (a.dealer_name || '').localeCompare(b.dealer_name || ''));

    return {
        summaries,
        total_dealers: summaries.length,
        total_quantity: totalQuantity,
        total_value: Number(totalValue.toFixed(2)),
    };
}

function convertDealerSummariesToOrders(summaries, dateLabel) {
    return summaries.map((summary) => {
        const warehouseName = summary.warehouse_names && summary.warehouse_names.length
            ? summary.warehouse_names.join(', ')
            : '';
        const transportNamesArray = summary.transport_names || [];
        const transportValue = transportNamesArray.length > 1
            ? 'Different Transport Providers'
            : (transportNamesArray[0] || '');

        return {
            order_id: `RANGE-${summary.id}`,
            order_type: 'Range',
            dealer_name: summary.dealer_name || '',
            dealer_territory: summary.dealer_territory || '',
            dealer_address: summary.dealer_address || '',
            dealer_contact: summary.dealer_contact || '',
            warehouse_name: warehouseName,
            transport_name: transportValue,
            transport_names: transportNamesArray,
            items: (summary.product_summaries || []).map(product => ({
                product_code: product.product_code || '',
                product_name: product.product_name || '',
                quantity: product.quantity || 0,
                unit_tp: product.unit_tp != null ? Number(product.unit_tp) : null,
            })),
            order_date: dateLabel,
        };
    });
}

// TSO report helper functions (no prices)
function buildDealerRangeSummaryNoPrices(orders) {
    const dealerMap = new Map();
    let totalQuantity = 0;

    orders.forEach((order) => {
        const dealerId = order.dealer_id || order.dealer_name || 'unknown';
        if (!dealerMap.has(dealerId)) {
            dealerMap.set(dealerId, {
                id: dealerId,
                dealer_name: order.dealer_name || '',
                dealer_territory: order.dealer_territory || '',
                dealer_address: order.dealer_address || '',
                dealer_contact: order.dealer_contact || '',
                order_count: 0,
                total_quantity: 0,
                product_map: new Map(),
                warehouse_names: new Set(),
                transport_names: new Set(),
            });
        }

        const entry = dealerMap.get(dealerId);
        entry.order_count += 1;

        (order.items || []).forEach((item) => {
            const qty = Number(item.quantity) || 0;
            entry.total_quantity += qty;
            totalQuantity += qty;

            const productCode = item.product_code || '';
            if (productCode) {
                if (!entry.product_map.has(productCode)) {
                    entry.product_map.set(productCode, {
                        product_code: productCode,
                        product_name: item.product_name || '',
                        quantity: 0,
                    });
                }
                const productEntry = entry.product_map.get(productCode);
                productEntry.quantity += qty;
            }
        });

        if (order.warehouse_name) {
            entry.warehouse_names.add(order.warehouse_name);
        }
        if (order.transport_name) {
            entry.transport_names.add(order.transport_name);
        }
    });

    const summaries = Array.from(dealerMap.values())
        .map((entry) => {
            const productSummaries = Array.from(entry.product_map.values());
            const warehouseNames = Array.from(entry.warehouse_names);
            const transportNames = Array.from(entry.transport_names);

            const orderDates = orders
                .filter(o => (o.dealer_id || o.dealer_name || 'unknown') === entry.id)
                .map(o => o.order_date)
                .filter(Boolean)
                .sort();

            const dateSpan = orderDates.length > 0
                ? orderDates.length === 1
                    ? orderDates[0]
                    : `${orderDates[0]} to ${orderDates[orderDates.length - 1]}`
                : '';

            return {
                id: entry.id,
                dealer_name: entry.dealer_name,
                dealer_territory: entry.dealer_territory,
                dealer_address: entry.dealer_address,
                dealer_contact: entry.dealer_contact,
                order_count: entry.order_count,
                distinct_products: productSummaries.length,
                total_quantity: entry.total_quantity,
                date_span: dateSpan,
                product_summaries: productSummaries,
                warehouse_names: warehouseNames,
                transport_names: transportNames,
            };
        })
        .sort((a, b) => (a.dealer_name || '').localeCompare(b.dealer_name || ''));

    return {
        summaries,
        total_dealers: summaries.length,
        total_quantity: totalQuantity,
    };
}

function convertDealerSummariesToOrdersNoPrices(summaries, dateLabel) {
    return summaries.map((summary) => {
        const warehouseName = summary.warehouse_names && summary.warehouse_names.length
            ? summary.warehouse_names.join(', ')
            : '';
        const transportNamesArray = summary.transport_names || [];
        const transportValue = transportNamesArray.length > 1
            ? 'Different Transport Providers'
            : (transportNamesArray[0] || '');

        return {
            order_id: `RANGE-${summary.id}`,
            order_type: 'Range',
            dealer_name: summary.dealer_name || '',
            dealer_territory: summary.dealer_territory || '',
            dealer_address: summary.dealer_address || '',
            dealer_contact: summary.dealer_contact || '',
            warehouse_name: warehouseName,
            transport_name: transportValue,
            transport_names: transportNamesArray,
            items: (summary.product_summaries || []).map(product => ({
                product_code: product.product_code || '',
                product_name: product.product_name || '',
                quantity: product.quantity || 0,
            })),
            order_date: dateLabel,
        };
    });
}

// Excel report generation function without prices
async function generateExcelReportNoPrices(orders, options = {}) {
    try {
        const {
            date = '',
            sheetTitle,
            dateLabel,
        } = options;

        // Create new workbook
        const workbook = new ExcelJS.Workbook();
        const worksheetName = sheetTitle
            || (date ? `Invoice ${date.replace(/-/g, '.')}` : 'Invoice Report');
        const worksheet = workbook.addWorksheet(worksheetName);
        
        // Build worksheet contents programmatically (without prices)
        await buildWorksheetStructureNoPrices(worksheet, orders, { date, dateLabel, sheetTitle });

        const excelDisplayOffset = 0.78;
        const desiredColumnWidths = {
            A: 5.78,
            B: 16.22,
            C: 26.22,
            D: 29.22,
            E: 19.44,
            F: 17.55,
            G: 11.55,
            H: 13.88,
            I: 15.11,
            J: 13.88,
            K: 14.33,
            L: 15.33,
            M: 17.77,
            N: 13.22,
            O: 15.55,
            P: 14,
            Q: 11.77,
            R: 18.55,
            S: 14.88,
            T: 13.66,
            U: 18.55,
            V: 16.66,
            W: 16.44,
            X: 14.44,
            Y: 19.44,
            Z: 14.66,
        };

        worksheet.columns.forEach((column, colNumber) => {
            const columnNumber = colNumber + 1;
            const columnLetter = column.letter;
            let maxLength = 0;

            const headerCell = worksheet.getRow(1).getCell(columnNumber);
            if (headerCell.value) {
                maxLength = Math.max(maxLength, String(headerCell.value).trim().length);
            }

            worksheet.eachRow({ includeEmpty: false }, (row) => {
                const cell = row.getCell(columnNumber);
                if (cell.value == null) {
                    return;
                }

                let cellLength = 0;
                if (typeof cell.value === 'string') {
                    const trimmed = cell.value.trim();
                    cellLength = trimmed.length;
                } else if (typeof cell.value === 'number') {
                    cellLength = cell.value.toString().trim().length;
                } else if (cell.value instanceof Date) {
                    cellLength = cell.value.toLocaleDateString().trim().length;
                } else {
                    cellLength = String(cell.value).trim().length;
                }

                maxLength = Math.max(maxLength, cellLength);
            });

        const desiredWidth = desiredColumnWidths[columnLetter];
        const isTransportColumn = column.key === 'transport';
        if (desiredWidth != null) {
            column.width = desiredWidth + excelDisplayOffset;
        } else if (isTransportColumn) {
            column.width = 18.11 + excelDisplayOffset;
        } else {
            column.width = Math.max(3.5, Math.min(maxLength + 0.05, 30));
        }
            column.hidden = false;

            if (columnNumber >= 6) {
                worksheet.getColumn(columnNumber).eachCell({ includeEmpty: false }, (cell) => {
                    if (cell.value && String(cell.value).trim().length > 20) {
                        cell.alignment = { ...(cell.alignment || {}), wrapText: true };
                    }
                });
            }
        });
        
        // Generate Excel buffer
        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
        
    } catch (error) {
        console.error('Error generating Excel report:', error);
        throw error;
    }
}

// Function to build worksheet structure programmatically without prices
async function buildWorksheetStructureNoPrices(worksheet, orders, options = {}) {
    const { dateLabel } = options;

    const defaultFont = { name: 'Calibri', size: 8 };
    const thinBorder = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
    };

    const styleCell = (cell, {
        bold = false,
        alignment = { horizontal: 'center', vertical: 'middle' },
        fill,
        numFmt,
        font = {},
        border = thinBorder,
    } = {}) => {
        cell.font = { ...defaultFont, ...font, bold };
        cell.alignment = alignment;
        if (border) {
            cell.border = border;
        }
        if (fill) {
            cell.fill = fill;
        }
        if (numFmt) {
            cell.numFmt = numFmt;
        }
    };

    // Collect unique product codes from orders
    const orderedProductCodes = new Set();
    orders.forEach((order) => {
        (order.items || []).forEach((item) => {
            if (item.product_code) {
                orderedProductCodes.add(item.product_code);
            }
        });
    });

    // Fetch only products that were actually ordered (excluding dummy application)
    let allProducts = [];
    if (orderedProductCodes.size > 0) {
        const productCodesArray = Array.from(orderedProductCodes);
        const allProductsQuery = `
            SELECT product_code, name as product_name, application_name
            FROM products
            WHERE status = 'A' AND application_name != 'Dummy' AND product_code IN (?)
            ORDER BY application_name, product_name
        `;
        const [allProductsResult] = await dbPromise.query(allProductsQuery, [productCodesArray]);
        allProducts = allProductsResult;
    }

    // Group products by application and prepare lookup maps
    const productsByApplication = {};
    const productInfoMap = new Map();

    allProducts.forEach((product) => {
        const appName = product.application_name || 'Other';
        if (!productsByApplication[appName]) {
            productsByApplication[appName] = [];
        }
        productsByApplication[appName].push(product);
        productInfoMap.set(product.product_code, {
            application: appName,
            product_name: product.product_name || '',
            product_code: product.product_code,
        });
    });

    const applicationNames = Object.keys(productsByApplication).sort((a, b) =>
        a.localeCompare(b),
    );

    const applicationTotals = {};
    applicationNames.forEach((appName) => {
        applicationTotals[appName] = { qty: 0 };
        productsByApplication[appName].sort((a, b) => (a.product_name || '').localeCompare(b.product_name || ''));
    });

    let grandTotalQty = 0;

    orders.forEach((order) => {
        (order.items || []).forEach((item) => {
            const qty = Number(item.quantity) || 0;
            const productInfo = productInfoMap.get(item.product_code);
            const appName = productInfo?.application || 'Other';

            if (!applicationTotals[appName]) {
                applicationTotals[appName] = { qty: 0 };
            }

            applicationTotals[appName].qty += qty;
            grandTotalQty += qty;
        });
    });
    
    // Summary header
    const dateRow = worksheet.getRow(1);
    if (dateLabel) {
        styleCell(dateRow.getCell(1), {
            alignment: { horizontal: 'left', vertical: 'middle' },
            border: null,
            bold: false,
        });
        dateRow.getCell(1).value = 'Date:';

        styleCell(dateRow.getCell(2), {
            alignment: { horizontal: 'left', vertical: 'middle' },
            border: null,
            bold: false,
        });
        dateRow.getCell(2).value = dateLabel;
    }

    const summaryHeaderRow = worksheet.getRow(2);
    styleCell(summaryHeaderRow.getCell(1), { bold: true });
    summaryHeaderRow.getCell(1).value = 'Seg';
    styleCell(summaryHeaderRow.getCell(2), { bold: true });
    summaryHeaderRow.getCell(2).value = 'Qty';

    let summaryRowIndex = 3;

    // Summary rows per application (no value column)
    applicationNames.forEach((appName) => {
        const row = worksheet.getRow(summaryRowIndex);
        const totals = applicationTotals[appName] || { qty: 0 };

        styleCell(row.getCell(1), {
            alignment: { horizontal: 'left', vertical: 'middle' },
        });
        row.getCell(1).value = appName;

        styleCell(row.getCell(2), {});
        row.getCell(2).value = totals.qty;

        summaryRowIndex += 1;
    });

    // Total row (no value column)
    const totalRow = worksheet.getRow(summaryRowIndex);
    styleCell(totalRow.getCell(1), { bold: true, alignment: { horizontal: 'left', vertical: 'middle' } });
    totalRow.getCell(1).value = 'Total';

    styleCell(totalRow.getCell(2), { bold: true });
    totalRow.getCell(2).value = grandTotalQty;

    const headerRowIndex = summaryRowIndex + 1;

    // Column headers for dealer information
    const headers = [
        'Sl. No.',
        'Territory',
        'Name of Dealer',
        'Address',
        'Contact Person & Number',
    ];

    headers.forEach((title, index) => {
        const cell = worksheet.getRow(headerRowIndex).getCell(index + 1);
        styleCell(cell, {
            bold: true,
            alignment: { horizontal: index === 0 ? 'center' : 'left', vertical: 'middle' },
        });
        cell.value = title;
    });

    // Product columns (no price row)
    const productColumnMap = {};
    const productColumns = [];
    let currentCol = 6;

    applicationNames.forEach((appName) => {
        const products = productsByApplication[appName];
        if (!products || !products.length) {
            return;
        }

        const appStartCol = currentCol;
        const appEndCol = currentCol + products.length - 1;
        worksheet.mergeCells(headerRowIndex, appStartCol, headerRowIndex, appEndCol);

        const headerCell = worksheet.getRow(headerRowIndex).getCell(appStartCol);
        styleCell(headerCell, { bold: true });
        headerCell.value = appName;

        products.forEach((product) => {
            const column = currentCol;
            const nameRow = worksheet.getRow(headerRowIndex + 1).getCell(column);
            styleCell(nameRow, {
                bold: true,
                alignment: { horizontal: 'left', vertical: 'middle' },
            });
            nameRow.value = product.product_name || product.product_code;

            productColumnMap[product.product_code] = column;
            productColumns.push(column);
            currentCol += 1;
        });
    });

    // Freeze panes below product header rows
    worksheet.views = [
        { state: 'frozen', xSplit: 5, ySplit: headerRowIndex + 1 },
    ];

    const transportColumnIndex = currentCol;
    const transportColumn = worksheet.getColumn(transportColumnIndex);
    transportColumn.key = 'transport';

    styleCell(worksheet.getRow(headerRowIndex).getCell(transportColumnIndex), {
        bold: true,
        alignment: { horizontal: 'left', vertical: 'middle' },
    });
    worksheet.getRow(headerRowIndex).getCell(transportColumnIndex).value = 'Transport';

    styleCell(worksheet.getRow(headerRowIndex + 1).getCell(transportColumnIndex), {
        alignment: { horizontal: 'center', vertical: 'middle' },
    });
    worksheet.getRow(headerRowIndex + 1).getCell(transportColumnIndex).value = '';

    let dataRowIndex = headerRowIndex + 2;
    let serial = 1;

    if (!orders.length) {
        const row = worksheet.getRow(dataRowIndex);
        styleCell(row.getCell(1), {});
        row.getCell(1).value = 1;
        styleCell(row.getCell(2), { alignment: { horizontal: 'left', vertical: 'middle' } });
        row.getCell(2).value = 'No Orders';
        styleCell(row.getCell(3), { alignment: { horizontal: 'left', vertical: 'middle' } });
        row.getCell(3).value = 'No Orders Found';
        for (let col = 4; col <= 5; col++) {
            styleCell(row.getCell(col), { alignment: { horizontal: 'left', vertical: 'middle' } });
            row.getCell(col).value = '';
        }

        productColumns.forEach((column) => {
            const cell = row.getCell(column);
            styleCell(cell, {});
            cell.value = 0;
        });

        styleCell(row.getCell(transportColumnIndex), { alignment: { horizontal: 'left', vertical: 'middle' } });
        row.getCell(transportColumnIndex).value = '';
        dataRowIndex += 1;
    } else {
        orders.forEach((order) => {
            const row = worksheet.getRow(dataRowIndex);

            styleCell(row.getCell(1), {});
            row.getCell(1).value = serial++;

            styleCell(row.getCell(2), { alignment: { horizontal: 'left', vertical: 'middle' } });
            row.getCell(2).value = order.dealer_territory || '';

        styleCell(row.getCell(3), { alignment: { horizontal: 'left', vertical: 'middle' } });
        row.getCell(3).value = order.dealer_name || '';

        styleCell(row.getCell(4), { alignment: { horizontal: 'left', vertical: 'middle' } });
        row.getCell(4).value = order.dealer_address || '';

        styleCell(row.getCell(5), { alignment: { horizontal: 'left', vertical: 'middle' } });
        row.getCell(5).value = order.dealer_contact || '';

        productColumns.forEach((column) => {
            const cell = row.getCell(column);
                styleCell(cell, {});
                cell.value = 0;
            });

            const quantityByProduct = {};
            (order.items || []).forEach((item) => {
                const code = item.product_code;
                if (!code) {
                    return;
                }
                quantityByProduct[code] = (quantityByProduct[code] || 0) + (Number(item.quantity) || 0);
            });

            Object.entries(quantityByProduct).forEach(([productCode, quantity]) => {
                const column = productColumnMap[productCode];
                if (!column) {
                    return;
                }
            const cell = row.getCell(column);
                cell.value = quantity;
            if (quantity > 0) {
                    cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                        fgColor: { argb: 'FFD8E4BC' },
                    };
                }
            });

            styleCell(row.getCell(transportColumnIndex), { alignment: { horizontal: 'left', vertical: 'middle' } });
            const transportValue =
                order.transport_name ||
                (Array.isArray(order.transport_names) && order.transport_names.length > 1
                    ? 'Different Transport Providers'
                    : Array.isArray(order.transport_names) && order.transport_names.length === 1
                        ? order.transport_names[0]
                        : order.transport || order.warehouse_name || '');
            row.getCell(transportColumnIndex).value = transportValue;

            dataRowIndex += 1;
        });
    }
}

// Function to build worksheet structure programmatically
async function buildWorksheetStructure(worksheet, orders, options = {}) {
    const { dateLabel } = options;

    const defaultFont = { name: 'Calibri', size: 8 };
    const thinBorder = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
    };

    const styleCell = (cell, {
        bold = false,
        alignment = { horizontal: 'center', vertical: 'middle' },
        fill,
        numFmt,
        font = {},
        border = thinBorder,
    } = {}) => {
        cell.font = { ...defaultFont, ...font, bold };
        cell.alignment = alignment;
        if (border) {
            cell.border = border;
        }
        if (fill) {
            cell.fill = fill;
        }
        if (numFmt) {
            cell.numFmt = numFmt;
        }
    };

    // Fetch complete product catalogue (excluding dummy application)
    const allProductsQuery = `
        SELECT product_code, name as product_name, application_name, unit_tp
        FROM products
        WHERE status = 'A' AND application_name != 'Dummy'
        ORDER BY application_name, product_name
    `;

    const [allProductsResult] = await dbPromise.query(allProductsQuery);
    const allProducts = allProductsResult;

    // Group products by application and prepare lookup maps
    const productsByApplication = {};
    const productInfoMap = new Map();

    allProducts.forEach((product) => {
        const appName = product.application_name || 'Other';
        if (!productsByApplication[appName]) {
            productsByApplication[appName] = [];
        }
        productsByApplication[appName].push(product);
        productInfoMap.set(product.product_code, {
            application: appName,
            unit_tp: product.unit_tp != null ? Number(product.unit_tp) : 0,
            product_name: product.product_name || '',
            product_code: product.product_code,
        });
    });

    const applicationNames = Object.keys(productsByApplication).sort((a, b) =>
        a.localeCompare(b),
    );

    const applicationTotals = {};
    applicationNames.forEach((appName) => {
        applicationTotals[appName] = { qty: 0, value: 0 };
        productsByApplication[appName].sort((a, b) => (a.product_name || '').localeCompare(b.product_name || ''));
    });

    let grandTotalQty = 0;
    let grandTotalValue = 0;

    orders.forEach((order) => {
        (order.items || []).forEach((item) => {
            const qty = Number(item.quantity) || 0;
            const productInfo = productInfoMap.get(item.product_code);
            const appName = productInfo?.application || 'Other';
            const unitTp = productInfo?.unit_tp != null ? Number(productInfo.unit_tp) : 0;

            if (!applicationTotals[appName]) {
                applicationTotals[appName] = { qty: 0, value: 0 };
            }

            applicationTotals[appName].qty += qty;
            applicationTotals[appName].value += qty * unitTp;

            grandTotalQty += qty;
            grandTotalValue += qty * unitTp;
        });
    });
    
    // Summary header
    const dateRow = worksheet.getRow(1);
    if (dateLabel) {
        styleCell(dateRow.getCell(1), {
            alignment: { horizontal: 'left', vertical: 'middle' },
            border: null,
            bold: false,
        });
        dateRow.getCell(1).value = 'Date:';

        styleCell(dateRow.getCell(2), {
            alignment: { horizontal: 'left', vertical: 'middle' },
            border: null,
            bold: false,
        });
        dateRow.getCell(2).value = dateLabel;
    }

    const summaryHeaderRow = worksheet.getRow(2);
    styleCell(summaryHeaderRow.getCell(1), { bold: true });
    summaryHeaderRow.getCell(1).value = 'Seg';
    styleCell(summaryHeaderRow.getCell(2), { bold: true });
    summaryHeaderRow.getCell(2).value = 'Qty';
    styleCell(summaryHeaderRow.getCell(3), { bold: true });
    summaryHeaderRow.getCell(3).value = 'Invoice Value';

    let summaryRowIndex = 3;

    // Summary rows per application
    applicationNames.forEach((appName) => {
        const row = worksheet.getRow(summaryRowIndex);
        const totals = applicationTotals[appName] || { qty: 0, value: 0 };

        styleCell(row.getCell(1), {
            alignment: { horizontal: 'left', vertical: 'middle' },
        });
        row.getCell(1).value = appName;

        styleCell(row.getCell(2), {});
        row.getCell(2).value = totals.qty;

        styleCell(row.getCell(3), { numFmt: '#,##0.00' });
        row.getCell(3).value = Number(totals.value.toFixed(2));

        summaryRowIndex += 1;
    });

    // Total row
    const totalRow = worksheet.getRow(summaryRowIndex);
    styleCell(totalRow.getCell(1), { bold: true, alignment: { horizontal: 'left', vertical: 'middle' } });
    totalRow.getCell(1).value = 'Total';

    styleCell(totalRow.getCell(2), { bold: true });
    totalRow.getCell(2).value = grandTotalQty;

    styleCell(totalRow.getCell(3), { bold: true, numFmt: '#,##0.00' });
    totalRow.getCell(3).value = Number(grandTotalValue.toFixed(2));

    const headerRowIndex = summaryRowIndex + 1;

    // Column headers for dealer information
    const headers = [
        'Sl. No.',
        'Territory',
        'Name of Dealer',
        'Address',
        'Contact Person & Number',
    ];

    headers.forEach((title, index) => {
        const cell = worksheet.getRow(headerRowIndex).getCell(index + 1);
        styleCell(cell, {
            bold: true,
            alignment: { horizontal: index === 0 ? 'center' : 'left', vertical: 'middle' },
        });
        cell.value = title;
    });

    // Product columns
    const productColumnMap = {};
    const productColumns = [];
    let currentCol = 6;

    applicationNames.forEach((appName) => {
        const products = productsByApplication[appName];
        if (!products || !products.length) {
                    return;
                }

        const appStartCol = currentCol;
        const appEndCol = currentCol + products.length - 1;
        worksheet.mergeCells(headerRowIndex, appStartCol, headerRowIndex, appEndCol);

        const headerCell = worksheet.getRow(headerRowIndex).getCell(appStartCol);
        styleCell(headerCell, { bold: true });
        headerCell.value = appName;

        products.forEach((product) => {
            const column = currentCol;
            const nameRow = worksheet.getRow(headerRowIndex + 1).getCell(column);
            styleCell(nameRow, {
                bold: true,
                alignment: { horizontal: 'left', vertical: 'middle' },
            });
            nameRow.value = product.product_name || product.product_code;

            const priceRow = worksheet.getRow(headerRowIndex + 2).getCell(column);
            styleCell(priceRow, {
                alignment: { horizontal: 'center', vertical: 'middle' },
                numFmt: '#,##0.00',
            });
            priceRow.value = product.unit_tp != null ? Number(product.unit_tp) : 0;

            productColumnMap[product.product_code] = column;
            productColumns.push(column);
            currentCol += 1;
        });
    });

    // Freeze panes below product header rows
    worksheet.views = [
        { state: 'frozen', xSplit: 5, ySplit: headerRowIndex + 2 },
    ];

    const transportColumnIndex = currentCol;
    const transportColumn = worksheet.getColumn(transportColumnIndex);
    transportColumn.key = 'transport';

    styleCell(worksheet.getRow(headerRowIndex).getCell(transportColumnIndex), {
        bold: true,
        alignment: { horizontal: 'left', vertical: 'middle' },
    });
    worksheet.getRow(headerRowIndex).getCell(transportColumnIndex).value = 'Transport';

    styleCell(worksheet.getRow(headerRowIndex + 1).getCell(transportColumnIndex), {
        alignment: { horizontal: 'center', vertical: 'middle' },
    });
    worksheet.getRow(headerRowIndex + 1).getCell(transportColumnIndex).value = '';

    styleCell(worksheet.getRow(headerRowIndex + 2).getCell(transportColumnIndex), {
        alignment: { horizontal: 'center', vertical: 'middle' },
    });
    worksheet.getRow(headerRowIndex + 2).getCell(transportColumnIndex).value = '';

    let dataRowIndex = headerRowIndex + 3;
    let serial = 1;

    if (!orders.length) {
        const row = worksheet.getRow(dataRowIndex);
        styleCell(row.getCell(1), {});
        row.getCell(1).value = 1;
        styleCell(row.getCell(2), { alignment: { horizontal: 'left', vertical: 'middle' } });
        row.getCell(2).value = 'No Orders';
        styleCell(row.getCell(3), { alignment: { horizontal: 'left', vertical: 'middle' } });
        row.getCell(3).value = 'No Orders Found';
        for (let col = 4; col <= 5; col++) {
            styleCell(row.getCell(col), { alignment: { horizontal: 'left', vertical: 'middle' } });
            row.getCell(col).value = '';
        }

        productColumns.forEach((column) => {
            const cell = row.getCell(column);
            styleCell(cell, {});
            cell.value = 0;
        });

        styleCell(row.getCell(transportColumnIndex), { alignment: { horizontal: 'left', vertical: 'middle' } });
        row.getCell(transportColumnIndex).value = '';
        dataRowIndex += 1;
            } else {
        orders.forEach((order) => {
            const row = worksheet.getRow(dataRowIndex);

            styleCell(row.getCell(1), {});
            row.getCell(1).value = serial++;

            styleCell(row.getCell(2), { alignment: { horizontal: 'left', vertical: 'middle' } });
            row.getCell(2).value = order.dealer_territory || '';

        styleCell(row.getCell(3), { alignment: { horizontal: 'left', vertical: 'middle' } });
        row.getCell(3).value = order.dealer_name || '';

        styleCell(row.getCell(4), { alignment: { horizontal: 'left', vertical: 'middle' } });
        row.getCell(4).value = order.dealer_address || '';

        styleCell(row.getCell(5), { alignment: { horizontal: 'left', vertical: 'middle' } });
        row.getCell(5).value = order.dealer_contact || '';

        productColumns.forEach((column) => {
            const cell = row.getCell(column);
                styleCell(cell, {});
                cell.value = 0;
            });

            const quantityByProduct = {};
            (order.items || []).forEach((item) => {
                const code = item.product_code;
                if (!code) {
                    return;
                }
                quantityByProduct[code] = (quantityByProduct[code] || 0) + (Number(item.quantity) || 0);
            });

            Object.entries(quantityByProduct).forEach(([productCode, quantity]) => {
                const column = productColumnMap[productCode];
                if (!column) {
                    return;
                }
            const cell = row.getCell(column);
                cell.value = quantity;
                if (quantity > 0) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFD8E4BC' },
                    };
                }
            });

            styleCell(row.getCell(transportColumnIndex), { alignment: { horizontal: 'left', vertical: 'middle' } });
            const transportValue =
                order.transport_name ||
                (Array.isArray(order.transport_names) && order.transport_names.length > 1
                    ? 'Different Transport Providers'
                    : Array.isArray(order.transport_names) && order.transport_names.length === 1
                        ? order.transport_names[0]
                        : order.transport || order.warehouse_name || '');
            row.getCell(transportColumnIndex).value = transportValue;

            dataRowIndex += 1;
        });
    }
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'CBL Sales Orders API'
    });
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Accept Excel and CSV files
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel' ||
            file.mimetype === 'text/csv' ||
            file.originalname.endsWith('.xlsx') ||
            file.originalname.endsWith('.xls') ||
            file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only Excel and CSV files are allowed'), false);
        }
    }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads', { recursive: true });
    console.log('📁 Created uploads directory');
} else {
    console.log('📁 Uploads directory exists');
}

// Check uploads directory permissions
try {
    fs.accessSync('uploads', fs.constants.R_OK | fs.constants.W_OK);
    console.log('✅ Uploads directory is readable and writable');
} catch (err) {
    console.error('❌ Uploads directory permission issue:', err.message);
    // Try to fix permissions (only works on Unix-like systems)
    try {
        fs.chmodSync('uploads', 0o777);
        console.log('🔧 Fixed uploads directory permissions');
    } catch (chmodErr) {
        console.error('❌ Could not fix permissions:', chmodErr.message);
    }
}

// MySQL connection pool
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '#lme11@@',
    database: process.env.DB_NAME || 'cbl_so',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
    queueLimit: 0,
    dateStrings: true // Return dates as strings instead of Date objects to preserve timezone
});
const dbPromise = db.promise();

const withTransaction = async (handler) => {
    const connection = await dbPromise.getConnection();
    try {
        await connection.beginTransaction();
        const result = await handler(connection);
        await connection.commit();
        return result;
    } catch (error) {
        try {
            await connection.rollback();
        } catch (rollbackError) {
            console.error('Rollback error:', rollbackError);
        }
        throw error;
    } finally {
        connection.release();
    }
};

// Create transport table if it doesn't exist
const createTransportTable = () => {
    const createTransportTableQuery = `
        CREATE TABLE IF NOT EXISTS transports (
            id INT AUTO_INCREMENT PRIMARY KEY,
            truck_slno INT,
            truck_no VARCHAR(50),
            engine_no VARCHAR(100),
            truck_details VARCHAR(255),
            driver_name VARCHAR(100),
            route_no VARCHAR(50),
            load_size VARCHAR(50),
            load_weight VARCHAR(50),
            remarks TEXT,
            truck_type VARCHAR(50),
            entered_by VARCHAR(100),
            entered_date DATE,
            entered_terminal VARCHAR(100),
            updated_by VARCHAR(100),
            updated_date DATE,
            updated_terminal VARCHAR(100),
            license_no VARCHAR(100),
            transport_status VARCHAR(10) DEFAULT 'A',
            vehicle_no VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;
    
    db.query(createTransportTableQuery, (err) => {
        if (err) {
            console.error('Error creating transport table:', err);
        } else {
            console.log('Transport table created successfully');
        }
    });
};

// Connect to database first, then start server
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1); // Exit if database connection fails
    }

        console.log('Connected to MySQL database');
    connection.release();

        // Create transport table
        createTransportTable();

        // Start server only after database connection is established
        app.listen(PORT, () => {
            console.log(`CBL Sales Orders server running on port ${PORT}`);
        });
});

// Routes

// SSE endpoint for quota change notifications
const quotaSubscribers = new Set();

app.get('/api/quota-stream', (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  // CORS is handled by app.use(cors()) middleware at line 534

  // Add client to subscribers
  quotaSubscribers.add(res);

  // Send initial connection message
  res.write('data: {"type":"connected"}\n\n');

  // Cleanup on client disconnect
  req.on('close', () => {
    quotaSubscribers.delete(res);
    console.log('Client disconnected from quota stream. Active subscribers:', quotaSubscribers.size);
  });

  console.log('Client connected to quota stream. Active subscribers:', quotaSubscribers.size);
});

// Broadcast quota change to all subscribers
function broadcastQuotaChange() {
  const message = JSON.stringify({ type: 'quotaChanged', timestamp: Date.now() });
  console.log(`Broadcasting quota change to ${quotaSubscribers.size} subscribers`);
  quotaSubscribers.forEach(client => {
    try {
      client.write(`data: ${message}\n\n`);
    } catch (err) {
      console.error('Error sending SSE message:', err);
      quotaSubscribers.delete(client);
    }
  });
}

// Authentication routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  const query = `
    SELECT u.*, d.name AS dealer_name, d.dealer_code 
    FROM users u 
    LEFT JOIN dealers d ON u.dealer_id = d.id 
    WHERE u.username = ? AND u.is_active = TRUE
  `;
  
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    
    const user = results[0];
    
    // Check password with bcrypt (or plain text fallback for old passwords)
    let isValid = false;
    try {
      // Try bcrypt comparison first (for new passwords)
      if (user.password_hash.startsWith('$2')) {
        isValid = await bcrypt.compare(password, user.password_hash);
      } else {
        // Fallback for old plain text passwords (migration period)
        isValid = user.password_hash === password;
      }
    } catch (error) {
      console.error('Password comparison error:', error);
      isValid = false;
    }
    
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    
    // Return user data without password
    const userData = { ...user };
    delete userData.password_hash;
    
    res.json({
      success: true,
      user: userData,
      token: 'mock-jwt-token' // In production, use JWT
    });
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Manage Users routes
app.get('/api/users', (req, res) => {
  const query = 'SELECT id, username, full_name, role, territory_name, dealer_id, is_active, created_at, updated_at FROM users ORDER BY id';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.post('/api/users', async (req, res) => {
  const { username, password, password_hash, full_name, role, territory_name, dealer_id } = req.body;
  
  // Get password from either field
  const plainPassword = password_hash || password;
  
  if (!plainPassword) {
    return res.status(400).json({ error: 'Password is required' });
  }
  
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    console.log('Creating user with data:', { username, full_name, role, territory_name, dealer_id, hasPassword: !!plainPassword });
    
    const query = 'INSERT INTO users (username, password_hash, full_name, role, territory_name, dealer_id) VALUES (?, ?, ?, ?, ?, ?)';
    
    db.query(query, [username, hashedPassword, full_name, role, territory_name || null, dealer_id || null], (err, result) => {
      if (err) {
        console.error('Error creating user:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Username already exists', message: err.sqlMessage });
        }
        return res.status(500).json({ error: 'Database error', message: err.sqlMessage });
      }
      res.json({ success: true, id: result.insertId });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    return res.status(500).json({ error: 'Failed to hash password' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password, password_hash, full_name, role, territory_name, dealer_id, is_active } = req.body;
  
  try {
    let query = 'UPDATE users SET username = ?, full_name = ?, role = ?, territory_name = ?, dealer_id = ?';
    const params = [username, full_name, role, territory_name || null, dealer_id || null];
    
    // Update password if provided (from either password or password_hash field)
    const newPassword = password_hash || password;
    if (newPassword) {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      query += ', password_hash = ?';
      params.push(hashedPassword);
    }
    
    if (is_active !== undefined) {
      query += ', is_active = ?';
      params.push(is_active);
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    db.query(query, params, (err) => {
      if (err) {
        console.error('Error updating user:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Username already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    return res.status(500).json({ error: 'Failed to hash password' });
  }
});

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM users WHERE id = ?';
  
  db.query(query, [id], (err) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true });
  });
});

// ======================================================================================
// PRODUCT QUOTA ROUTES - SINGLE SOURCE OF TRUTH
// ======================================================================================
// SINGLE SOURCE OF TRUTH for product quantities:
// 1. ALLOCATED: daily_quotas.max_quantity (total quota assigned)
// 2. SOLD: Calculated from order_items table (actual units sold)
// 3. REMAINING: Calculated as max_quantity - sold_quantity (always accurate)
//
// Simplified Approach:
// - We DO NOT store remaining_quantity in database
// - remaining_quantity is ALWAYS calculated: max_quantity - SUM(order_items.quantity)
// - This guarantees 100% accuracy and eliminates consistency issues
// - No need to UPDATE remaining_quantity on orders or quota changes
// All UI displays (Daily Quota Management, TSO Dashboard, Product Cards) read from
// these calculated values via the API endpoints below.
// ======================================================================================
app.post('/api/product-caps/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    let imported = 0;
    let errors = [];
    
    for (const row of jsonData) {
      try {
        const date = row.Date || row.date;
        const productCode = row['Product Code'] || row.product_code || row.ProductCode;
        const territoryName = row['Territory Name'] || row.territory_name || row.TerritoryName;
        const maxQty = row['Max Quantity'] || row.max_quantity || row.MaxQuantity;
        
        // Get product ID
        const productQuery = 'SELECT id FROM products WHERE product_code = ?';
        db.query(productQuery, [productCode], (err, productResults) => {
          if (err || productResults.length === 0) {
            errors.push(`Product ${productCode} not found`);
            return;
          }
          
          const productId = productResults[0].id;
          
          // Insert or update cap
          const insertQuery = `
            INSERT INTO daily_quotas (date, product_id, territory_name, max_quantity)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE max_quantity = VALUES(max_quantity)
          `;
          
          db.query(insertQuery, [date, productId, territoryName, maxQty], (err) => {
            if (err) {
              errors.push(`Error importing cap for ${productCode}`);
            } else {
              imported++;
            }
          });
        });
      } catch (error) {
        errors.push(`Error processing row: ${error.message}`);
      }
    }
    
    res.json({
      success: true,
      imported,
      errors: errors.slice(0, 10) // Limit errors to first 10
    });
  } catch (error) {
    console.error('Product cap upload error:', error);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

app.get('/api/product-caps', (req, res) => {
  const { date, territory_name } = req.query;
  
  let query = `
    SELECT pc.*, 
           p.product_code, 
           p.name as product_name,
           COALESCE((
             SELECT SUM(oi.quantity)
             FROM order_items oi
             INNER JOIN orders o ON o.order_id = oi.order_id
             INNER JOIN dealers d ON d.id = o.dealer_id
             WHERE oi.product_id = pc.product_id
               AND d.territory_name = pc.territory_name
               AND DATE(o.created_at) = pc.date
           ), 0) as sold_quantity,
           pc.max_quantity - COALESCE((
             SELECT SUM(oi.quantity)
             FROM order_items oi
             INNER JOIN orders o ON o.order_id = oi.order_id
             INNER JOIN dealers d ON d.id = o.dealer_id
             WHERE oi.product_id = pc.product_id
               AND d.territory_name = pc.territory_name
               AND DATE(o.created_at) = pc.date
           ), 0) as remaining_quantity
    FROM daily_quotas pc
    JOIN products p ON pc.product_id = p.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (date) {
    query += ' AND pc.date = ?';
    params.push(date);
  }
  
  if (territory_name) {
    query += ' AND pc.territory_name = ?';
    params.push(territory_name);
  }
  
  query += `
    ORDER BY pc.date DESC, p.product_code
  `;
  
  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching product caps:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(results);
  });
});

  // Get today's product quotas for a TSO
  app.get('/api/product-caps/tso-today', (req, res) => {
    const { territory_name } = req.query;
    
    if (!territory_name) {
      return res.status(400).json({ error: 'Territory name is required' });
    }
    
    const query = `
      SELECT pc.*,
             p.product_code,
             p.name as product_name,
             COALESCE((
               SELECT SUM(oi.quantity)
               FROM order_items oi
               JOIN orders o ON o.order_id = oi.order_id
               JOIN dealers d ON d.id = o.dealer_id
               WHERE oi.product_id = pc.product_id
                 AND d.territory_name = pc.territory_name
                 AND DATE(o.created_at) = pc.date
             ), 0) as sold_quantity,
             pc.max_quantity - COALESCE((
               SELECT SUM(oi.quantity)
               FROM order_items oi
               JOIN orders o ON o.order_id = oi.order_id
               JOIN dealers d ON d.id = o.dealer_id
               WHERE oi.product_id = pc.product_id
                 AND d.territory_name = pc.territory_name
                 AND DATE(o.created_at) = pc.date
             ), 0) as remaining_quantity
      FROM daily_quotas pc
      JOIN products p ON pc.product_id = p.id
      WHERE DATE(pc.date) = CURDATE() AND pc.territory_name = ?
      ORDER BY p.product_code
    `;
    
    db.query(query, [territory_name], (err, results) => {
      if (err) {
        console.error('Error fetching TSO quotas:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json(results);
    });
  });

// Bulk save product caps
app.post('/api/product-caps/bulk', async (req, res) => {
  const { quotas } = req.body;
  
  console.log('📥 Received bulk save request:', quotas?.length, 'quotas');
  
  if (!quotas || !Array.isArray(quotas)) {
    console.error('❌ Invalid quotas data:', quotas);
    return res.status(400).json({ error: 'Invalid quotas data' });
  }
  
  const insertQuery = `
          INSERT INTO daily_quotas (date, product_id, product_code, product_name, territory_name, max_quantity)
          VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            max_quantity = max_quantity + VALUES(max_quantity),
            product_code = VALUES(product_code),
            product_name = VALUES(product_name)
        `;
        
  try {
    await withTransaction(async (connection) => {
      for (const quota of quotas) {
        console.log('💾 Inserting quota:', {
          date: quota.date,
          product_id: quota.product_id,
          territory: quota.territory_name,
          qty: quota.max_quantity
        });

        await connection.query(insertQuery, [
          quota.date, 
          quota.product_id, 
          quota.product_code, 
          quota.product_name, 
          quota.territory_name, 
          quota.max_quantity
        ]);
      }
    });

          console.log('✅ Quotas saved successfully');
          broadcastQuotaChange();
          res.json({ success: true, message: 'Quotas saved successfully' });
  } catch (error) {
    console.error('❌ Error saving quotas:', error);
    res.status(500).json({ error: error.message || 'Failed to save quotas' });
  }
});

// Update a quota (set absolute value, not accumulate)
app.put('/api/product-caps/:date/:productId/:territoryName', (req, res) => {
  const { date, productId, territoryName } = req.params;
  const { max_quantity } = req.body;
  
  if (max_quantity === undefined) {
    return res.status(400).json({ error: 'max_quantity is required' });
  }
  
  // Check current sold quantity before updating
  const checkSoldQuery = `
    SELECT COALESCE(SUM(oi.quantity), 0) as sold_quantity
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    JOIN dealers d ON d.id = o.dealer_id
    WHERE oi.product_id = ? 
      AND d.territory_name = ?
      AND DATE(o.created_at) = ?
  `;
  
  db.query(checkSoldQuery, [productId, territoryName, date], (err, results) => {
    if (err) {
      console.error('Error checking sold quantity:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const soldQuantity = results[0]?.sold_quantity || 0;
    
    // Validate that new max_quantity is not less than sold_quantity
    if (max_quantity < soldQuantity) {
      return res.status(400).json({ 
        error: `Cannot set quota below already sold quantity (${soldQuantity} units)` 
      });
    }
    
    // Proceed with update
    const updateQuery = `
      UPDATE daily_quotas 
      SET max_quantity = ?, 
          updated_at = CURRENT_TIMESTAMP
      WHERE date = ? AND product_id = ? AND territory_name = ?
    `;
    
    db.query(updateQuery, [max_quantity, date, productId, territoryName], (err, result) => {
      if (err) {
        console.error('Error updating quota:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Quota not found' });
      }
      
      // Broadcast quota change to all connected clients
      broadcastQuotaChange();
      
      res.json({ success: true, message: 'Quota updated successfully' });
    });
  });
});

// Delete a quota
app.delete('/api/product-caps/:date/:productId/:territoryName', (req, res) => {
  const { date, productId, territoryName } = req.params;
  
  // Check current sold quantity before deleting
  const checkSoldQuery = `
    SELECT COALESCE(SUM(oi.quantity), 0) as sold_quantity
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    JOIN dealers d ON d.id = o.dealer_id
    WHERE oi.product_id = ? 
      AND d.territory_name = ?
      AND DATE(o.created_at) = ?
  `;
  
  db.query(checkSoldQuery, [productId, territoryName, date], (err, results) => {
    if (err) {
      console.error('Error checking sold quantity:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const soldQuantity = results[0]?.sold_quantity || 0;
    
    // Validate that we're not deleting a quota with sold items
    if (soldQuantity > 0) {
      return res.status(400).json({ 
        error: `Cannot delete quota with already sold quantity (${soldQuantity} units). Set quota to ${soldQuantity} instead.` 
      });
    }
    
    // Proceed with deletion
    const deleteQuery = `
      DELETE FROM daily_quotas 
      WHERE date = ? AND product_id = ? AND territory_name = ?
    `;
    
    db.query(deleteQuery, [date, productId, territoryName], (err, result) => {
      if (err) {
        console.error('Error deleting quota:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Quota not found' });
      }
      
      // Broadcast quota change to all connected clients
      broadcastQuotaChange();
      
      res.json({ success: true, message: 'Quota deleted successfully' });
    });
  });
});

// Import products from Excel file
app.post('/api/products/import', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('📁 Processing uploaded product file (CBL products only):', req.file.filename);
        console.log('📁 File path:', req.file.path);
        console.log('📁 File size:', req.file.size, 'bytes');

        // Check if file exists and is readable
        if (!fs.existsSync(req.file.path)) {
            console.error('❌ Uploaded file does not exist at path:', req.file.path);
            return res.status(500).json({ error: 'Uploaded file not found. Please check uploads directory permissions.' });
        }

        // Check uploads directory permissions
        try {
            fs.accessSync('uploads', fs.constants.W_OK);
        } catch (err) {
            console.error('❌ Uploads directory is not writable:', err.message);
            return res.status(500).json({ error: 'Uploads directory is not writable. Please check directory permissions.' });
        }

        // Read the uploaded Excel file
        let workbook;
        try {
            workbook = XLSX.readFile(req.file.path);
        } catch (readError) {
            console.error('❌ Error reading Excel file:', readError.message);
            console.error('❌ File path:', req.file.path);
            return res.status(500).json({ error: `Failed to read Excel file: ${readError.message}. Please check file format and permissions.` });
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length === 0) {
            return res.status(400).json({ error: 'Excel file is empty' });
        }

        const headers = jsonData[0];
        console.log('📋 Headers found:', headers.length);

        // Map column indices - comprehensive mapping for all 27 columns
        const columnMap = {};
        headers.forEach((header, index) => {
            const headerStr = header?.toString().toLowerCase().trim() || '';
            
            // Map all columns from PRODUCT_PRICE_ERP2.xlsx
            if (headerStr.includes('product_code') || headerStr.includes('product code')) columnMap.productCode = index;
            if (headerStr.includes('product_name') || headerStr.includes('product name')) columnMap.productName = index;
            if (headerStr.includes('unit_measure') || headerStr.includes('unit measure')) columnMap.unitMeasure = index;
            if (headerStr.includes('product_category') || headerStr.includes('product category')) columnMap.productCategory = index;
            if (headerStr.includes('brand_code') || headerStr.includes('brand code')) columnMap.brandCode = index;
            if (headerStr.includes('brand_name') || headerStr.includes('brand name')) columnMap.brandName = index;
            if (headerStr.includes('application_code') || headerStr.includes('application code')) columnMap.applicationCode = index;
            if (headerStr.includes('application_name') || headerStr.includes('application name')) columnMap.applicationName = index;
            if (headerStr.includes('price_date') || headerStr.includes('price date')) columnMap.priceDate = index;
            if (headerStr.includes('unit_tp') || headerStr.includes('unit tp')) columnMap.unitTp = index;
            if (headerStr.includes('oem_price') || headerStr.includes('oem price')) columnMap.oemPrice = index;
            if (headerStr.includes('b2b_price') || headerStr.includes('b2b price')) columnMap.b2bPrice = index;
            if (headerStr.includes('special_price') || headerStr.includes('special price')) columnMap.specialPrice = index;
            if (headerStr.includes('employee_price') || headerStr.includes('employee price')) columnMap.employeePrice = index;
            if (headerStr.includes('cash_price') || headerStr.includes('cash price')) columnMap.cashPrice = index;
            if (headerStr.includes('mrp')) columnMap.mrp = index;
            if (headerStr.includes('unit_trade_price') || headerStr.includes('unit trade price')) columnMap.unitTradePrice = index;
            if (headerStr.includes('unit_vat') || headerStr.includes('unit vat')) columnMap.unitVat = index;
            if (headerStr.includes('supp_tax') || headerStr.includes('supp tax')) columnMap.suppTax = index;
            if (headerStr.includes('gross_profit') || headerStr.includes('gross profit')) columnMap.grossProfit = index;
            if (headerStr.includes('bonus_allow') || headerStr.includes('bonus allow')) columnMap.bonusAllow = index;
            if (headerStr.includes('discount_allow') || headerStr.includes('discount allow')) columnMap.discountAllow = index;
            if (headerStr.includes('discount_type') || headerStr.includes('discount type')) columnMap.discountType = index;
            if (headerStr.includes('discount_val') || headerStr.includes('discount val')) columnMap.discountVal = index;
            if (headerStr.includes('pack_size') || headerStr.includes('pack size')) columnMap.packSize = index;
            if (headerStr.includes('shipper_qty') || headerStr.includes('shipper qty')) columnMap.shipperQty = index;
            if (headerStr.includes('status')) columnMap.status = index;
        });

        console.log('📋 Column mapping:', columnMap);

        // Check if required columns are found
        if (columnMap.productCode === undefined || columnMap.productName === undefined) {
            console.log('❌ Required columns not found. Available headers:', headers);
            return res.status(400).json({ 
                error: 'Required columns (PRODUCT_CODE and PRODUCT_NAME) not found in Excel file',
                availableHeaders: headers
            });
        }

        let importedCount = 0;
        let duplicateCount = 0;
        let errorCount = 0;

        await withTransaction(async (connection) => {
        // Process each row (skip header row)
        console.log(`📊 Processing ${jsonData.length - 1} data rows...`);
        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;
            
            console.log(`📝 Processing row ${i}:`, row.slice(0, 5)); // Log first 5 columns

            const productCode = row[columnMap.productCode]?.toString().trim();
            const productName = row[columnMap.productName]?.toString().trim();
            const productCategory = row[columnMap.productCategory]?.toString().trim();
            
            // Skip if required fields are missing
            if (!productCode || !productName) {
                console.log(`⚠️ Skipping row ${i}: Missing required fields (product_code: ${productCode}, product_name: ${productName})`);
                errorCount++;
                continue;
            }

            // Skip if product category is not CBL
            if (productCategory !== 'CBL') {
                console.log(`⚠️ Skipping row ${i}: Product category is not CBL (${productCategory})`);
                errorCount++;
                continue;
            }

            const productData = [
                productCode,
                productName,
                row[columnMap.unitMeasure]?.toString().trim() || null,
                row[columnMap.productCategory]?.toString().trim() || null,
                row[columnMap.brandCode]?.toString().trim() || null,
                row[columnMap.brandName]?.toString().trim() || null,
                row[columnMap.applicationCode]?.toString().trim() || null,
                row[columnMap.applicationName]?.toString().trim() || null,
                row[columnMap.priceDate] ? new Date((row[columnMap.priceDate] - 25569) * 86400 * 1000) : null,
                row[columnMap.unitTp] ? parseFloat(row[columnMap.unitTp]) : null,
                row[columnMap.oemPrice] ? parseFloat(row[columnMap.oemPrice]) : null,
                row[columnMap.b2bPrice] ? parseFloat(row[columnMap.b2bPrice]) : null,
                row[columnMap.specialPrice] ? parseFloat(row[columnMap.specialPrice]) : null,
                row[columnMap.employeePrice] ? parseFloat(row[columnMap.employeePrice]) : null,
                row[columnMap.cashPrice] ? parseFloat(row[columnMap.cashPrice]) : null,
                row[columnMap.mrp] ? parseFloat(row[columnMap.mrp]) : null,
                row[columnMap.unitTradePrice] ? parseFloat(row[columnMap.unitTradePrice]) : null,
                row[columnMap.unitVat] ? parseFloat(row[columnMap.unitVat]) : null,
                row[columnMap.suppTax] ? parseFloat(row[columnMap.suppTax]) : null,
                row[columnMap.grossProfit] ? parseFloat(row[columnMap.grossProfit]) : null,
                row[columnMap.bonusAllow]?.toString().trim() || null,
                row[columnMap.discountAllow]?.toString().trim() || null,
                row[columnMap.discountType]?.toString().trim() || null,
                row[columnMap.discountVal] ? parseFloat(row[columnMap.discountVal]) : null,
                row[columnMap.packSize]?.toString().trim() || null,
                row[columnMap.shipperQty] ? parseInt(row[columnMap.shipperQty]) : null,
                row[columnMap.status]?.toString().trim() || null
            ];

            try {
                    await connection.query(`
                    INSERT INTO products (
                        product_code, name, unit_measure, product_category, brand_code, brand_name,
                        application_code, application_name, price_date, unit_tp, oem_price, b2b_price,
                        special_price, employee_price, cash_price, mrp, unit_trade_price, unit_vat,
                        supp_tax, gross_profit, bonus_allow, discount_allow, discount_type,
                        discount_val, pack_size, shipper_qty, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, productData);

                importedCount++;
                console.log(`✅ Imported product: ${productData[1]} (${productData[0]})`);
            } catch (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    console.log(`🔄 Duplicate product: ${productData[1]} (${productData[0]})`);
                    duplicateCount++;
                } else {
                    console.log(`❌ Error importing row ${i}:`, error.message);
                    console.log(`❌ Product data:`, productData || 'Not defined');
                    errorCount++;
                }
            }
        }
        });

        console.log(`✅ Import completed: ${importedCount} imported, ${duplicateCount} duplicates, ${errorCount} errors`);

        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
            console.log('🗑️ Cleaned up uploaded file');
        }

        res.json({
            success: true,
            message: 'CBL products imported successfully',
            imported: importedCount,
            duplicates: duplicateCount,
            errors: errorCount,
            note: 'Only products with PRODUCT_CATEGORY = CBL were imported'
        });

    } catch (error) {
        console.error('❌ Import failed:', error.message);
        console.error('❌ Error stack:', error.stack);
        
        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
                console.log('🗑️ Cleaned up uploaded file after error');
            } catch (cleanupError) {
                console.error('❌ Error cleaning up file:', cleanupError.message);
            }
        }
        
        res.status(500).json({ error: 'Import failed: ' + error.message });
    }
});

// Import dealers from Excel file
app.post('/api/dealers/import', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('📁 Processing uploaded file:', req.file.filename);

        // Read the uploaded Excel file
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length === 0) {
            return res.status(400).json({ error: 'Excel file is empty' });
        }

        const headers = jsonData[0];
        console.log('📋 Headers found:', headers.length);

        // Map column indices - comprehensive mapping for all 30 columns
        const columnMap = {};
        headers.forEach((header, index) => {
            const headerStr = header?.toString().toLowerCase().trim() || '';
            
            // Map all columns from VW_ALL_CUSTOMER_INFO.xlsx
            if (headerStr.includes('dealer_code') || headerStr.includes('dealer code')) columnMap.dealerCode = index;
            if (headerStr.includes('dealer_name') || headerStr.includes('dealer name') || headerStr === 'dealername') columnMap.dealerName = index;
            if (headerStr.includes('short_name') || headerStr.includes('short name')) columnMap.shortName = index;
            if (headerStr.includes('proprietor_name') || headerStr.includes('proprietor name')) columnMap.proprietorName = index;
            if (headerStr.includes('dealer_address') || headerStr.includes('dealer address')) columnMap.address = index;
            if (headerStr.includes('dealer_contact') || headerStr.includes('dealer contact')) columnMap.contact = index;
            if (headerStr.includes('dealer_email') || headerStr.includes('dealer email')) columnMap.email = index;
            if (headerStr.includes('nat_code') || headerStr.includes('nat code')) columnMap.natCode = index;
            if (headerStr.includes('nat_name') || headerStr.includes('nat name')) columnMap.natName = index;
            if (headerStr.includes('div_code') || headerStr.includes('div code')) columnMap.divCode = index;
            if (headerStr.includes('div_name') || headerStr.includes('div name')) columnMap.divName = index;
            if (headerStr.includes('territory_code') || headerStr.includes('territory code')) columnMap.territoryCode = index;
            if (headerStr.includes('territory_name') || headerStr.includes('territory name')) columnMap.territoryName = index;
            if (headerStr.includes('dist_code') || headerStr.includes('dist code')) columnMap.distCode = index;
            if (headerStr.includes('dist_name') || headerStr.includes('dist name')) columnMap.distName = index;
            if (headerStr.includes('thana_code') || headerStr.includes('thana code')) columnMap.thanaCode = index;
            if (headerStr.includes('thana_name') || headerStr.includes('thana name')) columnMap.thanaName = index;
            if (headerStr.includes('sr_code') || headerStr.includes('sr code')) columnMap.srCode = index;
            if (headerStr.includes('sr_name') || headerStr.includes('sr name')) columnMap.srName = index;
            if (headerStr.includes('nsm_code') || headerStr.includes('nsm code')) columnMap.nsmCode = index;
            if (headerStr.includes('nsm_name') || headerStr.includes('nsm name')) columnMap.nsmName = index;
            if (headerStr.includes('cust_origin') || headerStr.includes('cust origin')) columnMap.custOrigin = index;
            if (headerStr.includes('dealer_status') || headerStr.includes('dealer status')) columnMap.dealerStatus = index;
            if (headerStr.includes('active_status') || headerStr.includes('active status')) columnMap.activeStatus = index;
            if (headerStr.includes('dealer_proptr') || headerStr.includes('dealer proptr')) columnMap.dealerProptr = index;
            if (headerStr.includes('dealer_type') || headerStr.includes('dealer type')) columnMap.dealerType = index;
            if (headerStr.includes('price_type') || headerStr.includes('price type')) columnMap.priceType = index;
            if (headerStr.includes('cust_disc_category') || headerStr.includes('cust disc category')) columnMap.custDiscCategory = index;
            if (headerStr.includes('party_type') || headerStr.includes('party type')) columnMap.partyType = index;
            if (headerStr.includes('erp_status') || headerStr.includes('erp status')) columnMap.erpStatus = index;
        });

        console.log('📋 Column mapping:', columnMap);

        // Check if required columns are found
        if (columnMap.dealerName === undefined) {
            console.log('❌ Required DEALER_NAME column not found. Available headers:', headers);
            return res.status(400).json({ 
                error: 'Required column (DEALER_NAME) not found in Excel file',
                availableHeaders: headers
            });
        }

        // If dealer_code is missing, we'll generate it from dealer_name
        const hasDealerCode = columnMap.dealerCode !== undefined;
        console.log(`📋 Dealer code column: ${hasDealerCode ? 'Found' : 'Will generate from dealer name'}`);

        let importedCount = 0;
        let duplicateCount = 0;
        let errorCount = 0;

        await withTransaction(async (connection) => {
        console.log(`📊 Processing ${jsonData.length - 1} data rows...`);
        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;
            
            console.log(`📝 Processing row ${i}:`, row.slice(0, 5)); // Log first 5 columns

            const dealerName = row[columnMap.dealerName]?.toString().trim();
            
            // Skip if dealer name is missing
            if (!dealerName) {
                console.log(`⚠️ Skipping row ${i}: Missing dealer name`);
                errorCount++;
                continue;
            }

            // Generate dealer_code from dealer_name if not provided
            const dealerCode = hasDealerCode 
                ? row[columnMap.dealerCode]?.toString().trim() 
                : dealerName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 20);

            const dealerData = [
                dealerCode,
                dealerName,
                row[columnMap.shortName]?.toString().trim() || null,
                row[columnMap.proprietorName]?.toString().trim() || null,
                row[columnMap.address]?.toString().trim() || null,
                row[columnMap.contact]?.toString().trim() || null,
                row[columnMap.email]?.toString().trim() || null,
                row[columnMap.natCode]?.toString().trim() || null,
                row[columnMap.natName]?.toString().trim() || null,
                row[columnMap.divCode]?.toString().trim() || null,
                row[columnMap.divName]?.toString().trim() || null,
                row[columnMap.territoryCode]?.toString().trim() || null,
                row[columnMap.territoryName]?.toString().trim() || null,
                row[columnMap.distCode]?.toString().trim() || null,
                row[columnMap.distName]?.toString().trim() || null,
                row[columnMap.thanaCode]?.toString().trim() || null,
                row[columnMap.thanaName]?.toString().trim() || null,
                row[columnMap.srCode]?.toString().trim() || null,
                row[columnMap.srName]?.toString().trim() || null,
                row[columnMap.nsmCode]?.toString().trim() || null,
                row[columnMap.nsmName]?.toString().trim() || null,
                row[columnMap.custOrigin]?.toString().trim() || null,
                row[columnMap.dealerStatus]?.toString().trim() || null,
                row[columnMap.activeStatus]?.toString().trim() || null,
                row[columnMap.dealerProptr]?.toString().trim() || null,
                row[columnMap.dealerType]?.toString().trim() || null,
                row[columnMap.priceType]?.toString().trim() || null,
                row[columnMap.custDiscCategory]?.toString().trim() || null,
                row[columnMap.partyType]?.toString().trim() || null,
                row[columnMap.erpStatus]?.toString().trim() || null
            ];

            try {
                    await connection.query(`
                    INSERT INTO dealers (
                        dealer_code, name, short_name, proprietor_name, address, contact, email,
                        nat_code, nat_name, div_code, div_name, territory_code, territory_name,
                        dist_code, dist_name, thana_code, thana_name, sr_code, sr_name,
                        nsm_code, nsm_name, cust_origin, dealer_status, active_status,
                        dealer_proptr, dealer_type, price_type, cust_disc_category, party_type, erp_status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, dealerData);

                importedCount++;
                console.log(`✅ Imported dealer: ${dealerData[1]} (${dealerData[0]})`);
            } catch (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    console.log(`🔄 Duplicate dealer: ${dealerData[1]} (${dealerData[0]})`);
                    duplicateCount++;
                } else {
                    console.log(`❌ Error importing row ${i}:`, error.message);
                    console.log(`❌ Dealer data:`, dealerData || 'Not defined');
                    console.log(`❌ Full error:`, error);
                    errorCount++;
                }
            }
        }
        });

        console.log(`✅ Import completed: ${importedCount} imported, ${duplicateCount} duplicates, ${errorCount} errors`);

        // Commit transaction
        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
            console.log('🗑️ Cleaned up uploaded file');
        }

        res.json({
            success: true,
            message: 'Dealers imported successfully',
            imported: importedCount,
            duplicates: duplicateCount,
            errors: errorCount
        });

    } catch (error) {
        console.error('❌ Import failed:', error.message);
        res.status(500).json({ error: 'Import failed: ' + error.message });
    }
});

// Get all order types
app.get('/api/order-types', (req, res) => {
    db.query('SELECT id, name FROM order_types ORDER BY id', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Get all warehouses
app.get('/api/warehouses', (req, res) => {
    db.query('SELECT id, name, alias FROM warehouses ORDER BY id', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Get all dealers
app.get('/api/dealers', (req, res) => {
    db.query('SELECT * FROM dealers ORDER BY name', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Get all territories for dropdown
app.get('/api/dealers/territories', (req, res) => {
    db.query('SELECT DISTINCT territory_name FROM dealers WHERE territory_name IS NOT NULL ORDER BY territory_name', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results.map(row => row.territory_name));
        }
    });
});

// Get dealers with filtering options
app.get('/api/dealers/filter', (req, res) => {
    const { territory, status, type } = req.query;
    let query = 'SELECT * FROM dealers WHERE 1=1';
    let params = [];

    if (territory) {
        query += ' AND (territory_name LIKE ? OR territory_code LIKE ?)';
        params.push(`%${territory}%`, `%${territory}%`);
    }

    if (status) {
        query += ' AND dealer_status = ?';
        params.push(status);
    }

    if (type) {
        query += ' AND dealer_type = ?';
        params.push(type);
    }

    query += ' ORDER BY name';

    db.query(query, params, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Create new order with multiple products
app.post('/api/orders', async (req, res) => {
    try {
        console.log('📦 Creating order with data:', req.body);
        const { order_type_id, dealer_id, warehouse_id, transport_id, order_items } = req.body;
        
        // Validate required fields
        if (!order_type_id || !dealer_id || !warehouse_id || !transport_id || !order_items || !Array.isArray(order_items) || order_items.length === 0) {
            return res.status(400).json({ 
                error: 'Missing required fields: order_type_id, dealer_id, warehouse_id, transport_id, and order_items array' 
            });
        }

        // Validate each order item
        for (const item of order_items) {
            if (!item.product_id || !item.quantity || item.quantity <= 0) {
                return res.status(400).json({ 
                    error: 'Each order item must have product_id and quantity > 0' 
                });
            }
        }

        const order_id = uuidv4().substring(0, 8).toUpperCase();
        
        await withTransaction(async (connection) => {
            const user_id = req.body.user_id || null;
            
            // Get dealer's territory for quota tracking and validation
            const [dealerRows] = await connection.query(`
                SELECT territory_name FROM dealers WHERE id = ?
            `, [dealer_id]);
            
            const territory_name = dealerRows[0]?.territory_name;
            if (!territory_name) {
                console.warn('⚠️ Territory not found for dealer:', dealer_id);
            }

            // Validate quotas before creating order
            if (territory_name) {
                const validationErrors = [];

                for (const item of order_items) {
                    // Get current quota and sold quantity for this product/territory/date
                    // Use CURDATE() to match today's date, same as TSO quota endpoint
                    const [quotaRows] = await connection.query(`
                        SELECT 
                            pc.max_quantity,
                            pc.date,
                            pc.territory_name as quota_territory,
                            COALESCE((
                                SELECT SUM(oi.quantity)
                                FROM order_items oi
                                JOIN orders o ON o.order_id = oi.order_id
                                JOIN dealers d ON d.id = o.dealer_id
                                WHERE oi.product_id = pc.product_id
                                  AND d.territory_name = pc.territory_name
                                  AND DATE(o.created_at) = pc.date
                            ), 0) as sold_quantity
                        FROM daily_quotas pc
                        WHERE pc.product_id = ? 
                          AND pc.territory_name = ? 
                          AND DATE(pc.date) = CURDATE()
                    `, [item.product_id, territory_name]);

                    if (quotaRows.length === 0) {
                        // Debug: Check if product exists and what territories it's allocated to
                        const [productRows] = await connection.query(`
                            SELECT product_code, name FROM products WHERE id = ?
                        `, [item.product_id]);
                        const product = productRows[0];
                        
                        // Check if quota exists for this product/territory on any date
                        const [anyQuotaRows] = await connection.query(`
                            SELECT DATE(date) as quota_date, territory_name 
                            FROM daily_quotas 
                            WHERE product_id = ? AND territory_name = ?
                            ORDER BY date DESC
                            LIMIT 5
                        `, [item.product_id, territory_name]);
                        
                        // Check if quota exists for this product today in any territory
                        const [todayQuotaRows] = await connection.query(`
                            SELECT territory_name 
                            FROM daily_quotas 
                            WHERE product_id = ? AND DATE(date) = CURDATE()
                            LIMIT 5
                        `, [item.product_id]);
                        
                        console.log(`⚠️ Quota validation failed for product_id=${item.product_id}, product_code=${product?.product_code}`);
                        console.log(`   Territory searched: "${territory_name}"`);
                        console.log(`   Quotas for this product/territory (any date):`, anyQuotaRows);
                        console.log(`   Quotas for this product today (any territory):`, todayQuotaRows);
                        
                        validationErrors.push(`Product ${product?.product_code || item.product_id} is not allocated to territory ${territory_name} for today.`);
                        continue;
                    }

                    const quota = quotaRows[0];
                    const maxQuantity = parseInt(quota.max_quantity) || 0;
                    const soldQuantity = parseInt(quota.sold_quantity) || 0;
                    const remainingQuantity = maxQuantity - soldQuantity;
                    const orderedQuantity = parseInt(item.quantity) || 0;

                    if (remainingQuantity <= 0) {
                        const [productRows] = await connection.query(`
                            SELECT product_code, name FROM products WHERE id = ?
                        `, [item.product_id]);
                        const product = productRows[0];
                        validationErrors.push(`Product ${product?.product_code || item.product_id} has no remaining units available (quota exhausted).`);
                    } else if (orderedQuantity > remainingQuantity) {
                        const [productRows] = await connection.query(`
                            SELECT product_code, name FROM products WHERE id = ?
                        `, [item.product_id]);
                        const product = productRows[0];
                        validationErrors.push(`Product ${product?.product_code || item.product_id}: Ordered ${orderedQuantity} units, but only ${remainingQuantity} units remaining.`);
                    }
                }

                if (validationErrors.length > 0) {
                    const validationError = new Error('Order validation failed');
                    validationError.status = 400;
                    validationError.details = validationErrors;
                    throw validationError;
                }
            }
            
            await connection.query(`
                INSERT INTO orders (order_id, order_type_id, dealer_id, warehouse_id, transport_id, user_id) 
                VALUES (?, ?, ?, ?, ?, ?)
            `, [order_id, order_type_id, dealer_id, warehouse_id, transport_id, user_id]);
            
            // Add order items
            for (const item of order_items) {
                await connection.query(`
                    INSERT INTO order_items (order_id, product_id, quantity) 
                    VALUES (?, ?, ?)
                `, [order_id, item.product_id, item.quantity]);
                
                console.log('✅ Added order item:', { product_id: item.product_id, quantity: item.quantity });
            }
        });

            // Broadcast quota change to notify all connected clients
            broadcastQuotaChange();

            res.json({ 
                success: true, 
                order_id: order_id,
                message: `Order created successfully with ${order_items.length} product(s)`,
                item_count: order_items.length
            });

    } catch (error) {
        console.error('❌ Order creation error:', error);
        console.error('❌ Error details:', error.message);
        console.error('❌ Stack trace:', error.stack);
        
        // Handle validation errors with details
        if (error.status === 400 && error.details) {
            return res.status(400).json({ 
                error: error.message,
                details: error.details
            });
        }
        
        res.status(error.status || 500).json({ error: error.message });
    }
});

// Get all orders with their items
app.get('/api/orders', (req, res) => {
    // Get user_id from query parameter (sent from frontend for TSO users)
    const user_id = req.query.user_id;
    
    let query = `
        SELECT 
            o.*, 
            ot.name as order_type, 
            d.name as dealer_name, 
            d.territory_name as dealer_territory, 
            w.name as warehouse_name,
            w.alias as warehouse_alias,
            COUNT(oi.id) as item_count,
            COALESCE(SUM(oi.quantity), 0) as quantity,
            (SELECT p.name FROM order_items oi2 
             JOIN products p ON oi2.product_id = p.id 
             WHERE oi2.order_id = o.order_id 
             ORDER BY oi2.id LIMIT 1) as product_name
        FROM orders o
        LEFT JOIN order_types ot ON o.order_type_id = ot.id
        LEFT JOIN dealers d ON o.dealer_id = d.id
        LEFT JOIN warehouses w ON o.warehouse_id = w.id
        LEFT JOIN order_items oi ON o.order_id = oi.order_id
    `;
    
    const params = [];
    
    // Filter by user_id if provided (for TSO users to see only their orders)
    if (user_id) {
        query += ' WHERE o.user_id = ?';
        params.push(user_id);
    }
    
    query += `
        GROUP BY o.id, o.order_id, o.order_type_id, o.dealer_id, o.warehouse_id, o.created_at, o.user_id, ot.name, d.name, d.territory_name, w.name
        ORDER BY o.created_at DESC
    `;
    
    db.query(query, params, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Get available dates with orders
app.get('/api/orders/available-dates', (req, res) => {
    const query = `
        SELECT DISTINCT DATE(created_at) as date
        FROM orders 
        WHERE created_at IS NOT NULL
        ORDER BY date DESC
    `;
    
    db.query(query, (err, rows) => {
        if (err) {
            console.error('Error fetching available dates:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        
        console.log('Raw database results:', rows);
        
        // Extract dates directly from MySQL DATE() result
        // With dateStrings: true, date is already a string in YYYY-MM-DD format
        const dates = rows.map(row => row.date);
        
        console.log('Processed dates:', dates);
        res.json({ dates });
    });
});

// Get aggregated orders for a date range
app.get('/api/orders/range', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'startDate and endDate are required' });
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        }

        if (startDate > endDate) {
            return res.status(400).json({ error: 'startDate cannot be after endDate' });
        }

        const ordersWithItems = await fetchOrdersWithItemsBetween(startDate, endDate);
        if (!ordersWithItems.length) {
            return res.status(404).json({ error: `No orders found between ${startDate} and ${endDate}` });
        }

        const { summaries, total_dealers, total_quantity, total_value } = buildDealerRangeSummary(ordersWithItems);

        res.json({
            orders: summaries,
            total_dealers,
            total_quantity,
            total_value,
            total_original_orders: ordersWithItems.length,
        });
    } catch (error) {
        console.error('Error fetching range orders:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get orders for a specific date
app.get('/api/orders/date/:date', async (req, res) => {
    try {
        const { date } = req.params;
        
        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        }
        
        // Get orders for the specific date with item_count and quantity
        const ordersQuery = `
            SELECT 
                o.*, 
                ot.name as order_type, 
                d.name as dealer_name, 
                d.territory_name as dealer_territory,
                d.address as dealer_address,
                d.contact as dealer_contact,
                w.name as warehouse_name,
                w.alias as warehouse_alias,
                t.truck_details as transport_name,
                DATE(o.created_at) as order_date,
                COUNT(oi.id) as item_count,
                COALESCE(SUM(oi.quantity), 0) as quantity,
                (SELECT p.name FROM order_items oi2 
                 JOIN products p ON oi2.product_id = p.id 
                 WHERE oi2.order_id = o.order_id 
                 ORDER BY oi2.id LIMIT 1) as product_name
            FROM orders o
            LEFT JOIN order_types ot ON o.order_type_id = ot.id
            LEFT JOIN dealers d ON o.dealer_id = d.id
            LEFT JOIN warehouses w ON o.warehouse_id = w.id
            LEFT JOIN transports t ON o.transport_id = t.id
            LEFT JOIN order_items oi ON o.order_id = oi.order_id
            WHERE DATE(o.created_at) = ?
            GROUP BY o.id, o.order_id, o.order_type_id, o.dealer_id, o.warehouse_id, o.created_at, o.user_id, ot.name, d.name, d.territory_name, d.address, d.contact, w.name, w.alias
            ORDER BY o.created_at DESC
        `;

        const orders = await dbPromise.query(ordersQuery, [date]);

        if (orders[0].length === 0) {
            return res.json({ 
                orders: [], 
                message: `No orders found for date: ${date}` 
            });
        }

        // Get order items for each order
        const ordersWithItems = [];
        for (const order of orders[0]) {
            const itemsQuery = `
                SELECT oi.*, p.name as product_name, p.product_code, p.unit_tp, p.mrp, p.unit_trade_price
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
                ORDER BY oi.id
            `;

            const items = await dbPromise.query(itemsQuery, [order.order_id]);
            order.items = items[0];
            ordersWithItems.push(order);
        }

        res.json({
            orders: ordersWithItems,
            date: date,
            total_orders: ordersWithItems.length,
            total_items: ordersWithItems.reduce((sum, order) => sum + order.items.length, 0)
        });
        
    } catch (error) {
        console.error('Error fetching orders by date:', error);
        res.status(500).json({ error: error.message });
    }
});

// Generate TSO Excel report for orders on a specific date
app.get('/api/orders/tso-report/:date', async (req, res) => {
    try {
        const { date } = req.params;
        
        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        }
        
        // Get orders for the specific date (same query as above)
        const ordersQuery = `
            SELECT 
                o.*, 
                ot.name as order_type, 
                d.name as dealer_name, 
                d.territory_name as dealer_territory,
                d.address as dealer_address,
                d.contact as dealer_contact,
                w.name as warehouse_name,
                w.alias as warehouse_alias,
                t.truck_details as transport_name,
                DATE(o.created_at) as order_date
            FROM orders o
            LEFT JOIN order_types ot ON o.order_type_id = ot.id
            LEFT JOIN dealers d ON o.dealer_id = d.id
            LEFT JOIN warehouses w ON o.warehouse_id = w.id
            LEFT JOIN transports t ON o.transport_id = t.id
            WHERE DATE(o.created_at) = ?
            ORDER BY o.created_at ASC
        `;
        
        const orders = await dbPromise.query(ordersQuery, [date]);
        
        if (orders[0].length === 0) {
            return res.status(404).json({ 
                error: `No orders found for date: ${date}` 
            });
        }
        
        // Get order items for each order
        const ordersWithItems = [];
        for (const order of orders[0]) {
            const itemsQuery = `
                SELECT oi.*, p.name as product_name, p.product_code, p.unit_tp, p.mrp, p.unit_trade_price
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
                ORDER BY oi.id
            `;
            
            const items = await dbPromise.query(itemsQuery, [order.order_id]);
            order.items = items[0];
            ordersWithItems.push(order);
        }
        
        // Generate Excel report
        const reportData = await generateExcelReport(ordersWithItems, {
            date,
            dateLabel: date,
        });
        
        // Set headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="TSO_Order_Report_${date}.xlsx"`);
        
        res.send(reportData);
        
    } catch (error) {
        console.error('Error generating Excel report:', error);
        res.status(500).json({ error: error.message });
    }
});

// Generate TSO Excel report for orders within a date range
app.get('/api/orders/tso-report-range', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'startDate and endDate are required' });
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        }

        if (startDate > endDate) {
            return res.status(400).json({ error: 'startDate cannot be after endDate' });
        }

        const ordersWithItems = await fetchOrdersWithItemsBetween(startDate, endDate);
        console.log('Range Excel request', { startDate, endDate, ordersCount: ordersWithItems.length });
        if (!ordersWithItems.length) {
            return res.status(404).json({ error: `No orders found between ${startDate} and ${endDate}` });
        }

        const dateLabel = `${startDate} to ${endDate}`;
        const { summaries } = buildDealerRangeSummary(ordersWithItems);
        const aggregatedOrders = convertDealerSummariesToOrders(summaries, dateLabel);
        const reportData = await generateExcelReport(aggregatedOrders, {
            date: startDate,
            dateLabel,
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="TSO_Order_Report_${startDate}_${endDate}.xlsx"`);
        res.send(reportData);
    } catch (error) {
        console.error('Error generating range Excel report:', error);
        res.status(500).json({ error: error.message });
    }
});

// Generate TSO Excel report for TSO's own orders on a specific date (no prices)
app.get('/api/orders/tso/my-report/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const { user_id } = req.query;
        
        if (!user_id) {
            return res.status(400).json({ error: 'user_id is required' });
        }
        
        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        }
        
        // Get orders for the specific date filtered by user_id
        const ordersQuery = `
            SELECT 
                o.*, 
                ot.name as order_type, 
                d.name as dealer_name, 
                d.territory_name as dealer_territory,
                d.address as dealer_address,
                d.contact as dealer_contact,
                w.name as warehouse_name,
                w.alias as warehouse_alias,
                t.truck_details as transport_name,
                DATE(o.created_at) as order_date
            FROM orders o
            LEFT JOIN order_types ot ON o.order_type_id = ot.id
            LEFT JOIN dealers d ON o.dealer_id = d.id
            LEFT JOIN warehouses w ON o.warehouse_id = w.id
            LEFT JOIN transports t ON o.transport_id = t.id
            WHERE DATE(o.created_at) = ? AND o.user_id = ?
            ORDER BY o.created_at ASC
        `;

        const orders = await dbPromise.query(ordersQuery, [date, user_id]);

        if (orders[0].length === 0) {
            return res.status(404).json({ 
                error: `No orders found for date: ${date}` 
            });
        }

        // Get order items for each order (without prices)
        const ordersWithItems = [];
        for (const order of orders[0]) {
            const itemsQuery = `
                SELECT oi.*, p.name as product_name, p.product_code
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
                ORDER BY oi.id
            `;

            const items = await dbPromise.query(itemsQuery, [order.order_id]);
            order.items = items[0];
            ordersWithItems.push(order);
        }

        // Generate Excel report without prices
        const reportData = await generateExcelReportNoPrices(ordersWithItems, {
            date,
            dateLabel: date,
        });
        
        // Set headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="TSO_My_Order_Report_${date}.xlsx"`);

        res.send(reportData);
        
    } catch (error) {
        console.error('Error generating TSO Excel report:', error);
        res.status(500).json({ error: error.message });
    }
});

// Generate TSO Excel report for TSO's own orders within a date range (no prices)
app.get('/api/orders/tso/my-report-range', async (req, res) => {
    try {
        const { startDate, endDate, user_id } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'startDate and endDate are required' });
        }

        if (!user_id) {
            return res.status(400).json({ error: 'user_id is required' });
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        }

        if (startDate > endDate) {
            return res.status(400).json({ error: 'startDate cannot be after endDate' });
        }

        // Fetch orders filtered by user_id
        const ordersQuery = `
            SELECT 
                o.*, 
                ot.name AS order_type,
                d.id AS dealer_id,
                d.name AS dealer_name, 
                d.territory_name AS dealer_territory,
                d.address AS dealer_address,
                d.contact AS dealer_contact,
                w.name AS warehouse_name,
                w.alias AS warehouse_alias,
                t.truck_details AS transport_name,
                DATE(o.created_at) AS order_date
        FROM orders o
        LEFT JOIN order_types ot ON o.order_type_id = ot.id
        LEFT JOIN dealers d ON o.dealer_id = d.id
        LEFT JOIN warehouses w ON o.warehouse_id = w.id
            LEFT JOIN transports t ON o.transport_id = t.id
            WHERE DATE(o.created_at) BETWEEN ? AND ? AND o.user_id = ?
            ORDER BY o.created_at ASC
        `;

        const [orders] = await dbPromise.query(ordersQuery, [startDate, endDate, user_id]);
        if (!orders.length) {
            return res.status(404).json({ error: `No orders found between ${startDate} and ${endDate}` });
        }

        const orderIds = orders.map(order => order.order_id);
        const [items] = await dbPromise.query(`
            SELECT 
                oi.*, 
                p.name AS product_name, 
                p.product_code
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id IN (?)
            ORDER BY oi.order_id, oi.id
        `, [orderIds]);

        const itemsByOrder = {};
        orderIds.forEach(id => {
            itemsByOrder[id] = [];
        });
        items.forEach(item => {
            if (itemsByOrder[item.order_id]) {
                itemsByOrder[item.order_id].push(item);
            }
        });

        const ordersWithItems = orders.map(order => ({
            ...order,
            items: itemsByOrder[order.order_id] || []
        }));

        const dateLabel = `${startDate} to ${endDate}`;
        const { summaries } = buildDealerRangeSummaryNoPrices(ordersWithItems);
        const aggregatedOrders = convertDealerSummariesToOrdersNoPrices(summaries, dateLabel);
        const reportData = await generateExcelReportNoPrices(aggregatedOrders, {
            date: startDate,
            dateLabel,
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="TSO_My_Order_Report_${startDate}_${endDate}.xlsx"`);
        res.send(reportData);
    } catch (error) {
        console.error('Error generating TSO range Excel report:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get TSO's available dates (dates where TSO has orders)
app.get('/api/orders/tso/available-dates', async (req, res) => {
    try {
        const { user_id } = req.query;
        
        if (!user_id) {
            return res.status(400).json({ error: 'user_id is required' });
        }
        
        const query = `
            SELECT DISTINCT DATE(created_at) as order_date
            FROM orders
            WHERE user_id = ?
            ORDER BY order_date DESC
        `;
        
        const result = await dbPromise.query(query, [user_id]);
        const dates = result[0].map(row => row.order_date);
        
        res.json({ dates });
    } catch (error) {
        console.error('Error fetching TSO available dates:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get TSO's orders for a specific date
app.get('/api/orders/tso/date/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const { user_id } = req.query;
        
        if (!user_id) {
            return res.status(400).json({ error: 'user_id is required' });
        }
        
        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        }
        
        // Get orders for the specific date filtered by user_id
        const ordersQuery = `
            SELECT 
                o.*, 
                ot.name as order_type, 
                d.name as dealer_name, 
                d.territory_name as dealer_territory,
                d.address as dealer_address,
                d.contact as dealer_contact,
                w.name as warehouse_name,
                w.alias as warehouse_alias,
                t.truck_details as transport_name,
                DATE(o.created_at) as order_date,
                COUNT(oi.id) as item_count,
                COALESCE(SUM(oi.quantity), 0) as quantity
            FROM orders o
            LEFT JOIN order_types ot ON o.order_type_id = ot.id
            LEFT JOIN dealers d ON o.dealer_id = d.id
            LEFT JOIN warehouses w ON o.warehouse_id = w.id
            LEFT JOIN transports t ON o.transport_id = t.id
            LEFT JOIN order_items oi ON o.order_id = oi.order_id
            WHERE DATE(o.created_at) = ? AND o.user_id = ?
            GROUP BY o.id, o.order_id, o.order_type_id, o.dealer_id, o.warehouse_id, o.created_at, o.user_id, ot.name, d.name, d.territory_name, d.address, d.contact, w.name, w.alias
            ORDER BY o.created_at DESC
        `;
        
        const orders = await dbPromise.query(ordersQuery, [date, user_id]);
        
        if (orders[0].length === 0) {
            return res.json({ 
                orders: [], 
                message: `No orders found for date: ${date}` 
            });
        }
        
        // Get order items for each order (without prices)
        const ordersWithItems = [];
        for (const order of orders[0]) {
            const itemsQuery = `
                SELECT oi.*, p.name as product_name, p.product_code
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
                ORDER BY oi.id
            `;
            
            const items = await dbPromise.query(itemsQuery, [order.order_id]);
            order.items = items[0];
            ordersWithItems.push(order);
        }
        
        res.json({ 
            orders: ordersWithItems,
            date: date,
            total_orders: ordersWithItems.length,
            total_items: ordersWithItems.reduce((sum, order) => sum + order.items.length, 0)
        });
        
    } catch (error) {
        console.error('Error fetching TSO orders by date:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get TSO's orders for a date range
app.get('/api/orders/tso/range', async (req, res) => {
    try {
        const { startDate, endDate, user_id } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'startDate and endDate are required' });
        }

        if (!user_id) {
            return res.status(400).json({ error: 'user_id is required' });
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        }
        
        if (startDate > endDate) {
            return res.status(400).json({ error: 'startDate cannot be after endDate' });
        }

        const ordersWithItems = await fetchOrdersWithItemsBetween(startDate, endDate, user_id);
        if (!ordersWithItems.length) {
            return res.json({
                orders: [],
                total_dealers: 0,
                total_quantity: 0,
                total_original_orders: 0,
            });
        }

        const { summaries } = buildDealerRangeSummaryNoPrices(ordersWithItems);
        res.json({
            orders: summaries,
            total_dealers: summaries.length,
            total_quantity: summaries.reduce((sum, s) => sum + (s.total_quantity || 0), 0),
            total_original_orders: ordersWithItems.length,
        });
    } catch (error) {
        console.error('Error fetching TSO range orders:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get order details with items
app.get('/api/orders/:orderId', (req, res) => {
    const { orderId } = req.params;
    
    // Get order details
    const orderQuery = `
        SELECT o.*, ot.name as order_type, d.name as dealer_name, d.territory_name as dealer_territory, w.name as warehouse_name
            FROM orders o
            LEFT JOIN order_types ot ON o.order_type_id = ot.id
            LEFT JOIN dealers d ON o.dealer_id = d.id
            LEFT JOIN warehouses w ON o.warehouse_id = w.id
        WHERE o.order_id = ?
    `;
    
    db.query(orderQuery, [orderId], (err, orderResults) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (orderResults.length === 0) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }
        
        // Get order items
            const itemsQuery = `
                SELECT oi.*, p.name as product_name, p.product_code, p.unit_tp, p.mrp, p.unit_trade_price
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
                ORDER BY oi.id
            `;
            
        db.query(itemsQuery, [orderId], (err, itemsResults) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            const order = orderResults[0];
            order.items = itemsResults;
            
            res.json(order);
        });
    });
});

// Generate MR Order Report CSV (using warehouse aliases)
app.get('/api/orders/mr-report/:date', async (req, res) => {
    const { date } = req.params;
    
    try {
        console.log(`📊 Generating MR Order Report CSV for date: ${date}`);
        
        // Get orders for the specified date with order items
        const ordersQuery = `
            SELECT DISTINCT
                o.order_id,
                ot.name as order_type, 
                d.name as dealer_name, 
                d.territory_name as dealer_territory, 
                w.name as warehouse_name,
                w.alias as warehouse_alias,
                DATE(o.created_at) as order_date,
                o.created_at
            FROM orders o
            LEFT JOIN order_types ot ON o.order_type_id = ot.id
            LEFT JOIN dealers d ON o.dealer_id = d.id
            LEFT JOIN warehouses w ON o.warehouse_id = w.id
            WHERE DATE(o.created_at) = ?
            ORDER BY o.created_at ASC
        `;
        
        const orders = await dbPromise.query(ordersQuery, [date]);
        
        if (orders[0].length === 0) {
            return res.status(404).json({ error: 'No orders found for the specified date' });
        }
        
        // Get order items for all orders
        const orderItemsQuery = `
            SELECT oi.order_id, p.name as product_name, oi.quantity
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id IN (${orders[0].map(() => '?').join(',')})
        `;
        const orderItems = await dbPromise.query(orderItemsQuery, orders[0].map(order => order.order_id));
        
        // Get only products that are actually ordered (distinct products from order_items)
        const orderedProducts = [...new Set(orderItems[0].map(item => item.product_name))].sort();
        
        // Group order items by order_id
        const orderItemsMap = {};
        orderItems[0].forEach(item => {
            if (!orderItemsMap[item.order_id]) {
                orderItemsMap[item.order_id] = {};
            }
            orderItemsMap[item.order_id][item.product_name] = item.quantity;
        });
        
        // Create CSV headers
        const headers = ['internalId', 'orderType', 'orderDate', 'warehouse', 'DealerName'];
        orderedProducts.forEach(productName => {
            headers.push(productName);
        });
        
        // Create CSV rows
        const csvRows = [headers.join(',')];
        
        orders[0].forEach(order => {
            const warehouseName = order.warehouse_alias || order.warehouse_name;
            const row = [
                '', // internalId
                order.order_type,
                date,
                warehouseName,
                order.dealer_name
            ];
            
            // Add quantities for each ordered product
            orderedProducts.forEach(productName => {
                const quantity = orderItemsMap[order.order_id]?.[productName] || '';
                row.push(quantity);
            });
            
            csvRows.push(row.join(','));
        });
        
        // Convert to CSV string
        const csvContent = csvRows.join('\n');
        
        // Set headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="MR_Order_Report_${date}.csv"`);
        
        res.send(csvContent);
        
    } catch (error) {
        console.error('Error generating MR Order Report CSV:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== Manage Transport API ENDPOINTS =====

// Get all transports
app.get('/api/transports', (req, res) => {
    const query = 'SELECT id, truck_details FROM transports ORDER BY truck_details ASC';
    
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Get transport by ID
app.get('/api/transports/:id', (req, res) => {
    const transportId = req.params.id;
    const query = 'SELECT * FROM transports WHERE id = ?';
    
    db.query(query, [transportId], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (results.length === 0) {
            res.status(404).json({ error: 'Transport not found' });
        } else {
            res.json(results[0]);
        }
    });
});

// Create new transport
app.post('/api/transports', (req, res) => {
    const {
        truck_slno, truck_no, engine_no, truck_details, driver_name, route_no,
        load_size, load_weight, remarks, truck_type, entered_by, entered_date,
        entered_terminal, updated_by, updated_date, updated_terminal,
        license_no, transport_status, vehicle_no
    } = req.body;

    const query = `
        INSERT INTO transports (
            truck_slno, truck_no, engine_no, truck_details, driver_name, route_no,
            load_size, load_weight, remarks, truck_type, entered_by, entered_date,
            entered_terminal, updated_by, updated_date, updated_terminal,
            license_no, transport_status, vehicle_no
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        truck_slno, truck_no, engine_no, truck_details, driver_name, route_no,
        load_size, load_weight, remarks, truck_type, entered_by, entered_date,
        entered_terminal, updated_by, updated_date, updated_terminal,
        license_no, transport_status, vehicle_no
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ 
                success: true, 
                id: result.insertId,
                message: 'Transport created successfully' 
            });
        }
    });
});

// Update transport
app.put('/api/transports/:id', (req, res) => {
    const transportId = req.params.id;
    const {
        truck_slno, truck_no, engine_no, truck_details, driver_name, route_no,
        load_size, load_weight, remarks, truck_type, entered_by, entered_date,
        entered_terminal, updated_by, updated_date, updated_terminal,
        license_no, transport_status, vehicle_no
    } = req.body;

    const query = `
        UPDATE transports SET 
            truck_slno = ?, truck_no = ?, engine_no = ?, truck_details = ?, 
            driver_name = ?, route_no = ?, load_size = ?, load_weight = ?, 
            remarks = ?, truck_type = ?, entered_by = ?, entered_date = ?, 
            entered_terminal = ?, updated_by = ?, updated_date = ?, 
            updated_terminal = ?, license_no = ?, transport_status = ?, 
            vehicle_no = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;

    const values = [
        truck_slno, truck_no, engine_no, truck_details, driver_name, route_no,
        load_size, load_weight, remarks, truck_type, entered_by, entered_date,
        entered_terminal, updated_by, updated_date, updated_terminal,
        license_no, transport_status, vehicle_no, transportId
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Transport not found' });
            }
            res.json({ 
                success: true, 
                message: 'Transport updated successfully' 
            });
        }
    });
});

// Delete transport
app.delete('/api/transports/:id', (req, res) => {
    const transportId = req.params.id;
    const query = 'DELETE FROM transports WHERE id = ?';

    db.query(query, [transportId], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Transport not found' });
            }
            res.json({ success: true, message: 'Transport deleted successfully' });
        }
    });
});

// Import transports from Excel file
app.post('/api/transports/import', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Skip header row
        const rows = data.slice(1);

        let importedCount = 0;
        let errorCount = 0;

        for (const row of rows) {
            if (row.length < 17) continue; // Skip incomplete rows

            const [
                truck_slno, truck_no, engine_no, truck_details, driver_name, route_no,
                load_size, load_weight, remarks, truck_type, entered_by, entered_date,
                entered_terminal, updated_by, updated_date, updated_terminal,
                license_no, transport_status, vehicle_no
            ] = row;

            // Skip if truck_details is empty (required field)
            if (!truck_details) continue;

            const insertQuery = `
                INSERT INTO transports (
                    truck_slno, truck_no, engine_no, truck_details, driver_name, route_no,
                    load_size, load_weight, remarks, truck_type, entered_by, entered_date,
                    entered_terminal, updated_by, updated_date, updated_terminal,
                    license_no, transport_status, vehicle_no
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                truck_slno || null, truck_no || null, engine_no || null, truck_details || null,
                driver_name || null, route_no || null, load_size || null, load_weight || null,
                remarks || null, truck_type || null, entered_by || null, entered_date || null,
                entered_terminal || null, updated_by || null, updated_date || null,
                updated_terminal || null, license_no || null, transport_status || 'A',
                vehicle_no || null
            ];

            try {
                await dbPromise.query(insertQuery, values);
                importedCount++;
            } catch (error) {
                console.error('Error importing transport:', error);
                errorCount++;
            }
        }

        // Delete the uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            message: `Transport import completed. ${importedCount} transports imported, ${errorCount} errors.`,
            imported: importedCount,
            errors: errorCount
        });

    } catch (error) {
        console.error('Transport import error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete an order by ID
app.delete('/api/orders/:id', async (req, res) => {
    const orderId = req.params.id;

    try {
        await withTransaction(async (connection) => {
            const [orderRows] = await connection.query(
                'SELECT order_id FROM orders WHERE id = ?',
                [orderId]
            );

            if (!orderRows || orderRows.length === 0) {
                const error = new Error('Order not found');
                error.status = 404;
                throw error;
            }

            const orderUUID = orderRows[0].order_id;

            await connection.query(
                'DELETE FROM order_items WHERE order_id = ?',
                [orderUUID]
            );

            const [deleteResult] = await connection.query(
                'DELETE FROM orders WHERE id = ?',
                [orderId]
            );

            if (!deleteResult || deleteResult.affectedRows === 0) {
                const error = new Error('Order not found');
                error.status = 404;
                throw error;
            }
        });

            broadcastQuotaChange();

            res.json({
                success: true,
                message: 'Order and associated items deleted successfully'
            });
        } catch (error) {
        if (error?.status === 404) {
            return res.status(404).json({ error: 'Order not found' });
        }

        console.error('Error deleting order:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// Monthly Forecast Management API
// Dealers submit their monthly battery forecast/needs
// ============================================================================

// Helper function to calculate monthly period dates based on start day
function calculateMonthlyPeriod(startDay, monthOffset = 0) {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    let periodStart, periodEnd;
    
    if (monthOffset === 0) {
        // For current period, use current day logic
        if (currentDay >= startDay) {
            // Current period started this month
            periodStart = new Date(currentYear, currentMonth, startDay);
            periodEnd = new Date(currentYear, currentMonth + 1, startDay - 1);
        } else {
            // Current period started last month
            periodStart = new Date(currentYear, currentMonth - 1, startDay);
            periodEnd = new Date(currentYear, currentMonth, startDay - 1);
        }
    } else {
        // For historical periods (monthOffset < 0), calculate based on offset from current period
        // Calculate the base period first
        let baseMonth, baseYear;
        if (currentDay >= startDay) {
            baseMonth = currentMonth;
            baseYear = currentYear;
        } else {
            baseMonth = currentMonth - 1;
            baseYear = currentYear;
        }
        
        // Apply offset
        let targetMonth = baseMonth + monthOffset;
        let targetYear = baseYear;
        
        // Adjust year if month goes out of bounds
        while (targetMonth < 0) {
            targetMonth += 12;
            targetYear -= 1;
        }
        while (targetMonth > 11) {
            targetMonth -= 12;
            targetYear += 1;
        }
        
        // For historical periods: period starts on startDay of target month, ends on startDay-1 of next month
        periodStart = new Date(targetYear, targetMonth, startDay);
        periodEnd = new Date(targetYear, targetMonth + 1, startDay - 1);
    }
    
    // Format dates as YYYY-MM-DD without timezone conversion issues
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    return {
        start: formatDate(periodStart),
        end: formatDate(periodEnd)
    };
}

// Get monthly forecast period start day setting
app.get('/api/settings/monthly-forecast-start-day', (req, res) => {
    const query = 'SELECT setting_value FROM settings WHERE setting_key = ?';
    db.query(query, ['monthly_forecast_start_day'], (err, results) => {
        if (err) {
            console.error('Error fetching setting:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        const startDay = results.length > 0 ? parseInt(results[0].setting_value) : 18;
        res.json({ start_day: startDay });
    });
});

// Update monthly forecast period start day setting (Admin only)
app.put('/api/settings/monthly-forecast-start-day', (req, res) => {
    const { start_day } = req.body;
    
    if (!start_day || start_day < 1 || start_day > 31) {
        return res.status(400).json({ error: 'Start day must be between 1 and 31' });
    }
    
    const query = `
        INSERT INTO settings (setting_key, setting_value, description) 
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            setting_value = ?,
            updated_at = CURRENT_TIMESTAMP
    `;
    
    db.query(query, [
        'monthly_forecast_start_day',
        start_day.toString(),
        'Day of month when monthly forecast period starts (1-31)',
        start_day.toString()
    ], (err) => {
        if (err) {
            console.error('Error updating setting:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true, start_day: parseInt(start_day) });
    });
});

// Get current monthly period dates
app.get('/api/monthly-forecast/current-period', (req, res) => {
    const query = 'SELECT setting_value FROM settings WHERE setting_key = ?';
    db.query(query, ['monthly_forecast_start_day'], (err, results) => {
        if (err) {
            console.error('Error fetching setting:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        const startDay = results.length > 0 ? parseInt(results[0].setting_value) : 18;
        const period = calculateMonthlyPeriod(startDay);
        res.json(period);
    });
});

// Get available forecast periods for a dealer (last 12 months)
app.get('/api/monthly-forecast/dealer/:dealerId/periods', (req, res) => {
    const { dealerId } = req.params;
    
    // Validate dealer exists
    db.query('SELECT id FROM dealers WHERE id = ?', [dealerId], (err, dealerCheck) => {
        if (err) {
            console.error('Error checking dealer:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (dealerCheck.length === 0) {
            return res.status(404).json({ error: 'Dealer not found' });
        }
        
        // Get start day setting
        const query = 'SELECT setting_value FROM settings WHERE setting_key = ?';
        db.query(query, ['monthly_forecast_start_day'], (err, results) => {
            if (err) {
                console.error('Error fetching setting:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            const startDay = results.length > 0 ? parseInt(results[0].setting_value) : 18;
            
            // Get current period
            const currentPeriod = calculateMonthlyPeriod(startDay, 0);
            
            // Generate list of periods (current + last 11 months)
            const periods = [];
            for (let i = 0; i >= -11; i--) {
                const period = calculateMonthlyPeriod(startDay, i);
                periods.push({
                    period_start: period.start,
                    period_end: period.end,
                    is_current: i === 0
                });
            }
            
            // Check which periods have forecasts
            const periodStarts = periods.map(p => p.period_start);
            const periodEnds = periods.map(p => p.period_end);
            
            const checkQuery = `
                SELECT DISTINCT period_start, period_end
                FROM monthly_forecast
                WHERE dealer_id = ?
                AND period_start IN (?)
                AND period_end IN (?)
            `;
            
            db.query(checkQuery, [dealerId, periodStarts, periodEnds], (err, forecastPeriods) => {
                if (err) {
                    console.error('Error checking forecast periods:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                
                const hasForecast = new Set();
                forecastPeriods.forEach(fp => {
                    hasForecast.add(`${fp.period_start}_${fp.period_end}`);
                });
                
                // Mark periods that have forecasts
                periods.forEach(period => {
                    period.has_forecast = hasForecast.has(`${period.period_start}_${period.period_end}`);
                });
                
                res.json({ periods });
            });
        });
    });
});

// Get dealer's monthly forecast for a specific period
// NOTE: Only dealers should access this endpoint (frontend enforces this via routing)
// Query params: period_start, period_end (optional - defaults to current period)
app.get('/api/monthly-forecast/dealer/:dealerId', (req, res) => {
    const { dealerId } = req.params;
    const { period_start, period_end } = req.query;
    
    // Validate dealer exists
    db.query('SELECT id FROM dealers WHERE id = ?', [dealerId], (err, dealerCheck) => {
        if (err) {
            console.error('Error checking dealer:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (dealerCheck.length === 0) {
            return res.status(404).json({ error: 'Dealer not found' });
        }
        
        // Get start day setting
        const query = 'SELECT setting_value FROM settings WHERE setting_key = ?';
        db.query(query, ['monthly_forecast_start_day'], (err, results) => {
            if (err) {
                console.error('Error fetching setting:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            const startDay = results.length > 0 ? parseInt(results[0].setting_value) : 18;
            
            // Use provided period or calculate current period
            let period;
            if (period_start && period_end) {
                period = { start: period_start, end: period_end };
            } else {
                period = calculateMonthlyPeriod(startDay, 0);
            }
            
            // Check if forecast is submitted for this period
            const submittedCheckQuery = `
                SELECT COUNT(*) as count 
                FROM monthly_forecast 
                WHERE dealer_id = ? 
                AND period_start = ? 
                AND period_end = ? 
                AND is_submitted = TRUE
                LIMIT 1
            `;
            
            db.query(submittedCheckQuery, [dealerId, period.start, period.end], (err, submittedResult) => {
                if (err) {
                    console.error('Error checking submission status:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                
                const isSubmitted = submittedResult[0].count > 0;
                
                // Get forecast for this period (bulk - sum all quantities per product)
                const forecastQuery = `
                    SELECT 
                        mf.product_id,
                        SUM(mf.quantity) AS quantity,
                        p.name AS product_name,
                        p.product_code
                    FROM monthly_forecast mf
                    LEFT JOIN products p ON mf.product_id = p.id
                    WHERE mf.dealer_id = ? 
                    AND mf.period_start = ? 
                    AND mf.period_end = ?
                    GROUP BY mf.product_id, p.name, p.product_code
                    ORDER BY p.product_code
                `;
                
                db.query(forecastQuery, [dealerId, period.start, period.end], (err, forecast) => {
                    if (err) {
                        console.error('Error fetching monthly forecast:', err);
                        return res.status(500).json({ error: 'Database error' });
                    }
                    res.json({
                        period_start: period.start,
                        period_end: period.end,
                        forecast: forecast,
                        is_submitted: isSubmitted
                    });
                });
            });
        });
    });
});

// Create or update dealer monthly forecast
// NOTE: Only dealers should access this endpoint (frontend enforces this via routing)
// This endpoint allows dealers to submit their monthly battery forecast
// Create or update dealer monthly forecast (bulk - one quantity per product per period)
app.post('/api/monthly-forecast', (req, res) => {
    const { dealer_id, product_id, quantity, user_role } = req.body;
    
    if (!dealer_id || !product_id || quantity === undefined) {
        return res.status(400).json({ error: 'dealer_id, product_id, and quantity are required' });
    }
    
    if (quantity < 0) {
        return res.status(400).json({ error: 'Quantity must be 0 or greater' });
    }
    
    // Validate dealer exists
    db.query('SELECT id FROM dealers WHERE id = ?', [dealer_id], (err, dealerCheck) => {
        if (err) {
            console.error('Error checking dealer:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (dealerCheck.length === 0) {
            return res.status(404).json({ error: 'Dealer not found' });
        }
        
        // Validate product exists and is assigned to this dealer
        const productAssignmentQuery = `
            SELECT p.id 
            FROM products p
            WHERE p.id = ? 
            AND (
                p.id IN (
                    SELECT product_id 
                    FROM dealer_product_assignments 
                    WHERE dealer_id = ? AND assignment_type = 'product' AND product_id IS NOT NULL
                )
                OR p.application_name IN (
                    SELECT product_category 
                    FROM dealer_product_assignments 
                    WHERE dealer_id = ? AND assignment_type = 'category' AND product_category IS NOT NULL
                )
            )
        `;
        
        db.query(productAssignmentQuery, [product_id, dealer_id, dealer_id], (err, productCheck) => {
            if (err) {
                console.error('Error checking product assignment:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            if (productCheck.length === 0) {
                return res.status(403).json({ error: 'This product is not assigned to you. Please contact admin to assign products.' });
            }
            
            // Get current period
            const query = 'SELECT setting_value FROM settings WHERE setting_key = ?';
            db.query(query, ['monthly_forecast_start_day'], (err, results) => {
                if (err) {
                    console.error('Error fetching setting:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                const startDay = results.length > 0 ? parseInt(results[0].setting_value) : 18;
                const period = calculateMonthlyPeriod(startDay);
                
                // Check if forecast is already submitted for this period
                const submittedCheckQuery = `
                    SELECT COUNT(*) as count 
                    FROM monthly_forecast 
                    WHERE dealer_id = ? 
                    AND period_start = ? 
                    AND period_end = ? 
                    AND is_submitted = TRUE
                    LIMIT 1
                `;
                
                db.query(submittedCheckQuery, [dealer_id, period.start, period.end], (err, submittedResult) => {
                    if (err) {
                        console.error('Error checking submission status:', err);
                        return res.status(500).json({ error: 'Database error' });
                    }
                    
                    const isSubmitted = submittedResult[0].count > 0;
                    const isAdminOrTSO = user_role === 'admin' || user_role === 'tso';
                    
                    // Prevent dealers from modifying submitted forecasts
                    if (isSubmitted && !isAdminOrTSO) {
                        return res.status(403).json({ 
                            error: 'This forecast has already been submitted and cannot be modified. Please contact admin or TSO for changes.' 
                        });
                    }
                    
                    // For bulk forecast: delete all existing day-wise entries for this product/period, then insert one entry
                    // Use period.start as forecast_date for the bulk entry
                    db.query('DELETE FROM monthly_forecast WHERE dealer_id = ? AND product_id = ? AND period_start = ? AND period_end = ?', 
                        [dealer_id, product_id, period.start, period.end], (err) => {
                        if (err) {
                            console.error('Error deleting old forecast entries:', err);
                            return res.status(500).json({ error: 'Database error' });
                        }
                        
                        // Insert bulk forecast entry
                        // Only set is_submitted if this is a dealer (not admin/TSO) and it's the first save
                        const insertQuery = `
                            INSERT INTO monthly_forecast (dealer_id, product_id, period_start, period_end, forecast_date, quantity, is_submitted, submitted_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        `;
                        
                        // If dealer is saving (not admin/TSO), mark as submitted
                        const shouldMarkSubmitted = !isAdminOrTSO;
                        const submittedAt = shouldMarkSubmitted ? new Date() : null;
                        
                        db.query(insertQuery, [
                            dealer_id,
                            product_id,
                            period.start,
                            period.end,
                            period.start, // Use period start as forecast_date for bulk entry
                            quantity,
                            shouldMarkSubmitted,
                            submittedAt
                        ], (err, result) => {
                            if (err) {
                                console.error('Error saving monthly forecast:', err);
                                return res.status(500).json({ error: 'Database error' });
                            }
                            
                            // If dealer saved, mark all other entries for this period as submitted too
                            if (shouldMarkSubmitted) {
                                db.query(`
                                    UPDATE monthly_forecast 
                                    SET is_submitted = TRUE, submitted_at = ? 
                                    WHERE dealer_id = ? 
                                    AND period_start = ? 
                                    AND period_end = ? 
                                    AND is_submitted = FALSE
                                `, [submittedAt, dealer_id, period.start, period.end], (err) => {
                                    if (err) {
                                        console.error('Error marking other entries as submitted:', err);
                                        // Don't fail the request, just log the error
                                    }
                                });
                            }
                            
                            res.json({ 
                                success: true, 
                                id: result.insertId,
                                period_start: period.start,
                                period_end: period.end
                            });
                        });
                    });
                });
            });
        });
    });
});

// Bulk save day-wise monthly forecast
app.post('/api/monthly-forecast/bulk', (req, res) => {
    const { dealer_id, forecasts } = req.body; // forecasts: [{ product_id, forecast_date, quantity }, ...]
    
    if (!dealer_id || !Array.isArray(forecasts) || forecasts.length === 0) {
        return res.status(400).json({ error: 'dealer_id and forecasts array are required' });
    }
    
    // Validate dealer exists
    db.query('SELECT id FROM dealers WHERE id = ?', [dealer_id], (err, dealerCheck) => {
        if (err) {
            console.error('Error checking dealer:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (dealerCheck.length === 0) {
            return res.status(404).json({ error: 'Dealer not found' });
        }
        
        // Get current period
        const query = 'SELECT setting_value FROM settings WHERE setting_key = ?';
        db.query(query, ['monthly_forecast_start_day'], (err, results) => {
            if (err) {
                console.error('Error fetching setting:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            const startDay = results.length > 0 ? parseInt(results[0].setting_value) : 18;
            const period = calculateMonthlyPeriod(startDay);
            
            // Validate all forecasts
            const validForecasts = [];
            const errors = [];
            
            forecasts.forEach((forecast, index) => {
                if (!forecast.product_id || !forecast.forecast_date || forecast.quantity === undefined) {
                    errors.push(`Forecast ${index + 1}: product_id, forecast_date, and quantity are required`);
                    return;
                }
                if (forecast.quantity < 0) {
                    errors.push(`Forecast ${index + 1}: quantity must be 0 or greater`);
                    return;
                }
                // Validate forecast_date is within period
                const forecastDate = new Date(forecast.forecast_date);
                const periodStart = new Date(period.start);
                const periodEnd = new Date(period.end);
                if (forecastDate < periodStart || forecastDate > periodEnd) {
                    errors.push(`Forecast ${index + 1}: forecast_date must be within the current period`);
                    return;
                }
                validForecasts.push(forecast);
            });
            
            if (errors.length > 0) {
                return res.status(400).json({ error: 'Validation errors', details: errors });
            }
            
            // Get unique product IDs
            const productIds = [...new Set(validForecasts.map(f => f.product_id))];
            
            // Validate all products are assigned to dealer
            const productAssignmentQuery = `
                SELECT DISTINCT p.id 
                FROM products p
                WHERE p.id IN (${productIds.map(() => '?').join(',')})
                AND (
                    p.id IN (
                        SELECT product_id 
                        FROM dealer_product_assignments 
                        WHERE dealer_id = ? AND assignment_type = 'product' AND product_id IS NOT NULL
                    )
                    OR p.application_name IN (
                        SELECT product_category 
                        FROM dealer_product_assignments 
                        WHERE dealer_id = ? AND assignment_type = 'category' AND product_category IS NOT NULL
                    )
                )
            `;
            
            db.query(productAssignmentQuery, [...productIds, dealer_id, dealer_id], (err, productCheck) => {
                if (err) {
                    console.error('Error checking product assignments:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                
                const assignedProductIds = productCheck.map(p => p.id);
                const unassignedProducts = productIds.filter(id => !assignedProductIds.includes(id));
                
                if (unassignedProducts.length > 0) {
                    return res.status(403).json({ 
                        error: 'Some products are not assigned to you', 
                        unassigned_product_ids: unassignedProducts 
                    });
                }
                
                // Bulk insert/update using transaction
                db.beginTransaction((err) => {
                    if (err) {
                        console.error('Error starting transaction:', err);
                        return res.status(500).json({ error: 'Database error' });
                    }
                    
                    const upsertQuery = `
                        INSERT INTO monthly_forecast (dealer_id, product_id, period_start, period_end, forecast_date, quantity)
                        VALUES (?, ?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE
                            quantity = VALUES(quantity),
                            updated_at = CURRENT_TIMESTAMP
                    `;
                    
                    let completed = 0;
                    let hasError = false;
                    
                    validForecasts.forEach((forecast) => {
                        db.query(upsertQuery, [
                            dealer_id,
                            forecast.product_id,
                            period.start,
                            period.end,
                            forecast.forecast_date,
                            forecast.quantity
                        ], (err) => {
                            if (err && !hasError) {
                                hasError = true;
                                console.error('Error saving forecast:', err);
                                db.rollback(() => {
                                    res.status(500).json({ error: 'Database error' });
                                });
                                return;
                            }
                            
                            completed++;
                            if (completed === validForecasts.length && !hasError) {
                                db.commit((err) => {
                                    if (err) {
                                        console.error('Error committing transaction:', err);
                                        db.rollback(() => {
                                            res.status(500).json({ error: 'Database error' });
                                        });
                                        return;
                                    }
                                    res.json({ 
                                        success: true, 
                                        saved_count: validForecasts.length,
                                        period_start: period.start,
                                        period_end: period.end
                                    });
                                });
                            }
                        });
                    });
                });
            });
        });
    });
});

// Get all forecasts for admin/TSO view (with territory filtering)
app.get('/api/monthly-forecast/all', (req, res) => {
    const { period_start, period_end, territory_name } = req.query;
    
    // Get start day setting
    const query = 'SELECT setting_value FROM settings WHERE setting_key = ?';
    db.query(query, ['monthly_forecast_start_day'], (err, results) => {
        if (err) {
            console.error('Error fetching setting:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        const startDay = results.length > 0 ? parseInt(results[0].setting_value) : 18;
        
        // Use provided period or calculate current period
        let period;
        if (period_start && period_end) {
            period = { start: period_start, end: period_end };
        } else {
            period = calculateMonthlyPeriod(startDay, 0);
        }
        
        // Build query with optional territory filter
        let forecastQuery = `
            SELECT 
                d.id AS dealer_id,
                d.dealer_code,
                d.name AS dealer_name,
                d.territory_name,
                mf.product_id,
                SUM(mf.quantity) AS quantity,
                p.name AS product_name,
                p.product_code
            FROM monthly_forecast mf
            INNER JOIN dealers d ON mf.dealer_id = d.id
            LEFT JOIN products p ON mf.product_id = p.id
            WHERE mf.period_start = ? 
            AND mf.period_end = ?
        `;
        
        const queryParams = [period.start, period.end];
        
        // Add territory filter if provided (for TSO users)
        if (territory_name) {
            forecastQuery += ' AND d.territory_name = ?';
            queryParams.push(territory_name);
        }
        
        forecastQuery += `
            GROUP BY d.id, d.dealer_code, d.name, d.territory_name, mf.product_id, p.name, p.product_code
            ORDER BY d.territory_name, d.dealer_code, p.product_code
        `;
        
        db.query(forecastQuery, queryParams, (err, forecastRows) => {
            if (err) {
                console.error('Error fetching forecasts:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            // Group by dealer
            const dealerMap = {};
            forecastRows.forEach(row => {
                if (!dealerMap[row.dealer_id]) {
                    dealerMap[row.dealer_id] = {
                        dealer_id: row.dealer_id,
                        dealer_code: row.dealer_code,
                        dealer_name: row.dealer_name,
                        territory_name: row.territory_name,
                        products: [],
                        total_products: 0,
                        total_quantity: 0,
                    };
                }
                
                dealerMap[row.dealer_id].products.push({
                    product_code: row.product_code,
                    product_name: row.product_name,
                    quantity: row.quantity,
                });
                dealerMap[row.dealer_id].total_quantity += row.quantity;
            });
            
            // Calculate total_products for each dealer
            Object.values(dealerMap).forEach(dealer => {
                dealer.total_products = dealer.products.length;
            });
            
            const forecasts = Object.values(dealerMap);
            
            res.json({
                period_start: period.start,
                period_end: period.end,
                forecasts: forecasts
            });
        });
    });
});

// Delete dealer monthly forecast
// NOTE: Only dealers should access this endpoint (frontend enforces this via routing)
// Dealers can only delete their own monthly forecast entries
app.delete('/api/monthly-forecast/:id', (req, res) => {
    const { id } = req.params;
    
    // First check if the forecast entry exists and get its dealer_id
    db.query('SELECT dealer_id FROM monthly_forecast WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error checking monthly forecast:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Monthly forecast entry not found' });
        }
        
        // Delete the forecast entry
        const query = 'DELETE FROM monthly_forecast WHERE id = ?';
        db.query(query, [id], (err) => {
            if (err) {
                console.error('Error deleting monthly forecast:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ success: true });
        });
    });
});

// Get all products for dealer monthly forecast selection (filtered by dealer assignments if dealer_id provided)
app.get('/api/products', (req, res) => {
    const { dealer_id } = req.query;
    
    let query;
    let params = [];
    
    if (dealer_id) {
        // Get products assigned to this dealer (by product_id or category)
        query = `
            SELECT DISTINCT p.id, p.product_code, p.name, p.product_category
            FROM products p
            WHERE p.id IN (
                SELECT product_id 
                FROM dealer_product_assignments 
                WHERE dealer_id = ? AND assignment_type = 'product' AND product_id IS NOT NULL
                UNION
                SELECT id 
                FROM products 
                WHERE application_name IN (
                    SELECT product_category 
                    FROM dealer_product_assignments 
                    WHERE dealer_id = ? AND assignment_type = 'category' AND product_category IS NOT NULL
                )
            )
            ORDER BY p.product_code
        `;
        params = [dealer_id, dealer_id];
    } else {
        // Admin or no filter - return all products
        query = 'SELECT id, product_code, name, brand_code, brand_name, application_name, unit_tp, product_category FROM products ORDER BY product_code';
    }
    
    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// ============================================================================
// Dealer Product Assignment Management API (Admin)
// ============================================================================

// Get all product categories
app.get('/api/products/categories', (req, res) => {
    const query = 'SELECT DISTINCT application_name FROM products WHERE application_name IS NOT NULL AND application_name != "" AND application_name != "Dummy" ORDER BY application_name';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results.map(r => r.application_name));
    });
});

// Get dealer's assigned products and categories
app.get('/api/dealer-assignments/:dealerId', (req, res) => {
    const { dealerId } = req.params;
    
    const query = `
        SELECT 
            id,
            assignment_type,
            product_id,
            product_category,
            created_at
        FROM dealer_product_assignments
        WHERE dealer_id = ?
        ORDER BY assignment_type, product_id, product_category
    `;
    
    db.query(query, [dealerId], (err, results) => {
        if (err) {
            console.error('Error fetching dealer assignments:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// Add product assignment to dealer
app.post('/api/dealer-assignments', (req, res) => {
    const { dealer_id, assignment_type, product_id, product_category } = req.body;
    
    if (!dealer_id || !assignment_type) {
        return res.status(400).json({ error: 'dealer_id and assignment_type are required' });
    }
    
    if (assignment_type === 'product' && !product_id) {
        return res.status(400).json({ error: 'product_id is required for product assignment' });
    }
    
    if (assignment_type === 'category' && !product_category) {
        return res.status(400).json({ error: 'product_category is required for category assignment' });
    }
    
    const query = `
        INSERT INTO dealer_product_assignments (dealer_id, assignment_type, product_id, product_category)
        VALUES (?, ?, ?, ?)
    `;
    
    db.query(query, [dealer_id, assignment_type, product_id || null, product_category || null], (err, result) => {
        if (err) {
            console.error('Error adding dealer assignment:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'This product/category is already assigned to this dealer' });
            }
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true, id: result.insertId });
    });
});

// Delete dealer assignment
app.delete('/api/dealer-assignments/:id', (req, res) => {
    const { id } = req.params;
    
    const query = 'DELETE FROM dealer_product_assignments WHERE id = ?';
    db.query(query, [id], (err) => {
        if (err) {
            console.error('Error deleting dealer assignment:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true });
    });
});

// Bulk assign products/categories to dealer
app.post('/api/dealer-assignments/bulk', (req, res) => {
    const { dealer_id, product_ids, product_categories } = req.body;
    
    if (!dealer_id) {
        return res.status(400).json({ error: 'dealer_id is required' });
    }
    
    const assignments = [];
    
    // Add product assignments
    if (Array.isArray(product_ids) && product_ids.length > 0) {
        product_ids.forEach(product_id => {
            assignments.push([dealer_id, 'product', product_id, null]);
        });
    }
    
    // Add category assignments
    if (Array.isArray(product_categories) && product_categories.length > 0) {
        product_categories.forEach(category => {
            assignments.push([dealer_id, 'category', null, category]);
        });
    }
    
    if (assignments.length === 0) {
        return res.status(400).json({ error: 'At least one product_id or product_category is required' });
    }
    
    const query = `
        INSERT INTO dealer_product_assignments (dealer_id, assignment_type, product_id, product_category)
        VALUES ?
        ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
    `;
    
    db.query(query, [assignments], (err, result) => {
        if (err) {
            console.error('Error bulk adding dealer assignments:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true, inserted: result.affectedRows });
    });
});

