import { Entity, Column, GridSettings, Context, SpecificEntityHelper, } from '@remult/core';
import { BusyService } from '@remult/core';

import { HasAsyncGetTheValue, DateTimeColumn } from "../model-shared/types";
import { foreachSync } from "./utils";
import { use } from '../translate';

export async function saveToExcel<E extends Entity<any>, T extends GridSettings<E>>(
  context: SpecificEntityHelper<any, E>,
  grid: T,
  fileName: string,
  busy: BusyService,
  hideColumn?: (e: E, c: Column<any>) => boolean,
  excludeColumn?: (e: E, c: Column<any>) => boolean,
  moreColumns?: (e: E, addColumn: (caption: string, v: string, t: import('xlsx').ExcelDataType) => void) => void) {
  await busy.doWhileShowingBusy(async () => {
    let XLSX = await import('xlsx');
    if (!hideColumn)
      hideColumn = () => false;
    if (!excludeColumn)
      excludeColumn = () => false;

    let wb = XLSX.utils.book_new();

    wb.Workbook = { Views: [{ RTL: use.language.languageCode=='iw' }] };
    let ws = {

    } as import('xlsx').WorkSheet;
    var dc = new DateTimeColumn();
    dc.value = new Date();
    ws["A1"] = {
      v: dc.displayValue,
      t: "d",
      w: "dd/mm/yyyy HH:MM"

    } as import('xlsx').CellObject;
    ws["A2"] = {
      f: "year(A1)"

    } as import('xlsx').CellObject;
    ws["!cols"] = [];




    let x = grid.page;
    let rowNum = 2;
    let maxChar = 'A';


    grid.page = 1;
    await grid.getRecords();
    while (grid.items.length > 0) {
      await foreachSync<Entity<any>>(grid.items
        , async  f => {
          let colPrefix = '';
          let colName = 'A';
          let colIndex = 0;

          let addColumn = (caption: string, v: string, t: import('xlsx').ExcelDataType, hidden?: boolean) => {

            if (rowNum == 2) {
              ws[colPrefix + colName + "1"] = { v: caption };
              ws["!cols"].push({
                wch: caption.length,
                hidden: hidden
              });
            }

            ws[colPrefix + colName + (rowNum.toString())] = {
              v: v, t: t
            };
            maxChar = colPrefix + colName;
            {
              let i = colName.charCodeAt(0);
              i++;
              colName = String.fromCharCode(i);
              if (colName > 'Z') {
                colName = 'A';
                if (colPrefix == 'A')
                  colPrefix = 'B';
                else if (colPrefix == 'B')
                  colPrefix = 'C';
                else
                  colPrefix = 'A';
              }
            }
            let col = ws["!cols"][colIndex++];
            if (v) {
              let len = v.length;
              if (len > col.wch) {
                col.wch = len;
              }
            }
          };
          for (const c of f.columns) {
            try {
              if (!excludeColumn(<E>f, c)) {
                let v = c.displayValue;
                if (v == undefined)
                  v = '';
                let getv: HasAsyncGetTheValue = <any>c as HasAsyncGetTheValue;
                if (getv && getv.getTheValue) {
                  v = await getv.getTheValue();
                }

                if (c instanceof DateTimeColumn) {
                  addColumn('תאריך ' + c.defs.caption, c.value ? c.getStringForInputDate() : undefined, "d", false);
                  addColumn('שעת ' + c.defs.caption, c.value ? c.value.getHours().toString() : undefined, "n", false);
                  addColumn('מלא ' + c.defs.caption, c.displayValue, "s", true);
                }
                else
                  addColumn(c.defs.caption, v.toString(), "s", hideColumn(<E>f, c))

              }
            } catch (err) {

              console.error(err, c.defs.key, context.toApiPojo(<E>f));
            }
          }

          if (moreColumns)
            await moreColumns(<E>f, addColumn);
          rowNum++;

        });
      await grid.nextPage();
    }
    grid.page = x;
    grid.getRecords();
    ws["!ref"] = "A1:" + maxChar + rowNum;
    ws["!autofilter"] = { ref: ws["!ref"] };


    XLSX.utils.book_append_sheet(wb, ws, 'test');
    XLSX.writeFile(wb, fileName + '.xlsx');
  });
}
export async function jsonToXlsx(busy: BusyService, rows: any[], fileName: string) {
  await busy.doWhileShowingBusy(async () => {
    let XLSX = await import('xlsx');


    let wb = XLSX.utils.book_new();

    wb.Workbook = { Views: [{ RTL: use.language.languageCode=='iw' }] };
    let ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1');
    XLSX.writeFile(wb, fileName + '.xlsx');
  });
}